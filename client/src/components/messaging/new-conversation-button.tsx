import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MessageSquarePlus, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NewConversationButtonProps {
  onConversationCreated: (conversationId: string) => void;
}

export default function NewConversationButton({ onConversationCreated }: NewConversationButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Get nearby users to potentially chat with
  const { data: nearbyUsers = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users/nearby", user?.locationLat, user?.locationLng],
    queryFn: getQueryFn({
      params: {
        lat: user?.locationLat || "",
        lng: user?.locationLng || "",
        radius: "50", // larger radius to include more potential contacts
      },
    }),
    enabled: !!user && !!user.locationLat && !!user.locationLng && isOpen,
  });

  const createConversationMutation = useMutation({
    mutationFn: async (otherUserId: number) => {
      const res = await apiRequest("POST", "/api/conversations", {
        otherUserId,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      onConversationCreated(data.conversationId);
      setIsOpen(false);
      toast({
        title: "Conversation created",
        description: "You can now start messaging!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create conversation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const startConversation = (otherUserId: number) => {
    createConversationMutation.mutate(otherUserId);
  };

  const filteredUsers = nearbyUsers.filter(
    (nearbyUser) =>
      nearbyUser.id !== user?.id &&
      (nearbyUser.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nearbyUser.occupation?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="elegant-button text-xs flex gap-2 py-1 px-3 uppercase tracking-wider font-light"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900 border border-zinc-800 p-5 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light tracking-wide text-zinc-100">Start a conversation</DialogTitle>
          <DialogDescription className="text-zinc-400 font-light mt-2">
            Find and connect with compatible dining companions
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center bg-zinc-800/50 border border-zinc-700 px-3 py-2 mt-6">
          <Search className="h-4 w-4 text-zinc-500 mr-2" />
          <Input
            placeholder="Search by name or occupation..."
            className="border-0 p-0 shadow-none focus-visible:ring-0 bg-transparent placeholder:text-zinc-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {isLoadingUsers ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-zinc-400 font-light">
              {searchTerm
                ? "No users found matching your search"
                : "No users available to chat with"}
            </p>
          </div>
        ) : (
          <ScrollArea className="mt-6 max-h-[300px] pr-4">
            <div className="space-y-3">
              {filteredUsers.map((nearbyUser) => (
                <div
                  key={nearbyUser.id}
                  className="flex items-center p-4 border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/50 cursor-pointer transition-all duration-200"
                  onClick={() => startConversation(nearbyUser.id)}
                >
                  <Avatar className="h-10 w-10 mr-3 ring-1 ring-zinc-700">
                    <AvatarImage
                      src={nearbyUser.profileImage || undefined}
                      alt={nearbyUser.name || "User"}
                    />
                    <AvatarFallback className="bg-zinc-800 text-primary">
                      {nearbyUser.name?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-light tracking-wide text-zinc-200">{nearbyUser.name}</h4>
                    <p className="text-sm text-zinc-500 font-light">
                      {nearbyUser.occupation || "No occupation"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}