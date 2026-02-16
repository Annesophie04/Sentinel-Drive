/**
 * Settings context — provides global access to user preferences
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserSettings, DEFAULT_SETTINGS } from '../types';
import { loadSettings, saveSetting } from '../services/database';

interface SettingsContextValue {
  settings: UserSettings;
  ready: boolean;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  ready: false,
  updateSetting: async () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadSettings()
      .then((s) => {
        setSettings(s);
        setReady(true);
      })
      .catch(() => setReady(true));
  }, []);

  const updateSetting = useCallback(
    async <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
      await saveSetting(key, value);
    },
    []
  );

  return (
    <SettingsContext.Provider value={{ settings, ready, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
