import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Restaurant, SavedRestaurant } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export type SavedRestaurantWithDetails = SavedRestaurant & { restaurant: Restaurant };

export function useSavedRestaurants() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all saved restaurants
  const { 
    data: savedRestaurants = [], 
    isLoading,
    error, 
    refetch 
  } = useQuery<SavedRestaurantWithDetails[]>({
    queryKey: ["/api/saved-restaurants"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/saved-restaurants");
      return res.json();
    }
  });

  // Save a restaurant
  const saveRestaurantMutation = useMutation({
    mutationFn: async ({ 
      restaurantId, 
      isPublic = true, 
      notes, 
      priority = 0 
    }: { 
      restaurantId: number; 
      isPublic?: boolean; 
      notes?: string; 
      priority?: number; 
    }) => {
      const res = await apiRequest("POST", "/api/saved-restaurants", {
        restaurantId,
        isPublic,
        notes,
        priority
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to save restaurant");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Restaurant saved",
        description: "The restaurant has been added to your saved list.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/saved-restaurants"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save restaurant",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update a saved restaurant
  const updateSavedRestaurantMutation = useMutation({
    mutationFn: async ({ 
      id, 
      isPublic, 
      notes, 
      priority 
    }: { 
      id: number; 
      isPublic?: boolean; 
      notes?: string; 
      priority?: number; 
    }) => {
      const data: Record<string, any> = {};
      if (isPublic !== undefined) data.isPublic = isPublic;
      if (notes !== undefined) data.notes = notes;
      if (priority !== undefined) data.priority = priority;

      const res = await apiRequest("PATCH", `/api/saved-restaurants/${id}`, data);
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update saved restaurant");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Restaurant updated",
        description: "Your saved restaurant has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/saved-restaurants"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update restaurant",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Remove a saved restaurant
  const deleteSavedRestaurantMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/saved-restaurants/${id}`);
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to remove restaurant");
      }
      
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Restaurant removed",
        description: "The restaurant has been removed from your saved list.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/saved-restaurants"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove restaurant",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Get users who have saved a restaurant
  const useUsersWithSavedRestaurant = (restaurantId: number) => {
    return useQuery({
      queryKey: [`/api/restaurants/${restaurantId}/saved-by`],
      queryFn: async () => {
        const res = await apiRequest("GET", `/api/restaurants/${restaurantId}/saved-by`);
        return res.json();
      },
      enabled: !!restaurantId
    });
  };

  // Get restaurant overlap with another user
  const useRestaurantOverlap = (userId: number) => {
    return useQuery({
      queryKey: [`/api/users/${userId}/restaurant-overlap`],
      queryFn: async () => {
        const res = await apiRequest("GET", `/api/users/${userId}/restaurant-overlap`);
        return res.json();
      },
      enabled: !!userId
    });
  };

  return {
    savedRestaurants,
    isLoading,
    error,
    refetch,
    saveRestaurantMutation,
    updateSavedRestaurantMutation,
    deleteSavedRestaurantMutation,
    useUsersWithSavedRestaurant,
    useRestaurantOverlap
  };
}