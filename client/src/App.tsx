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
import TeamCirclesPage from "@/pages/team-circles-page";
import CampusRestaurantsPage from "@/pages/campus-restaurants-page";
import CorporateEventsPage from "@/pages/corporate-events-page";
import ReceiptsPage from "@/pages/receipts-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/onboarding" component={OnboardingPage} />
      <ProtectedRoute path="/messages" component={MessagingPage} />
      <ProtectedRoute path="/saved" component={SavedRestaurantsPage} />
      <ProtectedRoute path="/matches" component={MatchesPage} />
      <ProtectedRoute path="/restaurants" component={RestaurantsPage} />
      <ProtectedRoute path="/friends" component={FriendsPage} />
      <ProtectedRoute path="/dining-circles" component={DiningCirclesPage} />
      <ProtectedRoute path="/recommendations" component={RecommendationsPage} />
      <ProtectedRoute path="/availability" component={AvailabilityPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/team-circles" component={TeamCirclesPage} />
      <ProtectedRoute path="/campus-restaurants" component={CampusRestaurantsPage} />
      <ProtectedRoute path="/corporate-events" component={CorporateEventsPage} />
      <ProtectedRoute path="/receipts" component={ReceiptsPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
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
