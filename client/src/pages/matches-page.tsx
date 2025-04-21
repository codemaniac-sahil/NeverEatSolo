import NearbyUsers from "@/components/dining/nearby-users-new";
import SiteHeader from "@/components/layout/site-header";
import MobileNav from "@/components/layout/mobile-nav";
import { Users } from "lucide-react";
import { useState } from "react";
import { User } from "@shared/schema";
import InviteModal from "@/components/dining/invite-modal";

export default function MatchesPage() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleInvite = (user: User) => {
    setSelectedUser(user);
    setShowInviteModal(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      <SiteHeader />
      
      <div className="pt-20 pb-12 bg-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-b from-black to-transparent"></div>
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
            }}
          ></div>
        </div>
        
        <div className="elegant-container relative z-10">
          <div className="max-w-2xl">
            <h1 className="elegant-heading mb-4 flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <span>Dining Partners</span>
            </h1>
            
            <p className="text-lg md:text-xl font-light text-zinc-400 mb-8 max-w-lg">
              Find compatible dining companions based on food preferences and culinary interests
            </p>
          </div>
        </div>
      </div>
      
      <main className="elegant-container py-12">
        <div className="elegant-card p-6">
          <NearbyUsers onInvite={handleInvite} />
        </div>
      </main>
      
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