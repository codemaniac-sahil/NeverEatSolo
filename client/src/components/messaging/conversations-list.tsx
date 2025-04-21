import { useAuth } from "@/hooks/use-auth";
import { getQueryFn, queryClient } from "@/lib/queryClient";
import { Conversation, Message, User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type ConversationWithDetails = Conversation & {
  otherUser: User;
  lastMessage: Message | null;
};

interface ConversationsListProps {
  onSelectConversation: (conversation: ConversationWithDetails) => void;
  selectedConversationId?: string;
}

export default function ConversationsList({
  onSelectConversation,
  selectedConversationId,
}: ConversationsListProps) {
  const { user } = useAuth();

  const {
    data: conversations = [],
    isLoading,
    error,
  } = useQuery<ConversationWithDetails[]>({
    queryKey: ["/api/conversations"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-bold mb-4">Conversations</h2>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="w-full">
            <CardContent className="p-4 flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-36" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading conversations</p>
        <Button
          variant="outline"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/conversations"] })}
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No conversations yet</h3>
        <p className="text-muted-foreground mt-1">
          Start a conversation with someone to chat
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Conversations</h2>
      <div className="space-y-3">
        {conversations.map((conversation) => {
          const { otherUser, lastMessage } = conversation;
          const isSelected = selectedConversationId === conversation.conversationId;
          
          return (
            <Card 
              key={conversation.id}
              className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                isSelected ? "bg-muted" : ""
              }`}
              onClick={() => onSelectConversation(conversation)}
            >
              <CardContent className="p-4 flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={otherUser.profileImage || undefined} alt={otherUser.name || "User"} />
                  <AvatarFallback>
                    {otherUser.name?.substring(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium truncate">{otherUser.name}</h3>
                    {lastMessage && (
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {lastMessage
                      ? lastMessage.senderId === user?.id
                        ? `You: ${lastMessage.content}`
                        : lastMessage.content
                      : "No messages yet"}
                  </p>
                </div>
                {!lastMessage?.isRead && lastMessage?.receiverId === user?.id && (
                  <Badge className="ml-2 bg-primary">New</Badge>
                )}
                <ChevronRight className="h-5 w-5 ml-2 text-muted-foreground" />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}