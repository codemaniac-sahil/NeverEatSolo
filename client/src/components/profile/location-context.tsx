import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MapPin, Save } from "lucide-react";

interface LocationContextData {
  locationContext: string;
  locationContextNote: string;
}

const locationContextSchema = z.object({
  locationContext: z.enum(["local", "tourist", "visiting", "networking"]),
  locationContextNote: z.string().max(500, {
    message: "Notes must be less than 500 characters",
  }).optional(),
});

type LocationContextFormValues = z.infer<typeof locationContextSchema>;

export default function LocationContext() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<LocationContextFormValues>({
    resolver: zodResolver(locationContextSchema),
    defaultValues: {
      locationContext: user?.locationContext as "local" | "tourist" | "visiting" | "networking" || "local",
      locationContextNote: user?.locationContextNote || "",
    },
  });
  
  const updateLocationContext = useMutation({
    mutationFn: async (data: LocationContextData) => {
      const response = await apiRequest(
        "PATCH",
        `/api/users/${user?.id}/location-context`,
        data
      );
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Location context updated",
        description: "Your location context has been successfully updated.",
      });
      
      // Update the user query data
      queryClient.setQueryData(["/api/user"], (oldData: any) => {
        return {
          ...oldData,
          locationContext: data.locationContext,
          locationContextNote: data.locationContextNote,
        };
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update location context",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(data: LocationContextFormValues) {
    updateLocationContext.mutate(data);
  }
  
  const contextDescriptions = {
    local: "You're a local resident of the area",
    tourist: "You're temporarily visiting for leisure or exploration",
    visiting: "You're here for a specific purpose, like work or an event",
    networking: "You're specifically looking for professional connections"
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center mb-8">
        <div className="bg-primary/10 p-3 rounded-full">
          <MapPin className="h-8 w-8 text-primary" />
        </div>
      </div>
      
      <h3 className="text-lg font-medium text-center mb-4">
        Your Location Context
      </h3>
      
      <p className="text-center text-muted-foreground mb-8">
        Let others know why you're in this location to help create more meaningful connections.
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="locationContext"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base">I am in this area as a:</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-3"
                  >
                    {Object.entries(contextDescriptions).map(([value, description]) => (
                      <Card key={value} className={`border transition-colors ${field.value === value ? 'bg-muted border-primary' : ''}`}>
                        <CardContent className="p-4">
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value={value} />
                            </FormControl>
                            <div className="flex flex-col">
                              <FormLabel className="font-semibold capitalize">
                                {value}
                              </FormLabel>
                              <FormDescription className="text-sm">
                                {description}
                              </FormDescription>
                            </div>
                          </FormItem>
                        </CardContent>
                      </Card>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="locationContextNote"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add more details about your location situation if you'd like..."
                    className="resize-none min-h-24"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Share more context about why you're here or what you're looking for.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90"
              disabled={updateLocationContext.isPending}
            >
              {updateLocationContext.isPending ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Location Context
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}