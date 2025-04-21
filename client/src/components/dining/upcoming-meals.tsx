import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, MessageSquare, MapPin, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import CalendarSync from "./calendar-sync";
import { Invitation, Restaurant, User } from "@shared/schema";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Toggle this to use mock data
const DEMO_MODE = false;

// Type for upcoming meals
type UpcomingMeal = Invitation & { restaurant: Restaurant; partner: User };

// Mock upcoming meals for demonstration
const mockUpcomingMeals: UpcomingMeal[] = [
  {
    id: 301,
    userId: 1,
    partnerId: 101,
    restaurantId: 201,
    status: "accepted",
    date: new Date().toISOString().split('T')[0], // Today
    time: "19:00",
    message: "Looking forward to trying their pasta!",
    createdAt: new Date(),
    outlookEventId: null,
    calendarSynced: false,
    lastCalendarSync: null,
    // Restaurant details
    restaurant: {
      id: 201,
      name: "La Trattoria Italiana",
      cuisine: "Italian",
      priceRange: "$$$",
      address: "123 Main St, New York, NY",
      locationLat: "40.7128",
      locationLng: "-74.0060",
      rating: "4.7",
      image: "",
      activeUserCount: 8
    },
    // Partner details
    partner: {
      id: 101,
      username: "emma_foodie",
      password: "",
      name: "Emma Davis",
      email: "emma@example.com",
      bio: "Passionate about Italian cuisine and fine dining experiences.",
      occupation: "Food Blogger",
      profileImage: "",
      age: 29,
      phone: "",
      isVerified: true,
      foodPreferences: ["Pasta", "Wine", "Desserts"],
      dietaryRestrictions: [],
      cuisinePreferences: ["Italian", "French", "Mediterranean"],
      diningStyles: ["Fine Dining", "Casual Dining"],
      locationLat: "40.712",
      locationLng: "-74.006",
      lastActive: new Date(),
      microsoftId: null,
      microsoftRefreshToken: null,
      useMicrosoftCalendar: false
    }
  },
  {
    id: 302,
    userId: 1,
    partnerId: 102,
    restaurantId: 203,
    status: "pending",
    date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0], // Day after tomorrow
    time: "12:30",
    message: "I've heard great things about their curry!",
    createdAt: new Date(),
    outlookEventId: null,
    calendarSynced: false,
    lastCalendarSync: null,
    // Restaurant details
    restaurant: {
      id: 203,
      name: "Spicy Thai Kitchen",
      cuisine: "Thai",
      priceRange: "$$",
      address: "789 Canal St, New York, NY",
      locationLat: "40.7130",
      locationLng: "-74.0065",
      rating: "4.5",
      image: "",
      activeUserCount: 3
    },
    // Partner details
    partner: {
      id: 102,
      username: "raj_spice",
      password: "",
      name: "Raj Patel",
      email: "raj@example.com",
      bio: "Spicy food enthusiast always looking for authentic international cuisines.",
      occupation: "Chef",
      profileImage: "",
      age: 34,
      phone: "",
      isVerified: true,
      foodPreferences: ["Spicy Food", "Street Food"],
      dietaryRestrictions: ["Vegetarian"],
      cuisinePreferences: ["Indian", "Thai", "Mexican"],
      diningStyles: ["Casual Dining", "Food Trucks"],
      locationLat: "40.715",
      locationLng: "-74.009",
      lastActive: new Date(),
      microsoftId: null,
      microsoftRefreshToken: null,
      useMicrosoftCalendar: false
    }
  }
];

export default function UpcomingMeals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showAll, setShowAll] = useState(false);
  const [, navigate] = useLocation();

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async (otherUserId: number) => {
      const res = await apiRequest("POST", "/api/conversations", {
        otherUserId,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      navigate("/messages");
      toast({
        title: "Conversation started",
        description: "You can now message your dining partner",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to start conversation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Start a conversation with a user
  const startConversation = (otherUserId: number) => {
    createConversationMutation.mutate(otherUserId);
  };

  // Fetch upcoming meals from API when not in demo mode
  const { data: apiUpcomingMeals = [], isLoading: isApiLoading } = useQuery<UpcomingMeal[]>({
    queryKey: ["/api/meals/upcoming"],
    queryFn: getQueryFn<UpcomingMeal[]>(),
    enabled: !DEMO_MODE && !!user
  });
  
  // Use mock data in demo mode, otherwise use data from API
  const upcomingMeals = DEMO_MODE ? mockUpcomingMeals : apiUpcomingMeals;
  const isLoading = DEMO_MODE ? false : isApiLoading;

  const displayMeals = showAll ? upcomingMeals : upcomingMeals.slice(0, 2);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Format date/time for display
  const formatDateTime = (dateStr: string, timeStr: string) => {
    const date = new Date(dateStr);
    const isToday = new Date().toDateString() === date.toDateString();
    const isTomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toDateString() === date.toDateString();
    
    let dateLabel = format(date, "MMM d");
    if (isToday) dateLabel = "Today";
    if (isTomorrow) dateLabel = "Tomorrow";
    
    return `${dateLabel}, ${timeStr}`;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-xl">Upcoming Meals</h2>
        </div>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((_, i) => (
              <div key={i} className="h-32 bg-neutral-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : upcomingMeals.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-neutral-600">You have no upcoming meals.</p>
            <p className="text-sm text-neutral-500 mt-2">Invite someone to dine with you!</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {displayMeals.map((meal: UpcomingMeal) => (
                <div key={meal.id} className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-neutral-800">
                        {meal.date && meal.time ? `Meal with ${meal.partner.name.split(' ')[0]}` : 'Scheduled Meal'}
                      </h3>
                      <p className="text-xs text-neutral-600 mt-1">
                        {meal.restaurant?.name || 'Restaurant'} • {meal.restaurant?.cuisine || 'Cuisine'}
                      </p>
                    </div>
                    <Badge 
                      variant="outline"
                      className={
                        new Date(meal.date) <= new Date() 
                          ? "bg-primary text-white border-primary" 
                          : "bg-neutral-200 text-neutral-700 border-neutral-300"
                      }
                    >
                      {meal.date && meal.time ? formatDateTime(meal.date, meal.time) : 'Scheduled'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <Avatar className="w-8 h-8 border border-neutral-200">
                      <AvatarImage src={meal.partner?.profileImage} alt={meal.partner?.name} />
                      <AvatarFallback>{meal.partner ? getInitials(meal.partner.name) : '?'}</AvatarFallback>
                    </Avatar>
                    
                    <div className="text-sm">
                      <span className="font-medium text-neutral-800">{meal.partner?.name || 'Partner'}</span>
                      <div className="flex items-center text-xs text-neutral-600">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                        <span>Verified User</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-3">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="flex-1 gap-1"
                      onClick={() => startConversation(meal.partner.id)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-1"
                      onClick={() => {
                        if (meal.restaurant?.locationLat && meal.restaurant?.locationLng) {
                          window.open(`https://maps.google.com/maps?q=${meal.restaurant.locationLat},${meal.restaurant.locationLng}`, '_blank');
                        }
                      }}
                    >
                      <MapPin className="h-4 w-4" />
                      Directions
                    </Button>
                  </div>
                  
                  {/* Calendar Sync Component */}
                  {meal.status === "accepted" && <CalendarSync invitation={meal} />}
                </div>
              ))}
            </div>
            
            {upcomingMeals.length > 2 && (
              <Button
                variant="ghost"
                className="w-full mt-3"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show less" : `Show ${upcomingMeals.length - 2} more`}
              </Button>
            )}
            
            <div className="mt-4">
              <Button className="w-full border border-primary text-primary hover:bg-primary hover:text-white">
                Schedule a New Meal
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
