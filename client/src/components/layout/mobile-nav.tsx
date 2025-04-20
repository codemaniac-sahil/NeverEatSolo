import { useLocation, Link } from "wouter";
import { Home, Users, MessageSquare, Utensils, User } from "lucide-react";

export default function MobileNav() {
  const [location] = useLocation();
  
  return (
    <div className="md:hidden bg-white shadow-t-sm border-t border-neutral-200 fixed bottom-0 left-0 right-0 z-10">
      <div className="flex justify-around">
        <Link href="/">
          <a className={`flex flex-col items-center py-3 px-4 ${location === '/' ? 'text-primary' : 'text-neutral-600'}`}>
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </a>
        </Link>
        
        <Link href="/matches">
          <a className={`flex flex-col items-center py-3 px-4 ${location === '/matches' ? 'text-primary' : 'text-neutral-600'}`}>
            <Users className="h-5 w-5" />
            <span className="text-xs mt-1">Matches</span>
          </a>
        </Link>
        
        <Link href="/messages">
          <a className={`flex flex-col items-center py-3 px-4 ${location === '/messages' ? 'text-primary' : 'text-neutral-600'}`}>
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs mt-1">Messages</span>
          </a>
        </Link>
        
        <Link href="/restaurants">
          <a className={`flex flex-col items-center py-3 px-4 ${location === '/restaurants' ? 'text-primary' : 'text-neutral-600'}`}>
            <Utensils className="h-5 w-5" />
            <span className="text-xs mt-1">Restaurants</span>
          </a>
        </Link>
        
        <Link href="/profile">
          <a className={`flex flex-col items-center py-3 px-4 ${location === '/profile' ? 'text-primary' : 'text-neutral-600'}`}>
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Profile</span>
          </a>
        </Link>
      </div>
    </div>
  );
}
