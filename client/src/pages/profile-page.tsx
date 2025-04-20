import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SiteHeader from "@/components/layout/site-header";
import MobileNav from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  User,
  MapPin,
  ShoppingBag,
  Phone,
  Mail,
  FileEdit,
  Save,
} from "lucide-react";

// Profile update schema
const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  bio: z.string().optional(),
  occupation: z.string().optional(),
  age: z.coerce.number().min(18, "You must be at least 18 years old.").optional(),
  phone: z.string().optional(),
  profileImage: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  
  // Form setup
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      bio: user?.bio || "",
      occupation: user?.occupation || "",
      age: user?.age || undefined,
      phone: user?.phone || "",
      profileImage: user?.profileImage || "",
    },
  });
  
  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      if (!user) throw new Error("Not authenticated");
      const res = await apiRequest("PATCH", `/api/users/${user.id}`, data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], data);
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  function onSubmit(data: ProfileFormValues) {
    updateProfile.mutate(data);
  }
  
  if (!user) return null;
  
  // Set up avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100">
      <SiteHeader />
      
      <main className="flex-grow container mx-auto px-4 py-4 md:py-8 pb-20 md:pb-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left sidebar */}
          <div className="md:w-1/4">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="w-24 h-24 border-4 border-white shadow">
                    <AvatarImage src={user.profileImage} alt={user.name} />
                    <AvatarFallback className="text-2xl">{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle>{user.name}</CardTitle>
                <CardDescription>{user.occupation || "Add your occupation"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-neutral-500" />
                    <span className="text-sm text-neutral-700">
                      {user.locationLat && user.locationLng ? "Location set" : "Add your location"}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <ShoppingBag className="h-4 w-4 mr-2 text-neutral-500" />
                    <span className="text-sm text-neutral-700">
                      {user.foodPreferences && user.foodPreferences.length > 0 
                        ? `${user.foodPreferences.length} food preferences`
                        : "Add food preferences"}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-neutral-500" />
                    <span className="text-sm text-neutral-700">
                      {user.phone || "Add phone number"}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-neutral-500" />
                    <span className="text-sm text-neutral-700">{user.email}</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90" 
                    onClick={() => setActiveTab("general")}
                  >
                    <FileEdit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right content */}
          <div className="md:w-3/4">
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>
                  Update your profile information to make it easier for others to get to know you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="preferences">Food Preferences</TabsTrigger>
                    <TabsTrigger value="verification">Verification</TabsTrigger>
                    <TabsTrigger value="integrations">Integrations</TabsTrigger>
                  </TabsList>
                  
                  {/* General Information Tab */}
                  <TabsContent value="general">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex justify-center my-4">
                            <div className="relative">
                              <Avatar className="w-20 h-20">
                                <AvatarImage 
                                  src={form.watch("profileImage")} 
                                  alt={user.name} 
                                />
                                <AvatarFallback className="text-xl">{getInitials(user.name)}</AvatarFallback>
                              </Avatar>
                              <Button
                                type="button"
                                size="icon"
                                variant="secondary"
                                className="absolute -bottom-2 -right-2 rounded-full h-8 w-8"
                              >
                                <Upload className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Full Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input placeholder="your@email.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone</FormLabel>
                                  <FormControl>
                                    <Input placeholder="+1 (555) 123-4567" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    Used for account verification.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="age"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Age</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={18}
                                      placeholder="30"
                                      {...field}
                                      onChange={(e) => {
                                        const value = e.target.value === "" ? undefined : parseInt(e.target.value);
                                        field.onChange(value);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="occupation"
                              render={({ field }) => (
                                <FormItem className="col-span-2">
                                  <FormLabel>Occupation</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Food Enthusiast" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="bio"
                              render={({ field }) => (
                                <FormItem className="col-span-2">
                                  <FormLabel>Bio</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Tell others about yourself and your dining preferences..."
                                      className="resize-none min-h-32"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    This will be visible to other users when they view your profile.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            className="bg-primary hover:bg-primary/90"
                            disabled={updateProfile.isPending}
                          >
                            {updateProfile.isPending ? (
                              <>Saving...</>
                            ) : (
                              <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </TabsContent>
                  
                  {/* Food Preferences Tab */}
                  <TabsContent value="preferences">
                    <div className="p-4 text-center">
                      <User className="h-12 w-12 mx-auto text-neutral-400" />
                      <h3 className="mt-4 text-lg font-medium">Food Preferences</h3>
                      <p className="mt-2 text-neutral-600">
                        Coming soon! You will be able to select your food preferences, 
                        dietary restrictions, and favorite cuisines here.
                      </p>
                    </div>
                  </TabsContent>
                  
                  {/* Verification Tab */}
                  <TabsContent value="verification">
                    <div className="p-4 text-center">
                      <User className="h-12 w-12 mx-auto text-neutral-400" />
                      <h3 className="mt-4 text-lg font-medium">Account Verification</h3>
                      <p className="mt-2 text-neutral-600">
                        Coming soon! You will be able to verify your identity and 
                        connect social accounts for added security.
                      </p>
                    </div>
                  </TabsContent>
                  
                  {/* Integrations Tab */}
                  <TabsContent value="integrations">
                    <div className="p-6 space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Microsoft Integration</h3>
                        <p className="text-neutral-600 mb-4">
                          Connect your Microsoft account to enable calendar syncing for your meal invitations.
                        </p>
                        
                        <div className="bg-neutral-50 rounded-lg p-4 border">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="h-10 w-10 bg-[#f2f2f2] rounded-md flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24">
                                  <path fill="#f25022" d="M1 1h10v10H1V1z"/>
                                  <path fill="#00a4ef" d="M1 13h10v10H1V13z"/>
                                  <path fill="#7fba00" d="M13 1h10v10H13V1z"/>
                                  <path fill="#ffb900" d="M13 13h10v10H13V13z"/>
                                </svg>
                              </div>
                              <div>
                                <h4 className="font-medium">Microsoft Account</h4>
                                <p className="text-sm text-neutral-500">
                                  {user.microsoftId 
                                    ? "Connected" 
                                    : "Not connected"}
                                </p>
                              </div>
                            </div>
                            
                            {user.microsoftId ? (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    toast({
                                      title: "Coming soon",
                                      description: "Disconnecting Microsoft accounts will be available in a future update.",
                                      variant: "default",
                                    });
                                  }}
                                >
                                  Disconnect
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => {
                                  window.location.href = "/auth";
                                }}
                              >
                                Connect
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {user.microsoftId && (
                        <div>
                          <h3 className="text-lg font-medium mb-2">Calendar Integration</h3>
                          <p className="text-neutral-600 mb-4">
                            Allow the application to automatically sync your meal invitations with your Microsoft Outlook calendar.
                          </p>
                          
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="calendar-sync"
                              checked={user.useMicrosoftCalendar === true}
                              onCheckedChange={(checked) => {
                                updateProfile.mutate({
                                  ...form.getValues(),
                                  useMicrosoftCalendar: checked
                                });
                              }}
                            />
                            <Label htmlFor="calendar-sync">Enable calendar synchronization</Label>
                          </div>
                          
                          <p className="text-sm text-neutral-500 mt-2">
                            When enabled, accepted meal invitations will automatically be added to your calendar,
                            and any updates to the invitation details will be reflected in your calendar events.
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}
