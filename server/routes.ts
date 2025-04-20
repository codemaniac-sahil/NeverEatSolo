import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertRestaurantSchema, insertInvitationSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up auth routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // User related routes
  app.get("/api/users/nearby", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const { lat, lng, radius = 10 } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }

      const users = await storage.getNearbyUsers(lat as string, lng as string, parseInt(radius as string));
      
      // Don't send passwords
      const sanitizedUsers = users.map(user => {
        const { password, ...rest } = user;
        return rest;
      });
      
      res.json(sanitizedUsers);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch nearby users" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user?.id !== parseInt(req.params.id)) return res.status(403).json({ message: "Forbidden" });

    try {
      const updateData = req.body;
      // Don't allow updating some fields
      const { id, password, isVerified, ...allowedData } = updateData;
      
      const updatedUser = await storage.updateUser(req.user.id, allowedData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't return password
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (err) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Restaurant related routes
  app.get("/api/restaurants/nearby", async (req, res) => {
    try {
      const { lat, lng, radius = 10 } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }

      const restaurants = await storage.getNearbyRestaurants(lat as string, lng as string, parseInt(radius as string));
      res.json(restaurants);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch nearby restaurants" });
    }
  });

  app.post("/api/restaurants", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      // Validate the request body
      const validatedData = insertRestaurantSchema.parse(req.body);
      const newRestaurant = await storage.createRestaurant(validatedData);
      res.status(201).json(newRestaurant);
    } catch (err) {
      if (err instanceof ZodError) {
        const validationError = fromZodError(err);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create restaurant" });
    }
  });

  // Invitation related routes
  app.post("/api/invitations", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      // Validate the request body
      const validatedData = insertInvitationSchema.parse({
        ...req.body,
        senderId: req.user.id
      });
      const newInvitation = await storage.createInvitation(validatedData);
      res.status(201).json(newInvitation);
    } catch (err) {
      if (err instanceof ZodError) {
        const validationError = fromZodError(err);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create invitation" });
    }
  });

  app.get("/api/invitations", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const invitations = await storage.getInvitationsForUser(req.user.id);
      res.json(invitations);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch invitations" });
    }
  });

  app.patch("/api/invitations/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || !["accepted", "declined"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const invitation = await storage.getInvitation(parseInt(id));
      if (!invitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }

      // Check if the user is the receiver of the invitation
      if (invitation.receiverId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updatedInvitation = await storage.updateInvitationStatus(parseInt(id), status);
      res.json(updatedInvitation);
    } catch (err) {
      res.status(500).json({ message: "Failed to update invitation status" });
    }
  });

  app.get("/api/meals/upcoming", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const upcomingMeals = await storage.getUpcomingMeals(req.user.id);
      res.json(upcomingMeals);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch upcoming meals" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
