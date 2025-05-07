import { pgTable, text, serial, integer, boolean, timestamp, json, primaryKey, numeric, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Corporate Organization model
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  domain: text("domain").notNull().unique(), // Email domain used for SSO verification
  logoImage: text("logo_image"),
  primaryColor: text("primary_color"), // For branding
  description: text("description"),
  address: text("address"),
  locationLat: numeric("location_lat", { precision: 9, scale: 6 }),
  locationLng: numeric("location_lng", { precision: 9, scale: 6 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  adminEmail: text("admin_email"), // Organization admin contact
  maxEmployees: integer("max_employees"), // For plan limitations
  subscriptionTier: text("subscription_tier").default("basic"), // basic, premium, enterprise
});

// Corporate Teams model
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  description: text("description"),
  department: text("department"),
  managerId: integer("manager_id"), // Will reference a user id
  logoImage: text("logo_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

// Corporate Workspace Locations model (for campus/office locations)
export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  address: text("address").notNull(),
  locationLat: numeric("location_lat", { precision: 9, scale: 6 }).notNull(),
  locationLng: numeric("location_lng", { precision: 9, scale: 6 }).notNull(),
  floor: text("floor"),
  buildingName: text("building_name"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

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
  locationLat: numeric("location_lat", { precision: 9, scale: 6 }),
  locationLng: numeric("location_lng", { precision: 9, scale: 6 }),
  locationContext: text("location_context").default("local"), // local, tourist, visiting, networking, other
  locationContextNote: text("location_context_note"), // Additional notes about their location context
  lastActive: timestamp("last_active").defaultNow().notNull(),
  // Microsoft integration fields
  microsoftId: text("microsoft_id"),
  microsoftRefreshToken: text("microsoft_refresh_token"),
  useMicrosoftCalendar: boolean("use_microsoft_calendar").default(false),
  
  // Corporate fields
  organizationId: integer("organization_id").references(() => organizations.id),
  workEmail: text("work_email"), // Separate from personal email for corp users
  jobTitle: text("job_title"),
  department: text("department"),
  employeeId: text("employee_id"),
  workspaceId: integer("workspace_id").references(() => workspaces.id),
  isCorpAdmin: boolean("is_corp_admin").default(false),
  useWorkProfile: boolean("use_work_profile").default(false), // Toggle between personal/work profiles
  workProfilePublic: boolean("work_profile_public").default(true), // Visibility of work profile
  allowCrossDepartmentMatching: boolean("allow_cross_department_matching").default(true),
});

// Restaurant model
export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cuisine: text("cuisine").notNull(),
  priceRange: text("price_range").notNull(),
  address: text("address").notNull(),
  locationLat: numeric("location_lat", { precision: 9, scale: 6 }).notNull(),
  locationLng: numeric("location_lng", { precision: 9, scale: 6 }).notNull(),
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

// Messages model with advanced features
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  conversationId: text("conversation_id").notNull(),
  // Advanced messaging features
  messageType: text("message_type").default("text").notNull(), // text, image, voice, location, invitation
  attachmentUrl: text("attachment_url"), // URL to any attached media
  reactionEmojis: json("reaction_emojis").$type<{ [userId: string]: string }>().default({}),
  isEdited: boolean("is_edited").default(false),
  editHistory: json("edit_history").$type<{ content: string, timestamp: string }[]>().default([]),
  deliveryStatus: text("delivery_status").default("sent").notNull(), // sent, delivered, seen
  readAt: timestamp("read_at"),
  replyToMessageId: integer("reply_to_message_id"), // For threaded replies
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

// Team Members
export const teamMembers = pgTable("team_members", {
  teamId: integer("team_id").notNull().references(() => teams.id),
  userId: integer("user_id").notNull().references(() => users.id),
  role: text("role").notNull().default("member"), // manager, lead, member
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.teamId, t.userId] })
}));

// Campus Restaurants (internal to organization)
export const campusRestaurants = pgTable("campus_restaurants", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  workspaceId: integer("workspace_id").references(() => workspaces.id),
  name: text("name").notNull(),
  description: text("description"),
  locationDetails: text("location_details").notNull(), // "Building A, Floor 2", etc.
  cuisine: text("cuisine").notNull(),
  priceRange: text("price_range").notNull(),
  openingTime: text("opening_time"),
  closingTime: text("closing_time"),
  daysOpen: json("days_open").$type<string[]>().default([]), // "Monday", "Tuesday", etc.
  menuUrl: text("menu_url"),
  image: text("image"),
  capacity: integer("capacity"),
  averageWaitTime: integer("average_wait_time"), // in minutes
  acceptsReservations: boolean("accepts_reservations").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

// Corporate Events (team lunches, welcome events, etc.)
export const corporateEvents = pgTable("corporate_events", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  teamId: integer("team_id").references(() => teams.id),
  name: text("name").notNull(),
  description: text("description"),
  locationId: integer("location_id"), // Could reference campus_restaurants or workspaces
  locationType: text("location_type"), // "restaurant", "workspace", "external"
  externalLocation: text("external_location"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isPublic: boolean("is_public").default(true).notNull(), // Whether visible to all org members
  maxParticipants: integer("max_participants"),
  eventType: text("event_type").notNull(), // "team_lunch", "welcome_event", "workshop", etc.
});

// Corporate Event Participants
export const eventParticipants = pgTable("event_participants", {
  eventId: integer("event_id").notNull().references(() => corporateEvents.id),
  userId: integer("user_id").notNull().references(() => users.id),
  status: text("status").notNull().default("invited"), // invited, attending, declined, waitlist
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  comment: text("comment"),
}, (t) => ({
  pk: primaryKey({ columns: [t.eventId, t.userId] })
}));

// Premium Features: Private Dining Rooms
export const privateDiningRooms = pgTable("private_dining_rooms", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  name: text("name").notNull(),
  description: text("description"),
  capacity: integer("capacity").notNull(),
  pricePerHour: integer("price_per_hour"), // in cents
  amenities: json("amenities").$type<string[]>().default([]),
  availableTimeSlots: json("available_time_slots").$type<{ day: string, slots: string[] }[]>().default([]),
  images: json("images").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Premium Features: Special Events
export const specialEvents = pgTable("special_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  locationName: text("location_name").notNull(),
  address: text("address").notNull(),
  locationLat: numeric("location_lat", { precision: 9, scale: 6 }),
  locationLng: numeric("location_lng", { precision: 9, scale: 6 }),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  maxAttendees: integer("max_attendees"),
  cost: integer("cost"), // in cents, can be 0 for free events
  eventType: text("event_type").notNull(), // tasting, cooking_class, food_tour, etc.
  hostId: integer("host_id").notNull().references(() => users.id),
  isPublic: boolean("is_public").default(true).notNull(),
  requiresRegistration: boolean("requires_registration").default(true).notNull(),
  coverImage: text("cover_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isPremiumOnly: boolean("is_premium_only").default(true).notNull(),
});

// Premium Features: Event Attendees
export const specialEventAttendees = pgTable("special_event_attendees", {
  eventId: integer("event_id").notNull().references(() => specialEvents.id),
  userId: integer("user_id").notNull().references(() => users.id),
  status: text("status").notNull().default("registered"), // registered, attended, cancelled
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
  notes: text("notes"),
}, (t) => ({
  pk: primaryKey({ columns: [t.eventId, t.userId] })
}));

// Premium Features: Team Building Activities
export const teamBuildingActivities = pgTable("team_building_activities", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  activityType: text("activity_type").notNull(), // lunch_rotation, restaurant_crawl, cooking_competition, etc.
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  recurrence: text("recurrence"), // once, daily, weekly, monthly
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  status: text("status").notNull().default("active"), // active, completed, cancelled
  settings: json("settings").default({}), // activity specific settings
});

// Receipt Storage model - for uploading receipts from meals
export const receipts = pgTable("receipts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  invitationId: integer("invitation_id").references(() => invitations.id),
  restaurantId: integer("restaurant_id").references(() => restaurants.id),
  imageUrl: text("image_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  totalAmount: numeric("total_amount"),
  currency: text("currency").default("USD"),
  date: timestamp("date").defaultNow().notNull(),
  description: text("description"),
  category: text("category").default("meal"), // meal, drinks, transportation, etc.
  tags: json("tags").$type<string[]>().default([]),
  isExpensed: boolean("is_expense").default(false),
  isShared: boolean("is_shared").default(false),
  sharedWithUserIds: json("shared_with_user_ids").$type<number[]>().default([]),
  splitDetails: json("split_details").$type<{
    userId: number,
    amount: number,
    isPaid: boolean,
    paymentMethod?: string,
    paymentDate?: string
  }[]>().default([]),
  ocrText: text("ocr_text"), // Text extracted from receipt via OCR
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Premium Features: Travel Mode
export const travelProfiles = pgTable("travel_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  isEnabled: boolean("is_enabled").default(false).notNull(),
  travelPreferences: json("travel_preferences").default({
    meetLocals: true,
    findFellowTravelers: true,
    exploreCuisines: true,
  }),
  upcomingTrips: json("upcoming_trips").$type<{
    destination: string,
    arrivalDate: string,
    departureDate: string,
    notes: string
  }[]>().default([]),
  preferredMeetingTimes: json("preferred_meeting_times").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// User Availability Status (enhanced with corporate fields)
export const userAvailabilities = pgTable("user_availabilities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  status: text("status").notNull().default("unavailable"), // available, busy, unavailable
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  notes: text("notes"),
  visibility: text("visibility").notNull().default("public"), // public, friends, circles, private
  locationLat: numeric("location_lat", { precision: 9, scale: 6 }),
  locationLng: numeric("location_lng", { precision: 9, scale: 6 }),
  preferredRadius: integer("preferred_radius"), // in kilometers
  preferredCuisines: json("preferred_cuisines").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  
  // Corporate-specific fields
  isWorkAvailability: boolean("is_work_availability").default(false),
  workspaceId: integer("workspace_id").references(() => workspaces.id),
  restrictToTeam: boolean("restrict_to_team").default(false),
  teamId: integer("team_id").references(() => teams.id),
  restrictToDepartment: boolean("restrict_to_department").default(false),
  spontaneous: boolean("spontaneous").default(false), // For "free for lunch today" signals
  lookingForNewConnections: boolean("looking_for_new_connections").default(true), // Preference for meeting new colleagues
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
  
  // Corporate relations
  organization: one(organizations, { fields: [users.organizationId], references: [organizations.id] }),
  workspace: one(workspaces, { fields: [users.workspaceId], references: [workspaces.id] }),
  teamMemberships: many(teamMembers, { relationName: "teamMember" }),
  createdEvents: many(corporateEvents, { relationName: "eventCreator" }),
  eventParticipations: many(eventParticipants, { relationName: "eventParticipant" }),
  
  // Premium features relations
  hostedSpecialEvents: many(specialEvents),
  specialEventAttendances: many(specialEventAttendees),
  createdTeamBuildingActivities: many(teamBuildingActivities),
  travelProfile: one(travelProfiles),
  receipts: many(receipts),
}));

export const restaurantsRelations = relations(restaurants, ({ many }) => ({
  invitations: many(invitations),
  savedBy: many(savedRestaurants),
  recommendations: many(restaurantRecommendations),
  privateDiningRooms: many(privateDiningRooms), // Premium feature
  receipts: many(receipts),
}));

export const savedRestaurantsRelations = relations(savedRestaurants, ({ one }) => ({
  user: one(users, { fields: [savedRestaurants.userId], references: [users.id] }),
  restaurant: one(restaurants, { fields: [savedRestaurants.restaurantId], references: [restaurants.id] }),
}));

export const invitationsRelations = relations(invitations, ({ one, many }) => ({
  sender: one(users, { relationName: "sentInvitations", fields: [invitations.senderId], references: [users.id] }),
  receiver: one(users, { relationName: "receivedInvitations", fields: [invitations.receiverId], references: [users.id] }),
  restaurant: one(restaurants, { fields: [invitations.restaurantId], references: [restaurants.id] }),
  receipts: many(receipts),
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

// Corporate relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  teams: many(teams),
  workspaces: many(workspaces),
  campusRestaurants: many(campusRestaurants),
  events: many(corporateEvents),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  organization: one(organizations, { fields: [teams.organizationId], references: [organizations.id] }),
  manager: one(users, { fields: [teams.managerId], references: [users.id] }),
  members: many(teamMembers),
  events: many(corporateEvents),
  teamBuildingActivities: many(teamBuildingActivities), // Premium feature
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  organization: one(organizations, { fields: [workspaces.organizationId], references: [organizations.id] }),
  users: many(users),
  campusRestaurants: many(campusRestaurants),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, { fields: [teamMembers.teamId], references: [teams.id] }),
  user: one(users, { relationName: "teamMember", fields: [teamMembers.userId], references: [users.id] }),
}));

export const campusRestaurantsRelations = relations(campusRestaurants, ({ one }) => ({
  organization: one(organizations, { fields: [campusRestaurants.organizationId], references: [organizations.id] }),
  workspace: one(workspaces, { fields: [campusRestaurants.workspaceId], references: [workspaces.id] }),
}));

export const corporateEventsRelations = relations(corporateEvents, ({ one, many }) => ({
  organization: one(organizations, { fields: [corporateEvents.organizationId], references: [organizations.id] }),
  team: one(teams, { fields: [corporateEvents.teamId], references: [teams.id] }),
  creator: one(users, { relationName: "eventCreator", fields: [corporateEvents.createdBy], references: [users.id] }),
  participants: many(eventParticipants),
}));

export const eventParticipantsRelations = relations(eventParticipants, ({ one }) => ({
  event: one(corporateEvents, { fields: [eventParticipants.eventId], references: [corporateEvents.id] }),
  user: one(users, { relationName: "eventParticipant", fields: [eventParticipants.userId], references: [users.id] }),
}));

// Premium features relations
export const privateDiningRoomsRelations = relations(privateDiningRooms, ({ one }) => ({
  restaurant: one(restaurants, { fields: [privateDiningRooms.restaurantId], references: [restaurants.id] }),
}));

export const specialEventsRelations = relations(specialEvents, ({ one, many }) => ({
  host: one(users, { fields: [specialEvents.hostId], references: [users.id] }),
  attendees: many(specialEventAttendees),
}));

export const specialEventAttendeesRelations = relations(specialEventAttendees, ({ one }) => ({
  event: one(specialEvents, { fields: [specialEventAttendees.eventId], references: [specialEvents.id] }),
  user: one(users, { fields: [specialEventAttendees.userId], references: [users.id] }),
}));

export const teamBuildingActivitiesRelations = relations(teamBuildingActivities, ({ one }) => ({
  team: one(teams, { fields: [teamBuildingActivities.teamId], references: [teams.id] }),
  creator: one(users, { fields: [teamBuildingActivities.createdBy], references: [users.id] }),
}));

export const receiptsRelations = relations(receipts, ({ one }) => ({
  user: one(users, { fields: [receipts.userId], references: [users.id] }),
  invitation: one(invitations, { fields: [receipts.invitationId], references: [invitations.id] }),
  restaurant: one(restaurants, { fields: [receipts.restaurantId], references: [restaurants.id] }),
}));

export const travelProfilesRelations = relations(travelProfiles, ({ one }) => ({
  user: one(users, { fields: [travelProfiles.userId], references: [users.id] }),
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

// Corporate schemas
export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
});

export const insertWorkspaceSchema = createInsertSchema(workspaces).omit({
  id: true,
  createdAt: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  joinedAt: true,
});

export const insertCampusRestaurantSchema = createInsertSchema(campusRestaurants).omit({
  id: true,
  createdAt: true,
});

export const insertCorporateEventSchema = createInsertSchema(corporateEvents).omit({
  id: true,
  createdAt: true,
});

export const insertEventParticipantSchema = createInsertSchema(eventParticipants).omit({
  joinedAt: true,
});

// Corporate types
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;

export type Workspace = typeof workspaces.$inferSelect;
export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;

export type CampusRestaurant = typeof campusRestaurants.$inferSelect;
export type InsertCampusRestaurant = z.infer<typeof insertCampusRestaurantSchema>;

export type CorporateEvent = typeof corporateEvents.$inferSelect;
export type InsertCorporateEvent = z.infer<typeof insertCorporateEventSchema>;

export type EventParticipant = typeof eventParticipants.$inferSelect;
export type InsertEventParticipant = z.infer<typeof insertEventParticipantSchema>;

// Premium features schemas
export const insertPrivateDiningRoomSchema = createInsertSchema(privateDiningRooms, {
  amenities: z.array(z.string()).optional(),
  availableTimeSlots: z.array(z.object({
    day: z.string(),
    slots: z.array(z.string())
  })).optional(),
  images: z.array(z.string()).optional(),
}).omit({
  id: true,
  createdAt: true,
});

export const insertSpecialEventSchema = createInsertSchema(specialEvents).omit({
  id: true,
  createdAt: true,
});

export const insertSpecialEventAttendeeSchema = createInsertSchema(specialEventAttendees).omit({
  registeredAt: true,
});

export const insertTeamBuildingActivitySchema = createInsertSchema(teamBuildingActivities, {
  settings: z.record(z.any()).optional(),
}).omit({
  id: true,
  createdAt: true,
});

export const insertReceiptSchema = createInsertSchema(receipts, {
  tags: z.array(z.string()).optional(),
  sharedWithUserIds: z.array(z.number()).optional(),
  splitDetails: z.array(z.object({
    userId: z.number(),
    amount: z.number(),
    isPaid: z.boolean().optional(),
    paymentMethod: z.string().optional(),
    paymentDate: z.string().optional(),
  })).optional(),
}).omit({
  id: true,
  createdAt: true,
});

export const insertTravelProfileSchema = createInsertSchema(travelProfiles, {
  travelPreferences: z.object({
    meetLocals: z.boolean().optional(),
    findFellowTravelers: z.boolean().optional(),
    exploreCuisines: z.boolean().optional(),
  }).optional(),
  upcomingTrips: z.array(z.object({
    destination: z.string(),
    arrivalDate: z.string(),
    departureDate: z.string(),
    notes: z.string().optional(),
  })).optional(),
  preferredMeetingTimes: z.array(z.string()).optional(),
}).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

// Premium features types
export type PrivateDiningRoom = typeof privateDiningRooms.$inferSelect;
export type InsertPrivateDiningRoom = z.infer<typeof insertPrivateDiningRoomSchema>;

export type SpecialEvent = typeof specialEvents.$inferSelect;
export type InsertSpecialEvent = z.infer<typeof insertSpecialEventSchema>;

export type SpecialEventAttendee = typeof specialEventAttendees.$inferSelect;
export type InsertSpecialEventAttendee = z.infer<typeof insertSpecialEventAttendeeSchema>;

export type TeamBuildingActivity = typeof teamBuildingActivities.$inferSelect;
export type InsertTeamBuildingActivity = z.infer<typeof insertTeamBuildingActivitySchema>;

export type Receipt = typeof receipts.$inferSelect;
export type InsertReceipt = z.infer<typeof insertReceiptSchema>;

export type TravelProfile = typeof travelProfiles.$inferSelect;
export type InsertTravelProfile = z.infer<typeof insertTravelProfileSchema>;
