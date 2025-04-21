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
        <Button variant="outline" className="flex gap-2">
          <MessageSquarePlus className="h-4 w-4" />
          New Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Start a conversation</DialogTitle>
          <DialogDescription>
            Search and select a user to start chatting with.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center border rounded-md px-3 py-2 mt-4">
          <Search className="h-4 w-4 text-muted-foreground mr-2" />
          <Input
            placeholder="Search by name or occupation..."
            className="border-0 p-0 shadow-none focus-visible:ring-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {isLoadingUsers ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            {searchTerm
              ? "No users found matching your search"
              : "No users available to chat with"}
          </div>
        ) : (
          <ScrollArea className="mt-4 max-h-[300px]">
            <div className="space-y-3">
              {filteredUsers.map((nearbyUser) => (
                <div
                  key={nearbyUser.id}
                  className="flex items-center p-3 border rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => startConversation(nearbyUser.id)}
                >
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage
                      src={nearbyUser.profileImage}
                      alt={nearbyUser.name}
                    />
                    <AvatarFallback>
                      {nearbyUser.name?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium">{nearbyUser.name}</h4>
                    <p className="text-sm text-muted-foreground">
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