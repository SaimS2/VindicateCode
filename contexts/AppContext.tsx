
import React, { createContext, useState, ReactNode } from 'react';
import { AppMode } from '../types';

interface AppContextType {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
}

export const AppContext = createContext<AppContextType>({
  appMode: 'clinical',
  setAppMode: () => {},
});

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [appMode, setAppMode] = useState<AppMode>('clinical');

  return (
    <AppContext.Provider value={{ appMode, setAppMode }}>
      {children}
    </AppContext.Provider>
  );
};
