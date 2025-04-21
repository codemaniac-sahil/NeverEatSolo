import ConversationsList from "@/components/messaging/conversations-list";
import MessageThread from "@/components/messaging/message-thread";
import NewConversationButton from "@/components/messaging/new-conversation-button";
import SiteHeader from "@/components/layout/site-header";
import { useAuth } from "@/hooks/use-auth";
import { getQueryFn } from "@/lib/queryClient";
import { Conversation, Message, User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";

type ConversationWithDetails = Conversation & {
  otherUser: User;
  lastMessage: Message | null;
};

export default function MessagingPage() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);

  const {
    data: conversations = [],
    isLoading,
    error,
  } = useQuery<ConversationWithDetails[]>({
    queryKey: ["/api/conversations"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  // Get unread message count for notification purposes
  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ["/api/messages/unread-count"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  // Select the first conversation by default if none is selected
  useEffect(() => {
    if (!selectedConversation && conversations.length > 0) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  const handleSelectConversation = (conversation: ConversationWithDetails) => {
    setSelectedConversation(conversation);
  };

  const handleConversationCreated = (conversationId: string) => {
    const newConversation = conversations.find(
      (c) => c.conversationId === conversationId
    );
    if (newConversation) {
      setSelectedConversation(newConversation);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <div className="flex-1 container py-6">
        <div className="flex gap-8 h-[calc(100vh-200px)]">
          <div className="w-1/3 border rounded-lg overflow-hidden flex flex-col">
            <div className="p-4 bg-muted/40 border-b flex justify-between items-center">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                Messages
                {unreadCount && unreadCount.count > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    {unreadCount.count}
                  </span>
                )}
              </h1>
              <NewConversationButton onConversationCreated={handleConversationCreated} />
            </div>
            <div className="flex-1 overflow-auto p-4">
              <ConversationsList
                onSelectConversation={handleSelectConversation}
                selectedConversationId={selectedConversation?.conversationId}
              />
            </div>
          </div>
          <div className="flex-1 border rounded-lg overflow-hidden">
            {selectedConversation ? (
              <MessageThread conversation={selectedConversation} />
            ) : (
              <div className="h-full flex items-center justify-center text-center p-6">
                <div>
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h2 className="text-xl font-medium mt-4">No conversation selected</h2>
                  <p className="text-muted-foreground mt-2">
                    Select a conversation from the list or start a new one.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}