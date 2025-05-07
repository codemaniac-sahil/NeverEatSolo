import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import csrf from "csurf";
import rateLimit from "express-rate-limit";
import { URL } from "url";

// Fail fast if environment variable is missing
if (process.env.NODE_ENV === "production" && !process.env.ENV) {
  console.error("ENV environment variable is missing in production mode!");
  process.exit(1);
}

const app = express();

// Secure app settings
app.set("env", process.env.ENV || "development");
app.set("strict routing", true);

// Basic security middleware
app.use((req, res, next) => {
  // Set security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  
  // Only allow POST requests with the correct content type
  if (req.method === "POST" && req.headers["content-type"] !== "application/json" && !req.path.includes("/auth")) {
    return res.status(400).json({ message: "Content-Type must be application/json" });
  }
  
  next();
});

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all API routes
app.use("/api/*", apiLimiter);

// Apply stricter rate limiting to auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 login attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." }
});

app.use("/api/login", authLimiter);
app.use("/api/register", authLimiter);
app.use("/api/auth/*", authLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CSRF protection for all non-GET, non-HEAD requests
const csrfProtection = csrf({
  cookie: {
    secure: process.env.NODE_ENV === "production", 
    httpOnly: true,
    sameSite: "strict"
  }
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Add CSRF protection to non-GET API routes
  app.use("/api", (req, res, next) => {
    const method = req.method.toUpperCase();
    // Skip CSRF for GET and HEAD requests
    if (method === "GET" || method === "HEAD") {
      return next();
    }
    // Skip CSRF for auth endpoints (login/register) as they are protected by rate limiting
    if (["/api/login", "/api/register", "/api/auth/microsoft"].includes(req.path)) {
      return next();
    }
    // Apply CSRF protection to all other API routes
    return csrfProtection(req, res, next);
  });

  // Generate CSRF token for client-side usage
  app.get("/api/csrf-token", csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  });

  const server = await registerRoutes(app);

  // Improved error handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    // Handle CSRF errors specifically
    if (err.code === "EBADCSRFTOKEN") {
      return res.status(403).json({
        message: "Invalid CSRF token, form submission rejected"
      });
    }

    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Use proper error logging rather than throwing
    console.error(`Error: ${message}`, err);
    
    // Send error response
    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
