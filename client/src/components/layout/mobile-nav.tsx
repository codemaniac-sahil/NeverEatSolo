import { useLocation, Link } from "wouter";
import { Home, Users, MessageSquare, Utensils, User, Bookmark } from "lucide-react";

export default function MobileNav() {
  const [location] = useLocation();
  
  return (
    <div className="md:hidden bg-zinc-900/95 backdrop-blur-md shadow-xl border-t border-zinc-800 fixed bottom-0 left-0 right-0 z-40">
      <div className="flex justify-around">
        <Link href="/">
          <div className={`flex flex-col items-center py-3 px-4 ${
            location === '/' ? 'text-primary' : 'text-zinc-400'
          }`}>
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1 font-light tracking-wide">Home</span>
          </div>
        </Link>
        
        <Link href="/matches">
          <div className={`flex flex-col items-center py-3 px-4 ${
            location === '/matches' ? 'text-primary' : 'text-zinc-400'
          }`}>
            <Users className="h-5 w-5" />
            <span className="text-xs mt-1 font-light tracking-wide">Matches</span>
          </div>
        </Link>
        
        <Link href="/messages">
          <div className={`flex flex-col items-center py-3 px-4 ${
            location === '/messages' ? 'text-primary' : 'text-zinc-400'
          }`}>
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs mt-1 font-light tracking-wide">Messages</span>
          </div>
        </Link>
        
        <Link href="/restaurants">
          <div className={`flex flex-col items-center py-3 px-4 ${
            location === '/restaurants' ? 'text-primary' : 'text-zinc-400'
          }`}>
            <Utensils className="h-5 w-5" />
            <span className="text-xs mt-1 font-light tracking-wide">Dining</span>
          </div>
        </Link>

        <Link href="/saved">
          <div className={`flex flex-col items-center py-3 px-4 ${
            location === '/saved' ? 'text-primary' : 'text-zinc-400'
          }`}>
            <Bookmark className="h-5 w-5" />
            <span className="text-xs mt-1 font-light tracking-wide">Saved</span>
          </div>
        </Link>
        
        <Link href="/profile">
          <div className={`flex flex-col items-center py-3 px-4 ${
            location === '/profile' ? 'text-primary' : 'text-zinc-400'
          }`}>
            <User className="h-5 w-5" />
            <span className="text-xs mt-1 font-light tracking-wide">Profile</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
