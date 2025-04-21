import NearbyRestaurants from "@/components/dining/nearby-restaurants";
import SiteHeader from "@/components/layout/site-header";
import MobileNav from "@/components/layout/mobile-nav";
import { Utensils } from "lucide-react";

export default function RestaurantsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      <SiteHeader />
      
      <div className="pt-20 pb-12 bg-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-b from-black to-transparent"></div>
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80')`
            }}
          ></div>
        </div>
        
        <div className="elegant-container relative z-10">
          <div className="max-w-2xl">
            <h1 className="elegant-heading mb-4 flex items-center gap-3">
              <Utensils className="h-8 w-8 text-primary" />
              <span>Restaurants</span>
            </h1>
            
            <p className="text-lg md:text-xl font-light text-zinc-400 mb-8 max-w-lg">
              Discover nearby dining options perfect for meeting new companions
            </p>
          </div>
        </div>
      </div>
      
      <main className="elegant-container py-12">
        <div className="elegant-card p-6">
          <NearbyRestaurants />
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}