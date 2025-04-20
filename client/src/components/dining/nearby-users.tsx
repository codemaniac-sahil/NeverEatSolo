import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { CheckCircle, Filter, Utensils, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "@shared/schema";
import { calculateCompatibilityScore } from "@shared/constants";

interface NearbyUsersProps {
  onInvite: (user: User) => void;
}

export default function NearbyUsers({ onInvite }: NearbyUsersProps) {
  const { user } = useAuth();
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

  // Fetch nearby users
  const { data: nearbyUsers = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users/nearby", coordinates?.lat, coordinates?.lng],
    enabled: !!coordinates && !!user,
  });

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

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-xl">Nearby Dining Companions</h2>
          <Button variant="outline" size="sm" className="text-neutral-600 flex items-center gap-1">
            <span>Filter</span>
            <Filter className="h-4 w-4" />
          </Button>
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
