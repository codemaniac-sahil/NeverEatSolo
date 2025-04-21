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
    <div className="flex flex-col min-h-screen bg-zinc-950">
      <SiteHeader />
      <div className="elegant-container py-8 flex-1">
        <h1 className="text-3xl font-light mb-8 text-zinc-100">
          <span className="text-primary">MESSAGES</span>
          {unreadCount && unreadCount.count > 0 && (
            <span className="bg-primary/20 text-primary text-xs px-2 py-1 ml-2 rounded-sm border border-primary/30">
              {unreadCount.count} new
            </span>
          )}
        </h1>
        
        <div className="flex gap-8 h-[calc(100vh-240px)]">
          <div className="w-1/3 elegant-card overflow-hidden flex flex-col">
            <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-light tracking-wide flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Conversations
              </h2>
              <NewConversationButton onConversationCreated={handleConversationCreated} />
            </div>
            <div className="flex-1 overflow-auto p-4">
              <ConversationsList
                onSelectConversation={handleSelectConversation}
                selectedConversationId={selectedConversation?.conversationId}
              />
            </div>
          </div>
          
          <div className="flex-1 elegant-card overflow-hidden">
            {selectedConversation ? (
              <MessageThread conversation={selectedConversation} />
            ) : (
              <div className="h-full flex items-center justify-center text-center p-6">
                <div>
                  <MessageSquare className="h-16 w-16 mx-auto text-primary/40" />
                  <h2 className="text-2xl font-light mt-6 text-zinc-300">No conversation selected</h2>
                  <p className="text-zinc-400 mt-3 max-w-md">
                    Select a conversation from the list or start a new one to connect with fellow diners.
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