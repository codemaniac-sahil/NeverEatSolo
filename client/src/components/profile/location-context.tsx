import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Map, Home, Plane, Briefcase, MapPin } from "lucide-react";

interface LocationContextData {
  locationContext: string;
  locationContextNote: string;
}

export default function LocationContext() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [locationContext, setLocationContext] = useState<string>(
    user?.locationContext || "local"
  );
  const [locationContextNote, setLocationContextNote] = useState<string>(
    user?.locationContextNote || ""
  );

  const updateLocationContext = useMutation({
    mutationFn: async (data: LocationContextData) => {
      if (!user) throw new Error("Not authenticated");
      const res = await apiRequest("PATCH", `/api/users/${user.id}/location-context`, data);
      return res.json();
    },
    onSuccess: (data) => {
      // Update the user data in the cache
      queryClient.setQueryData(["/api/user"], {
        ...user,
        locationContext: data.locationContext,
        locationContextNote: data.locationContextNote,
      });
      
      toast({
        title: "Location context updated",
        description: "Your location information has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update location context",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    updateLocationContext.mutate({
      locationContext,
      locationContextNote,
    });
  };

  const getContextIcon = (context: string) => {
    switch (context) {
      case 'local':
        return <Home className="h-4 w-4" />;
      case 'tourist':
        return <Plane className="h-4 w-4" />;
      case 'visiting':
        return <MapPin className="h-4 w-4" />;
      case 'networking':
        return <Briefcase className="h-4 w-4" />;
      default:
        return <Map className="h-4 w-4" />;
    }
  };

  const getContextLabel = (context: string) => {
    switch (context) {
      case 'local':
        return "I live here";
      case 'tourist':
        return "I'm visiting as a tourist";
      case 'visiting':
        return "I'm visiting for work/other reasons";
      case 'networking':
        return "I'm looking to network";
      default:
        return "Other";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <Map className="h-5 w-5 mr-2" />
          <CardTitle>Location Context</CardTitle>
        </div>
        <CardDescription>
          Let others know why you're in this area
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="locationContext">Your reason for being here</Label>
          <Select 
            value={locationContext} 
            onValueChange={setLocationContext}
            disabled={updateLocationContext.isPending}
          >
            <SelectTrigger id="locationContext" className="flex items-center">
              <span className="flex items-center">
                {getContextIcon(locationContext)}
                <span className="ml-2">{getContextLabel(locationContext)}</span>
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="local" className="flex items-center">
                <span className="flex items-center">
                  <Home className="h-4 w-4 mr-2" />
                  I live here
                </span>
              </SelectItem>
              <SelectItem value="tourist">
                <span className="flex items-center">
                  <Plane className="h-4 w-4 mr-2" />
                  I'm visiting as a tourist
                </span>
              </SelectItem>
              <SelectItem value="visiting">
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  I'm visiting for work/other reasons
                </span>
              </SelectItem>
              <SelectItem value="networking">
                <span className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" />
                  I'm looking to network
                </span>
              </SelectItem>
              <SelectItem value="other">
                <span className="flex items-center">
                  <Map className="h-4 w-4 mr-2" />
                  Other
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="locationContextNote">Additional notes (optional)</Label>
          <Textarea
            id="locationContextNote"
            placeholder="Share more details about why you're in this area, e.g., 'Visiting for a conference until Friday'"
            value={locationContextNote}
            onChange={(e) => setLocationContextNote(e.target.value)}
            disabled={updateLocationContext.isPending}
            rows={3}
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={updateLocationContext.isPending}
          className="w-full"
        >
          {updateLocationContext.isPending ? "Updating..." : "Update Location Context"}
        </Button>
      </CardContent>
    </Card>
  );
}