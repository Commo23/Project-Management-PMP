import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Theme management
const applyTheme = (theme: 'light' | 'dark' | 'system') => {
  const root = document.documentElement;
  
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
};

export interface AppSettings {
  // General
  projectMode: 'waterfall' | 'agile' | 'hybrid';
  notifications: boolean;
  autoSave: boolean;
  autoSaveInterval: number; // seconds
  
  // Project
  projectName: string;
  projectDescription: string;
  projectStartDate?: string;
  projectEndDate?: string;
  projectManager?: string;
  
  // Display
  theme: 'light' | 'dark' | 'system';
  dateFormat: 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'DD-MM-YYYY';
  timeFormat: '12h' | '24h';
  density: 'compact' | 'comfortable' | 'spacious';
  fontSize: 'small' | 'medium' | 'large';
  showSidebar: boolean;
  confidentialMode: boolean; // Hide sensitive information
  
  // Kanban
  kanbanShowStoryPoints: boolean;
  kanbanShowEstimatedHours: boolean;
  kanbanShowDueDates: boolean;
  kanbanShowTags: boolean;
  kanbanShowAssignees: boolean;
  kanbanCardSize: 'small' | 'medium' | 'large';
  kanbanAutoSave: boolean;
  
  // WBS
  wbsShowBudget: boolean;
  wbsShowProgress: boolean;
  wbsShowDates: boolean;
  wbsShowResponsible: boolean;
  wbsShowLinkedItems: boolean;
  wbsExpandAll: boolean;
  
  // RACI
  raciShowPhases: boolean;
  raciShowWBS: boolean;
  raciShowTasks: boolean;
  raciShowDeliverables: boolean;
  raciValidateSingleAccountable: boolean;
  
  // Risks
  risksShowMatrix: boolean;
  risksShowCategories: boolean;
  risksShowResponseStrategies: boolean;
  risksAutoCalculateScore: boolean;
  risksShowDates: boolean;
  
  // Stakeholders
  stakeholdersShowMatrix: boolean;
  stakeholdersShowEngagement: boolean;
  stakeholdersShowInteractions: boolean;
  stakeholdersShowContactInfo: boolean;
  
  // Team
  teamShowWorkload: boolean;
  teamShowSkills: boolean;
  teamShowCertifications: boolean;
  teamShowPerformance: boolean;
  teamShowAvailability: boolean;
  
  // Requirements
  requirementsShowTraceability: boolean;
  requirementsShowValidation: boolean;
  requirementsShowHierarchy: boolean;
  requirementsAutoGenerateCode: boolean;
  
  // Timeline/Gantt
  ganttShowDependencies: boolean;
  ganttShowProgress: boolean;
  ganttShowResources: boolean;
  ganttShowCosts: boolean;
  ganttZoomLevel: 'day' | 'week' | 'month';
  
  // Charts
  chartsShowBurndown: boolean;
  chartsShowVelocity: boolean;
  chartsShowProgress: boolean;
  chartsRefreshInterval: number; // seconds
  
  // Export
  exportIncludeAllData: boolean;
  exportFormat: 'json' | 'csv' | 'pdf';
  exportCompress: boolean;
  
  // Advanced
  enableAnalytics: boolean;
  enableErrorReporting: boolean;
  cacheEnabled: boolean;
  cacheDuration: number; // minutes
  maxHistoryEntries: number;
}

const defaultSettings: AppSettings = {
  // General
  projectMode: 'waterfall',
  notifications: true,
  autoSave: true,
  autoSaveInterval: 30,
  
  // Project
  projectName: 'My Project',
  projectDescription: '',
  
  // Display
  theme: 'system',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h',
  density: 'compact',
  fontSize: 'small',
  showSidebar: true,
  confidentialMode: false,
  
  // Kanban
  kanbanShowStoryPoints: true,
  kanbanShowEstimatedHours: true,
  kanbanShowDueDates: true,
  kanbanShowTags: true,
  kanbanShowAssignees: true,
  kanbanCardSize: 'medium',
  kanbanAutoSave: true,
  
  // WBS
  wbsShowBudget: true,
  wbsShowProgress: true,
  wbsShowDates: true,
  wbsShowResponsible: true,
  wbsShowLinkedItems: true,
  wbsExpandAll: false,
  
  // RACI
  raciShowPhases: true,
  raciShowWBS: true,
  raciShowTasks: true,
  raciShowDeliverables: true,
  raciValidateSingleAccountable: true,
  
  // Risks
  risksShowMatrix: true,
  risksShowCategories: true,
  risksShowResponseStrategies: true,
  risksAutoCalculateScore: true,
  risksShowDates: true,
  
  // Stakeholders
  stakeholdersShowMatrix: true,
  stakeholdersShowEngagement: true,
  stakeholdersShowInteractions: true,
  stakeholdersShowContactInfo: true,
  
  // Team
  teamShowWorkload: true,
  teamShowSkills: true,
  teamShowCertifications: true,
  teamShowPerformance: true,
  teamShowAvailability: true,
  
  // Requirements
  requirementsShowTraceability: true,
  requirementsShowValidation: true,
  requirementsShowHierarchy: true,
  requirementsAutoGenerateCode: true,
  
  // Timeline/Gantt
  ganttShowDependencies: true,
  ganttShowProgress: true,
  ganttShowResources: true,
  ganttShowCosts: true,
  ganttZoomLevel: 'week',
  
  // Charts
  chartsShowBurndown: true,
  chartsShowVelocity: true,
  chartsShowProgress: true,
  chartsRefreshInterval: 60,
  
  // Export
  exportIncludeAllData: true,
  exportFormat: 'json',
  exportCompress: false,
  
  // Advanced
  enableAnalytics: false,
  enableErrorReporting: true,
  cacheEnabled: true,
  cacheDuration: 60,
  maxHistoryEntries: 1000,
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
  resetSection: (section: keyof AppSettings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('pmp-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with defaults, but ensure density and fontSize are set if not present
        const merged = { ...defaultSettings, ...parsed };
        // If density or fontSize are not in saved settings, use defaults
        if (!parsed.density) merged.density = defaultSettings.density;
        if (!parsed.fontSize) merged.fontSize = defaultSettings.fontSize;
        return merged;
      } catch (e) {
        console.error('Error loading settings:', e);
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    // Save to localStorage whenever settings change
    localStorage.setItem('pmp-settings', JSON.stringify(settings));
    
    // Apply theme
    applyTheme(settings.theme);
    
    // Apply density and font size
    const root = document.documentElement;
    root.setAttribute('data-density', settings.density);
    root.setAttribute('data-font-size', settings.fontSize);
    
    // Listen for system theme changes
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings]);

  // Apply theme, density and font size on mount (initial load)
  useEffect(() => {
    applyTheme(settings.theme);
    
    // Apply density and font size immediately on mount
    const root = document.documentElement;
    root.setAttribute('data-density', settings.density);
    root.setAttribute('data-font-size', settings.fontSize);
  }, []); // Only run once on mount

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      
      // Apply theme immediately if changed
      if (updates.theme !== undefined) {
        applyTheme(updates.theme);
      }
      
      // Apply density and font size immediately if changed
      const root = document.documentElement;
      if (updates.density !== undefined) {
        root.setAttribute('data-density', updates.density);
      }
      if (updates.fontSize !== undefined) {
        root.setAttribute('data-font-size', updates.fontSize);
      }
      
      return newSettings;
    });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const resetSection = (section: keyof AppSettings) => {
    setSettings(prev => ({ ...prev, [section]: defaultSettings[section] }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings, resetSection }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

