import { useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle } from "lucide-react";

export default function ProfileCompletion() {
  const { user } = useAuth();
  
  // Calculate profile completion percentage
  const profileCompletion = useMemo(() => {
    if (!user) return 0;
    
    const requiredFields = [
      !!user.name,
      !!user.username,
      !!user.email,
      !!user.profileImage,
      user.foodPreferences && user.foodPreferences.length > 0,
      !!user.phone,
      !!user.bio,
      !!user.occupation,
      !!user.age,
      !!user.locationLat && !!user.locationLng
    ];
    
    const completedFields = requiredFields.filter(Boolean).length;
    return Math.floor((completedFields / requiredFields.length) * 100);
  }, [user]);
  
  if (!user) return null;

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="font-semibold text-lg mb-3">Complete Your Profile</h2>
        
        <div className="flex items-center mb-3">
          <Progress value={profileCompletion} className="h-2.5 flex-1" />
          <span className="ml-2 text-sm text-neutral-600">{profileCompletion}%</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            {user.name ? (
              <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
            ) : (
              <Circle className="text-neutral-300 mr-2 h-4 w-4" />
            )}
            <span className="text-neutral-600">Basic information</span>
          </div>
          
          <div className="flex items-center text-sm">
            {user.profileImage ? (
              <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
            ) : (
              <Circle className="text-neutral-300 mr-2 h-4 w-4" />
            )}
            <span className="text-neutral-600">Profile photo</span>
          </div>
          
          <div className="flex items-center text-sm">
            {user.foodPreferences && user.foodPreferences.length > 0 ? (
              <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
            ) : (
              <Circle className="text-neutral-300 mr-2 h-4 w-4" />
            )}
            <span className="text-neutral-600">Food preferences</span>
          </div>
          
          <div className="flex items-center text-sm">
            {user.phone ? (
              <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
            ) : (
              <Circle className="text-neutral-300 mr-2 h-4 w-4" />
            )}
            <span className="text-neutral-600">Verify your phone number</span>
          </div>
        </div>
        
        <Link href="/profile">
          <Button className="mt-4 w-full border border-primary text-primary hover:bg-primary hover:text-white">
            Complete Profile
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
