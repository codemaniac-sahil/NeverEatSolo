import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Invitation, Restaurant, User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { 
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent
} from "@/services/microsoft-graph";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Toggle this to use demo mode
const DEMO_MODE = true;

interface CalendarSyncProps {
  invitation: Invitation & { restaurant: Restaurant; partner: User };
}

export default function CalendarSync({ invitation }: CalendarSyncProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState(false);

  // Mutation for syncing with server
  const syncMutation = useMutation({
    mutationFn: async ({ id, outlookEventId }: { id: number; outlookEventId: string }) => {
      const res = await apiRequest('POST', `/api/invitations/${id}/sync-calendar`, { outlookEventId });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to sync with server');
      }
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/invitations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/meals/upcoming'] });
    }
  });

  // Check if user can sync with Microsoft calendar
  const canSyncWithCalendar = user?.microsoftId && user?.useMicrosoftCalendar;

  // Handle sync with Microsoft calendar
  const handleSyncWithCalendar = async () => {
    // In demo mode, just show a success message without making API calls
    if (DEMO_MODE) {
      setSyncing(true);
      // Simulate API delay
      setTimeout(() => {
        toast({
          title: "Demo Mode: Calendar synced",
          description: "In a real environment, this would sync with your Microsoft calendar.",
          variant: "default"
        });
        setSyncing(false);
      }, 1000);
      return;
    }
    
    if (!canSyncWithCalendar) {
      toast({
        title: "Microsoft account not connected",
        description: "Please connect your Microsoft account in your profile settings.",
        variant: "destructive"
      });
      return;
    }

    setSyncing(true);
    try {
      // If already synced, update the event
      if (invitation.outlookEventId) {
        const success = await updateCalendarEvent(
          invitation.outlookEventId,
          invitation,
          invitation.restaurant,
          invitation.partner
        );

        if (success) {
          toast({
            title: "Calendar updated",
            description: "Your Microsoft calendar has been updated.",
            variant: "default"
          });
        } else {
          throw new Error("Failed to update calendar event");
        }
      } else {
        // Create new calendar event
        const eventId = await createCalendarEvent(
          invitation,
          invitation.restaurant,
          invitation.partner
        );

        if (eventId) {
          // Update invitation with outlook event ID
          await syncMutation.mutateAsync({
            id: invitation.id,
            outlookEventId: eventId
          });

          toast({
            title: "Calendar synced",
            description: "This invitation has been added to your Microsoft calendar.",
            variant: "default"
          });
        } else {
          throw new Error("Failed to create calendar event");
        }
      }
    } catch (error) {
      console.error("Calendar sync error:", error);
      toast({
        title: "Sync failed",
        description: error instanceof Error ? error.message : "Failed to sync with Microsoft calendar",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  // Handle removing from calendar
  const handleRemoveFromCalendar = async () => {
    // In demo mode, just show a success message without making API calls
    if (DEMO_MODE) {
      setSyncing(true);
      // Simulate API delay
      setTimeout(() => {
        toast({
          title: "Demo Mode: Removed from calendar",
          description: "In a real environment, this would remove the event from your Microsoft calendar.",
          variant: "default"
        });
        setSyncing(false);
      }, 1000);
      return;
    }
    
    if (!invitation.outlookEventId) return;

    setSyncing(true);
    try {
      const success = await deleteCalendarEvent(invitation.outlookEventId);

      if (success) {
        // Update invitation to remove calendar info
        await syncMutation.mutateAsync({
          id: invitation.id,
          outlookEventId: "" // Empty string to indicate no event
        });

        toast({
          title: "Removed from calendar",
          description: "This invitation has been removed from your Microsoft calendar.",
          variant: "default"
        });
      } else {
        throw new Error("Failed to remove calendar event");
      }
    } catch (error) {
      console.error("Calendar removal error:", error);
      toast({
        title: "Removal failed",
        description: error instanceof Error ? error.message : "Failed to remove from Microsoft calendar",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  // In demo mode, always show calendar sync UI
  // Otherwise, check if user has Microsoft integration and calendar sync enabled
  if (!DEMO_MODE && (!user?.microsoftId || user?.useMicrosoftCalendar === false)) {
    return null;
  }

  return (
    <div className="mt-4 border rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <span className="font-medium">Microsoft Calendar</span>
        </div>
        
        {invitation.calendarSynced && invitation.outlookEventId ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center text-green-600 gap-1">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Synced</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleRemoveFromCalendar}
              disabled={syncing || syncMutation.isPending}
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncWithCalendar}
            disabled={syncing || syncMutation.isPending}
          >
            {syncing || syncMutation.isPending ? "Syncing..." : "Add to Calendar"}
          </Button>
        )}
      </div>
      
      {invitation.calendarSynced && invitation.lastCalendarSync && (
        <p className="text-xs text-gray-500 mt-2">
          Last synced: {new Date(invitation.lastCalendarSync).toLocaleString()}
        </p>
      )}
    </div>
  );
}