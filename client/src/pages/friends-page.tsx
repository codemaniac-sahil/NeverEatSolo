import SiteHeader from "@/components/layout/site-header";
import MobileNav from "@/components/layout/mobile-nav";
import { Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

type Friend = {
  id: number;
  userId: number;
  friendId: number;
  status: string;
  createdAt: string;
  friend: {
    id: number;
    username: string;
    name: string;
    profilePicture: string | null;
    bio: string | null;
  };
};

type FriendRequest = {
  id: number;
  userId: number;
  friendId: number;
  status: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
    name: string;
    profilePicture: string | null;
    bio: string | null;
  };
};

export default function FriendsPage() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState("friends");
  
  const { data: friends = [], isLoading: friendsLoading } = useQuery<Friend[]>({
    queryKey: ["/api/friends"],
    enabled: !!user
  });
  
  const { data: friendRequests = [], isLoading: requestsLoading } = useQuery<FriendRequest[]>({
    queryKey: ["/api/friend-requests"],
    enabled: !!user
  });
  
  const { toast } = useToast();
  
  async function handleAcceptFriend(id: number) {
    try {
      await apiRequest("PATCH", `/api/friends/${id}`, { status: "accepted" });
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      queryClient.invalidateQueries({ queryKey: ["/api/friend-requests"] });
      toast({
        title: "Friend request accepted",
        description: "You are now connected!",
      });
    } catch (error) {
      console.error("Error accepting friend request", error);
      toast({
        title: "Error",
        description: "Failed to accept friend request",
        variant: "destructive"
      });
    }
  }
  
  async function handleDeclineFriend(id: number) {
    try {
      await apiRequest("PATCH", `/api/friends/${id}`, { status: "declined" });
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      queryClient.invalidateQueries({ queryKey: ["/api/friend-requests"] });
      toast({
        title: "Friend request declined",
      });
    } catch (error) {
      console.error("Error declining friend request", error);
      toast({
        title: "Error",
        description: "Failed to decline friend request",
        variant: "destructive"
      });
    }
  }
  
  async function handleRemoveFriend(id: number) {
    try {
      await apiRequest("DELETE", `/api/friends/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      toast({
        title: "Friend removed",
      });
    } catch (error) {
      console.error("Error removing friend", error);
      toast({
        title: "Error",
        description: "Failed to remove friend",
        variant: "destructive"
      });
    }
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      <SiteHeader />
      
      <div className="pt-20 pb-12 bg-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-b from-black to-transparent"></div>
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
            }}
          ></div>
        </div>
        
        <div className="elegant-container relative z-10">
          <div className="max-w-2xl">
            <h1 className="elegant-heading mb-4 flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <span>Friends</span>
            </h1>
            
            <p className="text-lg md:text-xl font-light text-zinc-400 mb-8 max-w-lg">
              Connect with like-minded diners and expand your social circle
            </p>
          </div>
        </div>
      </div>
      
      <main className="elegant-container py-12">
        <Tabs 
          defaultValue="friends" 
          value={tabValue} 
          onValueChange={setTabValue} 
          className="space-y-6"
        >
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="friends">
              My Friends
              {friends.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {friends.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests">
              Friend Requests
              {friendRequests.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {friendRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="friends" className="space-y-6">
            {friendsLoading ? (
              <div className="flex items-center justify-center p-6">
                <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full"></div>
              </div>
            ) : friends.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-10">
                    <Users className="h-12 w-12 mx-auto mb-5 text-muted-foreground" />
                    <h3 className="mb-2 text-xl font-medium">No friends yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Connect with other diners by sending friend requests
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {friends.map((friend) => (
                  <Card key={friend.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={friend.friend.profilePicture || undefined} alt={friend.friend.name} />
                          <AvatarFallback>{friend.friend.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-xl">{friend.friend.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">@{friend.friend.username}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {friend.friend.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {friend.friend.bio}
                        </p>
                      )}
                      <div className="flex justify-between">
                        <Button variant="outline" size="sm" onClick={() => handleRemoveFriend(friend.id)}>
                          Remove
                        </Button>
                        <Button variant="default" size="sm">
                          Message
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="requests" className="space-y-6">
            {requestsLoading ? (
              <div className="flex items-center justify-center p-6">
                <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full"></div>
              </div>
            ) : friendRequests.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-10">
                    <Users className="h-12 w-12 mx-auto mb-5 text-muted-foreground" />
                    <h3 className="mb-2 text-xl font-medium">No friend requests</h3>
                    <p className="text-muted-foreground">
                      You'll see friend requests from other users here
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {friendRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.user.profilePicture || undefined} alt={request.user.name} />
                          <AvatarFallback>{request.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-xl">{request.user.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">@{request.user.username}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {request.user.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {request.user.bio}
                        </p>
                      )}
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => handleDeclineFriend(request.id)}>
                          Decline
                        </Button>
                        <Button variant="default" size="sm" onClick={() => handleAcceptFriend(request.id)}>
                          Accept
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <MobileNav />
    </div>
  );
}