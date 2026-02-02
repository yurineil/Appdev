import { MD3LightTheme } from 'react-native-paper';

export const appTheme = {
  ...MD3LightTheme,
  roundness: 18,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1d4ed8',
    secondary: '#0ea5e9',
    tertiary: '#22c55e',
    background: '#f4f7fb',
    surface: '#ffffff',
    surfaceVariant: '#e7eef8',
    outline: '#c7d2e5',
    onSurface: '#0f172a',
    onSurfaceVariant: '#64748b',
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level1: '#f8fafc',
      level2: '#f1f5f9',
      level3: '#e7eef8',
    },
  },
};
