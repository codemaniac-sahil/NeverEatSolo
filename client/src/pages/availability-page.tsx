import SiteHeader from "@/components/layout/site-header";
import MobileNav from "@/components/layout/mobile-nav";
import { Clock, Users, MapPin, CalendarClock, PlusCircle, History } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

type UserAvailability = {
  id: number;
  userId: number;
  status: string;
  notes: string | null;
  locationLat: string | null;
  locationLng: string | null;
  locationName: string | null;
  startTime: string;
  endTime: string;
  createdAt: string;
};

type NearbyAvailableUser = {
  id: number;
  userId: number;
  status: string;
  notes: string | null;
  locationLat: string | null;
  locationLng: string | null;
  locationName: string | null;
  startTime: string;
  endTime: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
    name: string;
    profilePicture: string | null;
    bio: string | null;
  };
};

const createAvailabilitySchema = z.object({
  status: z.string().min(1, "Status is required"),
  notes: z.string().optional(),
  locationName: z.string().optional(),
  locationLat: z.string().optional(),
  locationLng: z.string().optional(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
});

type CreateAvailabilityFormValues = z.infer<typeof createAvailabilitySchema>;

export default function AvailabilityPage() {
  const { user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState("current");
  
  const { data: currentAvailability } = useQuery<UserAvailability | null>({
    queryKey: ["/api/availability/current"],
    enabled: !!user
  });
  
  const { data: availabilityHistory = [], isLoading: historyLoading } = useQuery<UserAvailability[]>({
    queryKey: ["/api/availability/history"],
    enabled: !!user && tabValue === "history"
  });
  
  const { data: nearbyUsers = [], isLoading: nearbyLoading } = useQuery<NearbyAvailableUser[]>({
    queryKey: ["/api/availability/nearby", { lat: "40.7128", lng: "-74.0060", radius: 10 }],
    enabled: !!user && tabValue === "nearby"
  });
  
  const form = useForm<CreateAvailabilityFormValues>({
    resolver: zodResolver(createAvailabilitySchema),
    defaultValues: {
      status: "Looking for lunch companion",
      notes: "",
      locationName: "",
      locationLat: "40.7128", // Default to NYC coordinates
      locationLng: "-74.0060",
      startTime: new Date().toISOString().substring(0, 16), // Current time
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().substring(0, 16), // 2 hours from now
    }
  });
  
  const { toast } = useToast();
  
  const createMutation = useMutation({
    mutationFn: async (values: CreateAvailabilityFormValues) => {
      const response = await apiRequest("POST", "/api/availability", values);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability/current"] });
      setIsCreateDialogOpen(false);
      form.reset({
        status: "Looking for lunch companion",
        notes: "",
        locationName: "",
        locationLat: "40.7128",
        locationLng: "-74.0060",
        startTime: new Date().toISOString().substring(0, 16),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().substring(0, 16),
      });
      toast({
        title: "Availability Created",
        description: "Your availability has been posted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create availability",
        variant: "destructive"
      });
    }
  });
  
  function formatDate(dateString: string) {
    return format(new Date(dateString), "MMM d, h:mm a");
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      <SiteHeader />
      
      <div className="pt-20 pb-12 bg-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-b from-black to-transparent"></div>
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1560421683-6856ea585c78?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80')`
            }}
          ></div>
        </div>
        
        <div className="elegant-container relative z-10">
          <div className="max-w-2xl">
            <h1 className="elegant-heading mb-4 flex items-center gap-3">
              <Clock className="h-8 w-8 text-primary" />
              <span>Availability</span>
            </h1>
            
            <p className="text-lg md:text-xl font-light text-zinc-400 mb-8 max-w-lg">
              Set your dining availability and discover others ready to meet
            </p>
          </div>
        </div>
      </div>
      
      <main className="elegant-container py-12">
        <Tabs 
          defaultValue="current" 
          value={tabValue} 
          onValueChange={setTabValue} 
          className="space-y-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <TabsList className="grid w-full md:w-[400px] grid-cols-3">
              <TabsTrigger value="current">Current</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="nearby">Nearby</TabsTrigger>
            </TabsList>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Set Availability
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}>
                  <DialogHeader>
                    <DialogTitle>Set Your Availability</DialogTitle>
                    <DialogDescription>
                      Let others know when you're available for a meal
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Input 
                        id="status" 
                        placeholder="e.g., Looking for lunch companion" 
                        {...form.register("status")} 
                      />
                      {form.formState.errors.status && (
                        <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea 
                        id="notes" 
                        placeholder="Any preferences or additional details" 
                        {...form.register("notes")} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="locationName">Location Name (Optional)</Label>
                      <Input 
                        id="locationName" 
                        placeholder="e.g., Downtown or Near Central Park" 
                        {...form.register("locationName")} 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input 
                          id="startTime" 
                          type="datetime-local" 
                          {...form.register("startTime")} 
                        />
                        {form.formState.errors.startTime && (
                          <p className="text-sm text-red-500">{form.formState.errors.startTime.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endTime">End Time</Label>
                        <Input 
                          id="endTime" 
                          type="datetime-local" 
                          {...form.register("endTime")} 
                        />
                        {form.formState.errors.endTime && (
                          <p className="text-sm text-red-500">{form.formState.errors.endTime.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Setting..." : "Set Availability"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <TabsContent value="current" className="space-y-6">
            {currentAvailability ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Your Current Availability</CardTitle>
                  <CardDescription>You are currently available for dining</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {formatDate(currentAvailability.startTime)} - {formatDate(currentAvailability.endTime)}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/10 p-2 mt-1">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{currentAvailability.status}</h3>
                      {currentAvailability.notes && (
                        <p className="text-muted-foreground">{currentAvailability.notes}</p>
                      )}
                    </div>
                  </div>
                  {currentAvailability.locationName && (
                    <div className="flex items-start gap-2">
                      <div className="rounded-full bg-primary/10 p-2 mt-1">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Location</h3>
                        <p className="text-muted-foreground">{currentAvailability.locationName}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-muted/50">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)}>
                    Update Availability
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-10">
                    <Clock className="h-12 w-12 mx-auto mb-5 text-muted-foreground" />
                    <h3 className="mb-2 text-xl font-medium">No Active Availability</h3>
                    <p className="text-muted-foreground mb-6">
                      Set your availability to let others know when you're free for a meal
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Set Availability
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6">
            {historyLoading ? (
              <div className="flex items-center justify-center p-6">
                <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full"></div>
              </div>
            ) : availabilityHistory.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-10">
                    <History className="h-12 w-12 mx-auto mb-5 text-muted-foreground" />
                    <h3 className="mb-2 text-xl font-medium">No History Found</h3>
                    <p className="text-muted-foreground mb-6">
                      Your previous availability settings will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {availabilityHistory.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{item.status}</CardTitle>
                      <CardDescription>
                        {formatDate(item.startTime)} - {formatDate(item.endTime)}
                      </CardDescription>
                    </CardHeader>
                    {(item.notes || item.locationName) && (
                      <CardContent className="space-y-2">
                        {item.notes && <p className="text-sm">{item.notes}</p>}
                        {item.locationName && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{item.locationName}</span>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="nearby" className="space-y-6">
            {nearbyLoading ? (
              <div className="flex items-center justify-center p-6">
                <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full"></div>
              </div>
            ) : nearbyUsers.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-10">
                    <Users className="h-12 w-12 mx-auto mb-5 text-muted-foreground" />
                    <h3 className="mb-2 text-xl font-medium">No One Nearby</h3>
                    <p className="text-muted-foreground mb-6">
                      There are no users currently available near you
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {nearbyUsers.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={item.user.profilePicture || undefined} alt={item.user.name} />
                          <AvatarFallback>{item.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-xl">{item.user.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">@{item.user.username}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarClock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {formatDate(item.startTime)} - {formatDate(item.endTime)}
                        </span>
                      </div>
                      
                      <div className="bg-primary/10 rounded-lg p-3">
                        <p className="font-medium">{item.status}</p>
                        {item.notes && <p className="text-sm mt-1">{item.notes}</p>}
                      </div>
                      
                      {item.locationName && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{item.locationName}</span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="bg-muted/50 flex justify-between">
                      <Button variant="outline" asChild>
                        <a href={`/profile/${item.user.id}`}>View Profile</a>
                      </Button>
                      <Button asChild>
                        <a href={`/messages?userId=${item.user.id}`}>Message</a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <MobileNav />
    </div>
  );
}