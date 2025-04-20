import { users, type User, type InsertUser, restaurants, type Restaurant, type InsertRestaurant, invitations, type Invitation, type InsertInvitation } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
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
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private restaurants: Map<number, Restaurant>;
  private invitations: Map<number, Invitation>;
  sessionStore: session.SessionStore;
  private userIdCounter: number;
  private restaurantIdCounter: number;
  private invitationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.restaurants = new Map();
    this.invitations = new Map();
    this.userIdCounter = 1;
    this.restaurantIdCounter = 1;
    this.invitationIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Add some initial restaurants for testing
    this.seedRestaurants();
  }

  private seedRestaurants() {
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

    sampleRestaurants.forEach(restaurant => {
      this.createRestaurant(restaurant);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id, 
      isVerified: false, 
      foodPreferences: [],
      lastActive: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getNearbyUsers(lat: string, lng: string, radius: number): Promise<User[]> {
    // In a real app, we would use geospatial queries
    // For this mock, return all users except the one with the provided coordinates
    return Array.from(this.users.values()).filter(user => 
      user.locationLat !== lat && user.locationLng !== lng
    );
  }

  // Restaurant methods
  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    return this.restaurants.get(id);
  }

  async createRestaurant(insertRestaurant: InsertRestaurant): Promise<Restaurant> {
    const id = this.restaurantIdCounter++;
    const restaurant: Restaurant = { ...insertRestaurant, id, activeUserCount: 0 };
    this.restaurants.set(id, restaurant);
    return restaurant;
  }

  async getNearbyRestaurants(lat: string, lng: string, radius: number): Promise<Restaurant[]> {
    // In a real app, we would use geospatial queries
    // For this mock, return all restaurants
    return Array.from(this.restaurants.values());
  }

  async updateActiveUserCount(id: number, count: number): Promise<Restaurant | undefined> {
    const restaurant = await this.getRestaurant(id);
    if (!restaurant) return undefined;
    
    const updatedRestaurant = { ...restaurant, activeUserCount: count };
    this.restaurants.set(id, updatedRestaurant);
    return updatedRestaurant;
  }

  // Invitation methods
  async getInvitation(id: number): Promise<Invitation | undefined> {
    return this.invitations.get(id);
  }

  async createInvitation(insertInvitation: InsertInvitation): Promise<Invitation> {
    const id = this.invitationIdCounter++;
    const invitation: Invitation = { ...insertInvitation, id, createdAt: new Date() };
    this.invitations.set(id, invitation);
    return invitation;
  }

  async updateInvitationStatus(id: number, status: string): Promise<Invitation | undefined> {
    const invitation = await this.getInvitation(id);
    if (!invitation) return undefined;
    
    const updatedInvitation = { ...invitation, status };
    this.invitations.set(id, updatedInvitation);
    return updatedInvitation;
  }

  async getInvitationsForUser(userId: number): Promise<Invitation[]> {
    return Array.from(this.invitations.values()).filter(
      invitation => invitation.receiverId === userId || invitation.senderId === userId
    );
  }

  async getUpcomingMeals(userId: number): Promise<(Invitation & { restaurant: Restaurant, partner: User })[]> {
    const allInvitations = Array.from(this.invitations.values()).filter(
      invitation => (invitation.receiverId === userId || invitation.senderId === userId) && 
      invitation.status === 'accepted' &&
      new Date(invitation.date) >= new Date()
    );
    
    // For each invitation, get the restaurant and partner info
    return allInvitations.map(invitation => {
      const restaurant = this.restaurants.get(invitation.restaurantId)!;
      const partnerId = invitation.senderId === userId ? invitation.receiverId : invitation.senderId;
      const partner = this.users.get(partnerId)!;
      
      return {
        ...invitation,
        restaurant,
        partner
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}

export const storage = new MemStorage();
