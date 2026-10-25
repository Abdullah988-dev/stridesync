export interface ColorTheme {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryGradient: [string, string];
  secondary: string;
  secondaryLight: string;
  secondaryGradient: [string, string];
  accent: string;
  accentLight: string;
  accentGradient: [string, string];
  flameGradient: [string, string];
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceElevated: string;
  surfaceGlass: string;
  card: string;
  cardBorder: string;
  cardGlassBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  divider: string;
  success: string;
  warning: string;
  error: string;
  ringBackground: string;
  ringGlow: string;
  badgeLocked: string;
  badgeLockedBorder: string;
  inputBackground: string;
  inputBorder: string;
  inputFocusBorder: string;
  statDistance: string;
  statCalories: string;
  statActiveTime: string;
}

export const lightColors: ColorTheme = {
  primary: '#10B981', // Vibrant Emerald (Apple Fitness/Nike style)
  primaryLight: '#D1FAE5',
  primaryDark: '#059669',
  primaryGradient: ['#10B981', '#059669'],
  secondary: '#0284C7', // Electric Sky
  secondaryLight: '#E0F2FE',
  secondaryGradient: ['#38BDF8', '#0284C7'],
  accent: '#F59E0B', // Energetic Amber
  accentLight: '#FEF3C7',
  accentGradient: ['#FBBF24', '#F59E0B'],
  flameGradient: ['#FB923C', '#EF4444'],
  background: '#F8FAFC',
  backgroundSecondary: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceGlass: 'rgba(255, 255, 255, 0.85)',
  card: '#FFFFFF',
  cardBorder: '#E2E8F0',
  cardGlassBorder: 'rgba(255, 255, 255, 0.6)',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  divider: '#F1F5F9',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  ringBackground: '#E2E8F0',
  ringGlow: 'rgba(16, 185, 129, 0.3)',
  badgeLocked: '#F1F5F9',
  badgeLockedBorder: '#CBD5E1',
  inputBackground: '#F8FAFC',
  inputBorder: '#CBD5E1',
  inputFocusBorder: '#10B981',
  statDistance: '#0284C7',
  statCalories: '#F97316',
  statActiveTime: '#8B5CF6',
};

export const darkColors: ColorTheme = {
  primary: '#10B981', // Neon Emerald
  primaryLight: '#064E3B',
  primaryDark: '#047857',
  primaryGradient: ['#34D399', '#10B981'],
  secondary: '#38BDF8', // Cyan Glow
  secondaryLight: '#082F49',
  secondaryGradient: ['#38BDF8', '#0284C7'],
  accent: '#FBBF24', // Electric Gold
  accentLight: '#451A03',
  accentGradient: ['#FDE047', '#F59E0B'],
  flameGradient: ['#FB923C', '#F43F5E'],
  background: '#0F172A', // Slate 900 (Lighter, premium dark theme)
  backgroundSecondary: '#1E293B', // Slate 800
  surface: '#1E293B', // Slate 800
  surfaceElevated: '#334155', // Slate 700
  surfaceGlass: 'rgba(30, 41, 59, 0.85)',
  card: '#1E293B',
  cardBorder: 'rgba(148, 163, 184, 0.15)',
  cardGlassBorder: 'rgba(255, 255, 255, 0.10)',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#334155',
  divider: '#334155',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  ringBackground: '#334155',
  ringGlow: 'rgba(16, 185, 129, 0.45)',
  badgeLocked: '#1E293B',
  badgeLockedBorder: '#334155',
  inputBackground: '#1E293B',
  inputBorder: '#334155',
  inputFocusBorder: '#34D399',
  statDistance: '#38BDF8',
  statCalories: '#FB923C',
  statActiveTime: '#A78BFA',
};
