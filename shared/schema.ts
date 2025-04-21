import { pgTable, text, serial, integer, boolean, timestamp, json, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  bio: text("bio"),
  occupation: text("occupation"),
  profileImage: text("profile_image"),
  gender: text("gender"),
  dateOfBirth: text("date_of_birth"),
  age: integer("age"),
  phone: text("phone"),
  isVerified: boolean("is_verified").default(false).notNull(),
  foodPreferences: json("food_preferences").$type<string[]>().default([]),
  dietaryRestrictions: json("dietary_restrictions").$type<string[]>().default([]),
  cuisinePreferences: json("cuisine_preferences").$type<string[]>().default([]),
  diningStyles: json("dining_styles").$type<string[]>().default([]),
  locationLat: text("location_lat"),
  locationLng: text("location_lng"),
  lastActive: timestamp("last_active").defaultNow().notNull(),
  // Microsoft integration fields
  microsoftId: text("microsoft_id"),
  microsoftRefreshToken: text("microsoft_refresh_token"),
  useMicrosoftCalendar: boolean("use_microsoft_calendar").default(false),
});

// Restaurant model
export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cuisine: text("cuisine").notNull(),
  priceRange: text("price_range").notNull(),
  address: text("address").notNull(),
  locationLat: text("location_lat").notNull(),
  locationLng: text("location_lng").notNull(),
  rating: text("rating"),
  image: text("image"),
  activeUserCount: integer("active_user_count").default(0),
  googlePlaceId: text("google_place_id"),
  website: text("website"),
  phoneNumber: text("phone_number"),
  openingHours: json("opening_hours").$type<string[]>().default([]),
});

// Meal invitations model
export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  date: timestamp("date").notNull(),
  time: text("time").notNull(),
  message: text("message"),
  status: text("status").default("pending").notNull(), // pending, accepted, declined
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // Calendar integration fields
  outlookEventId: text("outlook_event_id"),
  calendarSynced: boolean("calendar_synced").default(false),
  lastCalendarSync: timestamp("last_calendar_sync"),
});

// Messages model
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  conversationId: text("conversation_id").notNull(),
});

// Conversations model (to group messages between two users)
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  conversationId: text("conversation_id").notNull().unique(),
  user1Id: integer("user1_id").notNull().references(() => users.id),
  user2Id: integer("user2_id").notNull().references(() => users.id),
  lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
});

// Saved restaurants model (for users to save restaurants they want to visit)
export const savedRestaurants = pgTable("saved_restaurants", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  isPublic: boolean("is_public").default(true).notNull(), // Whether this saved restaurant is visible to other users
  notes: text("notes"),
  priority: integer("priority").default(0), // Users can prioritize restaurants they want to visit
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Friends relationship model
export const friends = pgTable("friends", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  friendId: integer("friend_id").notNull().references(() => users.id),
  status: text("status").notNull().default("pending"), // pending, accepted, declined, blocked
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Dining Circles (groups) model
export const diningCircles = pgTable("dining_circles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isPrivate: boolean("is_private").default(false).notNull(),
  image: text("image"),
});

// Dining Circle Members
export const diningCircleMembers = pgTable("dining_circle_members", {
  diningCircleId: integer("dining_circle_id").notNull().references(() => diningCircles.id),
  userId: integer("user_id").notNull().references(() => users.id),
  role: text("role").notNull().default("member"), // owner, admin, member
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.diningCircleId, t.userId] })
}));

// User Availability Status
export const userAvailabilities = pgTable("user_availabilities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  status: text("status").notNull().default("unavailable"), // available, busy, unavailable
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  notes: text("notes"),
  visibility: text("visibility").notNull().default("public"), // public, friends, circles, private
  locationLat: text("location_lat"),
  locationLng: text("location_lng"),
  preferredRadius: integer("preferred_radius"), // in kilometers
  preferredCuisines: json("preferred_cuisines").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Restaurant Recommendations
export const restaurantRecommendations = pgTable("restaurant_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  score: integer("score").notNull().default(0), // Recommendation score (0-100)
  reason: text("reason"), // Why this restaurant was recommended
  createdAt: timestamp("created_at").defaultNow().notNull(),
  viewedAt: timestamp("viewed_at"),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // message, friend_request, invitation, availability, recommendation, etc.
  title: text("title").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  relatedId: integer("related_id"), // ID related to the notification (e.g., messageId, friendId)
  relatedType: text("related_type"), // Type of the related object (e.g., message, friend_request)
  linkUrl: text("link_url"), // URL to navigate to when clicking the notification
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Settings
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  theme: text("theme").default("dark").notNull(), // light, dark, system
  notificationPreferences: json("notification_preferences").default({
    messages: true,
    friendRequests: true,
    invitations: true,
    mealReminders: true,
    recommendations: true,
    nearbyUsers: true,
  }),
  privacySettings: json("privacy_settings").default({
    profileVisibility: "public", // public, friends, private
    locationVisibility: "friends", // public, friends, private
    availabilityVisibility: "friends", // public, friends, private
    savedRestaurantsVisibility: "friends", // public, friends, private
  }),
  searchRadius: integer("search_radius").default(10).notNull(), // in kilometers
  customUI: json("custom_ui").default({}),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ many, one }) => ({
  sentInvitations: many(invitations, { relationName: "sentInvitations" }),
  receivedInvitations: many(invitations, { relationName: "receivedInvitations" }),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
  conversations1: many(conversations, { relationName: "userConversations1" }),
  conversations2: many(conversations, { relationName: "userConversations2" }),
  savedRestaurants: many(savedRestaurants),
  // New relations
  sentFriendRequests: many(friends, { relationName: "sentFriendRequests" }),
  receivedFriendRequests: many(friends, { relationName: "receivedFriendRequests" }),
  createdCircles: many(diningCircles, { relationName: "circleCreator" }),
  circlesMemberships: many(diningCircleMembers, { relationName: "circleMember" }),
  availabilities: many(userAvailabilities),
  recommendations: many(restaurantRecommendations),
  // Additional relations for new features
  notifications: many(notifications),
  settings: one(userSettings),
}));

export const restaurantsRelations = relations(restaurants, ({ many }) => ({
  invitations: many(invitations),
  savedBy: many(savedRestaurants),
  recommendations: many(restaurantRecommendations),
}));

export const savedRestaurantsRelations = relations(savedRestaurants, ({ one }) => ({
  user: one(users, { fields: [savedRestaurants.userId], references: [users.id] }),
  restaurant: one(restaurants, { fields: [savedRestaurants.restaurantId], references: [restaurants.id] }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  sender: one(users, { relationName: "sentInvitations", fields: [invitations.senderId], references: [users.id] }),
  receiver: one(users, { relationName: "receivedInvitations", fields: [invitations.receiverId], references: [users.id] }),
  restaurant: one(restaurants, { fields: [invitations.restaurantId], references: [restaurants.id] }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, { relationName: "sentMessages", fields: [messages.senderId], references: [users.id] }),
  receiver: one(users, { relationName: "receivedMessages", fields: [messages.receiverId], references: [users.id] }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user1: one(users, { relationName: "userConversations1", fields: [conversations.user1Id], references: [users.id] }),
  user2: one(users, { relationName: "userConversations2", fields: [conversations.user2Id], references: [users.id] }),
  messages: many(messages),
}));

// Relations for new models
export const friendsRelations = relations(friends, ({ one }) => ({
  user: one(users, { relationName: "sentFriendRequests", fields: [friends.userId], references: [users.id] }),
  friend: one(users, { relationName: "receivedFriendRequests", fields: [friends.friendId], references: [users.id] }),
}));

export const diningCirclesRelations = relations(diningCircles, ({ one, many }) => ({
  creator: one(users, { relationName: "circleCreator", fields: [diningCircles.createdBy], references: [users.id] }),
  members: many(diningCircleMembers),
}));

export const diningCircleMembersRelations = relations(diningCircleMembers, ({ one }) => ({
  diningCircle: one(diningCircles, { fields: [diningCircleMembers.diningCircleId], references: [diningCircles.id] }),
  user: one(users, { relationName: "circleMember", fields: [diningCircleMembers.userId], references: [users.id] }),
}));

export const userAvailabilitiesRelations = relations(userAvailabilities, ({ one }) => ({
  user: one(users, { fields: [userAvailabilities.userId], references: [users.id] }),
}));

export const restaurantRecommendationsRelations = relations(restaurantRecommendations, ({ one }) => ({
  user: one(users, { fields: [restaurantRecommendations.userId], references: [users.id] }),
  restaurant: one(restaurants, { fields: [restaurantRecommendations.restaurantId], references: [restaurants.id] }),
}));

// Relations for notification and user settings
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, { fields: [userSettings.userId], references: [users.id] }),
}));

// Define Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isVerified: true,
  foodPreferences: true,
  dietaryRestrictions: true, 
  cuisinePreferences: true,
  diningStyles: true,
  lastActive: true,
  microsoftId: true,
  microsoftRefreshToken: true,
  useMicrosoftCalendar: true,
});

export const insertRestaurantSchema = createInsertSchema(restaurants).omit({
  id: true,
  activeUserCount: true,
});

export const insertInvitationSchema = createInsertSchema(invitations).omit({
  id: true,
  createdAt: true,
  outlookEventId: true,
  calendarSynced: true,
  lastCalendarSync: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  lastMessageAt: true,
});

export const insertSavedRestaurantSchema = createInsertSchema(savedRestaurants).omit({
  id: true,
  createdAt: true,
});

// Insert schemas for new models
export const insertFriendSchema = createInsertSchema(friends).omit({
  id: true,
  createdAt: true,
});

export const insertDiningCircleSchema = createInsertSchema(diningCircles).omit({
  id: true,
  createdAt: true,
});

export const insertDiningCircleMemberSchema = createInsertSchema(diningCircleMembers).omit({
  joinedAt: true,
});

export const insertUserAvailabilitySchema = createInsertSchema(userAvailabilities).omit({
  id: true,
  createdAt: true,
});

export const insertRestaurantRecommendationSchema = createInsertSchema(restaurantRecommendations).omit({
  id: true,
  createdAt: true,
  viewedAt: true,
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Define types for use in application
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Restaurant = typeof restaurants.$inferSelect;
export type Invitation = typeof invitations.$inferSelect;
export type SavedRestaurant = typeof savedRestaurants.$inferSelect;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type InsertInvitation = z.infer<typeof insertInvitationSchema>;
export type InsertSavedRestaurant = z.infer<typeof insertSavedRestaurantSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type Message = typeof messages.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

// Types for new models
export type Friend = typeof friends.$inferSelect;
export type InsertFriend = z.infer<typeof insertFriendSchema>;
export type DiningCircle = typeof diningCircles.$inferSelect;
export type InsertDiningCircle = z.infer<typeof insertDiningCircleSchema>;
export type DiningCircleMember = typeof diningCircleMembers.$inferSelect;
export type InsertDiningCircleMember = z.infer<typeof insertDiningCircleMemberSchema>;
export type UserAvailability = typeof userAvailabilities.$inferSelect;
export type InsertUserAvailability = z.infer<typeof insertUserAvailabilitySchema>;
export type RestaurantRecommendation = typeof restaurantRecommendations.$inferSelect;
export type InsertRestaurantRecommendation = z.infer<typeof insertRestaurantRecommendationSchema>;

// Schemas for notifications and user settings
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  lastUpdated: true,
});

// Types for notifications and user settings
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
