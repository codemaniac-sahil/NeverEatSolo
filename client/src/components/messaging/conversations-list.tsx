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
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-zinc-800 bg-zinc-900/80 rounded-sm backdrop-blur-sm">
            <div className="p-4 flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full bg-zinc-800" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-2 bg-zinc-800" />
                <Skeleton className="h-3 w-36 bg-zinc-800" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-amber-500 mb-3">Error loading conversations</p>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/conversations"] })}
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-1 px-4 text-sm font-light border border-zinc-700"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="h-12 w-12 mx-auto text-primary/30" />
        <h3 className="mt-4 text-lg font-light text-zinc-300">No conversations yet</h3>
        <p className="text-zinc-500 mt-2 text-sm">
          Use the "New Chat" button to start a conversation
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {conversations.map((conversation) => {
        const { otherUser, lastMessage } = conversation;
        const isSelected = selectedConversationId === conversation.conversationId;
        const isUnread = !lastMessage?.isRead && lastMessage?.receiverId === user?.id;
        
        return (
          <div 
            key={conversation.id}
            className={`border rounded-sm backdrop-blur-sm cursor-pointer transition-all duration-200 ${
              isSelected 
                ? "border-primary/50 bg-zinc-800/60" 
                : "border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/30"
            }`}
            onClick={() => onSelectConversation(conversation)}
          >
            <div className="p-4 flex items-center">
              <Avatar className={`h-10 w-10 mr-3 ${isSelected ? 'ring-1 ring-primary/50' : ''}`}>
                <AvatarImage src={otherUser.profileImage || undefined} alt={otherUser.name || "User"} />
                <AvatarFallback className="bg-zinc-800 text-primary">
                  {otherUser.name?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className={`text-sm font-light tracking-wide truncate ${isSelected ? 'text-primary' : 'text-zinc-200'}`}>
                    {otherUser.name}
                  </h3>
                  {lastMessage && (
                    <span className="text-xs text-zinc-500">
                      {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                    </span>
                  )}
                </div>
                <p className={`text-xs truncate mt-1 ${
                  isUnread 
                    ? "text-zinc-200 font-normal" 
                    : "text-zinc-500 font-light"
                }`}>
                  {lastMessage
                    ? lastMessage.senderId === user?.id
                      ? `You: ${lastMessage.content}`
                      : lastMessage.content
                    : "No messages yet"}
                </p>
              </div>
              {isUnread && (
                <div className="ml-2 h-2 w-2 rounded-full bg-primary"></div>
              )}
              <ChevronRight className={`h-4 w-4 ml-2 ${
                isSelected ? "text-primary" : "text-zinc-600"
              }`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}