import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertRestaurantSchema, insertInvitationSchema, insertMessageSchema, insertConversationSchema, insertSavedRestaurantSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { nanoid } from "nanoid";

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

  // Endpoint for updating user preferences (from onboarding)
  app.patch("/api/users/:id/preferences", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user?.id !== parseInt(req.params.id)) return res.status(403).json({ message: "Forbidden" });

    try {
      const { 
        gender, 
        dateOfBirth, 
        bio, 
        occupation, 
        dietaryRestrictions = [], 
        cuisinePreferences = [], 
        diningStyles = [] 
      } = req.body;
      
      // Create the update data
      const updateData: Partial<any> = {};
      
      if (gender) updateData.gender = gender;
      if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
      if (bio !== undefined) updateData.bio = bio;
      if (occupation !== undefined) updateData.occupation = occupation;
      if (dietaryRestrictions.length) updateData.dietaryRestrictions = dietaryRestrictions;
      if (cuisinePreferences.length) updateData.cuisinePreferences = cuisinePreferences;
      if (diningStyles.length) updateData.diningStyles = diningStyles;
      
      const updatedUser = await storage.updateUser(req.user.id, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't return password
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (err) {
      console.error("Error updating user preferences:", err);
      res.status(500).json({ message: "Failed to update user preferences" });
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
  
  // Microsoft Calendar Integration
  app.post("/api/invitations/:id/sync-calendar", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const { id } = req.params;
      const { outlookEventId } = req.body;
      
      if (!outlookEventId) {
        return res.status(400).json({ message: "Outlook event ID is required" });
      }
      
      const invitation = await storage.getInvitation(parseInt(id));
      if (!invitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }
      
      // Check if the user is authorized to sync this invitation (sender or receiver)
      if (invitation.senderId !== req.user.id && invitation.receiverId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Make sure user has Microsoft integration enabled
      const user = await storage.getUser(req.user.id);
      if (!user || !user.microsoftId) {
        return res.status(400).json({ message: "Microsoft account not connected" });
      }
      
      // Update invitation with calendar sync info
      const updatedInvitation = await storage.updateInvitationCalendarInfo(
        parseInt(id),
        outlookEventId,
        true,
        new Date()
      );
      
      res.json(updatedInvitation);
    } catch (err) {
      console.error("Error syncing calendar:", err);
      res.status(500).json({ message: "Failed to sync with Microsoft calendar" });
    }
  });

  // Messaging routes
  // Get all conversations for a user
  app.get("/api/conversations", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const conversations = await storage.getConversations(req.user.id);
      res.json(conversations);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Get unread message count
  app.get("/api/messages/unread-count", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const count = await storage.getUnreadCount(req.user.id);
      res.json({ count });
    } catch (err) {
      console.error("Error fetching unread count:", err);
      res.status(500).json({ message: "Failed to fetch unread message count" });
    }
  });

  // Get messages in a conversation
  app.get("/api/conversations/:conversationId/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const { conversationId } = req.params;
      
      // Get the conversation to check user access
      const conversation = await storage.getConversationByUsers(
        req.user.id,
        parseInt(req.query.otherUserId as string)
      );
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      // Check if the user is part of this conversation
      if (conversation.user1Id !== req.user.id && conversation.user2Id !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Mark messages as read
      await storage.markMessagesAsRead(conversationId, req.user.id);
      
      // Get messages
      const messages = await storage.getMessages(conversationId);
      res.json(messages);
    } catch (err) {
      console.error("Error fetching messages:", err);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Start a new conversation or get existing one
  app.post("/api/conversations", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const { otherUserId } = req.body;
      
      if (!otherUserId) {
        return res.status(400).json({ message: "otherUserId is required" });
      }
      
      // Check if other user exists
      const otherUser = await storage.getUser(parseInt(otherUserId));
      if (!otherUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if conversation already exists
      let conversation = await storage.getConversationByUsers(
        req.user.id,
        parseInt(otherUserId)
      );
      
      if (!conversation) {
        // Sort user IDs to ensure consistent conversation IDs
        const [smallerId, largerId] = [req.user.id, parseInt(otherUserId)].sort((a, b) => a - b);
        
        // Create new conversation
        conversation = await storage.createConversation({
          conversationId: nanoid(),
          user1Id: smallerId,
          user2Id: largerId
        });
      }
      
      // Return the conversation with other user info
      const conversationsWithDetails = await storage.getConversations(req.user.id);
      const conversationWithDetails = conversationsWithDetails.find(
        c => c.id === conversation!.id
      );
      
      res.status(201).json(conversationWithDetails);
    } catch (err) {
      console.error("Error creating conversation:", err);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  // Send a message
  app.post("/api/conversations/:conversationId/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const { conversationId } = req.params;
      const { content, receiverId } = req.body;
      
      if (!content || !receiverId) {
        return res.status(400).json({ message: "Content and receiverId are required" });
      }
      
      // Validate the conversation exists and user is part of it
      const conversation = await storage.getConversationByUsers(
        req.user.id,
        parseInt(receiverId)
      );
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      // Check if the user is part of this conversation
      if (conversation.user1Id !== req.user.id && conversation.user2Id !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Create the message
      const validatedData = insertMessageSchema.parse({
        senderId: req.user.id,
        receiverId: parseInt(receiverId),
        content,
        conversationId
      });
      
      const newMessage = await storage.createMessage(validatedData);
      
      // Get the full message with sender details
      const messages = await storage.getMessages(conversationId);
      const fullMessage = messages.find(msg => msg.id === newMessage.id);
      
      res.status(201).json(fullMessage);
    } catch (err) {
      if (err instanceof ZodError) {
        const validationError = fromZodError(err);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error sending message:", err);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Saved Restaurants routes
  app.get("/api/saved-restaurants", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const savedRestaurants = await storage.getUserSavedRestaurants(req.user.id);
      res.json(savedRestaurants);
    } catch (err) {
      console.error("Error fetching saved restaurants:", err);
      res.status(500).json({ message: "Failed to fetch saved restaurants" });
    }
  });

  app.post("/api/saved-restaurants", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const { restaurantId, isPublic = true, notes, priority = 0 } = req.body;
      
      if (!restaurantId) {
        return res.status(400).json({ message: "Restaurant ID is required" });
      }

      // Check if restaurant exists
      const restaurant = await storage.getRestaurant(parseInt(restaurantId));
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      // Check if user has already saved this restaurant
      const existing = await storage.getSavedRestaurantByUserAndRestaurant(
        req.user.id, 
        parseInt(restaurantId)
      );

      if (existing) {
        return res.status(409).json({ 
          message: "Restaurant already saved", 
          savedRestaurant: existing 
        });
      }
      
      // Validate data
      const validatedData = insertSavedRestaurantSchema.parse({
        userId: req.user.id,
        restaurantId: parseInt(restaurantId),
        isPublic,
        notes,
        priority
      });
      
      // Save restaurant
      const savedRestaurant = await storage.createSavedRestaurant(validatedData);
      res.status(201).json(savedRestaurant);
    } catch (err) {
      if (err instanceof ZodError) {
        const validationError = fromZodError(err);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error saving restaurant:", err);
      res.status(500).json({ message: "Failed to save restaurant" });
    }
  });

  app.patch("/api/saved-restaurants/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const { id } = req.params;
      const { isPublic, notes, priority } = req.body;
      
      // Get the saved restaurant
      const savedRestaurant = await storage.getSavedRestaurant(parseInt(id));
      if (!savedRestaurant) {
        return res.status(404).json({ message: "Saved restaurant not found" });
      }

      // Check if user owns this saved restaurant
      if (savedRestaurant.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Update the saved restaurant
      const updateData: any = {};
      if (isPublic !== undefined) updateData.isPublic = isPublic;
      if (notes !== undefined) updateData.notes = notes;
      if (priority !== undefined) updateData.priority = priority;

      const updatedSavedRestaurant = await storage.updateSavedRestaurant(parseInt(id), updateData);
      res.json(updatedSavedRestaurant);
    } catch (err) {
      console.error("Error updating saved restaurant:", err);
      res.status(500).json({ message: "Failed to update saved restaurant" });
    }
  });

  app.delete("/api/saved-restaurants/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const { id } = req.params;
      
      // Get the saved restaurant
      const savedRestaurant = await storage.getSavedRestaurant(parseInt(id));
      if (!savedRestaurant) {
        return res.status(404).json({ message: "Saved restaurant not found" });
      }

      // Check if user owns this saved restaurant
      if (savedRestaurant.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Delete the saved restaurant
      await storage.deleteSavedRestaurant(parseInt(id));
      res.status(204).end();
    } catch (err) {
      console.error("Error deleting saved restaurant:", err);
      res.status(500).json({ message: "Failed to delete saved restaurant" });
    }
  });

  // Get users who have saved a specific restaurant
  app.get("/api/restaurants/:id/saved-by", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const { id } = req.params;
      
      // Check if restaurant exists
      const restaurant = await storage.getRestaurant(parseInt(id));
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      // Get users who have saved this restaurant publicly
      const users = await storage.getUsersWithSavedRestaurant(parseInt(id));
      
      // Don't return passwords
      const sanitizedUsers = users.map(user => {
        const { password, ...rest } = user;
        return rest;
      });
      
      res.json(sanitizedUsers);
    } catch (err) {
      console.error("Error fetching users who saved restaurant:", err);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get restaurant overlap between current user and another user
  app.get("/api/users/:id/restaurant-overlap", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const { id } = req.params;
      
      // Check if other user exists
      const otherUser = await storage.getUser(parseInt(id));
      if (!otherUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get restaurant overlap
      const overlap = await storage.getRestaurantOverlap(req.user.id, parseInt(id));
      res.json(overlap);
    } catch (err) {
      console.error("Error fetching restaurant overlap:", err);
      res.status(500).json({ message: "Failed to fetch restaurant overlap" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
