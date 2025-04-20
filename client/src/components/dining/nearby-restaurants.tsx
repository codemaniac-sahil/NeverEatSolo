import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin } from "lucide-react";
import { Restaurant } from "@shared/schema";

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
    queryKey: ["/api/restaurants/nearby", coordinates?.lat, coordinates?.lng],
    enabled: !DEMO_MODE && !!coordinates,
  });
  
  // Use mock data in demo mode, otherwise use API data
  const restaurants = DEMO_MODE ? mockRestaurants : apiRestaurants;
  const isLoading = DEMO_MODE ? false : isApiLoading;

  // Mock distances for demonstration
  const distances = ["0.5 miles away", "0.8 miles away", "1.2 miles away"];
  const diners = [7, 5, 3];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-xl">Restaurants Near You</h2>
          <Button variant="link" className="text-primary text-sm font-medium p-0">
            View All
          </Button>
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
                className="flex bg-neutral-50 rounded-lg overflow-hidden border border-neutral-200 hover:shadow-sm transition-shadow"
              >
                <div className="w-20 h-24 bg-neutral-200 overflow-hidden">
                  {restaurant.image ? (
                    <img 
                      src={restaurant.image} 
                      alt={restaurant.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-neutral-300">
                      <span className="text-neutral-500">Image</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 p-3">
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
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-neutral-600 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {distances[i % distances.length]}
                    </span>
                    <span className="text-xs text-green-600">
                      {restaurant.activeUserCount || diners[i % diners.length]} dining now
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
