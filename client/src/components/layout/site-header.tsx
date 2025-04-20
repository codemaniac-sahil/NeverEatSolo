import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Bell, 
  ChevronDown, 
  Utensils, 
  User,
  LogOut,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

  return (
    <header className="bg-white shadow-sm hidden md:block">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center">
              <Utensils className="text-primary h-6 w-6 mr-2" />
              <span className="font-bold text-xl">Never Dine Alone</span>
            </Link>
            
            <nav className="flex space-x-4">
              <Link href="/">
                <Button
                  variant={location === "/" ? "default" : "ghost"}
                  className={location === "/" ? "bg-primary text-white" : "text-neutral-700 hover:text-primary"}
                >
                  Home
                </Button>
              </Link>
              
              <Link href="/matches">
                <Button
                  variant={location === "/matches" ? "default" : "ghost"}
                  className={location === "/matches" ? "bg-primary text-white" : "text-neutral-700 hover:text-primary"}
                >
                  Matches
                </Button>
              </Link>
              
              <Link href="/messages">
                <Button
                  variant={location === "/messages" ? "default" : "ghost"}
                  className={location === "/messages" ? "bg-primary text-white" : "text-neutral-700 hover:text-primary"}
                >
                  Messages
                </Button>
              </Link>
              
              <Link href="/restaurants">
                <Button
                  variant={location === "/restaurants" ? "default" : "ghost"}
                  className={location === "/restaurants" ? "bg-primary text-white" : "text-neutral-700 hover:text-primary"}
                >
                  Restaurants
                </Button>
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="text-neutral-700 h-5 w-5" />
            </Button>
            
            <DropdownMenu open={open} onOpenChange={setOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImage} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{user.name}</span>
                  <ChevronDown className="h-4 w-4 text-neutral-500" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-48">
                <Link href="/profile">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Your Profile</span>
                  </DropdownMenuItem>
                </Link>
                
                <Link href="/settings">
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </Link>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
