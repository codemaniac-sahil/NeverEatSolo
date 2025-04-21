import { useLocation, Link } from "wouter";
import {
  Home,
  Users,
  MessageSquare,
  Utensils,
  User,
  Bookmark,
  Clock,
  Menu,
  Sparkles
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function MobileNav() {
  const [location] = useLocation();
  
  const isActive = (path: string) => {
    return location === path ? 'text-primary' : 'text-zinc-400';
  };
  
  return (
    <div className="md:hidden bg-zinc-900/95 backdrop-blur-md shadow-xl border-t border-zinc-800 fixed bottom-0 left-0 right-0 z-40">
      <div className="flex justify-around">
        <Link href="/">
          <div className={`flex flex-col items-center py-3 px-2 ${isActive('/')}`}>
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1 font-light tracking-wide">Home</span>
          </div>
        </Link>
        
        <Link href="/friends">
          <div className={`flex flex-col items-center py-3 px-2 ${isActive('/friends')}`}>
            <Users className="h-5 w-5" />
            <span className="text-xs mt-1 font-light tracking-wide">Friends</span>
          </div>
        </Link>
        
        <Link href="/messages">
          <div className={`flex flex-col items-center py-3 px-2 ${isActive('/messages')}`}>
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs mt-1 font-light tracking-wide">Messages</span>
          </div>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="link" className={`flex h-auto flex-col items-center py-3 px-2 ${isActive('/restaurants') || isActive('/saved') || isActive('/recommendations') ? 'text-primary' : 'text-zinc-400'}`}>
              <Utensils className="h-5 w-5" />
              <span className="text-xs mt-1 font-light tracking-wide">Dining</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="bg-zinc-900 border-zinc-800">
            <DropdownMenuItem asChild>
              <Link href="/restaurants">
                <div className="flex items-center">
                  <Utensils className="h-4 w-4 mr-2" />
                  <span>Restaurants</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/saved">
                <div className="flex items-center">
                  <Bookmark className="h-4 w-4 mr-2" />
                  <span>Saved</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/recommendations">
                <div className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span>Recommendations</span>
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Link href="/availability">
          <div className={`flex flex-col items-center py-3 px-2 ${isActive('/availability')}`}>
            <Clock className="h-5 w-5" />
            <span className="text-xs mt-1 font-light tracking-wide">Available</span>
          </div>
        </Link>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="link" className={`flex h-auto flex-col items-center py-3 px-2 ${isActive('/profile') || isActive('/dining-circles') ? 'text-primary' : 'text-zinc-400'}`}>
              <Menu className="h-5 w-5" />
              <span className="text-xs mt-1 font-light tracking-wide">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <span>Profile</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dining-circles">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Dining Circles</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/matches">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Matches</span>
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
