import { useState } from "react";
import { useSavedRestaurants } from "@/hooks/use-saved-restaurants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bookmark, BookmarkCheck, Edit, Trash2, Star, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { User } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const editSavedRestaurantSchema = z.object({
  isPublic: z.boolean().default(true),
  notes: z.string().optional(),
  priority: z.number().min(0).max(5).default(0)
});

type EditSavedRestaurantValues = z.infer<typeof editSavedRestaurantSchema>;

export default function SavedRestaurants() {
  const { 
    savedRestaurants, 
    isLoading, 
    updateSavedRestaurantMutation, 
    deleteSavedRestaurantMutation,
    useUsersWithSavedRestaurant
  } = useSavedRestaurants();
  
  const [editingRestaurant, setEditingRestaurant] = useState<number | null>(null);
  const [showUsersDialog, setShowUsersDialog] = useState<number | null>(null);
  
  // Get the currently editing restaurant
  const currentRestaurant = savedRestaurants.find(r => r.id === editingRestaurant);
  
  // Get users who have saved the restaurant we're looking at
  const { data: usersWithRestaurant = [], isLoading: isLoadingUsers } = 
    useUsersWithSavedRestaurant(showUsersDialog !== null ? savedRestaurants.find(r => r.id === showUsersDialog)?.restaurantId || 0 : 0);
  
  // Form for editing saved restaurant
  const form = useForm<EditSavedRestaurantValues>({
    resolver: zodResolver(editSavedRestaurantSchema),
    defaultValues: {
      isPublic: currentRestaurant?.isPublic ?? true,
      notes: currentRestaurant?.notes ?? "",
      priority: currentRestaurant?.priority ?? 0
    }
  });
  
  // When currentRestaurant changes, reset form values
  if (currentRestaurant && editingRestaurant) {
    form.reset({
      isPublic: currentRestaurant.isPublic,
      notes: currentRestaurant.notes ?? "",
      priority: currentRestaurant.priority ?? 0
    });
  }
  
  const onSubmitEdit = (data: EditSavedRestaurantValues) => {
    if (editingRestaurant) {
      updateSavedRestaurantMutation.mutate({
        id: editingRestaurant,
        ...data
      });
      setEditingRestaurant(null);
    }
  };
  
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to remove this restaurant from your saved list?")) {
      deleteSavedRestaurantMutation.mutate(id);
    }
  };
  
  // Generate initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-light tracking-wide text-zinc-100 mb-4">Your Saved Restaurants</h2>
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-4">
            <div className="flex justify-between items-center mb-2">
              <Skeleton className="h-6 w-40" />
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-light tracking-wide text-zinc-100 mb-4">
        Your Saved Restaurants <span className="text-sm text-zinc-500">({savedRestaurants.length})</span>
      </h2>
      
      {savedRestaurants.length === 0 ? (
        <Card className="p-6 text-center text-zinc-400">
          <BookmarkCheck size={36} className="mx-auto mb-2 text-zinc-500" />
          <p>You haven't saved any restaurants yet.</p>
          <p className="text-sm mt-2">Save restaurants you want to visit to see them here.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {savedRestaurants.map((savedRest) => (
            <Card key={savedRest.id} className="p-5 elegant-card">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium text-zinc-100">{savedRest.restaurant.name}</h3>
                    {savedRest.isPublic ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="text-xs py-0 h-5">Public</Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Other users can see that you saved this restaurant</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="text-xs py-0 h-5 bg-zinc-800">Private</Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Only you can see that you saved this restaurant</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {savedRest.priority > 0 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center">
                              {Array.from({ length: savedRest.priority }).map((_, i) => (
                                <Star key={i} size={14} className="text-primary fill-primary" />
                              ))}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Priority: {savedRest.priority}/5</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400 mt-1">{savedRest.restaurant.cuisine} • {savedRest.restaurant.priceRange}</p>
                  <p className="text-sm text-zinc-500 mt-1">{savedRest.restaurant.address}</p>
                  
                  {savedRest.notes && (
                    <div className="mt-3 p-3 bg-zinc-800/50 rounded-md text-sm text-zinc-300 border border-zinc-700/50">
                      {savedRest.notes}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setShowUsersDialog(savedRest.id)}
                        >
                          <Users size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">See who else saved this restaurant</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setEditingRestaurant(savedRest.id)}
                        >
                          <Edit size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Edit saved restaurant</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(savedRest.id)}
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Remove from saved</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Edit Dialog */}
      <Dialog open={editingRestaurant !== null} onOpenChange={(open) => !open && setEditingRestaurant(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Saved Restaurant</DialogTitle>
            <DialogDescription>
              Update your notes and visibility preferences for this restaurant.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-6">
              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Public</FormLabel>
                      <FormDescription>
                        Let others see you've saved this restaurant
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority (0-5)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min={0}
                        max={5}
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      How important is it for you to visit this restaurant?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Why do you want to visit this restaurant?"
                        className="resize-none"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingRestaurant(null)}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Users Dialog */}
      <Dialog open={showUsersDialog !== null} onOpenChange={(open) => !open && setShowUsersDialog(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>People Who Saved This Restaurant</DialogTitle>
            <DialogDescription>
              Users who have this restaurant on their list.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4 max-h-[300px] overflow-y-auto">
            {isLoadingUsers ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            ) : usersWithRestaurant.length === 0 ? (
              <p className="text-center text-zinc-400">
                No other users have saved this restaurant publicly.
              </p>
            ) : (
              usersWithRestaurant.map((user: User) => (
                <div key={user.id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.profileImage || ""} alt={user.name} />
                    <AvatarFallback className="bg-zinc-800 text-primary">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-zinc-200">{user.name}</p>
                    <p className="text-xs text-zinc-400">{user.occupation || ""}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => setShowUsersDialog(null)} 
              className="w-full"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}