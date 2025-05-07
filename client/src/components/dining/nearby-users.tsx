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
    username: "emma_foodie",
    password: "",
    name: "Emma Davis",
    email: "emma@example.com",
    bio: "Passionate about Italian cuisine and fine dining experiences. I love exploring new restaurants on weekends.",
    occupation: "Food Blogger",
    profileImage: null,
    gender: "female",
    dateOfBirth: "1994-05-15",
    age: 29,
    phone: null,
    isVerified: true,
    foodPreferences: ["Pasta", "Wine", "Desserts"],
    dietaryRestrictions: [],
    cuisinePreferences: ["Italian", "French", "Mediterranean"],
    diningStyles: ["Fine Dining", "Casual Dining"],
    locationLat: "40.712",
    locationLng: "-74.006",
    locationContext: "local",
    locationContextNote: null,
    lastActive: new Date(),
    // Corporate fields
    organizationId: null,
    workEmail: null,
    jobTitle: null,
    department: null,
    employeeId: null,
    workspaceId: null,
    isCorpAdmin: false,
    useWorkProfile: false,
    workProfilePublic: true,
    allowCrossDepartmentMatching: true,
    // Microsoft fields
    microsoftId: null,
    microsoftRefreshToken: null,
    useMicrosoftCalendar: false
  },
  {
    id: 102,
    username: "raj_spice",
    password: "",
    name: "Raj Patel",
    email: "raj@example.com",
    bio: "Spicy food enthusiast always looking for authentic international cuisines. Love trying new dishes!",
    occupation: "Chef",
    profileImage: null,
    gender: "male",
    dateOfBirth: "1989-08-22",
    age: 34,
    phone: null,
    isVerified: true,
    foodPreferences: ["Spicy Food", "Street Food"],
    dietaryRestrictions: ["Vegetarian"],
    cuisinePreferences: ["Indian", "Thai", "Mexican"],
    diningStyles: ["Casual Dining", "Food Trucks"],
    locationLat: "40.715",
    locationLng: "-74.009",
    locationContext: "local",
    locationContextNote: null,
    lastActive: new Date(),
    // Corporate fields
    organizationId: null,
    workEmail: null,
    jobTitle: null,
    department: null,
    employeeId: null,
    workspaceId: null,
    isCorpAdmin: false,
    useWorkProfile: false,
    workProfilePublic: true,
    allowCrossDepartmentMatching: true,
    // Microsoft fields
    microsoftId: null,
    microsoftRefreshToken: null,
    useMicrosoftCalendar: false
  },
  {
    id: 103,
    username: "sophie_health",
    password: "",
    name: "Sophie Kim",
    email: "sophie@example.com",
    bio: "Health-conscious foodie looking for nutritious and delicious meals. I enjoy conversations about wellness and food.",
    occupation: "Nutritionist",
    profileImage: null,
    gender: "female",
    dateOfBirth: "1992-11-03",
    age: 31,
    phone: null,
    isVerified: true,
    foodPreferences: ["Organic", "Plant-based", "Seafood"],
    dietaryRestrictions: ["Gluten-Free"],
    cuisinePreferences: ["Japanese", "Korean", "Mediterranean"],
    diningStyles: ["Healthy Eating", "Farm-to-Table"],
    locationLat: "40.718",
    locationLng: "-74.003",
    locationContext: "local",
    locationContextNote: null,
    lastActive: new Date(),
    // Corporate fields
    organizationId: null,
    workEmail: null,
    jobTitle: null,
    department: null,
    employeeId: null,
    workspaceId: null,
    isCorpAdmin: false,
    useWorkProfile: false,
    workProfilePublic: true,
    allowCrossDepartmentMatching: true,
    // Microsoft fields
    microsoftId: null,
    microsoftRefreshToken: null,
    useMicrosoftCalendar: false
  },
  {
    id: 104,
    username: "carlos_taste",
    password: "",
    name: "Carlos Rodriguez",
    email: "carlos@example.com",
    bio: "Food enthusiast who loves exploring different cuisines. I'm always up for trying new restaurants and dishes!",
    occupation: "Food Photographer",
    profileImage: null,
    gender: "male",
    dateOfBirth: "1991-04-17",
    age: 32,
    phone: null,
    isVerified: true,
    foodPreferences: ["Tapas", "Grilled", "Seafood"],
    dietaryRestrictions: [],
    cuisinePreferences: ["Spanish", "Mexican", "Latin American"],
    diningStyles: ["Social Dining", "Wine Pairing"],
    locationLat: "40.710",
    locationLng: "-74.012",
    locationContext: "local",
    locationContextNote: null,
    lastActive: new Date(),
    // Corporate fields
    organizationId: null,
    workEmail: null,
    jobTitle: null,
    department: null,
    employeeId: null,
    workspaceId: null,
    isCorpAdmin: false,
    useWorkProfile: false,
    workProfilePublic: true,
    allowCrossDepartmentMatching: true,
    // Microsoft fields
    microsoftId: null,
    microsoftRefreshToken: null,
    useMicrosoftCalendar: false
  }
];

interface NearbyUsersProps {
  onInvite: (user: User) => void;
}

export default function NearbyUsers({ onInvite }: NearbyUsersProps) {
  const { user } = useAuth();
  const [coordinates, setCoordinates] = useState<{ lat: string, lng: string } | null>(null);
  const [geolocationError, setGeolocationError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [radius, setRadius] = useState(5);
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(70);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedDiningStyles, setSelectedDiningStyles] = useState<string[]>([]);
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [minCompatibility, setMinCompatibility] = useState(0);
  const [sortBy, setSortBy] = useState<"compatibility" | "distance" | "activity">("compatibility");
  
  // Get current coordinates
  useEffect(() => {
    // Create abort controller to handle timeouts and permission issues
    const abortController = new AbortController();
    const abortSignal = abortController.signal;
    
    // Set a timeout to abort after 10 seconds
    const timeoutId = setTimeout(() => {
      abortController.abort();
      setGeolocationError("Location request timed out. Using default location.");
      // Fallback to default coordinates (NYC)
      setCoordinates({ lat: "40.7128", lng: "-74.0060" });
    }, 10000);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Clear the timeout since we got a response
          clearTimeout(timeoutId);
          
          if (!abortSignal.aborted) {
            setCoordinates({
              lat: position.coords.latitude.toString(),
              lng: position.coords.longitude.toString()
            });
            setGeolocationError(null);
            setPermissionDenied(false);
          }
        },
        (error) => {
          // Clear the timeout since we got a response
          clearTimeout(timeoutId);
          
          if (!abortSignal.aborted) {
            console.error("Error getting location:", error);
            
            let errorMessage = "Unknown location error. Using default location.";
            
            // Handle permission denied specifically
            if (error.code === 1) { // PERMISSION_DENIED
              errorMessage = "Location permission denied. Some features will be limited.";
              setPermissionDenied(true);
            } else if (error.code === 2) { // POSITION_UNAVAILABLE
              errorMessage = "Location unavailable. Using default location.";
            } else if (error.code === 3) { // TIMEOUT
              errorMessage = "Location request timed out. Using default location.";
            }
            
            setGeolocationError(errorMessage);
            // Fallback to default coordinates (NYC)
            setCoordinates({ lat: "40.7128", lng: "-74.0060" });
          }
        },
        { 
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 60000
          // signal: abortSignal - not supported in standard PositionOptions
        }
      );
    } else {
      // Clear the timeout since geolocation is not supported
      clearTimeout(timeoutId);
      
      // Fallback if geolocation is not supported
      setGeolocationError("Geolocation is not supported by your browser. Using default location.");
      setCoordinates({ lat: "40.7128", lng: "-74.0060" });
    }
    
    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, []);

  // Fetch nearby users from API or use mock data in demo mode
  const { data: apiNearbyUsers = [], isLoading: isApiLoading } = useQuery<User[]>({
    queryKey: ["/api/users/nearby", coordinates?.lat || "0", coordinates?.lng || "0", radius],
    queryFn: async () => {
      if (!coordinates || !user) return [];
      const response = await fetch(`/api/users/nearby?lat=${coordinates.lat}&lng=${coordinates.lng}&radius=${radius}`);
      if (!response.ok) throw new Error("Failed to fetch nearby users");
      return response.json();
    },
    enabled: !DEMO_MODE && !!coordinates && !!user,
    ...getQueryOptions('location'), // Use location-specific cache settings
  });
  
  // Use mock data in demo mode, otherwise use data from API
  const allNearbyUsers = DEMO_MODE ? mockNearbyUsers : apiNearbyUsers;
  const isLoading = DEMO_MODE ? false : isApiLoading;

  // Helper distances for demonstration
  const distances = ["0.8 miles away", "1.2 miles away", "0.5 miles away", "1.5 miles away"];
  
  // Calculate compatibility score for each user
  const getCompatibilityScore = (otherUser: User) => {
    if (!user) return 0;
    
    return calculateCompatibilityScore(
      {
        dietaryRestrictions: user.dietaryRestrictions || [],
        cuisinePreferences: user.cuisinePreferences || [],
        diningStyles: user.diningStyles || [],
        foodPreferences: user.foodPreferences || []
      },
      {
        dietaryRestrictions: otherUser.dietaryRestrictions || [],
        cuisinePreferences: otherUser.cuisinePreferences || [],
        diningStyles: otherUser.diningStyles || [],
        foodPreferences: otherUser.foodPreferences || []
      }
    );
  };
  
  // Apply filters to users
  const filteredUsers = allNearbyUsers.filter(nearbyUser => {
    // Apply search filter
    if (searchTerm && !nearbyUser.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !nearbyUser.occupation?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Apply age filter
    if (nearbyUser.age && (nearbyUser.age < minAge || nearbyUser.age > maxAge)) {
      return false;
    }
    
    // Apply cuisine preference filter
    if (selectedCuisines.length > 0 && 
        !selectedCuisines.some(cuisine => 
          nearbyUser.cuisinePreferences?.includes(cuisine)
        )) {
      return false;
    }
    
    // Apply dining style filter
    if (selectedDiningStyles.length > 0 && 
        !selectedDiningStyles.some(style => 
          nearbyUser.diningStyles?.includes(style)
        )) {
      return false;
    }
    
    // Apply compatibility filter
    if (minCompatibility > 0 && getCompatibilityScore(nearbyUser) < minCompatibility) {
      return false;
    }
    
    // We'll assume all users are online in demo mode
    if (showOnlineOnly && DEMO_MODE) {
      return true;
    }
    
    return true;
  });
  
  // Sort users based on selected sort criteria
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === "compatibility") {
      return getCompatibilityScore(b) - getCompatibilityScore(a);
    } else if (sortBy === "distance") {
      // In demo mode, just random sort for distance
      return Math.random() - 0.5;
    } else {
      // Sort by activity (lastActive)
      return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
    }
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
                    Allow Location Access
                  </Button>
                </div>
              )}
            </AlertDescription>
          </div>
        </Alert>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input 
            placeholder="Search by name or profession..." 
            className="pl-10 h-10 bg-zinc-900/30 border-zinc-800 text-zinc-300 placeholder:text-zinc-600 focus-visible:ring-primary/30"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as "compatibility" | "distance" | "activity")}
          >
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
                      className="py-2"
                      min={1}
                      max={50}
                      step={1}
                      value={[radius]}
                      onValueChange={(value) => setRadius(value[0])}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Age Range
                      </label>
                      <span className="text-sm text-neutral-600">{minAge} - {maxAge}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        min={18} 
                        max={maxAge}
                        value={minAge}
                        onChange={(e) => setMinAge(parseInt(e.target.value))}
                        className="w-16 text-center"
                      />
                      <div className="h-px bg-neutral-200 flex-grow"></div>
                      <Input 
                        type="number" 
                        min={minAge} 
                        max={100}
                        value={maxAge}
                        onChange={(e) => setMaxAge(parseInt(e.target.value))}
                        className="w-16 text-center"
                      />
                    </div>
                  </div>
                  
                  <Accordion type="multiple" className="w-full">
                    <AccordionItem value="cuisines">
                      <AccordionTrigger className="text-sm font-medium py-2">
                        <div className="flex items-center gap-1">
                          <ChefHat className="h-4 w-4" />
                          <span>Cuisine Preferences</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-1 pt-2">
                          {CUISINE_PREFERENCES.map(cuisine => (
                            <div
                              key={cuisine} 
                              className={`px-2 py-1 rounded-md text-sm cursor-pointer border flex items-center justify-between ${
                                selectedCuisines.includes(cuisine) 
                                  ? 'border-primary bg-primary/5 text-primary' 
                                  : 'border-neutral-200 hover:border-neutral-300'
                              }`}
                              onClick={() => {
                                setSelectedCuisines(
                                  selectedCuisines.includes(cuisine)
                                    ? selectedCuisines.filter(c => c !== cuisine)
                                    : [...selectedCuisines, cuisine]
                                );
                              }}
                            >
                              <span>{cuisine}</span>
                              {selectedCuisines.includes(cuisine) && (
                                <CheckCircle className="h-3 w-3" />
                              )}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="dining-styles">
                      <AccordionTrigger className="text-sm font-medium py-2">
                        <div className="flex items-center gap-1">
                          <Utensils className="h-4 w-4" />
                          <span>Dining Styles</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-1 pt-2">
                          {DINING_STYLES.map(style => (
                            <div
                              key={style} 
                              className={`px-2 py-1 rounded-md text-sm cursor-pointer border flex items-center justify-between ${
                                selectedDiningStyles.includes(style) 
                                  ? 'border-primary bg-primary/5 text-primary' 
                                  : 'border-neutral-200 hover:border-neutral-300'
                              }`}
                              onClick={() => {
                                setSelectedDiningStyles(
                                  selectedDiningStyles.includes(style)
                                    ? selectedDiningStyles.filter(s => s !== style)
                                    : [...selectedDiningStyles, style]
                                );
                              }}
                            >
                              <span>{style}</span>
                              {selectedDiningStyles.includes(style) && (
                                <CheckCircle className="h-3 w-3" />
                              )}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="compatibility">
                      <AccordionTrigger className="text-sm font-medium py-2">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          <span>Compatibility</span>
                        </div>
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
  );
}
