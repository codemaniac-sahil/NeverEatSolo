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
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [compatibilityScore, setCompatibilityScore] = useState<number | null>(null);
  const [step, setStep] = useState<"details" | "message">("details");
  
  // Set default coordinates
  useEffect(() => {
    setCoordinates({ lat: "40.7128", lng: "-74.0060" });
    
    // Calculate compatibility score if user has food preferences
    if (user.foodPreferences?.length) {
      // Mock the current user preferences for demo purposes
      const currentUserPreferences = {
        foodPreferences: ["Italian", "Japanese", "Mexican"],
        dietaryRestrictions: ["Vegetarian"],
        cuisinePreferences: ["Italian", "Mediterranean"],
        diningStyles: ["Casual", "Fine Dining"]
      };
      
      const score = calculateCompatibilityScore(
        currentUserPreferences,
        {
          foodPreferences: user.foodPreferences || [],
          dietaryRestrictions: user.dietaryRestrictions || [],
          cuisinePreferences: user.cuisinePreferences || [],
          diningStyles: user.diningStyles || []
        }
      );
      
      setCompatibilityScore(score);
    }
  }, [user]);

  // Fetch nearby restaurants for the select dropdown
  const { data: restaurants = [] } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants/nearby", coordinates?.lat || "0", coordinates?.lng || "0"],
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
  
  // Watch the restaurant ID field to display selected restaurant details
  const watchedRestaurantId = form.watch("restaurantId");
  
  // Update selected restaurant when restaurant ID changes
  useEffect(() => {
    if (watchedRestaurantId && restaurants.length > 0) {
      const restaurant = restaurants.find(r => r.id.toString() === watchedRestaurantId);
      if (restaurant) {
        setSelectedRestaurant(restaurant);
      }
    } else {
      setSelectedRestaurant(null);
    }
  }, [watchedRestaurantId, restaurants]);

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

  // Function to handle moving to next step
  const handleNextStep = () => {
    const { restaurantId, date, time } = form.getValues();
    if (!restaurantId || !date || !time) {
      form.trigger(["restaurantId", "date", "time"]);
      return;
    }
    setStep("message");
  };

  // Function to go back to previous step
  const handlePrevStep = () => {
    setStep("details");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
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
        
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.profileImage || ""} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{user.name}</h3>
              {compatibilityScore !== null && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        <Heart className={`h-4 w-4 ${compatibilityScore > 75 ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                        <span className="text-sm font-medium">{compatibilityScore}% match</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Based on your food preferences and dining habits</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className="text-sm text-neutral-600">
              {user.age ? `${user.age} years old` : ''} 
              {user.occupation ? ` • ${user.occupation}` : ''}
            </p>
          </div>
        </div>
        
        {/* Food preferences */}
        {user.foodPreferences && user.foodPreferences.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {user.foodPreferences.map((pref, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {pref}
              </Badge>
            ))}
          </div>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {step === "details" ? (
              <>
                <FormField
                  control={form.control}
                  name="restaurantId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <RestaurantIcon className="h-4 w-4" />
                        Select Restaurant
                      </FormLabel>
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
                          {(restaurants as Restaurant[]).map((restaurant) => (
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
                
                {/* Restaurant preview card */}
                {selectedRestaurant && (
                  <Card className="mt-2">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{selectedRestaurant.name}</h4>
                        <div className="flex items-center text-amber-500 text-xs">
                          <Star className="h-3 w-3 fill-current mr-1" />
                          <span>{selectedRestaurant.rating || "4.5"}</span>
                        </div>
                      </div>
                      <div className="text-xs text-neutral-600 flex items-center gap-4">
                        <span className="flex items-center">
                          <Utensils className="h-3 w-3 mr-1" />
                          {selectedRestaurant.cuisine}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {selectedRestaurant.priceRange}
                        </span>
                        {selectedRestaurant.activeUserCount && (
                          <span className="flex items-center text-green-600">
                            <Users className="h-3 w-3 mr-1" />
                            {selectedRestaurant.activeUserCount} dining
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-600 mt-2 flex items-center">
                        <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                        {selectedRestaurant.address || "Address unavailable"}
                      </p>
                    </CardContent>
                  </Card>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Date
                        </FormLabel>
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
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Time
                        </FormLabel>
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
                </div>
                
                <Button 
                  type="button" 
                  className="w-full"
                  onClick={handleNextStep}
                >
                  Next: Add Personal Message
                </Button>
              </>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Personal Message
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Looking forward to trying this place! I've heard great things about their dishes."
                          className="resize-none min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Share why you'd like to dine with {firstName} and what you're looking forward to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-4 pt-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    className="flex-1"
                    onClick={handlePrevStep}
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={createInvitation.isPending}
                  >
                    {createInvitation.isPending ? "Sending..." : "Send Invitation"}
                  </Button>
                </div>
              </>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
