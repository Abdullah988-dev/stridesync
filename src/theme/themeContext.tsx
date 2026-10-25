import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, ColorTheme } from './colors';
import { spacing, borderRadius, shadows } from './spacing';
import { typography } from './typography';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: ColorTheme;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  typography: typeof typography;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'system',
  isDark: false,
  colors: lightColors,
  spacing,
  borderRadius,
  shadows,
  typography,
  setMode: () => {},
});

interface ThemeProviderProps {
  children: React.ReactNode;
  userThemeMode?: ThemeMode;
  onThemeChange?: (mode: ThemeMode) => void;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  userThemeMode = 'dark',
  onThemeChange,
}) => {
  const systemColorScheme = useColorScheme();

  const isDark = useMemo(() => {
    if (userThemeMode === 'dark') return true;
    if (userThemeMode === 'light') return false;
    return systemColorScheme !== 'light';
  }, [userThemeMode, systemColorScheme]);

  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);

  const setMode = (mode: ThemeMode) => {
    if (onThemeChange) {
      onThemeChange(mode);
    }
  };

  const value = useMemo(
    () => ({
      mode: userThemeMode,
      isDark,
      colors,
      spacing,
      borderRadius,
      shadows,
      typography,
      setMode,
    }),
    [userThemeMode, isDark, colors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = (): ThemeContextType => useContext(ThemeContext);
