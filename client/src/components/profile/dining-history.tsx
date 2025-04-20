import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription, 
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Star, ThumbsUp, ThumbsDown, MessageCircle, User } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from 'date-fns';
import { Invitation, User as UserType, Restaurant } from '@shared/schema';

// DEMO FLAG - Toggle for demo mode
const DEMO_MODE = true;

// Mock data for demo mode
const MOCK_DINING_HISTORY = [
  {
    id: 1,
    date: new Date('2025-03-15T19:00:00'),
    status: 'completed',
    userRating: 4,
    partnerRating: 5,
    notes: "We had a great conversation about travel and food. Definitely would meet again!",
    restaurant: {
      id: 3,
      name: "Bella Italia",
      cuisine: "Italian",
      priceRange: "$$",
      address: "123 Main St, New York, NY",
      locationLat: "40.7128",
      locationLng: "-74.0060",
      imageUrl: "",
      rating: 4.5,
      activeUserCount: 2,
    },
    partner: {
      id: 5,
      name: "Emily Chen",
      occupation: "Marketing Manager",
      profileImage: "",
      foodPreferences: ["Italian", "Thai", "Indian"],
      dietaryRestrictions: ["Vegetarian"],
    }
  },
  {
    id: 2,
    date: new Date('2025-02-28T12:30:00'),
    status: 'completed',
    userRating: 5,
    partnerRating: 4,
    notes: "Alex was very knowledgeable about wine. Great conversation about work-life balance.",
    restaurant: {
      id: 7,
      name: "The Wine Cellar",
      cuisine: "French",
      priceRange: "$$$",
      address: "456 Park Ave, New York, NY",
      locationLat: "40.7128",
      locationLng: "-74.0060",
      imageUrl: "",
      rating: 4.7,
      activeUserCount: 0,
    },
    partner: {
      id: 12,
      name: "Alex Johnson",
      occupation: "Software Engineer",
      profileImage: "",
      foodPreferences: ["French", "Mexican", "Japanese"],
      dietaryRestrictions: [],
    }
  },
  {
    id: 3,
    date: new Date('2025-02-10T08:30:00'),
    status: 'completed',
    userRating: 3,
    partnerRating: 3,
    notes: "Breakfast was fine. Conversation was a bit strained, but the food was good.",
    restaurant: {
      id: 9,
      name: "Morning Brew Café",
      cuisine: "Breakfast",
      priceRange: "$",
      address: "789 Broadway, New York, NY",
      locationLat: "40.7128",
      locationLng: "-74.0060",
      imageUrl: "",
      rating: 4.2,
      activeUserCount: 5,
    },
    partner: {
      id: 8,
      name: "Sam Taylor",
      occupation: "Graphic Designer",
      profileImage: "",
      foodPreferences: ["Breakfast Enthusiast", "Comfort Food Lover"],
      dietaryRestrictions: ["Gluten-Free"],
    }
  }
];

// Types for our components
type DiningHistoryItem = {
  id: number;
  date: Date;
  status: string;
  userRating: number;
  partnerRating: number;
  notes: string;
  restaurant: Restaurant;
  partner: Partial<UserType>;
}

type DiningHistoryProps = {
  userId: number;
}

export default function DiningHistory({ userId }: DiningHistoryProps) {
  const [activeTab, setActiveTab] = useState('all');
  
  // Fetch dining history from API or use mock data in demo mode
  const { data: diningHistory, isLoading } = useQuery({
    queryKey: ['/api/users', userId, 'history'],
    enabled: !DEMO_MODE && !!userId,
  });
  
  // Use mock data in demo mode
  const historyData: DiningHistoryItem[] = DEMO_MODE 
    ? MOCK_DINING_HISTORY 
    : (diningHistory as DiningHistoryItem[] || []);
  
  // Helper function to get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  // Render star ratings
  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300'
            }`}
          />
        ))}
      </div>
    );
  };
  
  if (isLoading && !DEMO_MODE) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Dining History</h3>
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'all' ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab('all')}
          >
            All
          </Button>
          <Button
            variant={activeTab === 'great' ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab('great')}
          >
            Great Matches
          </Button>
        </div>
      </div>
      
      {historyData.length === 0 ? (
        <div className="text-center py-10 bg-neutral-50 rounded-lg">
          <User className="h-10 w-10 mx-auto text-neutral-400" />
          <h4 className="mt-2 font-medium text-neutral-700">No dining history yet</h4>
          <p className="text-neutral-500 mt-1">
            Your past meals with dining companions will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {historyData
            .filter(item => 
              activeTab === 'all' || 
              (activeTab === 'great' && (item.userRating >= 4 || item.partnerRating >= 4))
            )
            .map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">
                        {item.restaurant.name}
                      </CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Calendar className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                        <span>
                          {format(new Date(item.date), 'MMMM d, yyyy')} at {format(new Date(item.date), 'h:mm a')}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={item.userRating >= 4 ? "default" : "outline"}
                      className={item.userRating >= 4 ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                    >
                      {item.userRating >= 4 ? "Great Match" : "Completed"}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-10 w-10 border-2 border-white">
                      <AvatarImage src={item.partner.profileImage} alt={item.partner.name} />
                      <AvatarFallback>{getInitials(item.partner.name)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="font-medium">{item.partner.name}</h4>
                        <span className="mx-2 text-neutral-300">•</span>
                        <span className="text-sm text-neutral-500">{item.partner.occupation}</span>
                      </div>
                      
                      <div className="mt-1 flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <ThumbsUp className="h-4 w-4 text-primary" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Your rating</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <StarRating rating={item.userRating} />
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <ThumbsDown className="h-4 w-4 text-neutral-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Their rating</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <StarRating rating={item.partnerRating} />
                        </div>
                      </div>
                      
                      {item.notes && (
                        <div className="mt-3 text-sm bg-neutral-50 p-2 rounded-md text-neutral-700">
                          <div className="flex items-start">
                            <MessageCircle className="h-4 w-4 mr-2 mt-0.5 text-neutral-400" />
                            <p>{item.notes}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-3 text-xs flex items-center text-neutral-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{item.restaurant.address}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}