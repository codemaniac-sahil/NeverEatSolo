import SiteHeader from "@/components/layout/site-header";
import MobileNav from "@/components/layout/mobile-nav";
import { Users, Plus, Settings, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type DiningCircle = {
  id: number;
  name: string;
  description: string | null;
  isPrivate: boolean;
  createdBy: number;
  createdAt: string;
  memberCount: number;
};

const createCircleSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  isPrivate: z.boolean().default(true)
});

type CreateCircleFormValues = z.infer<typeof createCircleSchema>;

export default function DiningCirclesPage() {
  const { user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const { data: diningCircles = [], isLoading } = useQuery<DiningCircle[]>({
    queryKey: ["/api/dining-circles"],
    enabled: !!user
  });
  
  const form = useForm<CreateCircleFormValues>({
    resolver: zodResolver(createCircleSchema),
    defaultValues: {
      name: "",
      description: "",
      isPrivate: true
    }
  });
  
  const { toast } = useToast();
  
  async function handleCreateCircle(values: CreateCircleFormValues) {
    try {
      await apiRequest("POST", "/api/dining-circles", values);
      queryClient.invalidateQueries({ queryKey: ["/api/dining-circles"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Dining Circle Created",
        description: "Your new dining circle has been created successfully."
      });
    } catch (error) {
      console.error("Error creating dining circle", error);
      toast({
        title: "Error",
        description: "Failed to create dining circle",
        variant: "destructive"
      });
    }
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
              backgroundImage: `url('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
            }}
          ></div>
        </div>
        
        <div className="elegant-container relative z-10">
          <div className="max-w-2xl">
            <h1 className="elegant-heading mb-4 flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <span>Dining Circles</span>
            </h1>
            
            <p className="text-lg md:text-xl font-light text-zinc-400 mb-8 max-w-lg">
              Create and join groups to coordinate meals with friends and colleagues
            </p>
          </div>
        </div>
      </div>
      
      <main className="elegant-container py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">Your Dining Circles</h2>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Circle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={form.handleSubmit(handleCreateCircle)}>
                <DialogHeader>
                  <DialogTitle>Create a New Dining Circle</DialogTitle>
                  <DialogDescription>
                    Create a group to coordinate meals with friends or colleagues.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Circle Name</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g., Weekend Foodies" 
                      {...form.register("name")} 
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea 
                      id="description" 
                      placeholder="What's this dining circle about?" 
                      {...form.register("description")} 
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="isPrivate" 
                      checked={form.watch("isPrivate")}
                      onCheckedChange={(checked) => form.setValue("isPrivate", checked)}
                    />
                    <Label htmlFor="isPrivate">Private Circle</Label>
                  </div>
                  {form.watch("isPrivate") ? (
                    <p className="text-sm text-muted-foreground">
                      Only members can see this circle
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Anyone can discover this circle
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Circle</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full"></div>
          </div>
        ) : diningCircles.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-10">
                <Users className="h-12 w-12 mx-auto mb-5 text-muted-foreground" />
                <h3 className="mb-2 text-xl font-medium">No Dining Circles</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first dining circle to start coordinating meals with friends
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Circle
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {diningCircles.map((circle) => (
              <Card key={circle.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{circle.name}</CardTitle>
                      {circle.isPrivate && (
                        <Badge variant="outline" className="mt-1">
                          Private
                        </Badge>
                      )}
                    </div>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {circle.description && (
                    <CardDescription className="mb-6">
                      {circle.description}
                    </CardDescription>
                  )}
                  <div className="flex items-center mb-4">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {circle.memberCount} {circle.memberCount === 1 ? "member" : "members"}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/50 flex justify-between">
                  <Button variant="outline" asChild>
                    <a href={`/dining-circles/${circle.id}`}>View Details</a>
                  </Button>
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <MobileNav />
    </div>
  );
}