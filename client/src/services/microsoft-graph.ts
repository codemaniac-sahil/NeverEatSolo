import { Client } from '@microsoft/microsoft-graph-client';
import { getAccessToken } from './microsoft-auth';
import { Invitation, Restaurant, User } from '@shared/schema';

// Initialize the Graph client
function getGraphClient(): Client {
  return Client.init({
    authProvider: async (done) => {
      const token = await getAccessToken();
      if (token) {
        done(null, token);
      } else {
        done('Could not get access token', null);
      }
    }
  });
}

/**
 * Format invitation to calendar event
 */
function formatInvitationToEvent(invitation: Invitation, restaurant: Restaurant, partner: User) {
  const startDateTime = new Date(invitation.date);
  
  // Parse the time string (assuming format like "18:30")
  if (invitation.time) {
    const [hours, minutes] = invitation.time.split(':').map(Number);
    startDateTime.setHours(hours, minutes);
  }
  
  // End time is 1.5 hours later (typical meal duration)
  const endDateTime = new Date(startDateTime);
  endDateTime.setMinutes(endDateTime.getMinutes() + 90);
  
  // Format the event
  return {
    subject: `Dining with ${partner.name} at ${restaurant.name}`,
    body: {
      contentType: 'HTML',
      content: `
        <p>You have a meal scheduled with ${partner.name} at ${restaurant.name}.</p>
        ${invitation.message ? `<p>Message: ${invitation.message}</p>` : ''}
        <p>Location: ${restaurant.address}</p>
        <p>Cuisine: ${restaurant.cuisine}</p>
        <p>Price Range: ${restaurant.priceRange}</p>
        <hr>
        <p><i>This event was created by Never Dine Alone.</i></p>
      `
    },
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: 'UTC'
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: 'UTC'
    },
    location: {
      displayName: restaurant.name,
      address: {
        street: restaurant.address,
      }
    },
    attendees: [
      {
        emailAddress: {
          address: partner.email,
          name: partner.name
        },
        type: 'required'
      }
    ]
  };
}

/**
 * Create a calendar event for an invitation
 */
export async function createCalendarEvent(
  invitation: Invitation, 
  restaurant: Restaurant, 
  partner: User
): Promise<string | null> {
  try {
    const client = getGraphClient();
    const event = formatInvitationToEvent(invitation, restaurant, partner);
    
    const response = await client
      .api('/me/events')
      .post(event);
    
    return response.id;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return null;
  }
}

/**
 * Update a calendar event
 */
export async function updateCalendarEvent(
  eventId: string,
  invitation: Invitation,
  restaurant: Restaurant,
  partner: User
): Promise<boolean> {
  try {
    const client = getGraphClient();
    const event = formatInvitationToEvent(invitation, restaurant, partner);
    
    await client
      .api(`/me/events/${eventId}`)
      .update(event);
    
    return true;
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return false;
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(eventId: string): Promise<boolean> {
  try {
    const client = getGraphClient();
    
    await client
      .api(`/me/events/${eventId}`)
      .delete();
    
    return true;
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return false;
  }
}

/**
 * Get user info from Microsoft Graph
 */
export async function getUserInfo(): Promise<{
  id: string;
  displayName: string;
  email?: string;
} | null> {
  try {
    const client = getGraphClient();
    
    const user = await client
      .api('/me')
      .select('id,displayName,mail')
      .get();
    
    return {
      id: user.id,
      displayName: user.displayName,
      email: user.mail
    };
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
}