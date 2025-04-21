import React from 'react';
import { useNotifications } from '@/hooks/use-notifications';
import {
  Bell,
  CheckCircle,
  Clock,
  MessageCircle,
  User,
  Calendar,
  MapPin,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Notification } from '@shared/schema';

const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'message':
      return <MessageCircle className="mr-2 h-4 w-4" />;
    case 'friend_request':
      return <User className="mr-2 h-4 w-4" />;
    case 'invitation':
      return <Calendar className="mr-2 h-4 w-4" />;
    case 'availability':
      return <Clock className="mr-2 h-4 w-4" />;
    case 'recommendation':
      return <MapPin className="mr-2 h-4 w-4" />;
    default:
      return <AlertCircle className="mr-2 h-4 w-4" />;
  }
};

const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete
}: {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}) => {
  return (
    <div className={cn(
      "flex items-start p-3 rounded-lg mb-2 relative",
      notification.isRead ? "bg-secondary/30" : "bg-secondary"
    )}>
      <div className="flex-shrink-0">
        <NotificationIcon type={notification.type} />
      </div>
      <div className="ml-2 flex-1">
        <div className="font-semibold">{notification.title}</div>
        <div className="text-sm text-muted-foreground">{notification.content}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {format(new Date(notification.createdAt), 'MMM d, yyyy - h:mm a')}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        {!notification.isRead && (
          <Button variant="ghost" size="icon" onClick={() => onMarkAsRead(notification.id)} className="h-7 w-7">
            <CheckCircle className="h-4 w-4" />
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={() => onDelete(notification.id)} className="h-7 w-7">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export const NotificationList = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isMarkingAsRead,
    isMarkingAllAsRead,
    isDeleting
  } = useNotifications();

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllAsRead();
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 px-2 py-0.5 min-w-5 h-5 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between p-4">
          <h4 className="font-semibold">Notifications</h4>
          <Button
            variant="ghost"
            size="sm"
            disabled={isMarkingAllAsRead || unreadCount === 0}
            onClick={handleMarkAllAsRead}
          >
            {isMarkingAllAsRead ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Mark all as read
          </Button>
        </div>
        <Separator />
        <ScrollArea className="h-[400px] p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="flex justify-center">
                <Bell className="h-8 w-8 mb-2" />
              </div>
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={(id) => markAsRead(id)}
                onDelete={(id) => deleteNotification(id)}
              />
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};