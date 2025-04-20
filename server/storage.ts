import { users, type User, type InsertUser, restaurants, type Restaurant, type InsertRestaurant, invitations, type Invitation, type InsertInvitation } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq, or, and, gte, sql } from "drizzle-orm";
import { pool } from "./db";

// @ts-ignore - Type definition issue with connect-pg-simple
const PostgresSessionStore = connectPg(session);

// Storage interface - Keep the same
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
  getInvitationsForUser(userId: number): Promise<Invitation[]>;
  getUpcomingMeals(userId: number): Promise<(Invitation & { restaurant: Restaurant, partner: User })[]>;
  
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
    // This is more complex and requires multiple queries
    const invitationsList = await db
      .select()
      .from(invitations)
      .where(
        and(
          or(
            eq(invitations.senderId, userId),
            eq(invitations.receiverId, userId)
          ),
          eq(invitations.status, "accepted"),
          gte(invitations.date, new Date())
        )
      )
      .orderBy(invitations.date);
    
    // Now we need to get restaurant and partner data for each invitation
    const result: (Invitation & { restaurant: Restaurant, partner: User })[] = [];
    
    for (const invitation of invitationsList) {
      const [restaurant] = await db
        .select()
        .from(restaurants)
        .where(eq(restaurants.id, invitation.restaurantId));
      
      const partnerId = invitation.senderId === userId ? invitation.receiverId : invitation.senderId;
      const [partner] = await db
        .select()
        .from(users)
        .where(eq(users.id, partnerId));
      
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
