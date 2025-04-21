import React from 'react';
import { useSettings } from '@/hooks/use-settings';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Loader2, 
  Settings, 
  BellRing, 
  Lock, 
  Map, 
  Moon, 
  Sun,
  Briefcase,
  Building
} from 'lucide-react';
import { UserSettings } from '@shared/schema';

export default function SettingsPage() {
  const { user } = useAuth();
  const { 
    settings, 
    isLoading, 
    updateSettings, 
    isUpdating,
    updateNotificationPreferences,
    updatePrivacySettings,
    updateSearchRadius,
    updateTheme
  } = useSettings();

  const handleNotificationChange = (key: string, value: boolean) => {
    updateNotificationPreferences({ [key]: value });
  };

  const handlePrivacyChange = (key: string, value: string) => {
    updatePrivacySettings({ [key]: value });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Default settings if none exist yet
  const defaultSettings = {
    id: 0,
    userId: user?.id || 0,
    theme: 'dark',
    notificationPreferences: {
      messages: true,
      friendRequests: true,
      invitations: true,
      mealReminders: true,
      recommendations: true,
      nearbyUsers: true,
    },
    privacySettings: {
      profileVisibility: 'public',
      locationVisibility: 'friends',
      availabilityVisibility: 'friends',
      savedRestaurantsVisibility: 'friends',
    },
    searchRadius: 10,
    customUI: {},
    lastUpdated: new Date(),
  } as UserSettings;

  const currentSettings = settings || defaultSettings;
  
  // Type-safe accessors with proper typing
  const theme = currentSettings.theme;
  const searchRadius = currentSettings.searchRadius;
  
  // Initialize default values for notification preferences and privacy settings if they don't exist
  const defaultNotificationPrefs = {
    messages: true,
    friendRequests: true,
    invitations: true,
    mealReminders: true,
    recommendations: true,
    nearbyUsers: true,
  };
  
  const defaultPrivacySettings = {
    profileVisibility: 'public',
    locationVisibility: 'friends',
    availabilityVisibility: 'friends',
    savedRestaurantsVisibility: 'friends',
  };
  
  // Use existing values or defaults
  const notificationPreferences = currentSettings.notificationPreferences 
    ? (currentSettings.notificationPreferences as typeof defaultNotificationPrefs)
    : defaultNotificationPrefs;
    
  const privacySettings = currentSettings.privacySettings
    ? (currentSettings.privacySettings as typeof defaultPrivacySettings)
    : defaultPrivacySettings;

  return (
    <div className="container max-w-3xl py-10">
      <div className="flex items-center mb-8">
        <Settings className="h-7 w-7 mr-2" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="grid gap-6">
        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <BellRing className="h-5 w-5 mr-2" />
              <CardTitle>Notification Preferences</CardTitle>
            </div>
            <CardDescription>
              Configure which notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="messages" className="flex-1">Direct Messages</Label>
              <Switch 
                id="messages" 
                checked={notificationPreferences.messages}
                onCheckedChange={(checked) => handleNotificationChange('messages', checked)}
                disabled={isUpdating}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="friendRequests" className="flex-1">Friend Requests</Label>
              <Switch 
                id="friendRequests" 
                checked={notificationPreferences.friendRequests}
                onCheckedChange={(checked) => handleNotificationChange('friendRequests', checked)}
                disabled={isUpdating}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="invitations" className="flex-1">Meal Invitations</Label>
              <Switch 
                id="invitations" 
                checked={notificationPreferences.invitations}
                onCheckedChange={(checked) => handleNotificationChange('invitations', checked)}
                disabled={isUpdating}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="mealReminders" className="flex-1">Meal Reminders</Label>
              <Switch 
                id="mealReminders" 
                checked={notificationPreferences.mealReminders}
                onCheckedChange={(checked) => handleNotificationChange('mealReminders', checked)}
                disabled={isUpdating}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="recommendations" className="flex-1">Restaurant Recommendations</Label>
              <Switch 
                id="recommendations" 
                checked={notificationPreferences.recommendations}
                onCheckedChange={(checked) => handleNotificationChange('recommendations', checked)}
                disabled={isUpdating}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="nearbyUsers" className="flex-1">Nearby Users Alerts</Label>
              <Switch 
                id="nearbyUsers" 
                checked={notificationPreferences.nearbyUsers}
                onCheckedChange={(checked) => handleNotificationChange('nearbyUsers', checked)}
                disabled={isUpdating}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              <CardTitle>Privacy Settings</CardTitle>
            </div>
            <CardDescription>
              Control who can see your information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="profileVisibility">Profile Visibility</Label>
              <Select 
                value={privacySettings.profileVisibility} 
                onValueChange={(value) => handlePrivacyChange('profileVisibility', value)}
                disabled={isUpdating}
              >
                <SelectTrigger id="profileVisibility">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public (Everyone)</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                  <SelectItem value="private">Private (Only Me)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="locationVisibility">Location Visibility</Label>
              <Select 
                value={privacySettings.locationVisibility} 
                onValueChange={(value) => handlePrivacyChange('locationVisibility', value)}
                disabled={isUpdating}
              >
                <SelectTrigger id="locationVisibility">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public (Everyone)</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                  <SelectItem value="private">Private (Only Me)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="availabilityVisibility">Availability Visibility</Label>
              <Select 
                value={privacySettings.availabilityVisibility} 
                onValueChange={(value) => handlePrivacyChange('availabilityVisibility', value)}
                disabled={isUpdating}
              >
                <SelectTrigger id="availabilityVisibility">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public (Everyone)</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                  <SelectItem value="private">Private (Only Me)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="savedRestaurantsVisibility">Saved Restaurants Visibility</Label>
              <Select 
                value={privacySettings.savedRestaurantsVisibility} 
                onValueChange={(value) => handlePrivacyChange('savedRestaurantsVisibility', value)}
                disabled={isUpdating}
              >
                <SelectTrigger id="savedRestaurantsVisibility">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public (Everyone)</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                  <SelectItem value="private">Private (Only Me)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Location Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Map className="h-5 w-5 mr-2" />
              <CardTitle>Location Settings</CardTitle>
            </div>
            <CardDescription>
              Configure your search radius for finding users and restaurants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="searchRadius">Search Radius (km)</Label>
                  <span className="text-sm">{searchRadius} km</span>
                </div>
                <Slider
                  id="searchRadius"
                  min={1}
                  max={50}
                  step={1}
                  value={[searchRadius]}
                  onValueChange={([value]) => updateSearchRadius(value)}
                  disabled={isUpdating}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Corporate Profile */}
        {user?.organizationId && (
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                <CardTitle>Corporate Profile</CardTitle>
              </div>
              <CardDescription>
                Configure your work profile settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="useWorkProfile" className="flex-1 mb-1 block">Use Work Profile</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between your personal and work profiles
                  </p>
                </div>
                <Switch 
                  id="useWorkProfile" 
                  checked={user?.useWorkProfile ?? false}
                  onCheckedChange={(checked) => {
                    // Call API to toggle work profile
                    fetch('/api/user/toggle-work-profile', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ useWorkProfile: checked }),
                    }).then(res => {
                      if (res.ok) {
                        // Refresh the user data
                        window.location.reload();
                      }
                    });
                  }}
                  disabled={isUpdating}
                />
              </div>

              <div className="pt-2">
                <div className="bg-muted p-3 rounded-md">
                  <div className="flex items-center mb-2">
                    <Briefcase className="h-4 w-4 mr-2 text-primary" />
                    <span className="font-medium">Current Profile:</span>
                    <span className="ml-2 px-2 py-1 bg-primary/20 text-primary rounded text-xs font-medium">
                      {user?.useWorkProfile ? 'Work' : 'Personal'}
                    </span>
                  </div>
                  {user?.useWorkProfile ? (
                    <p className="text-sm text-muted-foreground">
                      You're using your work profile. You'll see team members, campus restaurants, and work-related recommendations.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      You're using your personal profile. Switch to work profile to see team members, campus restaurants, and work-related recommendations.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Appearance */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 mr-2" />
              ) : (
                <Sun className="h-5 w-5 mr-2" />
              )}
              <CardTitle>Appearance</CardTitle>
            </div>
            <CardDescription>
              Customize how the app looks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Label htmlFor="theme">Theme</Label>
              <Select 
                value={theme} 
                onValueChange={(value) => updateTheme(value)}
                disabled={isUpdating}
              >
                <SelectTrigger id="theme">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}