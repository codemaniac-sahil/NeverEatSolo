import SiteHeader from "@/components/layout/site-header";
import MobileNav from "@/components/layout/mobile-nav";
import { Sparkles, RefreshCw, ThumbsUp, Store, Users } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

type Restaurant = {
  id: number;
  name: string;
  cuisine: string;
  priceRange: string;
  address: string;
  locationLat: string;
  locationLng: string;
  rating: string;
  image: string | null;
  activeUserCount: number | null;
};

type Recommendation = {
  id: number;
  userId: number;
  restaurantId: number;
  score: number;
  reason: string;
  createdAt: string;
  viewedAt: string | null;
  restaurant: Restaurant;
};

export default function RecommendationsPage() {
  const { user } = useAuth();
  
  const { 
    data: recommendations = [], 
    isLoading,
    refetch
  } = useQuery<Recommendation[]>({
    queryKey: ["/api/recommendations"],
    enabled: !!user
  });
  
  const { toast } = useToast();
  
  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/recommendations/generate");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
      toast({
        title: "Recommendations Generated",
        description: "New restaurant recommendations based on your preferences",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate recommendations",
        variant: "destructive"
      });
    }
  });
  
  const markViewedMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/recommendations/${id}/viewed`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
    }
  });
  
  // Filter for unviewed recommendations
  const newRecommendations = recommendations.filter(rec => !rec.viewedAt);
  
  // Filter for viewed recommendations
  const viewedRecommendations = recommendations.filter(rec => rec.viewedAt);
  
  function handleMarkViewed(id: number) {
    markViewedMutation.mutate(id);
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
              backgroundImage: `url('https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80')`
            }}
          ></div>
        </div>
        
        <div className="elegant-container relative z-10">
          <div className="max-w-2xl">
            <h1 className="elegant-heading mb-4 flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              <span>Recommendations</span>
            </h1>
            
            <p className="text-lg md:text-xl font-light text-zinc-400 mb-8 max-w-lg">
              Discover restaurants tailored to your preferences and dining history
            </p>
            
            <Button 
              onClick={() => generateMutation.mutate()} 
              disabled={generateMutation.isPending}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${generateMutation.isPending ? "animate-spin" : ""}`} />
              Generate New Recommendations
            </Button>
          </div>
        </div>
      </div>
      
      <main className="elegant-container py-12">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full"></div>
          </div>
        ) : recommendations.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-10">
                <Sparkles className="h-12 w-12 mx-auto mb-5 text-muted-foreground" />
                <h3 className="mb-2 text-xl font-medium">No Recommendations Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Generate your first set of personalized restaurant recommendations
                </p>
                <Button 
                  onClick={() => generateMutation.mutate()} 
                  disabled={generateMutation.isPending}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${generateMutation.isPending ? "animate-spin" : ""}`} />
                  Generate Recommendations
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {newRecommendations.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">New Recommendations</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {newRecommendations.map((rec) => (
                    <Card key={rec.id} className="overflow-hidden">
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          src={rec.restaurant.image || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=450&q=80'}
                          alt={rec.restaurant.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{rec.restaurant.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge>{rec.restaurant.cuisine}</Badge>
                              <Badge variant="outline">{rec.restaurant.priceRange}</Badge>
                            </div>
                          </div>
                          <div className="bg-primary/10 text-primary font-medium rounded-full px-3 py-1 text-sm">
                            {rec.score}% Match
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="mb-4">
                          {rec.restaurant.address}
                        </CardDescription>
                        <div className="bg-muted/50 rounded-lg p-3 mb-4">
                          <p className="text-sm text-muted-foreground italic">
                            "{rec.reason}"
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter className="bg-muted/50 flex justify-between">
                        <Button 
                          variant="outline" 
                          onClick={() => handleMarkViewed(rec.id)}
                        >
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Like
                        </Button>
                        <Button asChild>
                          <a href={`/restaurants/${rec.restaurant.id}`}>
                            <Store className="h-4 w-4 mr-2" />
                            View Restaurant
                          </a>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {viewedRecommendations.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Previous Recommendations</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {viewedRecommendations.map((rec) => (
                    <Card key={rec.id} className="overflow-hidden opacity-75 hover:opacity-100 transition-opacity">
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          src={rec.restaurant.image || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=450&q=80'}
                          alt={rec.restaurant.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{rec.restaurant.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge>{rec.restaurant.cuisine}</Badge>
                              <Badge variant="outline">{rec.restaurant.priceRange}</Badge>
                            </div>
                          </div>
                          <div className="bg-primary/10 text-primary font-medium rounded-full px-3 py-1 text-sm">
                            {rec.score}% Match
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="mb-4">
                          {rec.restaurant.address}
                        </CardDescription>
                      </CardContent>
                      <CardFooter className="bg-muted/50 flex justify-end">
                        <Button variant="outline" asChild>
                          <a href={`/restaurants/${rec.restaurant.id}`}>
                            <Store className="h-4 w-4 mr-2" />
                            View Restaurant
                          </a>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
      
      <MobileNav />
    </div>
  );
}