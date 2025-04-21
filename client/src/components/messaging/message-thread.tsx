import { useAuth } from "@/hooks/use-auth";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";
import { Conversation, Message, User } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

type MessageWithUser = Message & {
  sender: User;
};

interface MessageThreadProps {
  conversation: Conversation & { otherUser: User };
}

export default function MessageThread({ conversation }: MessageThreadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    data: messages = [],
    isLoading,
    error,
    refetch,
  } = useQuery<MessageWithUser[]>({
    queryKey: ["/api/conversations", conversation.conversationId, "messages"],
    queryFn: getQueryFn({
      params: { otherUserId: conversation.otherUser.id.toString() },
    }),
    enabled: !!user && !!conversation.conversationId,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest(
        "POST",
        `/api/conversations/${conversation.conversationId}/messages`,
        {
          content,
          receiverId: conversation.otherUser.id,
        }
      );
      return await res.json();
    },
    onSuccess: () => {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      queryClient.invalidateQueries({
        queryKey: ["/api/conversations", conversation.conversationId, "messages"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/unread-count"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const content = inputRef.current?.value.trim();
    if (!content) return;
    
    sendMessageMutation.mutate(content);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b bg-muted/40">
          <div className="flex items-center">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="ml-3">
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : ""}`}>
              <div className="flex max-w-[70%]">
                {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full mr-2" />}
                <Skeleton className={`h-16 ${i % 2 === 0 ? "w-40" : "w-60"}`} />
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b bg-muted/40">
          <div className="flex items-center">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={conversation.otherUser.profileImage || undefined}
                alt={conversation.otherUser.name || "User"}
              />
              <AvatarFallback>
                {conversation.otherUser.name?.substring(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <h3 className="font-medium">{conversation.otherUser.name}</h3>
              <p className="text-sm text-muted-foreground">
                {conversation.otherUser.occupation || "No occupation"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-2">Failed to load messages</p>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-muted/40 flex items-center">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={conversation.otherUser.profileImage || undefined}
            alt={conversation.otherUser.name || "User"}
          />
          <AvatarFallback>
            {conversation.otherUser.name?.substring(0, 2).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <h3 className="font-medium">{conversation.otherUser.name}</h3>
          <p className="text-sm text-muted-foreground">
            {conversation.otherUser.occupation || "No occupation"}
          </p>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation by sending a message</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.sender.id === user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? "justify-end" : ""}`}
              >
                <div className="flex max-w-[70%]">
                  {!isCurrentUser && (
                    <Avatar className="h-8 w-8 mr-2 mt-1">
                      <AvatarImage
                        src={message.sender.profileImage || undefined}
                        alt={message.sender.name || "User"}
                      />
                      <AvatarFallback>
                        {message.sender.name?.substring(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <div
                      className={`px-4 py-2 rounded-xl ${
                        isCurrentUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.content}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground text-right">
                      {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
        <Input
          ref={inputRef}
          placeholder="Type a message..."
          disabled={sendMessageMutation.isPending}
          className="flex-1"
        />
        <Button
          type="submit"
          size="icon"
          disabled={sendMessageMutation.isPending}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}