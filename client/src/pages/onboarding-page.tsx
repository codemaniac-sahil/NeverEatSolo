import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Utensils, CalendarDays, Salad, Info, CheckCircle2 } from "lucide-react";
import { 
  DIETARY_RESTRICTIONS, 
  CUISINE_PREFERENCES, 
  DINING_STYLES, 
  FOOD_PREFERENCES 
} from "@shared/constants";
import { useToast } from "@/hooks/use-toast";

// Define the onboarding schema
const onboardingSchema = z.object({
  gender: z.string().min(1, "Please select your gender"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  bio: z.string().optional(),
  occupation: z.string().optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  cuisinePreferences: z.array(z.string()).min(1, "Please select at least one cuisine preference"),
  diningStyles: z.array(z.string()).optional(),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("personal");
  
  // Redirect if not logged in
  if (!user) {
    navigate("/auth");
    return null;
  }

  // Form definition
  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      gender: "",
      dateOfBirth: "",
      bio: user.bio || "",
      occupation: user.occupation || "",
      dietaryRestrictions: [],
      cuisinePreferences: [],
      diningStyles: [],
    },
  });
  
  // Mutation for updating user preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: OnboardingFormValues) => {
      const res = await apiRequest("PATCH", `/api/users/${user.id}/preferences`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Preferences updated",
        description: "Your dining preferences have been saved successfully.",
      });
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update preferences",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  function onSubmit(data: OnboardingFormValues) {
    updatePreferencesMutation.mutate(data);
  }
  
  // Navigate between tabs
  const nextTab = () => {
    if (activeTab === "personal") {
      // Validate the personal info fields before proceeding
      form.trigger(["gender", "dateOfBirth"]);
      const genderError = form.formState.errors.gender;
      const dobError = form.formState.errors.dateOfBirth;
      
      if (!genderError && !dobError) {
        setActiveTab("dining");
      }
    } else if (activeTab === "dining") {
      // Validate cuisine preferences before proceeding
      form.trigger(["cuisinePreferences"]);
      const cuisineError = form.formState.errors.cuisinePreferences;
      
      if (!cuisineError) {
        setActiveTab("dietary");
      }
    } else if (activeTab === "dietary") {
      setActiveTab("review");
    }
  };
  
  const prevTab = () => {
    if (activeTab === "dining") {
      setActiveTab("personal");
    } else if (activeTab === "dietary") {
      setActiveTab("dining");
    } else if (activeTab === "review") {
      setActiveTab("dietary");
    }
  };
  
  const goToTab = (tab: string) => {
    setActiveTab(tab);
  };
  
  return (
    <div className="min-h-screen py-8 px-4 bg-neutral-50">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
            <CardDescription>
              Let's set up your preferences to help us match you with compatible dining companions
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <div 
                  onClick={() => goToTab("personal")}
                  className={`flex items-center cursor-pointer ${activeTab === "personal" ? "text-primary font-medium" : "text-neutral-500"}`}
                >
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center mr-2 ${activeTab === "personal" ? "bg-primary text-white" : "bg-neutral-200"}`}>
                    1
                  </div>
                  <span>Personal Info</span>
                </div>
                <div className="h-px bg-neutral-200 flex-1 mx-2"></div>
                <div 
                  onClick={() => goToTab("dining")}
                  className={`flex items-center cursor-pointer ${activeTab === "dining" ? "text-primary font-medium" : "text-neutral-500"}`}
                >
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center mr-2 ${activeTab === "dining" ? "bg-primary text-white" : "bg-neutral-200"}`}>
                    2
                  </div>
                  <span>Dining Preferences</span>
                </div>
                <div className="h-px bg-neutral-200 flex-1 mx-2"></div>
                <div 
                  onClick={() => goToTab("dietary")}
                  className={`flex items-center cursor-pointer ${activeTab === "dietary" ? "text-primary font-medium" : "text-neutral-500"}`}
                >
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center mr-2 ${activeTab === "dietary" ? "bg-primary text-white" : "bg-neutral-200"}`}>
                    3
                  </div>
                  <span>Dietary Needs</span>
                </div>
                <div className="h-px bg-neutral-200 flex-1 mx-2"></div>
                <div 
                  onClick={() => goToTab("review")}
                  className={`flex items-center cursor-pointer ${activeTab === "review" ? "text-primary font-medium" : "text-neutral-500"}`}
                >
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center mr-2 ${activeTab === "review" ? "bg-primary text-white" : "bg-neutral-200"}`}>
                    4
                  </div>
                  <span>Review</span>
                </div>
              </div>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  {/* Step 1: Personal Information */}
                  <TabsContent value="personal" className="space-y-4">
                    <div className="flex items-center mb-4">
                      <Info className="mr-2 h-5 w-5 text-primary" />
                      <h3 className="text-lg font-medium">Tell us about yourself</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="non-binary">Non-binary</SelectItem>
                                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="occupation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Occupation</FormLabel>
                          <FormControl>
                            <Input placeholder="What do you do?" {...field} />
                          </FormControl>
                          <FormDescription>
                            This helps potential dining partners learn more about you
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us a bit about yourself and your interests..." 
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Share what makes you a great dining companion
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  {/* Step 2: Dining Preferences */}
                  <TabsContent value="dining" className="space-y-4">
                    <div className="flex items-center mb-4">
                      <Utensils className="mr-2 h-5 w-5 text-primary" />
                      <h3 className="text-lg font-medium">Your Dining Preferences</h3>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="cuisinePreferences"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cuisine Preferences</FormLabel>
                          <FormDescription>
                            Select cuisines you enjoy (select at least one)
                          </FormDescription>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                            {CUISINE_PREFERENCES.map((cuisine) => (
                              <FormItem
                                key={cuisine}
                                className="flex flex-row items-start space-x-3 space-y-0 border rounded-md p-2"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(cuisine)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange([...(field.value || []), cuisine]);
                                      } else {
                                        field.onChange(
                                          field.value?.filter((value) => value !== cuisine) || []
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {cuisine}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="diningStyles"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dining Styles</FormLabel>
                          <FormDescription>
                            What dining experiences do you prefer?
                          </FormDescription>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                            {DINING_STYLES.map((style) => (
                              <FormItem
                                key={style}
                                className="flex flex-row items-start space-x-3 space-y-0 border rounded-md p-2"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(style)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange([...(field.value || []), style]);
                                      } else {
                                        field.onChange(
                                          field.value?.filter((value) => value !== style) || []
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {style}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  {/* Step 3: Dietary Needs */}
                  <TabsContent value="dietary" className="space-y-4">
                    <div className="flex items-center mb-4">
                      <Salad className="mr-2 h-5 w-5 text-primary" />
                      <h3 className="text-lg font-medium">Dietary Preferences & Restrictions</h3>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="dietaryRestrictions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dietary Restrictions</FormLabel>
                          <FormDescription>
                            Select any dietary restrictions you have
                          </FormDescription>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {DIETARY_RESTRICTIONS.map((restriction) => (
                              <FormItem
                                key={restriction}
                                className="flex flex-row items-start space-x-3 space-y-0 border rounded-md p-2"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(restriction)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange([...(field.value || []), restriction]);
                                      } else {
                                        field.onChange(
                                          field.value?.filter((value) => value !== restriction) || []
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {restriction}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  {/* Step 4: Review */}
                  <TabsContent value="review" className="space-y-6">
                    <div className="flex items-center mb-4">
                      <CheckCircle2 className="mr-2 h-5 w-5 text-primary" />
                      <h3 className="text-lg font-medium">Review Your Preferences</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 pt-0">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-sm font-medium">Gender</p>
                              <p className="text-sm text-neutral-600">
                                {form.getValues().gender || "Not specified"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Date of Birth</p>
                              <p className="text-sm text-neutral-600">
                                {form.getValues().dateOfBirth || "Not specified"}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Occupation</p>
                            <p className="text-sm text-neutral-600">
                              {form.getValues().occupation || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Bio</p>
                            <p className="text-sm text-neutral-600">
                              {form.getValues().bio || "Not specified"}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Dining Preferences</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 pt-0">
                          <div>
                            <p className="text-sm font-medium">Cuisine Preferences</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {form.getValues().cuisinePreferences?.length ? 
                                form.getValues().cuisinePreferences?.map(cuisine => (
                                  <span key={cuisine} className="bg-primary/10 text-primary text-xs rounded-full px-2 py-1">
                                    {cuisine}
                                  </span>
                                )) : 
                                <p className="text-sm text-neutral-600">None selected</p>
                              }
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Dining Styles</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {form.getValues().diningStyles?.length ? 
                                form.getValues().diningStyles?.map(style => (
                                  <span key={style} className="bg-primary/10 text-primary text-xs rounded-full px-2 py-1">
                                    {style}
                                  </span>
                                )) : 
                                <p className="text-sm text-neutral-600">None selected</p>
                              }
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Dietary Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 pt-0">
                          <div>
                            <p className="text-sm font-medium">Dietary Restrictions</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {form.getValues().dietaryRestrictions?.length ? 
                                form.getValues().dietaryRestrictions?.map(restriction => (
                                  <span key={restriction} className="bg-primary/10 text-primary text-xs rounded-full px-2 py-1">
                                    {restriction}
                                  </span>
                                )) : 
                                <p className="text-sm text-neutral-600">None selected</p>
                              }
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-between mt-6 pt-4 border-t">
                  {activeTab !== "personal" && (
                    <Button type="button" variant="outline" onClick={prevTab}>
                      Previous
                    </Button>
                  )}
                  
                  {activeTab === "personal" && (
                    <div></div>
                  )}
                  
                  {activeTab !== "review" ? (
                    <Button type="button" onClick={nextTab}>
                      Continue
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      disabled={updatePreferencesMutation.isPending}
                    >
                      {updatePreferencesMutation.isPending ? "Saving..." : "Complete Profile"}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}