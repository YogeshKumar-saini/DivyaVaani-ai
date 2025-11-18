'use client';

/**
 * Global Application Context
 * Manages user session, preferences, and global UI state
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserPreferences {
  language: string;
  voiceEnabled: boolean;
  autoPlayAudio: boolean;
  notificationsEnabled: boolean;
}

export interface AppState {
  user: {
    id: string;
    preferences: UserPreferences;
  };
  session: {
    startTime: Date;
    queryCount: number;
  };
  ui: {
    sidebarOpen: boolean;
    mobileNavOpen: boolean;
  };
}

interface AppContextType {
  state: AppState;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  incrementQueryCount: () => void;
  toggleSidebar: () => void;
  toggleMobileNav: () => void;
  setMobileNavOpen: (open: boolean) => void;
}

const defaultPreferences: UserPreferences = {
  language: 'en',
  voiceEnabled: true,
  autoPlayAudio: true,
  notificationsEnabled: true,
};

const defaultState: AppState = {
  user: {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    preferences: defaultPreferences,
  },
  session: {
    startTime: new Date(),
    queryCount: 0,
  },
  ui: {
    sidebarOpen: true,
    mobileNavOpen: false,
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        setState(prev => ({
          ...prev,
          user: {
            ...prev.user,
            preferences: { ...defaultPreferences, ...preferences },
          },
        }));
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    }

    // Load user ID from localStorage or create new one
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
      setState(prev => ({
        ...prev,
        user: {
          ...prev.user,
          id: savedUserId,
        },
      }));
    } else {
      localStorage.setItem('userId', state.user.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updatePreferences = (preferences: Partial<UserPreferences>) => {
    setState(prev => {
      const newPreferences = {
        ...prev.user.preferences,
        ...preferences,
      };
      
      // Save to localStorage
      localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
      
      return {
        ...prev,
        user: {
          ...prev.user,
          preferences: newPreferences,
        },
      };
    });
  };

  const incrementQueryCount = () => {
    setState(prev => ({
      ...prev,
      session: {
        ...prev.session,
        queryCount: prev.session.queryCount + 1,
      },
    }));
  };

  const toggleSidebar = () => {
    setState(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        sidebarOpen: !prev.ui.sidebarOpen,
      },
    }));
  };

  const toggleMobileNav = () => {
    setState(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        mobileNavOpen: !prev.ui.mobileNavOpen,
      },
    }));
  };

  const setMobileNavOpen = (open: boolean) => {
    setState(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        mobileNavOpen: open,
      },
    }));
  };

  return (
    <AppContext.Provider
      value={{
        state,
        updatePreferences,
        incrementQueryCount,
        toggleSidebar,
        toggleMobileNav,
        setMobileNavOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
