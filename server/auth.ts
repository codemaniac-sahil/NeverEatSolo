import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, InsertUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  // Add version prefix for future upgrades
  return `v1$${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  // Handle versioned password formats
  if (stored.startsWith('v1$')) {
    // Version 1 format: v1$hash.salt
    const [, hashAndSalt] = stored.split('$');
    const [hashed, salt] = hashAndSalt.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } else {
    // Legacy format (no version): hash.salt
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  }
}

export function setupAuth(app: Express) {
  // Fail fast if environment variable is missing
  if (!process.env.SESSION_SECRET) {
    console.error("SESSION_SECRET environment variable is missing!");
    process.exit(1);
  }
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: process.env.NODE_ENV === "production", // Only use secure cookies in production
      sameSite: "lax", // Helps prevent CSRF attacks
      httpOnly: true, // Prevents client-side JS from reading the cookie
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          // Update last active
          await storage.updateUser(user.id, { lastActive: new Date() });
          return done(null, user);
        }
      } catch (err) {
        return done(err as Error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (user) {
        // Update last active timestamp silently
        storage.updateUser(user.id, { lastActive: new Date() }).catch(err => console.error("Error updating last active:", err));
      }
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Extract registration data
      const { 
        username, 
        password, 
        email, 
        firstName, 
        lastName, 
        dietary, 
        typicalLunch 
      } = req.body;

      // Check if username exists
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check if email exists
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Create user with hashed password
      const user = await storage.createUser({
        username,
        password: await hashPassword(password),
        email,
        name: `${firstName} ${lastName}`,
        dietary,
        typicalLunch,
        isVerified: false, // Will require email verification in the future
        lastActive: new Date()
      });

      // Login the user
      req.login(user, (err) => {
        if (err) return next(err);
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (err) {
      console.error("Registration error:", err);
      if (err instanceof Error) {
        return res.status(400).json({ message: err.message });
      }
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: SelectUser | false) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid username or password" });
      
      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Return user without password
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });

  // Microsoft authentication endpoints
  app.post("/api/auth/microsoft", async (req, res, next) => {
    try {
      const { microsoftId, email, displayName, accessToken, refreshToken } = req.body;

      if (!microsoftId || !email) {
        return res.status(400).json({ message: "Microsoft ID and email are required" });
      }

      // Check if user exists with this Microsoft ID
      let user = await storage.getUserByMicrosoftId(microsoftId);
      
      if (user) {
        // Update Microsoft token
        user = await storage.updateUser(user.id, { 
          microsoftRefreshToken: refreshToken,
          lastActive: new Date()
        });
      } else {
        // Check if user exists with this email
        user = await storage.getUserByEmail(email);
        
        if (user) {
          // Link Microsoft account to existing user
          user = await storage.updateUser(user.id, {
            microsoftId,
            microsoftRefreshToken: refreshToken,
            lastActive: new Date()
          });
        } else {
          // Create new user with Microsoft account
          // Generate a random username based on email
          const username = email.split('@')[0] + '_' + Math.floor(Math.random() * 10000);
          // Generate a random secure password (user won't need this for login)
          const password = await hashPassword(randomBytes(16).toString('hex'));
          
          // Create user object with standard fields only
          const userToCreate: InsertUser & { 
            microsoftId?: string, 
            microsoftRefreshToken?: string,
            isVerified?: boolean
          } = {
            username,
            password,
            name: displayName || username,
            email,
            // Extended fields
            microsoftId,
            microsoftRefreshToken: refreshToken,
            isVerified: true, // Microsoft login is considered verified
          };
          
          user = await storage.createUser(userToCreate as InsertUser);
        }
      }

      if (!user) {
        return res.status(500).json({ message: "Failed to create or find user" });
      }

      // Login the user
      req.login(user, (err) => {
        if (err) return next(err);
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    } catch (err) {
      next(err);
    }
  });
}
