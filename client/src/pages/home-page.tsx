import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import SiteHeader from "@/components/layout/site-header";
import MobileNav from "@/components/layout/mobile-nav";
import NearbyUsers from "@/components/dining/nearby-users";
import NearbyRestaurants from "@/components/dining/nearby-restaurants";
import UpcomingMeals from "@/components/dining/upcoming-meals";
import ProfileCompletion from "@/components/profile/profile-completion";
import InviteModal from "@/components/dining/invite-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "@shared/schema";

export default function HomePage() {
  const { user } = useAuth();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch upcoming meals
  const { data: upcomingMeals = [] } = useQuery({
    queryKey: ["/api/meals/upcoming"],
    enabled: !!user
  });

  // Handle invite
  const handleInvite = (user: User) => {
    setSelectedUser(user);
    setShowInviteModal(true);
  };

  if (!user) return null;

  const firstName = user.name.split(' ')[0];
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100">
      <SiteHeader />
      
      <main className="flex-grow container mx-auto px-4 py-4 md:py-8 pb-20 md:pb-8">
        <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
          {/* Left Column */}
          <div className="md:w-2/3 space-y-6">
            {/* Welcome Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16 border-2 border-primary">
                    <AvatarImage src={user.profileImage} alt={user.name} />
                    <AvatarFallback className="text-lg">{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="font-bold text-2xl">Welcome back, {firstName}!</h1>
                    <p className="text-neutral-600">Ready to find your next dining companion?</p>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-wrap gap-4">
                  <div className="flex flex-col items-center bg-neutral-100 rounded-lg p-4 flex-1">
                    <span className="text-2xl font-bold text-primary">
                      {upcomingMeals.filter(meal => meal.status === 'pending').length || 0}
                    </span>
                    <span className="text-sm text-neutral-600">Pending Invites</span>
                  </div>
                  <div className="flex flex-col items-center bg-neutral-100 rounded-lg p-4 flex-1">
                    <span className="text-2xl font-bold text-primary">
                      {/* This would be from a real API in production */}
                      0
                    </span>
                    <span className="text-sm text-neutral-600">Matches</span>
                  </div>
                  <div className="flex flex-col items-center bg-neutral-100 rounded-lg p-4 flex-1">
                    <span className="text-2xl font-bold text-primary">
                      {upcomingMeals.length || 0}
                    </span>
                    <span className="text-sm text-neutral-600">Upcoming Meals</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Nearby Users Section */}
            <NearbyUsers onInvite={handleInvite} />
          </div>
          
          {/* Right Column */}
          <div className="md:w-1/3 space-y-6">
            {/* Nearby Restaurants */}
            <NearbyRestaurants />
            
            {/* Upcoming Meals */}
            <UpcomingMeals />
            
            {/* Profile Completion */}
            <ProfileCompletion />
          </div>
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <MobileNav />
      
      {/* Invite Modal */}
      {showInviteModal && selectedUser && (
        <InviteModal 
          user={selectedUser} 
          isOpen={showInviteModal} 
          onClose={() => setShowInviteModal(false)} 
        />
      )}
    </div>
  );
}
