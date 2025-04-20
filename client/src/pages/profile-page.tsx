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
import DiningHistory from "@/components/profile/dining-history";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
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
  UtensilsCrossed
} from "lucide-react";
import { 
  DIETARY_RESTRICTIONS, 
  CUISINE_PREFERENCES, 
  DINING_STYLES, 
  FOOD_PREFERENCES 
} from "@shared/constants";

// Profile update schema
const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  bio: z.string().optional(),
  occupation: z.string().optional(),
  age: z.coerce.number().min(18, "You must be at least 18 years old.").optional(),
  phone: z.string().optional(),
  profileImage: z.string().optional(),
  useMicrosoftCalendar: z.boolean().optional(),
  foodPreferences: z.array(z.string()).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  cuisinePreferences: z.array(z.string()).optional(),
  diningStyles: z.array(z.string()).optional(),
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
      useMicrosoftCalendar: user?.useMicrosoftCalendar || false,
      foodPreferences: user?.foodPreferences || [],
      dietaryRestrictions: user?.dietaryRestrictions || [],
      cuisinePreferences: user?.cuisinePreferences || [],
      diningStyles: user?.diningStyles || [],
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
                    <AvatarImage src={user.profileImage || undefined} alt={user.name} />
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
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="preferences">Food Preferences</TabsTrigger>
                    <TabsTrigger value="history">Dining History</TabsTrigger>
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
                                  src={form.watch("profileImage") || undefined} 
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
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
                        <div className="flex items-center justify-center mb-4">
                          <div className="bg-primary/10 p-3 rounded-full">
                            <UtensilsCrossed className="h-8 w-8 text-primary" />
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-medium text-center mb-6">
                          Dietary Preferences & Restrictions
                        </h3>
                        
                        <div className="space-y-8">
                          {/* Dietary Restrictions Section */}
                          <FormField
                            control={form.control}
                            name="dietaryRestrictions"
                            render={() => (
                              <FormItem>
                                <div className="mb-4">
                                  <FormLabel className="text-base">Dietary Restrictions</FormLabel>
                                  <FormDescription>
                                    Select any dietary restrictions that you follow.
                                  </FormDescription>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  {DIETARY_RESTRICTIONS.map((item) => (
                                    <FormField
                                      key={item}
                                      control={form.control}
                                      name="dietaryRestrictions"
                                      render={({ field }) => {
                                        return (
                                          <FormItem
                                            key={item}
                                            className="flex flex-row items-start space-x-3 space-y-0 bg-neutral-50 border rounded-md p-3 hover:bg-neutral-100"
                                          >
                                            <FormControl>
                                              <Checkbox
                                                checked={field.value?.includes(item)}
                                                onCheckedChange={(checked) => {
                                                  return checked
                                                    ? field.onChange([...field.value || [], item])
                                                    : field.onChange(
                                                        field.value?.filter(
                                                          (value) => value !== item
                                                        )
                                                      );
                                                }}
                                              />
                                            </FormControl>
                                            <FormLabel className="font-normal text-sm cursor-pointer">
                                              {item}
                                            </FormLabel>
                                          </FormItem>
                                        );
                                      }}
                                    />
                                  ))}
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          {/* Cuisine Preferences Section */}
                          <FormField
                            control={form.control}
                            name="cuisinePreferences"
                            render={() => (
                              <FormItem>
                                <div className="mb-4">
                                  <FormLabel className="text-base">Favorite Cuisines</FormLabel>
                                  <FormDescription>
                                    Select the types of cuisines you most enjoy.
                                  </FormDescription>
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                  {CUISINE_PREFERENCES.map((item) => (
                                    <FormField
                                      key={item}
                                      control={form.control}
                                      name="cuisinePreferences"
                                      render={({ field }) => {
                                        const selected = field.value?.includes(item);
                                        return (
                                          <FormItem key={item} className="flex flex-row space-x-1 space-y-0">
                                            <FormControl>
                                              <div
                                                className={`cursor-pointer px-3 py-1 rounded-full text-sm transition-colors ${
                                                  selected
                                                    ? "bg-primary text-white"
                                                    : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                                                }`}
                                                onClick={() => {
                                                  return selected
                                                    ? field.onChange(
                                                        field.value?.filter(
                                                          (value) => value !== item
                                                        )
                                                      )
                                                    : field.onChange([...field.value || [], item]);
                                                }}
                                              >
                                                {item}
                                              </div>
                                            </FormControl>
                                          </FormItem>
                                        );
                                      }}
                                    />
                                  ))}
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          {/* Dining Styles Section */}
                          <FormField
                            control={form.control}
                            name="diningStyles"
                            render={() => (
                              <FormItem>
                                <div className="mb-4">
                                  <FormLabel className="text-base">Preferred Dining Styles</FormLabel>
                                  <FormDescription>
                                    What types of dining experiences do you prefer?
                                  </FormDescription>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  {DINING_STYLES.map((item) => (
                                    <FormField
                                      key={item}
                                      control={form.control}
                                      name="diningStyles"
                                      render={({ field }) => {
                                        return (
                                          <FormItem
                                            key={item}
                                            className="flex flex-row items-start space-x-3 space-y-0 bg-neutral-50 border rounded-md p-3 hover:bg-neutral-100"
                                          >
                                            <FormControl>
                                              <Checkbox
                                                checked={field.value?.includes(item)}
                                                onCheckedChange={(checked) => {
                                                  return checked
                                                    ? field.onChange([...field.value || [], item])
                                                    : field.onChange(
                                                        field.value?.filter(
                                                          (value) => value !== item
                                                        )
                                                      );
                                                }}
                                              />
                                            </FormControl>
                                            <FormLabel className="font-normal text-sm cursor-pointer">
                                              {item}
                                            </FormLabel>
                                          </FormItem>
                                        );
                                      }}
                                    />
                                  ))}
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          {/* Food Preferences Section */}
                          <FormField
                            control={form.control}
                            name="foodPreferences"
                            render={() => (
                              <FormItem>
                                <div className="mb-4">
                                  <FormLabel className="text-base">Eating Habits & Preferences</FormLabel>
                                  <FormDescription>
                                    These preferences help us match you with compatible dining partners.
                                  </FormDescription>
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                  {FOOD_PREFERENCES.map((item) => (
                                    <FormField
                                      key={item}
                                      control={form.control}
                                      name="foodPreferences"
                                      render={({ field }) => {
                                        const selected = field.value?.includes(item);
                                        return (
                                          <FormItem key={item} className="flex flex-row space-x-1 space-y-0">
                                            <FormControl>
                                              <div
                                                className={`cursor-pointer px-3 py-1 rounded-full text-sm transition-colors ${
                                                  selected
                                                    ? "bg-primary text-white"
                                                    : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                                                }`}
                                                onClick={() => {
                                                  return selected
                                                    ? field.onChange(
                                                        field.value?.filter(
                                                          (value) => value !== item
                                                        )
                                                      )
                                                    : field.onChange([...field.value || [], item]);
                                                }}
                                              >
                                                {item}
                                              </div>
                                            </FormControl>
                                          </FormItem>
                                        );
                                      }}
                                    />
                                  ))}
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="flex justify-end pt-4">
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
                                Save Preferences
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </TabsContent>
                  
                  {/* Dining History Tab */}
                  <TabsContent value="history">
                    <div className="p-6">
                      <DiningHistory userId={user.id} />
                    </div>
                  </TabsContent>
                  
                  {/* Verification Tab */}
                  <TabsContent value="verification">
                    <div className="p-6 space-y-6">
                      <div className="flex items-center justify-center mb-2">
                        <div className="bg-primary/10 p-3 rounded-full">
                          <User className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-medium text-center">Account Verification</h3>
                      <p className="text-center text-neutral-600 mb-6">
                        Verify your identity to build trust with other users and get access to premium features.
                      </p>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <Mail className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">Email Verification</h4>
                              <p className="text-sm text-neutral-600">Verify your email address</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-none">
                            Verified
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="bg-neutral-200 p-2 rounded-full">
                              <Phone className="h-5 w-5 text-neutral-500" />
                            </div>
                            <div>
                              <h4 className="font-medium">Phone Verification</h4>
                              <p className="text-sm text-neutral-600">Verify your phone number</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            Verify
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="bg-neutral-200 p-2 rounded-full">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500">
                                <path d="M12 2 L19 7 V17 L12 22 L5 17 V7 L12 2" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-medium">ID Verification</h4>
                              <p className="text-sm text-neutral-600">Verify your identity with a government ID</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            Verify
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="bg-neutral-200 p-2 rounded-full">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500">
                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                <rect x="2" y="9" width="4" height="12" />
                                <circle cx="4" cy="4" r="2" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-medium">LinkedIn Verification</h4>
                              <p className="text-sm text-neutral-600">Verify your professional identity</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            Connect
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <p className="text-center text-neutral-500 text-sm">
                          Verifying your identity helps create a safer community for everyone.
                        </p>
                      </div>
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
                                const currentValues = form.getValues();
                                updateProfile.mutate({
                                  name: currentValues.name,
                                  email: currentValues.email,
                                  bio: currentValues.bio,
                                  occupation: currentValues.occupation,
                                  age: currentValues.age,
                                  phone: currentValues.phone,
                                  profileImage: currentValues.profileImage,
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
