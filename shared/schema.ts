import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
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
  age: integer("age"),
  phone: text("phone"),
  isVerified: boolean("is_verified").default(false).notNull(),
  foodPreferences: json("food_preferences").$type<string[]>().default([]),
  locationLat: text("location_lat"),
  locationLng: text("location_lng"),
  lastActive: timestamp("last_active").defaultNow().notNull(),
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
});

// Meal invitations model
export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  restaurantId: integer("restaurant_id").notNull(),
  date: timestamp("date").notNull(),
  time: text("time").notNull(),
  message: text("message"),
  status: text("status").default("pending").notNull(), // pending, accepted, declined
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isVerified: true,
  foodPreferences: true,
  lastActive: true,
});

export const insertRestaurantSchema = createInsertSchema(restaurants).omit({
  id: true,
  activeUserCount: true,
});

export const insertInvitationSchema = createInsertSchema(invitations).omit({
  id: true,
  createdAt: true,
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
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type InsertInvitation = z.infer<typeof insertInvitationSchema>;
export type LoginData = z.infer<typeof loginSchema>;
