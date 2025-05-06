import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  ChevronDown, 
  Utensils, 
  User as UserIcon,
  LogOut,
  Settings,
  Menu,
  Bell,
  Receipt
} from "lucide-react";
import { NotificationList } from "@/components/notifications/notification-list";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function SiteHeader() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const NavLinks = () => (
    <>
      <Link href="/">
        <div className={`text-sm uppercase tracking-wider font-light hover:text-primary transition-colors px-4 py-2 border-b-2 ${
          location === "/" ? "border-primary text-primary" : "border-transparent text-zinc-400"
        }`}>
          Home
        </div>
      </Link>
      
      <Link href="/friends">
        <div className={`text-sm uppercase tracking-wider font-light hover:text-primary transition-colors px-4 py-2 border-b-2 ${
          location === "/friends" ? "border-primary text-primary" : "border-transparent text-zinc-400"
        }`}>
          Friends
        </div>
      </Link>
      
      <Link href="/messages">
        <div className={`text-sm uppercase tracking-wider font-light hover:text-primary transition-colors px-4 py-2 border-b-2 ${
          location === "/messages" ? "border-primary text-primary" : "border-transparent text-zinc-400"
        }`}>
          Messages
        </div>
      </Link>
      
      <Link href="/restaurants">
        <div className={`text-sm uppercase tracking-wider font-light hover:text-primary transition-colors px-4 py-2 border-b-2 ${
          location === "/restaurants" ? "border-primary text-primary" : "border-transparent text-zinc-400"
        }`}>
          Restaurants
        </div>
      </Link>
      
      <Link href="/recommendations">
        <div className={`text-sm uppercase tracking-wider font-light hover:text-primary transition-colors px-4 py-2 border-b-2 ${
          location === "/recommendations" ? "border-primary text-primary" : "border-transparent text-zinc-400"
        }`}>
          Recommendations
        </div>
      </Link>
      
      <Link href="/dining-circles">
        <div className={`text-sm uppercase tracking-wider font-light hover:text-primary transition-colors px-4 py-2 border-b-2 ${
          location === "/dining-circles" ? "border-primary text-primary" : "border-transparent text-zinc-400"
        }`}>
          Circles
        </div>
      </Link>
      
      <Link href="/availability">
        <div className={`text-sm uppercase tracking-wider font-light hover:text-primary transition-colors px-4 py-2 border-b-2 ${
          location === "/availability" ? "border-primary text-primary" : "border-transparent text-zinc-400"
        }`}>
          Availability
        </div>
      </Link>
    </>
  );

  return (
    <header className="bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Utensils className="text-primary h-5 w-5 mr-2" />
              <span className="font-medium text-xl tracking-wider text-zinc-100">
                NEVER EAT <span className="text-primary">SOLO</span>
              </span>
            </Link>
            
            <nav className="hidden md:flex ml-10 space-x-2">
              <NavLinks />
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationList />
            
            <DropdownMenu open={open} onOpenChange={setOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 relative group hover:bg-zinc-800/50">
                  <Avatar className="h-8 w-8 ring-1 ring-zinc-700 group-hover:ring-primary transition-all">
                    <AvatarImage src={user.profileImage || undefined} alt={user.name || "User"} />
                    <AvatarFallback className="bg-zinc-800 text-primary">
                      {getInitials(user.name || "User")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-light text-zinc-300 hidden md:inline">{user.name}</span>
                  <ChevronDown className="h-4 w-4 text-zinc-500" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border border-zinc-800">
                <Link href="/profile">
                  <div className="w-full">
                    <DropdownMenuItem className="hover:bg-zinc-800 cursor-pointer">
                      <UserIcon className="mr-2 h-4 w-4 text-zinc-400" />
                      <span>Your Profile</span>
                    </DropdownMenuItem>
                  </div>
                </Link>
                
                <Link href="/settings">
                  <div className="w-full">
                    <DropdownMenuItem className="hover:bg-zinc-800 cursor-pointer">
                      <Settings className="mr-2 h-4 w-4 text-zinc-400" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </div>
                </Link>
                
                <Link href="/receipts">
                  <div className="w-full">
                    <DropdownMenuItem className="hover:bg-zinc-800 cursor-pointer">
                      <Receipt className="mr-2 h-4 w-4 text-zinc-400" />
                      <span>Receipts</span>
                    </DropdownMenuItem>
                  </div>
                </Link>
                
                <DropdownMenuSeparator className="bg-zinc-800" />
                
                <DropdownMenuItem 
                  className="hover:bg-zinc-800 cursor-pointer hover:text-red-400"
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-primary hover:bg-zinc-800/50">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-zinc-900 border-l border-zinc-800">
                  <div className="flex flex-col gap-6 mt-8">
                    <div className="flex flex-col gap-2">
                      <NavLinks />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
