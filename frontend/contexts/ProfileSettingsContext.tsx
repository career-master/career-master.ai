'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiService } from '@/lib/api';
import {
  PROFILE_COMPLETION_ENFORCED as DEFAULT_ENFORCED,
  PROFILE_MIN_COMPLETION_PERCENT as DEFAULT_MIN_PERCENT,
} from '@/lib/profileConfig';

type ProfileSettings = {
  profileCompletionEnforced: boolean;
  profileMinCompletionPercent: number;
};

const defaultSettings: ProfileSettings = {
  profileCompletionEnforced: DEFAULT_ENFORCED,
  profileMinCompletionPercent: DEFAULT_MIN_PERCENT,
};

const ProfileSettingsContext = createContext<{
  profileCompletionEnforced: boolean;
  profileMinCompletionPercent: number;
  loading: boolean;
  refetch: () => Promise<void>;
}>({
  ...defaultSettings,
  loading: true,
  refetch: async () => {},
});

export function ProfileSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ProfileSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await apiService.getSettings();
      if (res.success && res.data) {
        setSettings({
          profileCompletionEnforced: res.data.profileCompletionEnforced ?? defaultSettings.profileCompletionEnforced,
          profileMinCompletionPercent: res.data.profileMinCompletionPercent ?? defaultSettings.profileMinCompletionPercent,
        });
      }
    } catch {
      // keep defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <ProfileSettingsContext.Provider
      value={{
        profileCompletionEnforced: settings.profileCompletionEnforced,
        profileMinCompletionPercent: settings.profileMinCompletionPercent,
        loading,
        refetch: fetchSettings,
      }}
    >
      {children}
    </ProfileSettingsContext.Provider>
  );
}

export function useProfileSettings() {
  return useContext(ProfileSettingsContext);
}
