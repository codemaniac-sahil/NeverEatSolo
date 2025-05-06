import { 
  users, type User, type InsertUser, 
  restaurants, type Restaurant, type InsertRestaurant, 
  invitations, type Invitation, type InsertInvitation,
  messages, type Message, type InsertMessage,
  conversations, type Conversation, type InsertConversation,
  savedRestaurants, type SavedRestaurant, type InsertSavedRestaurant,
  friends, type Friend, type InsertFriend,
  diningCircles, type DiningCircle, type InsertDiningCircle,
  diningCircleMembers, type DiningCircleMember, type InsertDiningCircleMember,
  userAvailabilities, type UserAvailability, type InsertUserAvailability,
  restaurantRecommendations, type RestaurantRecommendation, type InsertRestaurantRecommendation,
  notifications, type Notification, type InsertNotification,
  userSettings, type UserSettings, type InsertUserSettings,
  organizations, type Organization, type InsertOrganization,
  teams, type Team, type InsertTeam,
  teamMembers, type TeamMember, type InsertTeamMember,
  workspaces, type Workspace, type InsertWorkspace,
  campusRestaurants, type CampusRestaurant, type InsertCampusRestaurant,
  corporateEvents, type CorporateEvent, type InsertCorporateEvent,
  eventParticipants, type EventParticipant, type InsertEventParticipant,
  privateDiningRooms, type PrivateDiningRoom, type InsertPrivateDiningRoom,
  specialEvents, type SpecialEvent, type InsertSpecialEvent,
  specialEventAttendees, type SpecialEventAttendee, type InsertSpecialEventAttendee,
  teamBuildingActivities, type TeamBuildingActivity, type InsertTeamBuildingActivity,
  travelProfiles, type TravelProfile, type InsertTravelProfile,
  receipts, type Receipt, type InsertReceipt
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
  
  // Notification operations
  getNotification(id: number): Promise<Notification | undefined>;
  getUserNotifications(userId: number): Promise<Notification[]>;
  getUserUnreadNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  deleteNotification(id: number): Promise<boolean>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
  
  // User Settings operations
  getUserSettings(userId: number): Promise<UserSettings | undefined>;
  createOrUpdateUserSettings(userId: number, settings: Partial<UserSettings>): Promise<UserSettings>;
  
  // Corporate Organization operations
  getOrganization(id: number): Promise<Organization | undefined>;
  getOrganizationByDomain(domain: string): Promise<Organization | undefined>;
  createOrganization(organization: InsertOrganization): Promise<Organization>;
  updateOrganization(id: number, data: Partial<Organization>): Promise<Organization | undefined>;
  
  // Corporate Team operations
  getTeam(id: number): Promise<Team | undefined>;
  getTeamsByOrganization(organizationId: number): Promise<Team[]>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: number, data: Partial<Team>): Promise<Team | undefined>;
  getTeamMembers(teamId: number): Promise<(TeamMember & { user: User })[]>;
  
  // Corporate User operations
  getUsersByOrganization(organizationId: number): Promise<User[]>;
  getUsersByWorkspace(workspaceId: number): Promise<User[]>;
  getUsersByTeam(teamId: number): Promise<User[]>;
  getUsersAvailableForLunch(
    organizationId: number,
    workspaceId?: number,
    teamId?: number,
    departmentOnly?: boolean
  ): Promise<(UserAvailability & { user: User })[]>;
  toggleWorkProfile(userId: number, useWorkProfile: boolean): Promise<User | undefined>;
  
  // Corporate Workspace operations
  getWorkspace(id: number): Promise<Workspace | undefined>;
  getWorkspacesByOrganization(organizationId: number): Promise<Workspace[]>;
  createWorkspace(workspace: InsertWorkspace): Promise<Workspace>;
  
  // Campus Restaurant operations
  getCampusRestaurant(id: number): Promise<CampusRestaurant | undefined>;
  getCampusRestaurantsByOrganization(organizationId: number): Promise<CampusRestaurant[]>;
  getCampusRestaurantsByWorkspace(workspaceId: number): Promise<CampusRestaurant[]>;
  createCampusRestaurant(restaurant: InsertCampusRestaurant): Promise<CampusRestaurant>;
  
  // Corporate Event operations
  getCorporateEvent(id: number): Promise<CorporateEvent | undefined>;
  getCorporateEventsByOrganization(organizationId: number): Promise<CorporateEvent[]>;
  getCorporateEventsByTeam(teamId: number): Promise<CorporateEvent[]>;
  getUpcomingCorporateEvents(userId: number): Promise<CorporateEvent[]>;
  createCorporateEvent(event: InsertCorporateEvent): Promise<CorporateEvent>;
  
  // Private Dining Room operations
  getPrivateDiningRoom(id: number): Promise<PrivateDiningRoom | undefined>;
  getPrivateDiningRoomsByRestaurant(restaurantId: number): Promise<PrivateDiningRoom[]>;
  createPrivateDiningRoom(room: InsertPrivateDiningRoom): Promise<PrivateDiningRoom>;
  updatePrivateDiningRoom(id: number, data: Partial<PrivateDiningRoom>): Promise<PrivateDiningRoom | undefined>;
  deletePrivateDiningRoom(id: number): Promise<boolean>;
  
  // Special Event operations
  getSpecialEvent(id: number): Promise<SpecialEvent | undefined>;
  getUserHostedSpecialEvents(userId: number): Promise<SpecialEvent[]>;
  getUserAttendingSpecialEvents(userId: number): Promise<(SpecialEventAttendee & { event: SpecialEvent })[]>;
  createSpecialEvent(event: InsertSpecialEvent): Promise<SpecialEvent>;
  updateSpecialEvent(id: number, data: Partial<SpecialEvent>): Promise<SpecialEvent | undefined>;
  deleteSpecialEvent(id: number): Promise<boolean>;
  getSpecialEventAttendees(eventId: number): Promise<(SpecialEventAttendee & { user: User })[]>;
  addSpecialEventAttendee(attendee: InsertSpecialEventAttendee): Promise<SpecialEventAttendee>;
  removeSpecialEventAttendee(eventId: number, userId: number): Promise<boolean>;
  
  // Team Building Activity operations
  getTeamBuildingActivity(id: number): Promise<TeamBuildingActivity | undefined>;
  getTeamBuildingActivitiesByTeam(teamId: number): Promise<TeamBuildingActivity[]>;
  createTeamBuildingActivity(activity: InsertTeamBuildingActivity): Promise<TeamBuildingActivity>;
  updateTeamBuildingActivity(id: number, data: Partial<TeamBuildingActivity>): Promise<TeamBuildingActivity | undefined>;
  deleteTeamBuildingActivity(id: number): Promise<boolean>;
  
  // Travel Profile operations
  getTravelProfile(userId: number): Promise<TravelProfile | undefined>;
  createTravelProfile(profile: InsertTravelProfile): Promise<TravelProfile>;
  updateTravelProfile(userId: number, data: Partial<TravelProfile>): Promise<TravelProfile | undefined>;
  deleteTravelProfile(userId: number): Promise<boolean>;
  getUsersInTravelMode(lat: string, lng: string, radius: number): Promise<(TravelProfile & { user: User })[]>;
  
  // Receipt operations
  getReceipt(id: number): Promise<Receipt | undefined>;
  getUserReceipts(userId: number): Promise<Receipt[]>;
  getReceiptsForInvitation(invitationId: number): Promise<Receipt[]>;
  getReceiptsForRestaurant(restaurantId: number): Promise<Receipt[]>;
  createReceipt(receipt: InsertReceipt): Promise<Receipt>;
  updateReceipt(id: number, data: Partial<Receipt>): Promise<Receipt | undefined>;
  deleteReceipt(id: number): Promise<boolean>;
  getSharedReceipts(userId: number): Promise<Receipt[]>;

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
  
  // Corporate Organization methods
  async getOrganization(id: number): Promise<Organization | undefined> {
    const [organization] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id));
    
    return organization;
  }
  
  async getOrganizationByDomain(domain: string): Promise<Organization | undefined> {
    const [organization] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.domain, domain));
    
    return organization;
  }
  
  async createOrganization(data: InsertOrganization): Promise<Organization> {
    const [organization] = await db
      .insert(organizations)
      .values(data)
      .returning();
    
    return organization;
  }
  
  async updateOrganization(id: number, data: Partial<Organization>): Promise<Organization | undefined> {
    const [updatedOrganization] = await db
      .update(organizations)
      .set(data)
      .where(eq(organizations.id, id))
      .returning();
    
    return updatedOrganization;
  }
  
  // Corporate Team methods
  async getTeam(id: number): Promise<Team | undefined> {
    const [team] = await db
      .select()
      .from(teams)
      .where(eq(teams.id, id));
    
    return team;
  }
  
  async getTeamsByOrganization(organizationId: number): Promise<Team[]> {
    return db
      .select()
      .from(teams)
      .where(eq(teams.organizationId, organizationId));
  }
  
  async createTeam(data: InsertTeam): Promise<Team> {
    const [team] = await db
      .insert(teams)
      .values(data)
      .returning();
    
    return team;
  }
  
  async updateTeam(id: number, data: Partial<Team>): Promise<Team | undefined> {
    const [updatedTeam] = await db
      .update(teams)
      .set(data)
      .where(eq(teams.id, id))
      .returning();
    
    return updatedTeam;
  }
  
  async getTeamMembers(teamId: number): Promise<(TeamMember & { user: User })[]> {
    const teamMembersWithUsers = await db
      .select({
        id: teamMembers.id,
        teamId: teamMembers.teamId,
        userId: teamMembers.userId,
        role: teamMembers.role,
        createdAt: teamMembers.createdAt,
        user: users
      })
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.teamId, teamId));
    
    return teamMembersWithUsers;
  }
  
  // Corporate User methods
  async getUsersByOrganization(organizationId: number): Promise<User[]> {
    return db
      .select()
      .from(users)
      .where(eq(users.organizationId, organizationId));
  }
  
  async getUsersByWorkspace(workspaceId: number): Promise<User[]> {
    return db
      .select()
      .from(users)
      .where(eq(users.workspaceId, workspaceId));
  }
  
  async getUsersByTeam(teamId: number): Promise<User[]> {
    const teamMembersWithUsers = await db
      .select({
        user: users
      })
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.teamId, teamId));
    
    return teamMembersWithUsers.map(item => item.user);
  }
  
  async getUsersAvailableForLunch(
    organizationId: number,
    workspaceId?: number,
    teamId?: number,
    departmentOnly?: boolean
  ): Promise<(UserAvailability & { user: User })[]> {
    let query = db
      .select({
        id: userAvailabilities.id,
        userId: userAvailabilities.userId,
        startTime: userAvailabilities.startTime,
        endTime: userAvailabilities.endTime,
        status: userAvailabilities.status,
        createdAt: userAvailabilities.createdAt,
        user: users
      })
      .from(userAvailabilities)
      .innerJoin(users, eq(userAvailabilities.userId, users.id))
      .where(
        and(
          eq(users.organizationId, organizationId),
          eq(users.useWorkProfile, true),
          eq(userAvailabilities.status, 'available')
        )
      );
    
    if (workspaceId) {
      query = query.where(eq(users.workspaceId, workspaceId));
    }
    
    if (departmentOnly) {
      // This would need the current user's department to filter
      // Simplified version just returns all available users
    }
    
    return query;
  }
  
  async toggleWorkProfile(userId: number, useWorkProfile: boolean): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ useWorkProfile })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }
  
  // Corporate Workspace methods
  async getWorkspace(id: number): Promise<Workspace | undefined> {
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, id));
    
    return workspace;
  }
  
  async getWorkspacesByOrganization(organizationId: number): Promise<Workspace[]> {
    return db
      .select()
      .from(workspaces)
      .where(eq(workspaces.organizationId, organizationId));
  }
  
  async createWorkspace(data: InsertWorkspace): Promise<Workspace> {
    const [workspace] = await db
      .insert(workspaces)
      .values(data)
      .returning();
    
    return workspace;
  }
  
  // Campus Restaurant methods
  async getCampusRestaurant(id: number): Promise<CampusRestaurant | undefined> {
    const [restaurant] = await db
      .select()
      .from(campusRestaurants)
      .where(eq(campusRestaurants.id, id));
    
    return restaurant;
  }
  
  async getCampusRestaurantsByOrganization(organizationId: number): Promise<CampusRestaurant[]> {
    return db
      .select()
      .from(campusRestaurants)
      .where(eq(campusRestaurants.organizationId, organizationId));
  }
  
  async getCampusRestaurantsByWorkspace(workspaceId: number): Promise<CampusRestaurant[]> {
    return db
      .select()
      .from(campusRestaurants)
      .where(eq(campusRestaurants.workspaceId, workspaceId));
  }
  
  async createCampusRestaurant(data: InsertCampusRestaurant): Promise<CampusRestaurant> {
    const [restaurant] = await db
      .insert(campusRestaurants)
      .values(data)
      .returning();
    
    return restaurant;
  }
  
  // Corporate Event methods
  async getCorporateEvent(id: number): Promise<CorporateEvent | undefined> {
    const [event] = await db
      .select()
      .from(corporateEvents)
      .where(eq(corporateEvents.id, id));
    
    return event;
  }
  
  async getCorporateEventsByOrganization(organizationId: number): Promise<CorporateEvent[]> {
    return db
      .select()
      .from(corporateEvents)
      .where(eq(corporateEvents.organizationId, organizationId));
  }
  
  async getCorporateEventsByTeam(teamId: number): Promise<CorporateEvent[]> {
    return db
      .select()
      .from(corporateEvents)
      .where(eq(corporateEvents.teamId, teamId));
  }
  
  async getUpcomingCorporateEvents(userId: number): Promise<CorporateEvent[]> {
    // Get the user's organization
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user?.organizationId) {
      return [];
    }
    
    // Get events from the user's organization where the date is in the future
    return db
      .select()
      .from(corporateEvents)
      .where(
        and(
          eq(corporateEvents.organizationId, user.organizationId),
          gte(corporateEvents.eventDate, sql`CURRENT_DATE`)
        )
      )
      .orderBy(asc(corporateEvents.eventDate));
  }
  
  async createCorporateEvent(data: InsertCorporateEvent): Promise<CorporateEvent> {
    const [event] = await db
      .insert(corporateEvents)
      .values(data)
      .returning();
    
    return event;
  }
  
  // Private Dining Room methods
  async getPrivateDiningRoom(id: number): Promise<PrivateDiningRoom | undefined> {
    const [room] = await db
      .select()
      .from(privateDiningRooms)
      .where(eq(privateDiningRooms.id, id));
    
    return room;
  }

  async getPrivateDiningRoomsByRestaurant(restaurantId: number): Promise<PrivateDiningRoom[]> {
    return db
      .select()
      .from(privateDiningRooms)
      .where(eq(privateDiningRooms.restaurantId, restaurantId));
  }

  async createPrivateDiningRoom(data: InsertPrivateDiningRoom): Promise<PrivateDiningRoom> {
    const [room] = await db
      .insert(privateDiningRooms)
      .values(data)
      .returning();
    
    return room;
  }

  async updatePrivateDiningRoom(id: number, data: Partial<PrivateDiningRoom>): Promise<PrivateDiningRoom | undefined> {
    const [updatedRoom] = await db
      .update(privateDiningRooms)
      .set(data)
      .where(eq(privateDiningRooms.id, id))
      .returning();
    
    return updatedRoom;
  }

  async deletePrivateDiningRoom(id: number): Promise<boolean> {
    const result = await db
      .delete(privateDiningRooms)
      .where(eq(privateDiningRooms.id, id));
    
    return result.rowCount > 0;
  }
  
  // Special Event methods
  async getSpecialEvent(id: number): Promise<SpecialEvent | undefined> {
    const [event] = await db
      .select()
      .from(specialEvents)
      .where(eq(specialEvents.id, id));
    
    return event;
  }

  async getUserHostedSpecialEvents(userId: number): Promise<SpecialEvent[]> {
    return db
      .select()
      .from(specialEvents)
      .where(eq(specialEvents.hostId, userId));
  }

  async getUserAttendingSpecialEvents(userId: number): Promise<(SpecialEventAttendee & { event: SpecialEvent })[]> {
    const attendeeEvents = await db
      .select({
        id: specialEventAttendees.id,
        eventId: specialEventAttendees.eventId,
        userId: specialEventAttendees.userId,
        status: specialEventAttendees.status,
        registeredAt: specialEventAttendees.registeredAt,
        event: specialEvents
      })
      .from(specialEventAttendees)
      .innerJoin(specialEvents, eq(specialEventAttendees.eventId, specialEvents.id))
      .where(eq(specialEventAttendees.userId, userId));
    
    return attendeeEvents;
  }

  async createSpecialEvent(data: InsertSpecialEvent): Promise<SpecialEvent> {
    const [event] = await db
      .insert(specialEvents)
      .values(data)
      .returning();
    
    return event;
  }

  async updateSpecialEvent(id: number, data: Partial<SpecialEvent>): Promise<SpecialEvent | undefined> {
    const [updatedEvent] = await db
      .update(specialEvents)
      .set(data)
      .where(eq(specialEvents.id, id))
      .returning();
    
    return updatedEvent;
  }

  async deleteSpecialEvent(id: number): Promise<boolean> {
    const result = await db
      .delete(specialEvents)
      .where(eq(specialEvents.id, id));
    
    return result.rowCount > 0;
  }

  async getSpecialEventAttendees(eventId: number): Promise<(SpecialEventAttendee & { user: User })[]> {
    const attendeesWithUsers = await db
      .select({
        id: specialEventAttendees.id,
        eventId: specialEventAttendees.eventId,
        userId: specialEventAttendees.userId,
        status: specialEventAttendees.status,
        registeredAt: specialEventAttendees.registeredAt,
        user: users
      })
      .from(specialEventAttendees)
      .innerJoin(users, eq(specialEventAttendees.userId, users.id))
      .where(eq(specialEventAttendees.eventId, eventId));
    
    return attendeesWithUsers;
  }

  async addSpecialEventAttendee(data: InsertSpecialEventAttendee): Promise<SpecialEventAttendee> {
    const [attendee] = await db
      .insert(specialEventAttendees)
      .values(data)
      .returning();
    
    return attendee;
  }

  async removeSpecialEventAttendee(eventId: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(specialEventAttendees)
      .where(
        and(
          eq(specialEventAttendees.eventId, eventId),
          eq(specialEventAttendees.userId, userId)
        )
      );
    
    return result.rowCount > 0;
  }
  
  // Team Building Activity methods
  async getTeamBuildingActivity(id: number): Promise<TeamBuildingActivity | undefined> {
    const [activity] = await db
      .select()
      .from(teamBuildingActivities)
      .where(eq(teamBuildingActivities.id, id));
    
    return activity;
  }

  async getTeamBuildingActivitiesByTeam(teamId: number): Promise<TeamBuildingActivity[]> {
    return db
      .select()
      .from(teamBuildingActivities)
      .where(eq(teamBuildingActivities.teamId, teamId));
  }

  async createTeamBuildingActivity(data: InsertTeamBuildingActivity): Promise<TeamBuildingActivity> {
    const [activity] = await db
      .insert(teamBuildingActivities)
      .values(data)
      .returning();
    
    return activity;
  }

  async updateTeamBuildingActivity(id: number, data: Partial<TeamBuildingActivity>): Promise<TeamBuildingActivity | undefined> {
    const [updatedActivity] = await db
      .update(teamBuildingActivities)
      .set(data)
      .where(eq(teamBuildingActivities.id, id))
      .returning();
    
    return updatedActivity;
  }

  async deleteTeamBuildingActivity(id: number): Promise<boolean> {
    const result = await db
      .delete(teamBuildingActivities)
      .where(eq(teamBuildingActivities.id, id));
    
    return result.rowCount > 0;
  }
  
  // Travel Profile methods
  async getTravelProfile(userId: number): Promise<TravelProfile | undefined> {
    const [profile] = await db
      .select()
      .from(travelProfiles)
      .where(eq(travelProfiles.userId, userId));
    
    return profile;
  }

  async createTravelProfile(data: InsertTravelProfile): Promise<TravelProfile> {
    const [profile] = await db
      .insert(travelProfiles)
      .values(data)
      .returning();
    
    return profile;
  }

  async updateTravelProfile(userId: number, data: Partial<TravelProfile>): Promise<TravelProfile | undefined> {
    const [updatedProfile] = await db
      .update(travelProfiles)
      .set(data)
      .where(eq(travelProfiles.userId, userId))
      .returning();
    
    return updatedProfile;
  }

  async deleteTravelProfile(userId: number): Promise<boolean> {
    const result = await db
      .delete(travelProfiles)
      .where(eq(travelProfiles.userId, userId));
    
    return result.rowCount > 0;
  }

  async getUsersInTravelMode(lat: string, lng: string, radius: number): Promise<(TravelProfile & { user: User })[]> {
    // This is a simplified version that just returns all travel profiles
    // In a real implementation, you would use a GeoSpatial query to filter by location
    const travelerProfiles = await db
      .select({
        id: travelProfiles.id,
        userId: travelProfiles.userId,
        destination: travelProfiles.destination,
        startDate: travelProfiles.startDate,
        endDate: travelProfiles.endDate,
        locationLat: travelProfiles.locationLat,
        locationLng: travelProfiles.locationLng,
        travelPreferences: travelProfiles.travelPreferences,
        upcomingTrips: travelProfiles.upcomingTrips,
        preferredMeetingTimes: travelProfiles.preferredMeetingTimes,
        createdAt: travelProfiles.createdAt,
        lastUpdated: travelProfiles.lastUpdated,
        user: users
      })
      .from(travelProfiles)
      .innerJoin(users, eq(travelProfiles.userId, users.id));
    
    // Filter results to match the current location and active travel dates
    const today = new Date();
    const filteredResults = travelerProfiles.filter(profile => {
      // Check if profile has start and end dates and they include the current date
      const isActiveTrip = profile.startDate && profile.endDate && 
        profile.startDate <= today && profile.endDate >= today;
        
      // In a real implementation, we would calculate distance between lat/lng here
      // For now, we'll just return all active travel profiles
      return isActiveTrip;
    });
    
    return filteredResults;
  }

  // Receipt methods
  async getReceipt(id: number): Promise<Receipt | undefined> {
    const [receipt] = await db
      .select()
      .from(receipts)
      .where(eq(receipts.id, id));
    
    return receipt;
  }

  async getUserReceipts(userId: number): Promise<Receipt[]> {
    return db
      .select()
      .from(receipts)
      .where(eq(receipts.userId, userId))
      .orderBy(desc(receipts.date));
  }

  async getReceiptsForInvitation(invitationId: number): Promise<Receipt[]> {
    return db
      .select()
      .from(receipts)
      .where(eq(receipts.invitationId, invitationId))
      .orderBy(desc(receipts.date));
  }

  async getReceiptsForRestaurant(restaurantId: number): Promise<Receipt[]> {
    return db
      .select()
      .from(receipts)
      .where(eq(receipts.restaurantId, restaurantId))
      .orderBy(desc(receipts.date));
  }

  async createReceipt(data: InsertReceipt): Promise<Receipt> {
    const [receipt] = await db
      .insert(receipts)
      .values(data)
      .returning();
    
    return receipt;
  }

  async updateReceipt(id: number, data: Partial<Receipt>): Promise<Receipt | undefined> {
    const [updatedReceipt] = await db
      .update(receipts)
      .set(data)
      .where(eq(receipts.id, id))
      .returning();
    
    return updatedReceipt;
  }

  async deleteReceipt(id: number): Promise<boolean> {
    const result = await db
      .delete(receipts)
      .where(eq(receipts.id, id));
    
    return result.rowCount > 0;
  }

  async getSharedReceipts(userId: number): Promise<Receipt[]> {
    // This is a simplified version that finds receipts where the user ID is in the sharedWithUserIds array
    // In PostgreSQL, you would use a more efficient query with JSON operators
    const allReceipts = await db
      .select()
      .from(receipts)
      .where(eq(receipts.isShared, true));
    
    // Filter results to find receipts shared with the specified user
    const sharedReceipts = allReceipts.filter(receipt => 
      receipt.sharedWithUserIds && 
      Array.isArray(receipt.sharedWithUserIds) && 
      receipt.sharedWithUserIds.includes(userId)
    );
    
    return sharedReceipts;
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

  // Friend methods
  async getFriend(id: number): Promise<Friend | undefined> {
    const [friend] = await db
      .select()
      .from(friends)
      .where(eq(friends.id, id));
    return friend;
  }
  
  async getFriendshipByUsers(userId: number, friendId: number): Promise<Friend | undefined> {
    const [friendship] = await db
      .select()
      .from(friends)
      .where(
        or(
          and(
            eq(friends.userId, userId),
            eq(friends.friendId, friendId)
          ),
          and(
            eq(friends.userId, friendId),
            eq(friends.friendId, userId)
          )
        )
      );
    return friendship;
  }
  
  async getUserFriends(userId: number): Promise<(Friend & { friend: User })[]> {
    // Get all accepted friendships where the user is either userId or friendId
    const friendships = await db
      .select()
      .from(friends)
      .where(
        and(
          or(
            eq(friends.userId, userId),
            eq(friends.friendId, userId)
          ),
          eq(friends.status, 'accepted')
        )
      );
    
    const result: (Friend & { friend: User })[] = [];
    
    for (const friendship of friendships) {
      // Get the other user's details (the friend)
      const friendId = friendship.userId === userId ? friendship.friendId : friendship.userId;
      const [friendData] = await db
        .select()
        .from(users)
        .where(eq(users.id, friendId));
        
      if (friendData) {
        result.push({
          ...friendship,
          friend: friendData
        });
      }
    }
    
    return result;
  }
  
  async getUserFriendRequests(userId: number): Promise<(Friend & { user: User })[]> {
    // Get all pending friend requests where the user is the recipient
    const friendRequests = await db
      .select()
      .from(friends)
      .where(
        and(
          eq(friends.friendId, userId),
          eq(friends.status, 'pending')
        )
      );
    
    const result: (Friend & { user: User })[] = [];
    
    for (const request of friendRequests) {
      // Get the sender's details
      const [userData] = await db
        .select()
        .from(users)
        .where(eq(users.id, request.userId));
        
      if (userData) {
        result.push({
          ...request,
          user: userData
        });
      }
    }
    
    return result;
  }
  
  async createFriend(insertFriend: InsertFriend): Promise<Friend> {
    const [friend] = await db
      .insert(friends)
      .values(insertFriend)
      .returning();
      
    return friend;
  }
  
  async updateFriendStatus(id: number, status: string): Promise<Friend | undefined> {
    const [updatedFriend] = await db
      .update(friends)
      .set({ status })
      .where(eq(friends.id, id))
      .returning();
      
    return updatedFriend;
  }
  
  async deleteFriend(id: number): Promise<boolean> {
    const result = await db
      .delete(friends)
      .where(eq(friends.id, id))
      .returning();
      
    return result.length > 0;
  }
  
  // Dining Circle methods
  async getDiningCircle(id: number): Promise<DiningCircle | undefined> {
    const [diningCircle] = await db
      .select()
      .from(diningCircles)
      .where(eq(diningCircles.id, id));
    return diningCircle;
  }
  
  async getUserDiningCircles(userId: number): Promise<(DiningCircle & { memberCount: number })[]> {
    // Get all dining circles where user is a member
    const membershipsList = await db
      .select()
      .from(diningCircleMembers)
      .where(eq(diningCircleMembers.userId, userId));
    
    const result: (DiningCircle & { memberCount: number })[] = [];
    
    for (const membership of membershipsList) {
      const [circle] = await db
        .select()
        .from(diningCircles)
        .where(eq(diningCircles.id, membership.diningCircleId));
      
      if (circle) {
        // Count members in this circle
        const membersCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(diningCircleMembers)
          .where(eq(diningCircleMembers.diningCircleId, circle.id));
        
        result.push({
          ...circle,
          memberCount: membersCount[0]?.count || 0
        });
      }
    }
    
    return result;
  }
  
  async createDiningCircle(insertDiningCircle: InsertDiningCircle): Promise<DiningCircle> {
    const [diningCircle] = await db
      .insert(diningCircles)
      .values(insertDiningCircle)
      .returning();
    
    // Automatically add the creator as a member with 'admin' role
    await db
      .insert(diningCircleMembers)
      .values({
        diningCircleId: diningCircle.id,
        userId: insertDiningCircle.createdBy,
        role: 'admin'
      });
      
    return diningCircle;
  }
  
  async updateDiningCircle(id: number, data: Partial<DiningCircle>): Promise<DiningCircle | undefined> {
    const [updatedDiningCircle] = await db
      .update(diningCircles)
      .set(data)
      .where(eq(diningCircles.id, id))
      .returning();
      
    return updatedDiningCircle;
  }
  
  async deleteDiningCircle(id: number): Promise<boolean> {
    // First delete all members
    await db
      .delete(diningCircleMembers)
      .where(eq(diningCircleMembers.diningCircleId, id));
    
    // Then delete the circle
    const result = await db
      .delete(diningCircles)
      .where(eq(diningCircles.id, id))
      .returning();
      
    return result.length > 0;
  }
  
  async getDiningCircleMembers(diningCircleId: number): Promise<(DiningCircleMember & { user: User })[]> {
    const membersList = await db
      .select()
      .from(diningCircleMembers)
      .where(eq(diningCircleMembers.diningCircleId, diningCircleId));
    
    const result: (DiningCircleMember & { user: User })[] = [];
    
    for (const member of membersList) {
      const [userData] = await db
        .select()
        .from(users)
        .where(eq(users.id, member.userId));
        
      if (userData) {
        result.push({
          ...member,
          user: userData
        });
      }
    }
    
    return result;
  }
  
  async addDiningCircleMember(insertMember: InsertDiningCircleMember): Promise<DiningCircleMember> {
    const [member] = await db
      .insert(diningCircleMembers)
      .values(insertMember)
      .returning();
      
    return member;
  }
  
  async removeDiningCircleMember(diningCircleId: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(diningCircleMembers)
      .where(
        and(
          eq(diningCircleMembers.diningCircleId, diningCircleId),
          eq(diningCircleMembers.userId, userId)
        )
      )
      .returning();
      
    return result.length > 0;
  }
  
  async updateDiningCircleMemberRole(diningCircleId: number, userId: number, role: string): Promise<DiningCircleMember | undefined> {
    const [updatedMember] = await db
      .update(diningCircleMembers)
      .set({ role })
      .where(
        and(
          eq(diningCircleMembers.diningCircleId, diningCircleId),
          eq(diningCircleMembers.userId, userId)
        )
      )
      .returning();
      
    return updatedMember;
  }
  
  // User Availability methods
  async getUserAvailability(id: number): Promise<UserAvailability | undefined> {
    const [availability] = await db
      .select()
      .from(userAvailabilities)
      .where(eq(userAvailabilities.id, id));
    return availability;
  }
  
  async getCurrentUserAvailability(userId: number): Promise<UserAvailability | undefined> {
    const now = new Date();
    
    // Get the current active availability (where now is between start and end time)
    const [availability] = await db
      .select()
      .from(userAvailabilities)
      .where(
        and(
          eq(userAvailabilities.userId, userId),
          gte(sql`${userAvailabilities.endTime}::timestamp`, now)
        )
      )
      .orderBy(desc(userAvailabilities.createdAt))
      .limit(1);
      
    return availability;
  }
  
  async getUserAvailabilities(userId: number): Promise<UserAvailability[]> {
    return db
      .select()
      .from(userAvailabilities)
      .where(eq(userAvailabilities.userId, userId))
      .orderBy(desc(userAvailabilities.createdAt));
  }
  
  async getAvailableUsersNearby(lat: string, lng: string, radius: number): Promise<(UserAvailability & { user: User })[]> {
    const now = new Date();
    
    // Get all active availabilities (where now is between start and end time)
    const activeAvailabilities = await db
      .select()
      .from(userAvailabilities)
      .where(gte(sql`${userAvailabilities.endTime}::timestamp`, now));
    
    // Filter by location if provided
    let nearbyAvailabilities = activeAvailabilities;
    if (lat && lng && radius) {
      nearbyAvailabilities = activeAvailabilities.filter(avail => {
        if (!avail.locationLat || !avail.locationLng) return false;
        
        // Calculate distance using Haversine formula
        const R = 6371; // Earth radius in km
        const dLat = this.toRad(parseFloat(avail.locationLat) - parseFloat(lat));
        const dLon = this.toRad(parseFloat(avail.locationLng) - parseFloat(lng));
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(this.toRad(parseFloat(lat))) * Math.cos(this.toRad(parseFloat(avail.locationLat))) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        return distance <= radius;
      });
    }
    
    // Get user details for each availability
    const result: (UserAvailability & { user: User })[] = [];
    
    for (const avail of nearbyAvailabilities) {
      const [userData] = await db
        .select()
        .from(users)
        .where(eq(users.id, avail.userId));
        
      if (userData) {
        result.push({
          ...avail,
          user: userData
        });
      }
    }
    
    return result;
  }
  
  // Helper for Haversine formula
  private toRad(value: number): number {
    return value * Math.PI / 180;
  }
  
  async createUserAvailability(insertAvailability: InsertUserAvailability): Promise<UserAvailability> {
    const [availability] = await db
      .insert(userAvailabilities)
      .values(insertAvailability)
      .returning();
      
    return availability;
  }
  
  async updateUserAvailability(id: number, data: Partial<UserAvailability>): Promise<UserAvailability | undefined> {
    const [updatedAvailability] = await db
      .update(userAvailabilities)
      .set(data)
      .where(eq(userAvailabilities.id, id))
      .returning();
      
    return updatedAvailability;
  }
  
  async deleteUserAvailability(id: number): Promise<boolean> {
    const result = await db
      .delete(userAvailabilities)
      .where(eq(userAvailabilities.id, id))
      .returning();
      
    return result.length > 0;
  }
  
  // Restaurant Recommendation methods
  async getRestaurantRecommendation(id: number): Promise<RestaurantRecommendation | undefined> {
    const [recommendation] = await db
      .select()
      .from(restaurantRecommendations)
      .where(eq(restaurantRecommendations.id, id));
    return recommendation;
  }
  
  async getUserRecommendations(userId: number): Promise<(RestaurantRecommendation & { restaurant: Restaurant })[]> {
    const recommendationsList = await db
      .select()
      .from(restaurantRecommendations)
      .where(eq(restaurantRecommendations.userId, userId))
      .orderBy(desc(restaurantRecommendations.score), desc(restaurantRecommendations.createdAt));
    
    const result: (RestaurantRecommendation & { restaurant: Restaurant })[] = [];
    
    for (const recommendation of recommendationsList) {
      const [restaurant] = await db
        .select()
        .from(restaurants)
        .where(eq(restaurants.id, recommendation.restaurantId));
        
      if (restaurant) {
        result.push({
          ...recommendation,
          restaurant
        });
      }
    }
    
    return result;
  }
  
  async createRestaurantRecommendation(insertRecommendation: InsertRestaurantRecommendation): Promise<RestaurantRecommendation> {
    const [recommendation] = await db
      .insert(restaurantRecommendations)
      .values(insertRecommendation)
      .returning();
      
    return recommendation;
  }
  
  async markRecommendationAsViewed(id: number): Promise<RestaurantRecommendation | undefined> {
    const [updatedRecommendation] = await db
      .update(restaurantRecommendations)
      .set({ viewedAt: new Date() })
      .where(eq(restaurantRecommendations.id, id))
      .returning();
      
    return updatedRecommendation;
  }
  
  async deleteRestaurantRecommendation(id: number): Promise<boolean> {
    const result = await db
      .delete(restaurantRecommendations)
      .where(eq(restaurantRecommendations.id, id))
      .returning();
      
    return result.length > 0;
  }
  
  async generateRecommendationsForUser(userId: number): Promise<RestaurantRecommendation[]> {
    // Get user preferences
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user) return [];
    
    // Get restaurants that match user preferences
    const allRestaurants = await db.select().from(restaurants);
    
    // Generate recommendations based on cuisine preference match
    const recommendations: RestaurantRecommendation[] = [];
    
    for (const restaurant of allRestaurants) {
      // Check if user already has this recommendation
      const [existingRecommendation] = await db
        .select()
        .from(restaurantRecommendations)
        .where(
          and(
            eq(restaurantRecommendations.userId, userId),
            eq(restaurantRecommendations.restaurantId, restaurant.id)
          )
        );
      
      if (existingRecommendation) continue;
      
      // Calculate score based on cuisine match
      let score = 0;
      let reason = '';
      
      if (user.cuisinePreferences?.includes(restaurant.cuisine)) {
        score += 50;
        reason += 'Matches your cuisine preferences. ';
      }
      
      // Check if friends have saved this restaurant
      const userFriends = await this.getUserFriends(userId);
      const friendIds = userFriends.map(f => f.friend.id);
      
      if (friendIds.length > 0) {
        const friendSaves = await db
          .select()
          .from(savedRestaurants)
          .where(
            and(
              eq(savedRestaurants.restaurantId, restaurant.id),
              sql`${savedRestaurants.userId} IN (${friendIds.join(',')})`
            )
          );
        
        if (friendSaves.length > 0) {
          score += 30;
          reason += `${friendSaves.length} of your friends saved this restaurant. `;
        }
      }
      
      // Only add recommendations with a minimum score
      if (score >= 20) {
        const newRecommendation = await this.createRestaurantRecommendation({
          userId,
          restaurantId: restaurant.id,
          score,
          reason: reason.trim()
        });
        
        recommendations.push(newRecommendation);
      }
    }
    
    return recommendations;
  }

  // Notification methods
  async getNotification(id: number): Promise<Notification | undefined> {
    const [notification] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id));
    return notification;
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async getUserUnreadNotifications(userId: number): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      )
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const [updatedNotification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return updatedNotification;
  }

  async deleteNotification(id: number): Promise<boolean> {
    const result = await db
      .delete(notifications)
      .where(eq(notifications.id, id))
      .returning();
    return result.length > 0;
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );
  }

  // User Settings methods
  async getUserSettings(userId: number): Promise<UserSettings | undefined> {
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));
    return settings;
  }

  async createOrUpdateUserSettings(userId: number, settings: Partial<UserSettings>): Promise<UserSettings> {
    // Check if settings already exist for this user
    const existingSettings = await this.getUserSettings(userId);

    if (existingSettings) {
      // Update existing settings
      const [updatedSettings] = await db
        .update(userSettings)
        .set({
          ...settings,
          lastUpdated: new Date()
        })
        .where(eq(userSettings.userId, userId))
        .returning();
      return updatedSettings;
    } else {
      // Create new settings
      const [newSettings] = await db
        .insert(userSettings)
        .values({
          userId,
          ...settings
        })
        .returning();
      return newSettings;
    }
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

  async getInvitationsForUser(userId: number): Promise<Invitation[]> {
    try {
      // Explicitly select only the columns we need to avoid errors with schema mismatches
      return await db
        .select({
          id: invitations.id,
          senderId: invitations.senderId,
          receiverId: invitations.receiverId,
          restaurantId: invitations.restaurantId,
          date: invitations.date,
          time: invitations.time,
          message: invitations.message,
          status: invitations.status,
          createdAt: invitations.createdAt
        })
        .from(invitations)
        .where(
          and(
            or(
              eq(invitations.senderId, userId),
              eq(invitations.receiverId, userId)
            ),
            eq(invitations.status, "accepted"),
            gte(invitations.date, sql`CURRENT_DATE`)
          )
        )
        .orderBy(asc(invitations.date));
    } catch (error) {
      console.error("Error in getInvitationsForUser:", error);
      throw error;
    }
  }

  async getUpcomingMeals(userId: number): Promise<(Invitation & { restaurant: Restaurant, partner: User })[]> {
    try {
      // Get all accepted invitations for this user that are scheduled for today or in the future
      const userInvitations = await this.getInvitationsForUser(userId);
      
      // For each invitation, get the restaurant and partner details
      const result: (Invitation & { restaurant: Restaurant, partner: User })[] = [];
      
      for (const invitation of userInvitations) {
        // Get the restaurant details
        const restaurant = await this.getRestaurant(invitation.restaurantId);
        
        // Determine who is the partner (the other user)
        const partnerId = invitation.senderId === userId ? invitation.receiverId : invitation.senderId;
        
        // Get the partner details
        const partner = await this.getUser(partnerId);
        
        if (restaurant && partner) {
          // Add the restaurant and partner to the invitation
          result.push({
            ...invitation,
            restaurant,
            partner
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error("Error in getUpcomingMeals:", error);
      throw new Error("Failed to fetch upcoming meals: " + (error as Error).message);
    }
  }
}

export const storage = new DatabaseStorage();