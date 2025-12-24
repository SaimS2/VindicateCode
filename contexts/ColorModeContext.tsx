import React, { createContext, ReactNode, useContext } from 'react';

// This context is now a no-op to remove the grayscale filter functionality.
// The file is kept to avoid potential build issues with orphan imports.
interface ColorModeContextType {}
export const ColorModeContext = createContext<ColorModeContextType>({});

interface ColorModeProviderProps {
  children: ReactNode;
}

export const ColorModeProvider: React.FC<ColorModeProviderProps> = ({ children }) => {
  return <>{children}</>;
};

export const useColorMode = () => useContext(ColorModeContext);
