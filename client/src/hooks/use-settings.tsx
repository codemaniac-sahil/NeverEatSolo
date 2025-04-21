import { useQuery, useMutation } from '@tanstack/react-query';
import { UserSettings } from '@shared/schema';
import { queryClient, getQueryFn, apiRequest } from '@/lib/queryClient';
import { useToast } from './use-toast';

export function useSettings() {
  const { toast } = useToast();

  const {
    data: settings,
    isLoading,
    error,
    refetch
  } = useQuery<UserSettings>({
    queryKey: ['/api/settings'],
    queryFn: getQueryFn(),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<UserSettings>) => {
      const res = await apiRequest('POST', '/api/settings', newSettings);
      return await res.json();
    },
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(['/api/settings'], updatedSettings);
      toast({
        title: 'Settings Updated',
        description: 'Your settings have been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update settings: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Helper function to update notification preferences
  const updateNotificationPreferences = (preferences: Record<string, boolean>) => {
    if (!settings) return;
    
    updateSettingsMutation.mutate({
      notificationPreferences: {
        ...settings.notificationPreferences,
        ...preferences
      }
    });
  };

  // Helper function to update privacy settings
  const updatePrivacySettings = (privacySettings: Record<string, string>) => {
    if (!settings) return;
    
    updateSettingsMutation.mutate({
      privacySettings: {
        ...settings.privacySettings,
        ...privacySettings
      }
    });
  };

  // Helper function to update search radius
  const updateSearchRadius = (radius: number) => {
    updateSettingsMutation.mutate({ searchRadius: radius });
  };

  // Helper function to update theme
  const updateTheme = (theme: string) => {
    updateSettingsMutation.mutate({ theme });
  };

  return {
    settings,
    isLoading,
    error,
    refetch,
    updateSettings: updateSettingsMutation.mutate,
    isUpdating: updateSettingsMutation.isPending,
    updateNotificationPreferences,
    updatePrivacySettings,
    updateSearchRadius,
    updateTheme
  };
}