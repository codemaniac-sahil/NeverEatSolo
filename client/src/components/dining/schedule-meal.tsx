import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  CalendarDays, 
  Clock, 
  Coffee, 
  Utensils,
  AlarmClock,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

// Demo mode flag
const DEMO_MODE = true;

// Schema for the scheduling form
const scheduleFormSchema = z.object({
  date: z.date(),
  mealType: z.enum([
    "breakfast", 
    "brunch", 
    "lunch", 
    "coffee", 
    "snack", 
    "afterWorkDrink", 
    "dinner"
  ]),
  duration: z.string(),
  customDuration: z.string().optional(),
  notes: z.string().optional(),
  openToCompany: z.boolean().default(true),
  location: z.string().optional(),
  restaurantPreference: z.string().optional(),
});

// Schema for the spontaneous meetup form
const spontaneousFormSchema = z.object({
  mealType: z.enum([
    "breakfast", 
    "brunch", 
    "lunch", 
    "coffee", 
    "snack", 
    "afterWorkDrink", 
    "dinner"
  ]),
  duration: z.string(),
  customDuration: z.string().optional(),
  notes: z.string().optional(),
  location: z.string().optional(),
  restaurantPreference: z.string().optional(),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;
type SpontaneousFormValues = z.infer<typeof spontaneousFormSchema>;

// Meal type options with icons
const mealTypeOptions = [
  { value: "breakfast", label: "Breakfast", icon: <Utensils className="mr-2 h-4 w-4" /> },
  { value: "brunch", label: "Brunch", icon: <Utensils className="mr-2 h-4 w-4" /> },
  { value: "lunch", label: "Lunch", icon: <Utensils className="mr-2 h-4 w-4" /> },
  { value: "coffee", label: "Coffee/Drink", icon: <Coffee className="mr-2 h-4 w-4" /> },
  { value: "snack", label: "Snack", icon: <Coffee className="mr-2 h-4 w-4" /> },
  { value: "afterWorkDrink", label: "After Work Drink", icon: <Coffee className="mr-2 h-4 w-4" /> },
  { value: "dinner", label: "Dinner", icon: <Utensils className="mr-2 h-4 w-4" /> },
];

// Duration options
const durationOptions = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "1 hour" },
  { value: "custom", label: "Custom" },
];

interface ScheduleMealModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScheduleMealModal({ isOpen, onClose }: ScheduleMealModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("planned");
  const [isScheduling, setIsScheduling] = useState(false);
  
  // Form for scheduling a meal
  const scheduleForm = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      date: new Date(),
      mealType: "lunch",
      duration: "60",
      notes: "",
      openToCompany: true,
    },
  });

  // Form for spontaneous meetup
  const spontaneousForm = useForm<SpontaneousFormValues>({
    resolver: zodResolver(spontaneousFormSchema),
    defaultValues: {
      mealType: "coffee",
      duration: "30",
      notes: "",
    },
  });

  // Mutation for scheduling a meal
  const scheduleMutation = useMutation({
    mutationFn: async (data: ScheduleFormValues) => {
      if (DEMO_MODE) {
        // Simulate API call in demo mode
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({ success: true, message: "Meal scheduled successfully" });
          }, 1000);
        });
      }
      
      const res = await apiRequest("POST", "/api/meals/schedule", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to schedule meal");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Meal scheduled",
        description: "Your meal has been scheduled successfully.",
      });
      scheduleForm.reset();
      onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/meals/upcoming"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to schedule meal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for spontaneous meetup
  const spontaneousMutation = useMutation({
    mutationFn: async (data: SpontaneousFormValues) => {
      if (DEMO_MODE) {
        // Simulate API call in demo mode
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({ success: true, message: "Spontaneous meetup created successfully" });
          }, 1000);
        });
      }
      
      const res = await apiRequest("POST", "/api/meals/spontaneous", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create spontaneous meetup");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Spontaneous meetup created",
        description: "Your availability has been posted. We'll notify you of any matches.",
      });
      spontaneousForm.reset();
      onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/meals/upcoming"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create meetup",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Submit handler for scheduled meal
  function onScheduleSubmit(data: ScheduleFormValues) {
    setIsScheduling(true);
    scheduleMutation.mutate(data);
    setIsScheduling(false);
  }

  // Submit handler for spontaneous meetup
  function onSpontaneousSubmit(data: SpontaneousFormValues) {
    setIsScheduling(true);
    spontaneousMutation.mutate(data);
    setIsScheduling(false);
  }

  // Helper for showing duration input
  const showCustomDuration = (form: any, formType: 'schedule' | 'spontaneous') => {
    const duration = form.getValues("duration");
    return duration === "custom";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Schedule a Meal</DialogTitle>
          <DialogDescription className="text-center text-neutral-600">
            Plan your meals and connect with compatible dining companions
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="planned" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span>Planned Meal</span>
            </TabsTrigger>
            <TabsTrigger value="spontaneous" className="flex items-center gap-2">
              <AlarmClock className="h-4 w-4" />
              <span>I'm Free Now</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Planned Meal Tab */}
          <TabsContent value="planned">
            <Form {...scheduleForm}>
              <form onSubmit={scheduleForm.handleSubmit(onScheduleSubmit)} className="space-y-5">
                {/* Date Selection */}
                <FormField
                  control={scheduleForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        className="rounded-md border"
                        classNames={{
                          head_cell: "text-primary/80 font-semibold",
                          day_selected: "bg-primary text-primary-foreground",
                        }}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Meal Type */}
                <FormField
                  control={scheduleForm.control}
                  name="mealType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meal Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a meal type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mealTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center">
                                {option.icon}
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Duration */}
                <FormField
                  control={scheduleForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {durationOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Custom Duration */}
                {showCustomDuration(scheduleForm, 'schedule') && (
                  <FormField
                    control={scheduleForm.control}
                    name="customDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input type="number" min="5" placeholder="Enter minutes" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {/* Location/Area */}
                <FormField
                  control={scheduleForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location/Area (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Downtown, Midtown, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Restaurant Preference */}
                <FormField
                  control={scheduleForm.control}
                  name="restaurantPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restaurant Preference (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Italian restaurant, cafe, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Notes */}
                <FormField
                  control={scheduleForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional details about this meal"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Open to Company */}
                <FormField
                  control={scheduleForm.control}
                  name="openToCompany"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Open to Company</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Allow other users to join your meal
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={scheduleMutation.isPending}
                  >
                    {scheduleMutation.isPending ? "Scheduling..." : "Schedule Meal"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
          
          {/* Spontaneous Meetup Tab */}
          <TabsContent value="spontaneous">
            <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/30">
              <div className="flex items-start gap-3">
                <AlarmClock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-lg text-primary">I'm Available Now</h3>
                  <p className="text-sm text-neutral-600">
                    Let nearby users know you're available for a spontaneous meal or coffee. 
                    Perfect for last-minute cancellations or unexpected free time.
                  </p>
                </div>
              </div>
            </div>
            
            <Form {...spontaneousForm}>
              <form onSubmit={spontaneousForm.handleSubmit(onSpontaneousSubmit)} className="space-y-5">
                {/* Meal Type */}
                <FormField
                  control={spontaneousForm.control}
                  name="mealType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What are you looking for?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a meal type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mealTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center">
                                {option.icon}
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Duration */}
                <FormField
                  control={spontaneousForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How long are you available?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {durationOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Custom Duration */}
                {showCustomDuration(spontaneousForm, 'spontaneous') && (
                  <FormField
                    control={spontaneousForm.control}
                    name="customDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input type="number" min="5" placeholder="Enter minutes" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {/* Location/Area */}
                <FormField
                  control={spontaneousForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location/Area (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Downtown, Midtown, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Restaurant Preference */}
                <FormField
                  control={spontaneousForm.control}
                  name="restaurantPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restaurant Preference (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Italian restaurant, cafe, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Notes */}
                <FormField
                  control={spontaneousForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional notes (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share any additional details about your spontaneous availability"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Badge variant="secondary" className="mb-2 py-1.5 px-3 gap-1">
                  <Users className="h-3 w-3" />
                  <span>Your availability will be shown to nearby users for 2 hours</span>
                </Badge>

                <DialogFooter>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={spontaneousMutation.isPending}
                  >
                    {spontaneousMutation.isPending ? "Creating..." : "I'm Available Now"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}