import type { Express } from "express";
import { storage } from "./storage";

export function registerLocationContextRoutes(app: Express) {
  // Update user location context
  app.patch("/api/users/:id/location-context", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    // Only allow users to update their own location context
    if (req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    try {
      const { locationContext, locationContextNote } = req.body;
      
      // Create the update data with location context fields
      const updateData: Partial<any> = {};
      
      if (locationContext) updateData.locationContext = locationContext;
      if (locationContextNote !== undefined) updateData.locationContextNote = locationContextNote;
      
      const updatedUser = await storage.updateUser(req.user.id, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return only the relevant fields
      res.json({
        locationContext: updatedUser.locationContext,
        locationContextNote: updatedUser.locationContextNote
      });
    } catch (err) {
      console.error("Error updating user location context:", err);
      res.status(500).json({ message: "Failed to update location context" });
    }
  });
}