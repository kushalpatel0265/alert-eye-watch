
import React, { createContext, useContext, useState, useEffect } from "react";
import { AlertSettings } from "@/types";
import { toast } from "@/components/ui/use-toast";

interface SettingsContextType {
  settings: AlertSettings;
  updateSettings: (newSettings: Partial<AlertSettings>) => void;
}

const defaultSettings: AlertSettings = {
  threshold: 0.7,
  enableEmailAlerts: true,
  enableSmsAlerts: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AlertSettings>(defaultSettings);

  useEffect(() => {
    // Load settings from localStorage
    const storedSettings = localStorage.getItem("alertSettings");
    if (storedSettings) {
      try {
        setSettings(JSON.parse(storedSettings));
      } catch (error) {
        console.error("Failed to parse stored settings:", error);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<AlertSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // Save to localStorage
    localStorage.setItem("alertSettings", JSON.stringify(updatedSettings));
    
    toast({
      title: "Settings Updated",
      description: "Your alert settings have been updated successfully",
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
