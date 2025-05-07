import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, RouteComponentProps } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

// Toggle this to true to allow demo mode (bypass authentication)
const DEMO_MODE = true;

type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType<any>;
};

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading, error } = useAuth();
  const { toast } = useToast();

  // Bypass authentication check in demo mode
  if (DEMO_MODE) {
    return (
      <Route path={path}>
        {(params) => <Component params={params} />}
      </Route>
    );
  }
  
  // Check for authentication errors and show toast notification
  useEffect(() => {
    if (error) {
      toast({
        title: "Authentication error",
        description: error.message || "Please log in again",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <Route path={path}>
      {(params) => {
        try {
          if (isLoading) {
            return (
              <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            );
          }

          if (!user) {
            return <Redirect to="/auth" />;
          }
          
          // Pass any route params to the component
          return <Component params={params} />;
        } catch (err) {
          console.error("Protected route error:", err);
          return <Redirect to="/auth" />;
        }
      }}
    </Route>
  );
}
