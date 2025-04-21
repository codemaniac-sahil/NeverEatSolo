import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  MapPin, 
  Clock, 
  Coffee, 
  Utensils, 
  Pizza, 
  DollarSign, 
  Star, 
  Building,
  Search,
  FilterX
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { queryClient } from '@/lib/queryClient';

interface CampusRestaurant {
  id: number;
  name: string;
  description: string;
  address: string;
  imageUrl: string;
  cuisine: string;
  priceRange: string;
  rating: number;
  hours: string;
  organizationId: number;
  workspaceId: number;
  createdAt: Date;
}

interface Workspace {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  organizationId: number;
}

export default function CampusRestaurantsPage() {
  const { user } = useAuth();
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCuisine, setFilterCuisine] = useState('all');
  const [filterPrice, setFilterPrice] = useState('all');

  // Fetch workspaces
  const { 
    data: workspaces,
    isLoading: isLoadingWorkspaces
  } = useQuery<Workspace[]>({
    queryKey: ['/api/organizations', user?.organizationId, 'workspaces'],
    enabled: !!user?.organizationId
  });

  // Fetch campus restaurants
  const { 
    data: restaurants,
    isLoading: isLoadingRestaurants,
    refetch: refetchRestaurants
  } = useQuery<CampusRestaurant[]>({
    queryKey: [
      selectedWorkspace === 'all' 
        ? `/api/organizations/${user?.organizationId}/campus-restaurants`
        : `/api/workspaces/${selectedWorkspace}/campus-restaurants`
    ],
    enabled: !!user?.organizationId
  });

  // Effect to refetch restaurants when workspace changes
  useEffect(() => {
    if (selectedWorkspace) {
      refetchRestaurants();
    }
  }, [selectedWorkspace, refetchRestaurants]);

  // Filter restaurants based on search and filters
  const filteredRestaurants = restaurants?.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          restaurant.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = filterCuisine === 'all' || restaurant.cuisine === filterCuisine;
    const matchesPrice = filterPrice === 'all' || restaurant.priceRange === filterPrice;
    
    return matchesSearch && matchesCuisine && matchesPrice;
  });

  // Get unique cuisine types for filter
  const cuisineTypes = restaurants 
    ? Array.from(new Set<string>(restaurants.map(r => r.cuisine)))
    : [];

  // Loading state
  if (isLoadingWorkspaces || isLoadingRestaurants) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If user doesn't belong to an organization
  if (!user?.organizationId) {
    return (
      <div className="container py-10">
        <div className="max-w-md mx-auto bg-muted p-6 rounded-md text-center">
          <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">No Organization Found</h1>
          <p className="text-sm text-muted-foreground mb-4">
            You need to be part of a corporate organization to view campus restaurants.
          </p>
        </div>
      </div>
    );
  }

  // If no restaurants found
  if (!restaurants || restaurants.length === 0) {
    return (
      <div className="container py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Campus Restaurants</h1>
          {workspaces && workspaces.length > 0 && (
            <div className="w-60">
              <Select 
                value={selectedWorkspace}
                onValueChange={setSelectedWorkspace}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select workspace" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {workspaces.map(workspace => (
                    <SelectItem key={workspace.id} value={workspace.id.toString()}>
                      {workspace.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        <div className="max-w-md mx-auto bg-muted p-6 rounded-md text-center mt-12">
          <Utensils className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">No Restaurants Found</h1>
          <p className="text-sm text-muted-foreground mb-4">
            There are no campus restaurants added for your organization yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Campus Restaurants</h1>
        {workspaces && workspaces.length > 0 && (
          <div className="w-60">
            <Select 
              value={selectedWorkspace}
              onValueChange={setSelectedWorkspace}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select workspace" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {workspaces.map(workspace => (
                  <SelectItem key={workspace.id} value={workspace.id.toString()}>
                    {workspace.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        <div className="relative md:col-span-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search restaurants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="md:col-span-3">
          <Select 
            value={filterCuisine}
            onValueChange={setFilterCuisine}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by cuisine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cuisines</SelectItem>
              {cuisineTypes.map(cuisine => (
                <SelectItem key={cuisine} value={cuisine}>
                  {cuisine}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="md:col-span-3">
          <Select 
            value={filterPrice}
            onValueChange={setFilterPrice}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Price Ranges</SelectItem>
              <SelectItem value="$">$ (Budget)</SelectItem>
              <SelectItem value="$$">$$ (Moderate)</SelectItem>
              <SelectItem value="$$$">$$$ (Expensive)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reset Filters Button - Only show if filters are applied */}
      {(searchQuery || filterCuisine !== 'all' || filterPrice !== 'all') && (
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setFilterCuisine('all');
              setFilterPrice('all');
            }}
            className="text-xs"
          >
            <FilterX className="h-3 w-3 mr-1" />
            Reset Filters
          </Button>
        </div>
      )}

      {/* Results Count */}
      {filteredRestaurants && (
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredRestaurants.length} of {restaurants.length} restaurants
        </p>
      )}

      {/* Restaurant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRestaurants && filteredRestaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} workspaces={workspaces || []} />
        ))}
      </div>
    </div>
  );
}

function RestaurantCard({ restaurant, workspaces }: { restaurant: CampusRestaurant, workspaces: Workspace[] }) {
  // Find the workspace name
  const workspace = workspaces.find(w => w.id === restaurant.workspaceId);
  
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="relative pb-[56.25%] bg-muted">
        {restaurant.imageUrl ? (
          <img 
            src={restaurant.imageUrl} 
            alt={restaurant.name} 
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <Utensils className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md">
          {restaurant.priceRange}
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{restaurant.name}</CardTitle>
          <div className="flex items-center bg-muted px-2 py-1 rounded">
            <Star className="h-3 w-3 text-yellow-500 mr-1 fill-yellow-500" />
            <span className="text-xs font-medium">{restaurant.rating.toFixed(1)}</span>
          </div>
        </div>
        <CardDescription className="flex items-center mt-1">
          <MapPin className="h-3 w-3 mr-1" />
          {workspace?.name || "Main Campus"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {restaurant.description}
        </p>
        
        <div className="flex items-center text-xs text-muted-foreground mb-2">
          <Coffee className="h-3 w-3 mr-1" />
          <span>{restaurant.cuisine}</span>
        </div>
        
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          <span>{restaurant.hours || "Hours not available"}</span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button variant="outline" size="sm" className="w-full">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}