import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  Clipboard, 
  MapPin, 
  Users, 
  Utensils, 
  Building,
  Plus,
  Loader2,
  Calendar as CalendarIcon,
  Filter,
  AlarmClock,
  CheckCircle2
} from 'lucide-react';
import { format, isToday, isTomorrow, addDays, parseISO } from 'date-fns';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CorporateEvent {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  eventType: string; // 'lunch', 'meeting', 'social'
  location: string;
  restaurantId?: number;
  campusRestaurantId?: number;
  workspaceId?: number;
  teamId?: number;
  organizationId: number;
  createdBy: number;
  createdAt: string;
  participants: EventParticipant[];
}

interface EventParticipant {
  id: number;
  eventId: number;
  userId: number;
  status: string; // 'going', 'maybe', 'not_going'
  createdAt: string;
  user: {
    id: number;
    name: string;
    profileImageUrl?: string;
    title?: string;
  };
}

interface Team {
  id: number;
  name: string;
  organizationId: number;
}

interface Workspace {
  id: number;
  name: string;
  address: string;
  organizationId: number;
}

interface CampusRestaurant {
  id: number;
  name: string;
  address: string;
  organizationId: number;
  workspaceId?: number;
}

export default function CorporateEventsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [filterType, setFilterType] = useState('all');
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    eventDate: format(new Date(), 'yyyy-MM-dd'),
    eventTime: '12:00',
    eventType: 'lunch',
    location: '',
    teamId: '',
    workspaceId: '',
    campusRestaurantId: '',
  });

  // Fetch upcoming corporate events
  const { 
    data: events,
    isLoading: isLoadingEvents,
    refetch: refetchEvents
  } = useQuery<CorporateEvent[]>({
    queryKey: ['/api/corporate-events/upcoming'],
    enabled: !!user?.organizationId
  });

  // Fetch teams for the dropdown
  const { 
    data: teams,
    isLoading: isLoadingTeams
  } = useQuery<Team[]>({
    queryKey: ['/api/organizations', user?.organizationId, 'teams'],
    enabled: !!user?.organizationId && isCreateDialogOpen
  });

  // Fetch workspaces for the dropdown
  const { 
    data: workspaces,
    isLoading: isLoadingWorkspaces
  } = useQuery<Workspace[]>({
    queryKey: ['/api/organizations', user?.organizationId, 'workspaces'],
    enabled: !!user?.organizationId && isCreateDialogOpen
  });

  // Fetch campus restaurants
  const { 
    data: campusRestaurants,
    isLoading: isLoadingRestaurants
  } = useQuery<CampusRestaurant[]>({
    queryKey: ['/api/organizations', user?.organizationId, 'campus-restaurants'],
    enabled: !!user?.organizationId && isCreateDialogOpen && newEvent.eventType === 'lunch'
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const res = await apiRequest('POST', '/api/corporate-events', {
        ...eventData,
        organizationId: user?.organizationId
      });
      return await res.json();
    },
    onSuccess: () => {
      setIsCreateDialogOpen(false);
      setNewEvent({
        title: '',
        description: '',
        eventDate: format(new Date(), 'yyyy-MM-dd'),
        eventTime: '12:00',
        eventType: 'lunch',
        location: '',
        teamId: '',
        workspaceId: '',
        campusRestaurantId: '',
      });
      refetchEvents();
      toast({
        title: 'Event created successfully',
        description: 'Your event has been scheduled.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create event',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Handle event creation
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEvent.title || !newEvent.eventDate || !newEvent.eventTime || !newEvent.eventType) {
      toast({
        title: 'Required fields missing',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    const eventData = {
      ...newEvent,
      teamId: newEvent.teamId ? parseInt(newEvent.teamId) : undefined,
      workspaceId: newEvent.workspaceId ? parseInt(newEvent.workspaceId) : undefined,
      campusRestaurantId: newEvent.campusRestaurantId ? parseInt(newEvent.campusRestaurantId) : undefined,
    };
    
    createEventMutation.mutate(eventData);
  };

  // Filter events based on tab and event type
  const filteredEvents = events?.filter(event => {
    if (activeTab === 'upcoming') {
      const eventDate = parseISO(event.eventDate);
      const isUpcoming = eventDate >= new Date();
      
      if (filterType === 'all') return isUpcoming;
      return isUpcoming && event.eventType === filterType;
    } else {
      const eventDate = parseISO(event.eventDate);
      const isPast = eventDate < new Date();
      
      if (filterType === 'all') return isPast;
      return isPast && event.eventType === filterType;
    }
  });

  // Group events by date
  const groupedEvents: { [key: string]: CorporateEvent[] } = {};
  
  filteredEvents?.forEach(event => {
    const dateKey = event.eventDate;
    if (!groupedEvents[dateKey]) {
      groupedEvents[dateKey] = [];
    }
    groupedEvents[dateKey].push(event);
  });
  
  // Sort dates
  const sortedDates = Object.keys(groupedEvents).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  // If user doesn't belong to an organization
  if (!user?.organizationId) {
    return (
      <div className="container py-10">
        <div className="max-w-md mx-auto bg-muted p-6 rounded-md text-center">
          <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">No Organization Found</h1>
          <p className="text-sm text-muted-foreground mb-4">
            You need to be part of a corporate organization to view and create events.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoadingEvents) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Corporate Events</h1>
          <p className="text-muted-foreground mt-1">
            Schedule and manage team lunches and other corporate events
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      <div className="mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past Events</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="lunch">Lunches</SelectItem>
                  <SelectItem value="meeting">Meetings</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <TabsContent value="upcoming">
            {sortedDates.length > 0 ? (
              <div className="space-y-6">
                {sortedDates.map(date => (
                  <div key={date}>
                    <h3 className="text-sm font-medium mb-3 flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-primary" />
                      {formatDateHeading(date)}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groupedEvents[date].map(event => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4 bg-muted rounded-md">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Upcoming Events</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                  There are no upcoming events scheduled. Create a new event to get started.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past">
            {sortedDates.length > 0 ? (
              <div className="space-y-6">
                {sortedDates.map(date => (
                  <div key={date}>
                    <h3 className="text-sm font-medium mb-3 flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-primary" />
                      {formatDateHeading(date)}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groupedEvents[date].map(event => (
                        <EventCard key={event.id} event={event} isPast />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4 bg-muted rounded-md">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Past Events</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  There are no past events to display.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Event Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Schedule a team lunch, meeting, or other corporate event.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateEvent}>
            <div className="space-y-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="event-title">Event Title</Label>
                <Input 
                  id="event-title" 
                  placeholder="Enter event title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="event-type">Event Type</Label>
                <Select 
                  value={newEvent.eventType}
                  onValueChange={(value) => setNewEvent({...newEvent, eventType: value})}
                  required
                >
                  <SelectTrigger id="event-type">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lunch">Team Lunch</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="social">Social Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="event-date">Date</Label>
                  <Input 
                    id="event-date" 
                    type="date"
                    value={newEvent.eventDate}
                    onChange={(e) => setNewEvent({...newEvent, eventDate: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="event-time">Time</Label>
                  <Input 
                    id="event-time" 
                    type="time"
                    value={newEvent.eventTime}
                    onChange={(e) => setNewEvent({...newEvent, eventTime: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="event-team">Team (Optional)</Label>
                <Select 
                  value={newEvent.teamId}
                  onValueChange={(value) => setNewEvent({...newEvent, teamId: value})}
                >
                  <SelectTrigger id="event-team">
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (Open to All)</SelectItem>
                    {teams?.map(team => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="event-workspace">Workspace (Optional)</Label>
                <Select 
                  value={newEvent.workspaceId}
                  onValueChange={(value) => setNewEvent({...newEvent, workspaceId: value})}
                >
                  <SelectTrigger id="event-workspace">
                    <SelectValue placeholder="Select a workspace" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {workspaces?.map(workspace => (
                      <SelectItem key={workspace.id} value={workspace.id.toString()}>
                        {workspace.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {newEvent.eventType === 'lunch' && (
                <div className="grid gap-2">
                  <Label htmlFor="event-restaurant">Restaurant (Optional)</Label>
                  <Select 
                    value={newEvent.campusRestaurantId}
                    onValueChange={(value) => setNewEvent({...newEvent, campusRestaurantId: value})}
                  >
                    <SelectTrigger id="event-restaurant">
                      <SelectValue placeholder="Select a restaurant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None (TBD)</SelectItem>
                      {campusRestaurants?.map(restaurant => (
                        <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                          {restaurant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="grid gap-2">
                <Label htmlFor="event-location">Location</Label>
                <Input 
                  id="event-location" 
                  placeholder="Enter event location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="event-description">Description</Label>
                <Textarea 
                  id="event-description" 
                  placeholder="Provide details about the event..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createEventMutation.isPending}>
                {createEventMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Create Event
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EventCard({ event, isPast = false }: { event: CorporateEvent; isPast?: boolean }) {
  const { toast } = useToast();
  const participantCount = event.participants?.length || 0;
  
  const getEventTypeIcon = () => {
    switch(event.eventType) {
      case 'lunch':
        return <Utensils className="h-4 w-4" />;
      case 'meeting':
        return <Clipboard className="h-4 w-4" />;
      case 'social':
        return <Users className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };
  
  const getEventTypeLabel = () => {
    switch(event.eventType) {
      case 'lunch':
        return 'Lunch';
      case 'meeting':
        return 'Meeting';
      case 'social':
        return 'Social';
      default:
        return 'Event';
    }
  };
  
  return (
    <Card className={cn(
      "overflow-hidden",
      isPast && "opacity-70"
    )}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="mb-2 flex items-center gap-1">
            {getEventTypeIcon()}
            <span>{getEventTypeLabel()}</span>
          </Badge>
          
          {isPast && (
            <Badge variant="secondary">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl">{event.title}</CardTitle>
        <CardDescription className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {event.eventTime}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-4">
        {event.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {event.description}
          </p>
        )}
        
        <div className="space-y-2">
          {event.location && (
            <div className="flex items-center text-xs">
              <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
              <span className="text-muted-foreground">{event.location}</span>
            </div>
          )}
          
          <div className="flex items-center text-xs">
            <Users className="h-3 w-3 mr-1 text-muted-foreground" />
            <span className="text-muted-foreground">
              {participantCount} {participantCount === 1 ? 'participant' : 'participants'}
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        {!isPast ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => toast({
              title: 'Coming Soon',
              description: 'RSVP functionality is coming soon!',
            })}
          >
            RSVP
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => toast({
              title: 'Coming Soon',
              description: 'View details functionality is coming soon!',
            })}
          >
            View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// Helper to format date headings
function formatDateHeading(dateString: string): string {
  const date = parseISO(dateString);
  
  if (isToday(date)) {
    return 'Today';
  } else if (isTomorrow(date)) {
    return 'Tomorrow';
  } else if (date < new Date() && date >= addDays(new Date(), -7)) {
    return `${format(date, 'EEEE')} (${format(date, 'MMM d')})`;
  } else {
    return format(date, 'EEEE, MMMM d, yyyy');
  }
}