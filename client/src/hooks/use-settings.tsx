import { useQuery, useMutation } from '@tanstack/react-query';
import { UserSettings } from '@shared/schema';
import { queryClient, getQueryFn, apiRequest } from '@/lib/queryClient';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

export function useSettings() {
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    data: settings,
    isLoading,
    error,
    refetch
  } = useQuery<UserSettings | undefined>({
    queryKey: ['/api/user/settings'],
    queryFn: getQueryFn(),
    enabled: !!user,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: Partial<UserSettings>) => {
      const res = await apiRequest('PATCH', '/api/user/settings', updatedSettings);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/settings'] });
      toast({
        title: 'Settings Updated',
        description: 'Your settings have been saved successfully.',
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

  const updateNotificationPreferencesMutation = useMutation({
    mutationFn: async (preferences: Record<string, boolean>) => {
      const updates = {
        notificationPreferences: {
          ...(settings?.notificationPreferences as Record<string, boolean>),
          ...preferences
        }
      };
      const res = await apiRequest('PATCH', '/api/user/settings', updates);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/settings'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update notification preferences: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updatePrivacySettingsMutation = useMutation({
    mutationFn: async (privacySettings: Record<string, string>) => {
      const updates = {
        privacySettings: {
          ...(settings?.privacySettings as Record<string, string>),
          ...privacySettings
        }
      };
      const res = await apiRequest('PATCH', '/api/user/settings', updates);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/settings'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update privacy settings: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updateSearchRadiusMutation = useMutation({
    mutationFn: async (radius: number) => {
      const updates = { searchRadius: radius };
      const res = await apiRequest('PATCH', '/api/user/settings', updates);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/settings'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update search radius: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updateThemeMutation = useMutation({
    mutationFn: async (theme: string) => {
      const updates = { theme };
      const res = await apiRequest('PATCH', '/api/user/settings', updates);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/settings'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update theme: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    settings,
    isLoading,
    error,
    refetch,
    updateSettings: updateSettingsMutation.mutate,
    isUpdating: updateSettingsMutation.isPending,
    updateNotificationPreferences: updateNotificationPreferencesMutation.mutate,
    updatePrivacySettings: updatePrivacySettingsMutation.mutate,
    updateSearchRadius: updateSearchRadiusMutation.mutate,
    updateTheme: updateThemeMutation.mutate,
  };
}