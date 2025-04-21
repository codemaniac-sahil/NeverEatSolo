import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  MapPin, 
  Search, 
  Filter, 
  ChevronsUpDown, 
  DollarSign, 
  Users, 
  Clock,
  ArrowUpDown,
  ChefHat,
  X,
  Bookmark,
  BookmarkCheck
} from "lucide-react";
import { Restaurant } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CUISINE_PREFERENCES } from "@shared/constants";
import { useSavedRestaurants } from "@/hooks/use-saved-restaurants";
import { useToast } from "@/hooks/use-toast";

// Toggle this to use mock data
const DEMO_MODE = true;

// Mock restaurants for demonstration
const mockRestaurants: Restaurant[] = [
  {
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
  {
    id: 202,
    name: "Sushi Sensation",
    cuisine: "Japanese",
    priceRange: "$$",
    address: "456 Broadway, New York, NY",
    locationLat: "40.7125",
    locationLng: "-74.0058",
    rating: "4.9",
    image: "",
    activeUserCount: 5
  },
  {
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
  }
];

export default function NearbyRestaurants() {
  const [coordinates, setCoordinates] = useState<{ lat: string, lng: string } | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [radius, setRadius] = useState(5);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<"distance" | "rating" | "popularity">("distance");
  const [expanded, setExpanded] = useState(false);
  
  // Get current coordinates
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString()
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback to default coordinates (NYC)
          setCoordinates({ lat: "40.7128", lng: "-74.0060" });
        }
      );
    } else {
      // Fallback if geolocation is not supported
      setCoordinates({ lat: "40.7128", lng: "-74.0060" });
    }
  }, []);

  // Fetch nearby restaurants from API or use mock data in demo mode
  const { data: apiRestaurants = [], isLoading: isApiLoading } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants/nearby", coordinates?.lat || "0", coordinates?.lng || "0", radius],
    queryFn: async () => {
      if (!coordinates) return [];
      const response = await fetch(`/api/restaurants/nearby?lat=${coordinates.lat}&lng=${coordinates.lng}&radius=${radius}`);
      if (!response.ok) throw new Error("Failed to fetch restaurants");
      return response.json();
    },
    enabled: !DEMO_MODE && !!coordinates,
  });
  
  // Use mock data in demo mode, otherwise use API data
  const allRestaurants = DEMO_MODE ? mockRestaurants : apiRestaurants;
  const isLoading = DEMO_MODE ? false : isApiLoading;

  // Apply filters
  const filteredRestaurants = allRestaurants.filter(restaurant => {
    // Apply search filter
    if (searchTerm && !restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !restaurant.cuisine?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Apply cuisine filter
    if (selectedCuisines.length > 0 && !selectedCuisines.includes(restaurant.cuisine)) {
      return false;
    }
    
    // Apply price range filter
    if (priceRange.length > 0 && !priceRange.includes(restaurant.priceRange)) {
      return false;
    }
    
    // Apply rating filter
    if (minRating > 0 && parseFloat(restaurant.rating as string) < minRating) {
      return false;
    }
    
    return true;
  });
  
  // Sort restaurants
  const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
    if (sortBy === "rating") {
      return parseFloat(b.rating as string) - parseFloat(a.rating as string);
    } else if (sortBy === "popularity") {
      return (b.activeUserCount || 0) - (a.activeUserCount || 0);
    } else {
      // Default to distance (in demo mode, just use the mock order)
      return 0;
    }
  });
  
  // Final list of restaurants to display
  const restaurants = sortedRestaurants;
  
  // Mock distances for demonstration
  const distances = ["0.5 miles away", "0.8 miles away", "1.2 miles away"];
  const diners = [7, 5, 3];
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setRadius(5);
    setSelectedCuisines([]);
    setPriceRange([]);
    setMinRating(0);
    setSortBy("distance");
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-xl">Restaurants Near You</h2>
          
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 flex items-center gap-1">
                  <Filter className="h-3.5 w-3.5" />
                  <span className="text-sm">Filter</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-sm">
                <SheetHeader>
                  <SheetTitle>Filter Restaurants</SheetTitle>
                </SheetHeader>
                
                <div className="mt-6 space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Search</label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2 text-neutral-500"
                        onClick={() => setSearchTerm("")}
                      >
                        Clear
                      </Button>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <Input 
                        placeholder="Restaurant name or cuisine..." 
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cuisine Types</label>
                    <div className="flex flex-wrap gap-2">
                      {CUISINE_PREFERENCES.map(cuisine => (
                        <Badge
                          key={cuisine}
                          variant={selectedCuisines.includes(cuisine) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            setSelectedCuisines(prev => 
                              prev.includes(cuisine) 
                                ? prev.filter(c => c !== cuisine) 
                                : [...prev, cuisine]
                            );
                          }}
                        >
                          {cuisine}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price Range</label>
                    <div className="flex gap-2">
                      {["$", "$$", "$$$", "$$$$"].map(price => (
                        <div
                          key={price}
                          className={`flex-1 p-2 rounded-md border text-center cursor-pointer ${
                            priceRange.includes(price) 
                              ? 'border-primary bg-primary/5 text-primary' 
                              : 'border-neutral-200 hover:border-neutral-300'
                          }`}
                          onClick={() => {
                            setPriceRange(prev => 
                              prev.includes(price) 
                                ? prev.filter(p => p !== price) 
                                : [...prev, price]
                            );
                          }}
                        >
                          {price}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Minimum Rating</label>
                    <Select
                      value={minRating.toString()}
                      onValueChange={(value) => setMinRating(parseFloat(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Any rating</SelectItem>
                        <SelectItem value="3">3+ stars</SelectItem>
                        <SelectItem value="3.5">3.5+ stars</SelectItem>
                        <SelectItem value="4">4+ stars</SelectItem>
                        <SelectItem value="4.5">4.5+ stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sort by</label>
                    <Select
                      value={sortBy}
                      onValueChange={(value) => setSortBy(value as "distance" | "rating" | "popularity")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="distance">Distance</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="popularity">Most Popular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-between pt-4 border-t">
                    <Button variant="outline" onClick={resetFilters}>
                      Reset Filters
                    </Button>
                    <SheetClose asChild>
                      <Button>Apply Filters</Button>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as "distance" | "rating" | "popularity")}
            >
              <SelectTrigger className="h-8 w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="popularity">Most Popular</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2"
              onClick={() => setExpanded(!expanded)}
            >
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input 
              placeholder="Search restaurants or cuisines..." 
              className="pl-9 pr-4"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedCuisines.map(cuisine => (
              <Badge
                key={cuisine}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {cuisine}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => setSelectedCuisines(prev => prev.filter(c => c !== cuisine))}
                />
              </Badge>
            ))}
            
            {priceRange.map(price => (
              <Badge
                key={price}
                variant="outline"
                className="flex items-center gap-1"
              >
                {price}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => setPriceRange(prev => prev.filter(p => p !== price))}
                />
              </Badge>
            ))}
            
            {minRating > 0 && (
              <Badge
                variant="outline"
                className="flex items-center gap-1"
              >
                {minRating}+ <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => setMinRating(0)}
                />
              </Badge>
            )}
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="h-24 bg-neutral-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-neutral-600">No restaurants found nearby.</p>
            <p className="text-sm text-neutral-500 mt-2">Try expanding your search radius.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {restaurants.map((restaurant: Restaurant, i: number) => (
              <div 
                key={restaurant.id} 
                className={`flex ${expanded ? 'flex-col' : 'flex-row'} bg-neutral-50 rounded-lg overflow-hidden border border-neutral-200 hover:shadow-md transition-shadow cursor-pointer`}
              >
                <div className={`${expanded ? 'w-full h-48' : 'w-20 h-24'} bg-neutral-200 overflow-hidden relative`}>
                  {restaurant.image ? (
                    <img 
                      src={restaurant.image} 
                      alt={restaurant.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-neutral-300 to-neutral-200">
                      <ChefHat className="h-8 w-8 text-neutral-500" />
                    </div>
                  )}
                  
                  {expanded && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-3">
                      <h3 className="font-medium text-white text-lg">{restaurant.name}</h3>
                      <div className="flex items-center mt-1">
                        <div className="flex items-center bg-white/90 text-amber-500 text-xs px-2 py-0.5 rounded-full">
                          <Star className="h-3 w-3 fill-current mr-1" />
                          <span>{restaurant.rating || "4.5"}</span>
                        </div>
                        <span className="text-xs text-white/90 ml-2">
                          {restaurant.cuisine} • {restaurant.priceRange}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className={`${expanded ? 'p-4' : 'flex-1 p-3'}`}>
                  {!expanded && (
                    <>
                      <div className="flex justify-between">
                        <h3 className="font-medium text-neutral-800">{restaurant.name}</h3>
                        <div className="flex items-center text-amber-400 text-xs">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="ml-1 text-neutral-700">{restaurant.rating || "4.5"}</span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-neutral-600 mt-1">
                        {restaurant.cuisine} • {restaurant.priceRange}
                      </p>
                    </>
                  )}
                  
                  <div className={`flex ${expanded ? 'mt-3' : 'mt-2'} justify-between items-center`}>
                    <span className="text-xs text-neutral-600 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {distances[i % distances.length]}
                    </span>
                    <span className="text-xs text-green-600 flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {restaurant.activeUserCount || diners[i % diners.length]} dining now
                    </span>
                  </div>
                  
                  {expanded && (
                    <>
                      <p className="text-sm text-neutral-600 mt-3">
                        {restaurant.address || "123 Restaurant Address, City"}
                      </p>
                      
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" className="flex-1 text-xs">See Details</Button>
                        <Button size="sm" className="flex-1 text-xs">Schedule Meal</Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
