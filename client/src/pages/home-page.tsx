import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import SiteHeader from "@/components/layout/site-header";
import MobileNav from "@/components/layout/mobile-nav";
import HeroBanner from "@/components/layout/hero-banner";
import NearbyUsers from "@/components/dining/nearby-users-new";
import NearbyRestaurants from "@/components/dining/nearby-restaurants";
import SavedRestaurants from "@/components/dining/saved-restaurants";
import UpcomingMeals from "@/components/dining/upcoming-meals";
import ProfileCompletion from "@/components/profile/profile-completion";
import InviteModal from "@/components/dining/invite-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarPlus, Utensils, Bookmark } from "lucide-react";
import { User } from "@shared/schema";

import JoinMeModal from "@/components/dining/join-me";

// Toggle this to view the page without authentication
const DEMO_MODE = true;

// Mock user data for demo mode
const mockUser: User = {
  id: 1,
  username: "demouser",
  password: "",
  name: "Demo User",
  email: "demo@example.com",
  bio: "I love trying new restaurants and meeting interesting people.",
  occupation: "Food Enthusiast",
  profileImage: "",
  age: 28,
  phone: "(555) 123-4567",
  isVerified: true,
  foodPreferences: ["Spicy Food", "Healthy Options", "Desserts"],
  dietaryRestrictions: ["Gluten-Free"],
  cuisinePreferences: ["Italian", "Japanese", "Mexican", "Thai"],
  diningStyles: ["Casual Dining", "Fine Dining"],
  locationLat: "40.7128",
  locationLng: "-74.0060",
  lastActive: new Date(),
  microsoftId: null,
  microsoftRefreshToken: null,
  useMicrosoftCalendar: false
};

export default function HomePage() {
  const { user: authUser } = useAuth();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Use mock user in demo mode, otherwise use authenticated user
  const user = DEMO_MODE ? mockUser : authUser;

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

  if (!user && !DEMO_MODE) return null;

  const firstName = user?.name.split(' ')[0] || "User";
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      <SiteHeader />
      
      <div className="pt-20 pb-32 bg-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-b from-black to-transparent"></div>
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80')`
            }}
          ></div>
        </div>
        
        <div className="elegant-container relative z-10">
          <div className="max-w-2xl">
            <h1 className="elegant-heading mb-4">
              Never Eat
              <br/>
              <span className="text-zinc-100">Solo</span>
            </h1>
            
            <p className="text-lg md:text-xl font-light text-zinc-400 mb-8 max-w-lg">
              Connect with like-minded food enthusiasts for memorable dining experiences
              at any type of restaurant, from casual cafés to local favorites.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button 
                onClick={() => setShowScheduleModal(true)}
                className="elegant-button px-6 py-6 text-sm uppercase tracking-widest"
              >
                Join Me
              </Button>
              <Button 
                variant="outline" 
                className="elegant-button px-6 py-6 text-sm uppercase tracking-widest border-zinc-700 text-zinc-400 hover:bg-zinc-800/50"
                onClick={() => setShowScheduleModal(true)}
              >
                Find Companions
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <main className="elegant-container py-16">
        <div className="flex items-center space-x-4 mb-10">
          <Avatar className="h-16 w-16 ring-2 ring-primary/30">
            <AvatarImage src={user.profileImage} alt={user.name} />
            <AvatarFallback className="bg-zinc-800 text-primary text-lg">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-light tracking-wide text-zinc-100">
              Welcome back, <span className="text-primary">{firstName}</span>
            </h2>
            <p className="text-zinc-400 font-light">Your culinary adventures await</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-12">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-light tracking-wide text-zinc-100">
                  <span className="text-primary border-l-2 border-primary pl-3 italic">Featured</span> Dining Partners
                </h2>
                <Button variant="ghost" className="font-light text-sm uppercase tracking-wider text-primary hover:bg-primary/5">
                  View All
                </Button>
              </div>
              <div className="elegant-card p-6">
                <NearbyUsers onInvite={handleInvite} />
              </div>
            </section>
            
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-light tracking-wide text-zinc-100">
                  <span className="text-primary border-l-2 border-primary pl-3 italic">Curated</span> Restaurants
                </h2>
                <Button variant="ghost" className="font-light text-sm uppercase tracking-wider text-primary hover:bg-primary/5">
                  View All
                </Button>
              </div>
              <div className="elegant-card p-6">
                <NearbyRestaurants />
              </div>
            </section>
            
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-light tracking-wide text-zinc-100">
                  <span className="text-primary border-l-2 border-primary pl-3 italic">Your</span> Saved Restaurants
                </h2>
                <Button variant="ghost" className="font-light text-sm uppercase tracking-wider text-primary hover:bg-primary/5 flex items-center gap-1">
                  <Bookmark className="h-4 w-4" />
                  Manage
                </Button>
              </div>
              <div className="elegant-card p-6">
                <SavedRestaurants />
              </div>
            </section>
          </div>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-light tracking-wide text-zinc-100 mb-6">
                <span className="text-primary border-l-2 border-primary pl-3 italic">Your</span> Calendar
              </h2>
              <div className="elegant-card p-6">
                <UpcomingMeals />
              </div>
            </section>
            
            <section className="elegant-card p-6">
              <h3 className="text-xl font-light tracking-wide text-primary mb-6">Profile Status</h3>
              <ProfileCompletion />
            </section>
            
            <section className="elegant-card p-6">
              <h3 className="text-xl font-light tracking-wide text-primary mb-4">Your Activity</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 border border-zinc-800 bg-zinc-900/50">
                  <div className="text-2xl font-light text-primary">
                    {upcomingMeals.filter(meal => meal.status === 'pending').length || 0}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">Pending</div>
                </div>
                <div className="text-center p-4 border border-zinc-800 bg-zinc-900/50">
                  <div className="text-2xl font-light text-primary">
                    {/* This would be from a real API in production */}
                    0
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">Matches</div>
                </div>
                <div className="text-center p-4 border border-zinc-800 bg-zinc-900/50">
                  <div className="text-2xl font-light text-primary">
                    {upcomingMeals.length || 0}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">Upcoming</div>
                </div>
              </div>
            </section>
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
      
      {/* Join Me Modal */}
      <JoinMeModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      />
    </div>
  );
}
