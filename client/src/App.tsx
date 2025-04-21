import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProfilePage from "@/pages/profile-page";
import OnboardingPage from "@/pages/onboarding-page";
import MessagingPage from "@/pages/messaging-page";
import SavedRestaurantsPage from "@/pages/saved-restaurants-page";
import MatchesPage from "@/pages/matches-page";
import RestaurantsPage from "@/pages/restaurants-page";
import FriendsPage from "@/pages/friends-page";
import DiningCirclesPage from "@/pages/dining-circles-page";
import RecommendationsPage from "@/pages/recommendations-page";
import AvailabilityPage from "@/pages/availability-page";
import SettingsPage from "@/pages/settings-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <ProtectedRoute path="/" component={HomePage} />
      </Route>
      <Route path="/profile">
        <ProtectedRoute path="/profile" component={ProfilePage} />
      </Route>
      <Route path="/onboarding">
        <ProtectedRoute path="/onboarding" component={OnboardingPage} />
      </Route>
      <Route path="/messages">
        <ProtectedRoute path="/messages" component={MessagingPage} />
      </Route>
      <Route path="/saved">
        <ProtectedRoute path="/saved" component={SavedRestaurantsPage} />
      </Route>
      <Route path="/matches">
        <ProtectedRoute path="/matches" component={MatchesPage} />
      </Route>
      <Route path="/restaurants">
        <ProtectedRoute path="/restaurants" component={RestaurantsPage} />
      </Route>
      <Route path="/friends">
        <ProtectedRoute path="/friends" component={FriendsPage} />
      </Route>
      <Route path="/dining-circles">
        <ProtectedRoute path="/dining-circles" component={DiningCirclesPage} />
      </Route>
      <Route path="/recommendations">
        <ProtectedRoute path="/recommendations" component={RecommendationsPage} />
      </Route>
      <Route path="/availability">
        <ProtectedRoute path="/availability" component={AvailabilityPage} />
      </Route>
      <Route path="/settings">
        <ProtectedRoute path="/settings" component={SettingsPage} />
      </Route>
      <Route path="/auth" component={AuthPage} />
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
