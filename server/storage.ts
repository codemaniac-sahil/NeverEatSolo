import { 
  users, type User, type InsertUser, 
  restaurants, type Restaurant, type InsertRestaurant, 
  invitations, type Invitation, type InsertInvitation,
  messages, type Message, type InsertMessage,
  conversations, type Conversation, type InsertConversation,
  savedRestaurants, type SavedRestaurant, type InsertSavedRestaurant
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq, or, and, gte, sql, desc, asc } from "drizzle-orm";
import { pool } from "./db";

// @ts-ignore - Type definition issue with connect-pg-simple
const PostgresSessionStore = connectPg(session);

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByMicrosoftId(microsoftId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  getNearbyUsers(lat: string, lng: string, radius: number): Promise<User[]>;
  
  // Restaurant operations
  getRestaurant(id: number): Promise<Restaurant | undefined>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  getNearbyRestaurants(lat: string, lng: string, radius: number): Promise<Restaurant[]>;
  updateActiveUserCount(id: number, count: number): Promise<Restaurant | undefined>;
  
  // Invitation operations
  getInvitation(id: number): Promise<Invitation | undefined>;
  createInvitation(invitation: InsertInvitation): Promise<Invitation>;
  updateInvitationStatus(id: number, status: string): Promise<Invitation | undefined>;
  updateInvitationCalendarInfo(
    id: number, 
    outlookEventId: string, 
    calendarSynced: boolean, 
    lastCalendarSync: Date
  ): Promise<Invitation | undefined>;
  getInvitationsForUser(userId: number): Promise<Invitation[]>;
  getUpcomingMeals(userId: number): Promise<(Invitation & { restaurant: Restaurant, partner: User })[]>;
  
  // Messaging operations
  getConversations(userId: number): Promise<(Conversation & { 
    otherUser: User, 
    lastMessage: Message | null 
  })[]>;
  
  getConversationByUsers(user1Id: number, user2Id: number): Promise<Conversation | undefined>;
  
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  
  getMessages(conversationId: string): Promise<(Message & { 
    sender: User 
  })[]>;
  
  createMessage(message: InsertMessage): Promise<Message>;
  
  markMessagesAsRead(conversationId: string, userId: number): Promise<void>;

  getUnreadCount(userId: number): Promise<number>;
  
  // Saved Restaurants operations
  getSavedRestaurant(id: number): Promise<SavedRestaurant | undefined>;
  getSavedRestaurantByUserAndRestaurant(userId: number, restaurantId: number): Promise<SavedRestaurant | undefined>;
  getUserSavedRestaurants(userId: number): Promise<(SavedRestaurant & { restaurant: Restaurant })[]>;
  createSavedRestaurant(savedRestaurant: InsertSavedRestaurant): Promise<SavedRestaurant>;
  updateSavedRestaurant(id: number, data: Partial<SavedRestaurant>): Promise<SavedRestaurant | undefined>;
  deleteSavedRestaurant(id: number): Promise<boolean>;
  getUsersWithSavedRestaurant(restaurantId: number): Promise<User[]>;
  getRestaurantOverlap(userId: number, otherUserId: number): Promise<{ restaurants: Restaurant[], count: number }>;
  
  // Friend operations
  getFriend(id: number): Promise<Friend | undefined>;
  getFriendshipByUsers(userId: number, friendId: number): Promise<Friend | undefined>;
  getUserFriends(userId: number): Promise<(Friend & { friend: User })[]>;
  getUserFriendRequests(userId: number): Promise<(Friend & { user: User })[]>;
  createFriend(friend: InsertFriend): Promise<Friend>;
  updateFriendStatus(id: number, status: string): Promise<Friend | undefined>;
  deleteFriend(id: number): Promise<boolean>;
  
  // Dining Circle operations
  getDiningCircle(id: number): Promise<DiningCircle | undefined>;
  getUserDiningCircles(userId: number): Promise<(DiningCircle & { memberCount: number })[]>;
  createDiningCircle(diningCircle: InsertDiningCircle): Promise<DiningCircle>;
  updateDiningCircle(id: number, data: Partial<DiningCircle>): Promise<DiningCircle | undefined>;
  deleteDiningCircle(id: number): Promise<boolean>;
  getDiningCircleMembers(diningCircleId: number): Promise<(DiningCircleMember & { user: User })[]>;
  addDiningCircleMember(member: InsertDiningCircleMember): Promise<DiningCircleMember>;
  removeDiningCircleMember(diningCircleId: number, userId: number): Promise<boolean>;
  updateDiningCircleMemberRole(diningCircleId: number, userId: number, role: string): Promise<DiningCircleMember | undefined>;
  
  // User Availability operations
  getUserAvailability(id: number): Promise<UserAvailability | undefined>;
  getCurrentUserAvailability(userId: number): Promise<UserAvailability | undefined>;
  getUserAvailabilities(userId: number): Promise<UserAvailability[]>;
  getAvailableUsersNearby(lat: string, lng: string, radius: number): Promise<(UserAvailability & { user: User })[]>;
  createUserAvailability(availability: InsertUserAvailability): Promise<UserAvailability>;
  updateUserAvailability(id: number, data: Partial<UserAvailability>): Promise<UserAvailability | undefined>;
  deleteUserAvailability(id: number): Promise<boolean>;
  
  // Restaurant Recommendation operations
  getRestaurantRecommendation(id: number): Promise<RestaurantRecommendation | undefined>;
  getUserRecommendations(userId: number): Promise<(RestaurantRecommendation & { restaurant: Restaurant })[]>;
  createRestaurantRecommendation(recommendation: InsertRestaurantRecommendation): Promise<RestaurantRecommendation>;
  markRecommendationAsViewed(id: number): Promise<RestaurantRecommendation | undefined>;
  deleteRestaurantRecommendation(id: number): Promise<boolean>;
  generateRecommendationsForUser(userId: number): Promise<RestaurantRecommendation[]>;
  
  // Session store
  sessionStore: session.Store;
}

// Database implementation of IStorage
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
    
    // Seed some initial data
    this.seedInitialData();
  }
  
  // Messaging methods
  async getConversations(userId: number): Promise<(Conversation & { otherUser: User, lastMessage: Message | null })[]> {
    // Find all conversations where user is either user1 or user2
    const userConversations = await db
      .select()
      .from(conversations)
      .where(
        or(
          eq(conversations.user1Id, userId),
          eq(conversations.user2Id, userId)
        )
      )
      .orderBy(desc(conversations.lastMessageAt));
    
    const result: (Conversation & { otherUser: User, lastMessage: Message | null })[] = [];
    
    for (const conversation of userConversations) {
      // Determine which user is the "other" user
      const otherUserId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;
      
      // Get the other user's details
      const [otherUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, otherUserId));
        
      // Get the last message in this conversation
      const [lastMessage] = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversation.conversationId))
        .orderBy(desc(messages.createdAt))
        .limit(1);
      
      if (otherUser) {
        result.push({
          ...conversation,
          otherUser,
          lastMessage: lastMessage || null
        });
      }
    }
    
    return result;
  }
  
  async getConversationByUsers(user1Id: number, user2Id: number): Promise<Conversation | undefined> {
    // Sort the user IDs to ensure consistent conversation IDs
    const [smallerId, largerId] = [user1Id, user2Id].sort((a, b) => a - b);
    
    // Check if a conversation already exists
    const [existingConversation] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.user1Id, smallerId),
          eq(conversations.user2Id, largerId)
        )
      );
      
    return existingConversation;
  }
  
  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values(insertConversation)
      .returning();
      
    return conversation;
  }
  
  async getMessages(conversationId: string): Promise<(Message & { sender: User })[]> {
    // Get all messages in the conversation
    const messagesList = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt));
    
    // For each message, get the sender details
    const result: (Message & { sender: User })[] = [];
    
    for (const message of messagesList) {
      const [sender] = await db
        .select()
        .from(users)
        .where(eq(users.id, message.senderId));
        
      if (sender) {
        result.push({
          ...message,
          sender
        });
      }
    }
    
    return result;
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    // Create the message
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    
    // Update the lastMessageAt timestamp in the conversation
    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.conversationId, insertMessage.conversationId));
      
    return message;
  }
  
  async markMessagesAsRead(conversationId: string, userId: number): Promise<void> {
    // Update all unread messages sent to this user in this conversation
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.receiverId, userId),
          eq(messages.isRead, false)
        )
      );
  }
  
  async getUnreadCount(userId: number): Promise<number> {
    // Count all unread messages for this user
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(
        and(
          eq(messages.receiverId, userId),
          eq(messages.isRead, false)
        )
      );
      
    return result[0]?.count || 0;
  }

  // Saved Restaurants methods
  async getSavedRestaurant(id: number): Promise<SavedRestaurant | undefined> {
    const [savedRestaurant] = await db
      .select()
      .from(savedRestaurants)
      .where(eq(savedRestaurants.id, id));
    return savedRestaurant;
  }
  
  async getSavedRestaurantByUserAndRestaurant(userId: number, restaurantId: number): Promise<SavedRestaurant | undefined> {
    const [savedRestaurant] = await db
      .select()
      .from(savedRestaurants)
      .where(
        and(
          eq(savedRestaurants.userId, userId),
          eq(savedRestaurants.restaurantId, restaurantId)
        )
      );
    return savedRestaurant;
  }
  
  async getUserSavedRestaurants(userId: number): Promise<(SavedRestaurant & { restaurant: Restaurant })[]> {
    const savedRestaurantsList = await db
      .select()
      .from(savedRestaurants)
      .where(eq(savedRestaurants.userId, userId))
      .orderBy(desc(savedRestaurants.priority), desc(savedRestaurants.createdAt));
    
    const result: (SavedRestaurant & { restaurant: Restaurant })[] = [];
    
    for (const savedRestaurant of savedRestaurantsList) {
      const [restaurant] = await db
        .select()
        .from(restaurants)
        .where(eq(restaurants.id, savedRestaurant.restaurantId));
        
      if (restaurant) {
        result.push({
          ...savedRestaurant,
          restaurant
        });
      }
    }
    
    return result;
  }
  
  async createSavedRestaurant(insertSavedRestaurant: InsertSavedRestaurant): Promise<SavedRestaurant> {
    const [savedRestaurant] = await db
      .insert(savedRestaurants)
      .values(insertSavedRestaurant)
      .returning();
    return savedRestaurant;
  }
  
  async updateSavedRestaurant(id: number, data: Partial<SavedRestaurant>): Promise<SavedRestaurant | undefined> {
    const [updatedSavedRestaurant] = await db
      .update(savedRestaurants)
      .set(data)
      .where(eq(savedRestaurants.id, id))
      .returning();
    return updatedSavedRestaurant;
  }
  
  async deleteSavedRestaurant(id: number): Promise<boolean> {
    const result = await db
      .delete(savedRestaurants)
      .where(eq(savedRestaurants.id, id))
      .returning();
    return result.length > 0;
  }
  
  async getUsersWithSavedRestaurant(restaurantId: number): Promise<User[]> {
    const publicSavedRestaurants = await db
      .select()
      .from(savedRestaurants)
      .where(
        and(
          eq(savedRestaurants.restaurantId, restaurantId),
          eq(savedRestaurants.isPublic, true)
        )
      );
    
    const userIds = publicSavedRestaurants.map(saved => saved.userId);
    
    if (userIds.length === 0) {
      return [];
    }
    
    // Get users who have saved this restaurant publicly
    return await db
      .select()
      .from(users)
      .where(
        sql`${users.id} IN (${userIds.join(',')})`
      );
  }
  
  async getRestaurantOverlap(userId: number, otherUserId: number): Promise<{ restaurants: Restaurant[], count: number }> {
    // Get all restaurants saved by the current user
    const userSavedRestaurants = await db
      .select()
      .from(savedRestaurants)
      .where(eq(savedRestaurants.userId, userId));
    
    // Get all publicly saved restaurants by the other user
    const otherUserSavedRestaurants = await db
      .select()
      .from(savedRestaurants)
      .where(
        and(
          eq(savedRestaurants.userId, otherUserId),
          eq(savedRestaurants.isPublic, true)
        )
      );
    
    // Find the overlap of restaurant IDs
    const userRestaurantIds = userSavedRestaurants.map(saved => saved.restaurantId);
    const otherUserRestaurantIds = otherUserSavedRestaurants.map(saved => saved.restaurantId);
    const overlapIds = userRestaurantIds.filter(id => otherUserRestaurantIds.includes(id));
    
    if (overlapIds.length === 0) {
      return { restaurants: [], count: 0 };
    }
    
    // Get the detailed restaurant information for the overlapping IDs
    const overlapRestaurants = await db
      .select()
      .from(restaurants)
      .where(
        sql`${restaurants.id} IN (${overlapIds.join(',')})`
      );
    
    return {
      restaurants: overlapRestaurants,
      count: overlapIds.length
    };
  }

  private async seedInitialData() {
    // Check if there are any restaurants, if not, seed some
    const existingRestaurants = await db.select().from(restaurants).limit(1);
    
    if (existingRestaurants.length === 0) {
      const sampleRestaurants: InsertRestaurant[] = [
        {
          name: "The Rustic Table",
          cuisine: "Italian",
          priceRange: "$$",
          address: "123 Main St",
          locationLat: "40.7128",
          locationLng: "-74.0060",
          rating: "4.7",
          image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
        },
        {
          name: "Green Garden Café",
          cuisine: "Vegan",
          priceRange: "$$",
          address: "456 Oak St",
          locationLat: "40.7129",
          locationLng: "-74.0061",
          rating: "4.5",
          image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
        },
        {
          name: "Sushi Sensation",
          cuisine: "Japanese",
          priceRange: "$$$",
          address: "789 Pine St",
          locationLat: "40.7130",
          locationLng: "-74.0062",
          rating: "4.8",
          image: "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
        }
      ];

      for (const restaurant of sampleRestaurants) {
        await this.createRestaurant(restaurant);
      }
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(sql`LOWER(${users.username}) = LOWER(${username})`);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(sql`LOWER(${users.email}) = LOWER(${email})`);
    return user;
  }

  async getUserByMicrosoftId(microsoftId: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.microsoftId, microsoftId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getNearbyUsers(lat: string, lng: string, radius: number): Promise<User[]> {
    // In a real implementation, we would use a geospatial query
    // For simplicity, we'll just query all users except those with the exact same coordinates
    return await db
      .select()
      .from(users)
      .where(
        and(
          sql`${users.locationLat} IS NOT NULL`,
          sql`${users.locationLng} IS NOT NULL`,
          sql`${users.locationLat} <> ${lat} OR ${users.locationLng} <> ${lng}`
        )
      );
  }

  // Restaurant methods
  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    const [restaurant] = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.id, id));
    return restaurant;
  }

  async createRestaurant(insertRestaurant: InsertRestaurant): Promise<Restaurant> {
    const [restaurant] = await db
      .insert(restaurants)
      .values(insertRestaurant)
      .returning();
    return restaurant;
  }

  async getNearbyRestaurants(lat: string, lng: string, radius: number): Promise<Restaurant[]> {
    // Similarly, in a real implementation we would use geospatial queries
    // For now, return all restaurants
    return await db.select().from(restaurants);
  }

  async updateActiveUserCount(id: number, count: number): Promise<Restaurant | undefined> {
    const [updatedRestaurant] = await db
      .update(restaurants)
      .set({ activeUserCount: count })
      .where(eq(restaurants.id, id))
      .returning();
    return updatedRestaurant;
  }

  // Invitation methods
  async getInvitation(id: number): Promise<Invitation | undefined> {
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(eq(invitations.id, id));
    return invitation;
  }

  async createInvitation(insertInvitation: InsertInvitation): Promise<Invitation> {
    const [invitation] = await db
      .insert(invitations)
      .values(insertInvitation)
      .returning();
    return invitation;
  }

  async updateInvitationStatus(id: number, status: string): Promise<Invitation | undefined> {
    const [updatedInvitation] = await db
      .update(invitations)
      .set({ status })
      .where(eq(invitations.id, id))
      .returning();
    return updatedInvitation;
  }
  
  async updateInvitationCalendarInfo(
    id: number, 
    outlookEventId: string, 
    calendarSynced: boolean, 
    lastCalendarSync: Date
  ): Promise<Invitation | undefined> {
    const [updatedInvitation] = await db
      .update(invitations)
      .set({ 
        outlookEventId, 
        calendarSynced, 
        lastCalendarSync 
      })
      .where(eq(invitations.id, id))
      .returning();
    return updatedInvitation;
  }

  async getInvitationsForUser(userId: number): Promise<Invitation[]> {
    return await db
      .select()
      .from(invitations)
      .where(
        or(
          eq(invitations.senderId, userId),
          eq(invitations.receiverId, userId)
        )
      );
  }

  async getUpcomingMeals(userId: number): Promise<(Invitation & { restaurant: Restaurant, partner: User })[]> {
    // Get all invitations for this user
    const userInvitations = await this.getInvitationsForUser(userId);
    
    // For each invitation, get the restaurant and partner details
    const result: (Invitation & { restaurant: Restaurant, partner: User })[] = [];
    
    for (const invitation of userInvitations) {
      const restaurant = await this.getRestaurant(invitation.restaurantId);
      
      // Determine who is the partner (the other user)
      const partnerId = invitation.senderId === userId ? invitation.receiverId : invitation.senderId;
      const partner = await this.getUser(partnerId);
      
      if (restaurant && partner) {
        result.push({
          ...invitation,
          restaurant,
          partner
        });
      }
    }
    
    return result;
  }
}

export const storage = new DatabaseStorage();