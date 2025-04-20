import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertInvitationSchema } from "@shared/schema";
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  MessageCircle, 
  Store as RestaurantIcon, 
  Utensils, 
  Star, 
  DollarSign,
  Users,
  Info,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { User, Restaurant } from "@shared/schema";
import { calculateCompatibilityScore } from "@shared/constants";

// Create a form schema based on the invitation schema
const inviteFormSchema = z.object({
  restaurantId: z.string().min(1, "Please select a restaurant"),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  message: z.string().optional(),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

interface InviteModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteModal({ user, isOpen, onClose }: InviteModalProps) {
  const { toast } = useToast();
  const [coordinates, setCoordinates] = useState<{ lat: string, lng: string } | null>(null);
  
  // Set default coordinates
  useState(() => {
    setCoordinates({ lat: "40.7128", lng: "-74.0060" });
  });

  // Fetch nearby restaurants for the select dropdown
  const { data: restaurants = [] } = useQuery({
    queryKey: ["/api/restaurants/nearby", coordinates?.lat, coordinates?.lng],
    enabled: !!coordinates && isOpen,
  });
  
  // Form setup
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      restaurantId: "",
      date: "",
      time: "",
      message: "",
    },
  });

  // Get user's first name for display
  const firstName = user.name.split(' ')[0];
  
  // Initialize avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  // Handle invitation creation
  const createInvitation = useMutation({
    mutationFn: async (data: InviteFormValues) => {
      // Convert form data to match the API schema
      const invitationData = {
        receiverId: user.id,
        restaurantId: parseInt(data.restaurantId),
        date: new Date(data.date).toISOString(),
        time: data.time,
        message: data.message || undefined,
      };
      
      const res = await apiRequest("POST", "/api/invitations", invitationData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Invitation sent!",
        description: `Your invitation has been sent to ${firstName}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/invitations"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send invitation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: InviteFormValues) {
    createInvitation.mutate(data);
  }

  // Disable past dates in the date picker
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Invite to Dine</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="flex items-center space-x-3 mb-6">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.profileImage} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{user.name}</h3>
            <p className="text-sm text-neutral-600">
              {user.age ? `${user.age} years old` : ''} 
              {user.occupation ? ` • ${user.occupation}` : ''}
            </p>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="restaurantId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Restaurant</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a restaurant" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {restaurants.map((restaurant: any) => (
                        <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                          {restaurant.name} ({restaurant.cuisine})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      min={today}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Looking forward to trying this place! I've heard great things about their dishes."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={createInvitation.isPending}
            >
              {createInvitation.isPending ? "Sending..." : "Send Invitation"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
