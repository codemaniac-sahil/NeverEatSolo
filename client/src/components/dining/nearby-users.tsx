import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getQueryOptions } from "@/lib/queryClient";
import { 
  CheckCircle, Filter, Utensils, Heart, X, MapPin, 
  Search, Coffee, Clock, ChefHat, Star, Users, Leaf,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "@shared/schema";
import { calculateCompatibilityScore } from "@shared/constants";
import { Input } from "@/components/ui/input";
import { 
  Sheet, 
  SheetClose, 
  SheetContent,
  SheetHeader,
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import {
  Slider
} from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { CUISINE_PREFERENCES, DINING_STYLES } from "@shared/constants";

// Toggle this to use mock data
const DEMO_MODE = true;

// Mock nearby users for demonstration
const mockNearbyUsers: User[] = [
  {
    id: 101,
    name: "Sophia Chen",
    username: "sophiafoodie",
    email: "sophia@example.com",
    password: "hashed_password",
    age: 28,
    bio: "Food photographer and culinary explorer. Always looking to share a meal and stories!",
    occupation: "Food Photographer",
    profileImage: null,
    coordinates: {
      lat: "37.7859",
      lng: "-122.4006"
    },
    preferences: {
      priceRange: ["$$", "$$$"],
      availability: ["weekends", "evenings"],
    },
    cuisinePreferences: ["Italian", "Japanese", "Mediterranean"],
    diningStyles: ["Casual", "Fine Dining"],
    dietaryRestrictions: ["None"],
    isVerified: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    corporateEmail: "sophia.chen@techinc.com",
    corporateRole: "Creative Director",
    teamId: 3,
    workspaceId: 1,
    organizationId: 1,
    availableForSpontaneousLunch: true,
    locationContext: "local",
    isUsingCorporateProfile: false
  },
  {
    id: 102,
    name: "Marcus Johnson",
    username: "marcusjchef",
    email: "marcus@example.com",
    password: "hashed_password",
    age: 34,
    bio: "Amateur chef who loves to discuss cooking techniques and food science. Let's exchange recipes over dinner!",
    occupation: "Software Engineer",
    profileImage: null,
    coordinates: {
      lat: "37.7929",
      lng: "-122.3971"
    },
    preferences: {
      priceRange: ["$$", "$$$"],
      availability: ["weekdays", "lunch"],
    },
    cuisinePreferences: ["Thai", "Mexican", "Indian"],
    diningStyles: ["Casual", "Quick Bites"],
    dietaryRestrictions: ["None"],
    isVerified: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    corporateEmail: "marcus.j@techinc.com",
    corporateRole: "Senior Engineer",
    teamId: 2,
    workspaceId: 1,
    organizationId: 1,
    availableForSpontaneousLunch: true,
    locationContext: "local",
    isUsingCorporateProfile: true
  },
  {
    id: 103,
    name: "Aisha Patel",
    username: "aishafoodie",
    email: "aisha@example.com",
    password: "hashed_password",
    age: 31,
    bio: "Food blogger who specializes in fusion cuisine. Looking to meet fellow food enthusiasts for culinary adventures!",
    occupation: "Food Blogger",
    profileImage: null,
    coordinates: {
      lat: "37.7749",
      lng: "-122.4194"
    },
    preferences: {
      priceRange: ["$", "$$"],
      availability: ["weekdays", "evenings"],
    },
    cuisinePreferences: ["Indian", "Korean", "Italian"],
    diningStyles: ["Casual", "Vegetarian"],
    dietaryRestrictions: ["Vegetarian"],
    isVerified: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    corporateEmail: null,
    corporateRole: null,
    teamId: null,
    workspaceId: null,
    organizationId: null,
    availableForSpontaneousLunch: false,
    locationContext: "tourist",
    isUsingCorporateProfile: false
  },
  {
    id: 104,
    name: "Carlos Mendez",
    username: "carloswine",
    email: "carlos@example.com",
    password: "hashed_password",
    age: 42,
    bio: "Wine enthusiast and foodie. I enjoy discussing wine pairings and discovering new restaurants with passionate people.",
    occupation: "Wine Consultant",
    profileImage: null,
    coordinates: {
      lat: "37.7833",
      lng: "-122.4167"
    },
    preferences: {
      priceRange: ["$$$", "$$$$"],
      availability: ["weekends", "evenings"],
    },
    cuisinePreferences: ["French", "Spanish", "Mediterranean"],
    diningStyles: ["Fine Dining"],
    dietaryRestrictions: ["None"],
    isVerified: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    corporateEmail: "carlos.m@winecompany.com",
    corporateRole: "Senior Consultant",
    teamId: 5,
    workspaceId: 2,
    organizationId: 2,
    availableForSpontaneousLunch: false,
    locationContext: "visiting",
    isUsingCorporateProfile: true
  },
  {
    id: 105,
    name: "Emma Wilson",
    username: "emmafoodie",
    email: "emma@example.com",
    password: "hashed_password",
    age: 29,
    bio: "Passionate about sustainable dining and farm-to-table restaurants. Always looking to share meals with like-minded foodies!",
    occupation: "Environmental Scientist",
    profileImage: null,
    coordinates: {
      lat: "37.7956",
      lng: "-122.3933"
    },
    preferences: {
      priceRange: ["$$", "$$$"],
      availability: ["weekends", "evenings"],
    },
    cuisinePreferences: ["Farm-to-Table", "Vegetarian", "Mediterranean"],
    diningStyles: ["Casual", "Vegetarian"],
    dietaryRestrictions: ["Pescatarian"],
    isVerified: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    corporateEmail: "e.wilson@scienceorg.com",
    corporateRole: "Research Scientist",
    teamId: 6,
    workspaceId: 3,
    organizationId: 3,
    availableForSpontaneousLunch: true,
    locationContext: "networking",
    isUsingCorporateProfile: false
  },
  {
    id: 106,
    name: "David Kim",
    username: "davidfoodie",
    email: "david@example.com",
    password: "hashed_password",
    age: 33,
    bio: "Culinary school graduate who loves discussing cooking techniques and food trends. Always up for trying new restaurants!",
    occupation: "Chef",
    profileImage: null,
    coordinates: {
      lat: "37.7699",
      lng: "-122.4269"
    },
    preferences: {
      priceRange: ["$$", "$$$", "$$$$"],
      availability: ["late_nights", "evenings"],
    },
    cuisinePreferences: ["Korean", "Japanese", "French"],
    diningStyles: ["Fine Dining", "Casual"],
    dietaryRestrictions: ["None"],
    isVerified: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    corporateEmail: "chef.kim@restaurant.com",
    corporateRole: "Executive Chef",
    teamId: null,
    workspaceId: null,
    organizationId: 4,
    availableForSpontaneousLunch: false,
    locationContext: "local",
    isUsingCorporateProfile: true
  }
];

// Distance calculations (mock data)
const distances = ["0.3 miles away", "0.5 miles away", "0.8 miles away", "1.2 miles away", "1.5 miles away", "1.9 miles away"];

interface NearbyUsersProps {
  onInvite: (user: User) => void;
}

export default function NearbyUsers({ onInvite }: NearbyUsersProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [radius, setRadius] = useState(5);
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(70);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedDiningStyles, setSelectedDiningStyles] = useState<string[]>([]);
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [minCompatibility, setMinCompatibility] = useState(0);
  const [sortBy, setSortBy] = useState("compatibility");
  const [geolocationError, setGeolocationError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [coordinates, setCoordinates] = useState<{lat: string, lng: string} | null>(null);
  
  // Get user's current location with enhanced permissions handling
  useEffect(() => {
    if (!coordinates && navigator.geolocation) {
      const timeoutDuration = 10000; // 10 seconds timeout
      const geoOptions = {
        enableHighAccuracy: true,
        timeout: timeoutDuration,
        maximumAge: 0
      };
      
      // Create an AbortController to manage timeout
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), timeoutDuration);
      
      setGeolocationError("Requesting location access...");
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          setCoordinates({
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString()
          });
          setGeolocationError(null);
          setPermissionDenied(false);
        },
        (error) => {
          clearTimeout(timeoutId);
          if (error.code === 1) {
            // Permission denied
            setGeolocationError("Location permission denied. Some features will be limited.");
            setPermissionDenied(true);
          } else if (error.code === 2) {
            setGeolocationError("Location unavailable. Please try again later.");
          } else if (error.code === 3) {
            setGeolocationError("Location request timed out. Please try again.");
          } else {
            setGeolocationError("Unable to access your location. Error: " + error.message);
          }
        },
        geoOptions
      );
      
      return () => {
        clearTimeout(timeoutId);
        abortController.abort();
      };
    }
  }, [coordinates]);
  
  // Fetch nearby users from API or use mock data
  const { data: nearbyUsersData = [], isLoading, error } = useQuery({
    ...getQueryOptions('location'),
    queryKey: ['/api/nearby-users', coordinates?.lat, coordinates?.lng, radius],
    enabled: DEMO_MODE || (coordinates !== null),
  });
  
  // For demo mode, use mock data
  const nearbyUsersRaw = DEMO_MODE ? mockNearbyUsers : nearbyUsersData;
  
  // Calculate compatibility score between current user and another user
  const getCompatibilityScore = (otherUser: User) => {
    if (!user) return 50; // Default score if not logged in
    
    // Use proper calculation from shared/constants
    if (typeof calculateCompatibilityScore === 'function') {
      return calculateCompatibilityScore(user, otherUser);
    }
    
    // Fallback matching logic
    const cuisineMatches = user.cuisinePreferences?.filter(cuisine => 
      otherUser.cuisinePreferences?.includes(cuisine)
    ).length || 0;
    
    const styleMatches = user.diningStyles?.filter(style => 
      otherUser.diningStyles?.includes(style)
    ).length || 0;
    
    const priceRangeMatches = user.preferences?.priceRange?.filter(price => 
      otherUser.preferences?.priceRange?.includes(price)
    ).length || 0;
    
    // Give more weight to cuisine preferences
    const totalScore = (cuisineMatches * 50) + (styleMatches * 30) + (priceRangeMatches * 20);
    const maxPossibleScore = (
      (user.cuisinePreferences?.length || 1) * 50 + 
      (user.diningStyles?.length || 1) * 30 + 
      (user.preferences?.priceRange?.length || 1) * 20
    );
    
    return Math.round((totalScore / maxPossibleScore) * 100);
  };
  
  // Filter users based on search and filter criteria
  const filteredUsers = nearbyUsersRaw.filter(nearbyUser => {
    // Text search
    if (searchTerm && 
        !nearbyUser.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !nearbyUser.occupation?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Age filter
    if ((nearbyUser.age && (nearbyUser.age < minAge || nearbyUser.age > maxAge))) {
      return false;
    }
    
    // Cuisine preferences filter
    if (selectedCuisines.length > 0 && 
        !selectedCuisines.some(cuisine => nearbyUser.cuisinePreferences?.includes(cuisine))) {
      return false;
    }
    
    // Dining styles filter
    if (selectedDiningStyles.length > 0 && 
        !selectedDiningStyles.some(style => nearbyUser.diningStyles?.includes(style))) {
      return false;
    }
    
    // Compatibility score filter
    if (minCompatibility > 0 && getCompatibilityScore(nearbyUser) < minCompatibility) {
      return false;
    }
    
    // Online only filter - assuming 'isActive' indicates online status
    if (showOnlineOnly && !nearbyUser.isActive) {
      return false;
    }
    
    return true;
  });
  
  // Sort users based on selected sorting option
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === "compatibility") {
      return getCompatibilityScore(b) - getCompatibilityScore(a);
    } else if (sortBy === "distance") {
      // In a real app, we would calculate actual distance here
      // For mock data, we're just using the index in the array to simulate distance
      return nearbyUsersRaw.indexOf(a) - nearbyUsersRaw.indexOf(b);
    } else if (sortBy === "activity") {
      // Sort by last active timestamp (most recent first)
      return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
    }
    return 0;
  });
  
  // Final list of users to display
  const nearbyUsers = sortedUsers;
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setRadius(5);
    setMinAge(18);
    setMaxAge(70);
    setSelectedCuisines([]);
    setSelectedDiningStyles([]);
    setShowOnlineOnly(false);
    setMinCompatibility(0);
    setSortBy("compatibility");
  };

  return (
    <div>
      {/* Geolocation error alert */}
      {geolocationError && (
        <Alert className="mb-4 border-amber-600/30 bg-amber-600/10 text-amber-100" variant="default">
          <AlertCircle className="h-5 w-5 text-amber-400" />
          <div className="ml-3">
            <AlertTitle className="text-amber-200">Location Service Issue</AlertTitle>
            <AlertDescription className="text-amber-100/80 text-sm">
              {geolocationError}
              {permissionDenied && (
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 px-2 text-amber-100 border-amber-600/50 bg-amber-600/20 hover:bg-amber-600/30"
                    onClick={() => {
                      // Prompt for location permissions again
                      if (navigator.geolocation) {
                        setGeolocationError("Requesting location access...");
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            setCoordinates({
                              lat: position.coords.latitude.toString(),
                              lng: position.coords.longitude.toString()
                            });
                            setGeolocationError(null);
                            setPermissionDenied(false);
                          },
                          (error) => {
                            setGeolocationError("Location permission still denied. Features will be limited.");
                            setPermissionDenied(true);
                          }
                        );
                      }
                    }}
                  >
                    Request Location Access
                  </Button>
                </div>
              )}
            </AlertDescription>
          </div>
        </Alert>
      )}
      
      <div className="space-y-6">
        <div className="bg-neutral-50 rounded-lg p-5 border border-neutral-200">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">Find Dining Companions</h2>
              <p className="text-neutral-600">Connect with people who share your taste in food</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-10 bg-zinc-900/30 border-zinc-800 text-zinc-300 w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border border-zinc-800">
                  <SelectItem value="compatibility" className="text-zinc-300">Best Match</SelectItem>
                  <SelectItem value="distance" className="text-zinc-300">Closest First</SelectItem>
                  <SelectItem value="activity" className="text-zinc-300">Recently Active</SelectItem>
                </SelectContent>
              </Select>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="border-zinc-800 bg-zinc-900/30 text-zinc-300 h-10 flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full md:max-w-sm overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filter Dining Companions</SheetTitle>
                  </SheetHeader>
                  
                  <div className="mt-6 space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium">Search</label>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-neutral-500"
                          onClick={() => setSearchTerm("")}
                        >
                          Clear
                        </Button>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input 
                          placeholder="Name or occupation..." 
                          className="pl-8"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Search Radius
                        </label>
                        <span className="text-sm text-neutral-600">{radius} miles</span>
                      </div>
                      <Slider 
                        min={1}
                        max={50}
                        step={1}
                        value={[radius]}
                        onValueChange={(value) => setRadius(value[0])}
                      />
                    </div>
                    
                    <div className="pt-2 space-y-2">
                      <label className="text-sm font-medium flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Age Range
                      </label>
                      <div className="flex justify-between">
                        <div className="space-y-2 flex-1 pr-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Minimum</span>
                            <span className="text-sm text-neutral-600">{minAge}</span>
                          </div>
                          <Slider
                            min={18}
                            max={70}
                            step={1}
                            value={[minAge]}
                            onValueChange={(value) => setMinAge(Math.min(value[0], maxAge - 1))}
                          />
                        </div>
                        <div className="space-y-2 flex-1 pl-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Maximum</span>
                            <span className="text-sm text-neutral-600">{maxAge}</span>
                          </div>
                          <Slider
                            min={19}
                            max={70}
                            step={1}
                            value={[maxAge]}
                            onValueChange={(value) => setMaxAge(Math.max(value[0], minAge + 1))}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="cuisines">
                        <AccordionTrigger className="text-sm font-medium py-2 flex items-center gap-1">
                          <Utensils className="h-4 w-4 inline-block mr-1" />
                          <span>Cuisine Preferences</span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-2 gap-2 pt-2">
                            {CUISINE_PREFERENCES.map((cuisine) => (
                              <div 
                                key={cuisine}
                                className={`p-2 rounded-md border text-sm cursor-pointer transition-colors flex items-center ${
                                  selectedCuisines.includes(cuisine) 
                                    ? 'border-primary bg-primary/5 text-primary' 
                                    : 'border-neutral-200 hover:border-neutral-300'
                                }`}
                                onClick={() => {
                                  if (selectedCuisines.includes(cuisine)) {
                                    setSelectedCuisines(selectedCuisines.filter(c => c !== cuisine));
                                  } else {
                                    setSelectedCuisines([...selectedCuisines, cuisine]);
                                  }
                                }}
                              >
                                <Utensils className="h-3 w-3 mr-1.5" />
                                {cuisine}
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="dining-styles">
                        <AccordionTrigger className="text-sm font-medium py-2 flex items-center gap-1">
                          <ChefHat className="h-4 w-4 inline-block mr-1" />
                          <span>Dining Styles</span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-2 gap-2 pt-2">
                            {DINING_STYLES.map((style) => (
                              <div 
                                key={style}
                                className={`p-2 rounded-md border text-sm cursor-pointer transition-colors flex items-center ${
                                  selectedDiningStyles.includes(style) 
                                    ? 'border-primary bg-primary/5 text-primary' 
                                    : 'border-neutral-200 hover:border-neutral-300'
                                }`}
                                onClick={() => {
                                  if (selectedDiningStyles.includes(style)) {
                                    setSelectedDiningStyles(selectedDiningStyles.filter(s => s !== style));
                                  } else {
                                    setSelectedDiningStyles([...selectedDiningStyles, style]);
                                  }
                                }}
                              >
                                {style === "Casual" && <Coffee className="h-3 w-3 mr-1.5" />}
                                {style === "Fine Dining" && <Star className="h-3 w-3 mr-1.5" />}
                                {style === "Quick Bites" && <Clock className="h-3 w-3 mr-1.5" />}
                                {style === "Vegetarian" && <Leaf className="h-3 w-3 mr-1.5" />}
                                {style}
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="compatibility">
                        <AccordionTrigger className="text-sm font-medium py-2 flex items-center gap-1">
                          <Heart className="h-4 w-4 inline-block mr-1" />
                          <span>Compatibility</span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pt-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Minimum Match</span>
                              <span className="text-sm text-neutral-600">{minCompatibility}%</span>
                            </div>
                            <Slider
                              className="py-2"
                              min={0}
                              max={100}
                              step={5}
                              value={[minCompatibility]}
                              onValueChange={(value) => setMinCompatibility(value[0])}
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    
                    <div className="flex items-center gap-2 pt-2">
                      <div 
                        className={`flex-1 py-2 rounded-md border text-center cursor-pointer ${
                          showOnlineOnly 
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                        onClick={() => setShowOnlineOnly(!showOnlineOnly)}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${showOnlineOnly ? 'bg-green-500' : 'bg-neutral-300'}`}></div>
                          <span className="text-sm">Online Only</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between pt-4 border-t">
                      <Button variant="outline" onClick={resetFilters}>
                        Reset All Filters
                      </Button>
                      <SheetClose asChild>
                        <Button>Apply Filters</Button>
                      </SheetClose>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
        
        <Card>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map((_, i) => (
                  <div key={i} className="h-80 bg-neutral-100 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : nearbyUsers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-neutral-600">No dining companions found nearby.</p>
                <p className="text-sm text-neutral-500 mt-2">Try expanding your search radius.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {nearbyUsers.slice(0, 4).map((nearbyUser: User, i: number) => (
                    <div key={nearbyUser.id} className="bg-neutral-50 rounded-lg overflow-hidden shadow-sm border border-neutral-200 hover:shadow-md transition-shadow">
                      <div className="relative">
                        {/* Use a generic placeholder image */}
                        <div className="w-full h-48 bg-neutral-200 overflow-hidden">
                          {nearbyUser.profileImage ? (
                            <img 
                              src={nearbyUser.profileImage} 
                              alt={`${nearbyUser.name}'s profile`} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-neutral-300">
                              <span className="text-4xl font-bold text-neutral-600">
                                {nearbyUser.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                          <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                          <span>Online</span>
                        </div>
                        
                        <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 text-xs px-2 py-1 rounded-full flex items-center">
                          <span>{distances[i % distances.length]}</span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg flex items-center">
                              {nearbyUser.name}, {nearbyUser.age || 30}
                              {nearbyUser.isVerified && (
                                <CheckCircle className="text-green-500 ml-1 h-4 w-4" aria-label="Verified User" />
                              )}
                            </h3>
                            <p className="text-neutral-600 text-sm">{nearbyUser.occupation || "Food Enthusiast"}</p>
                          </div>
                          
                          {/* Display real compatibility score based on food preferences */}
                          {user && (
                            <Badge 
                              variant="outline" 
                              className={`flex items-center gap-1 ${
                                getCompatibilityScore(nearbyUser) >= 75 
                                  ? "bg-green-100 border-green-200 text-green-800"
                                  : getCompatibilityScore(nearbyUser) >= 50
                                    ? "bg-amber-100 border-amber-200 text-amber-800"
                                    : "bg-gray-100 border-gray-200 text-gray-800"
                              }`}
                            >
                              <Heart className="h-3 w-3 mr-0.5" />
                              {getCompatibilityScore(nearbyUser)}% Match
                            </Badge>
                          )}
                        </div>
                        
                        <div className="mt-3 flex flex-wrap gap-2">
                          {/* Display actual cuisine preferences */}
                          {nearbyUser.cuisinePreferences && nearbyUser.cuisinePreferences.length > 0 ? (
                            nearbyUser.cuisinePreferences.slice(0, 3).map((pref, j) => (
                              <Badge key={j} variant="secondary" className="text-xs flex items-center gap-1">
                                <Utensils className="h-3 w-3" />
                                {pref}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="secondary" className="text-xs">No preferences set</Badge>
                          )}
                        </div>
                        
                        <p className="mt-3 text-sm text-neutral-600 line-clamp-2">
                          {nearbyUser.bio || "I love exploring new restaurants and enjoy conversations about food, travel and culture."}
                        </p>
                        
                        <div className="mt-4 flex space-x-2">
                          <Button 
                            onClick={() => onInvite(nearbyUser)} 
                            className="flex-1 bg-primary hover:bg-primary/90"
                          >
                            Invite to Dine
                          </Button>
                          <Button variant="outline" className="flex-1">
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {nearbyUsers.length > 4 && (
                  <div className="mt-5 text-center">
                    <Button variant="link" className="text-primary hover:text-primary/90 font-medium">
                      Show more
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}