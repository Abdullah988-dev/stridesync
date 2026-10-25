export type GlassThemeId = 'aurora' | 'sunset' | 'ocean' | 'forest' | 'rose' | 'graphite';

export interface MeshBlob {
  color: string;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  size: number;
}

export interface GlassThemeConfig {
  id: GlassThemeId;
  name: string;
  subtitle: string;
  primary: string;
  secondary: string;
  accent: string;
  gradient: [string, string, string];
  ringGradient: [string, string];
  glassCardBg: string;
  glassBorder: string;
  glassHighlight: string;
  ringGlow: string;
  cardGlow: string;
  blobs: MeshBlob[];
}

export const GLASS_THEMES: Record<GlassThemeId, GlassThemeConfig> = {
  aurora: {
    id: 'aurora',
    name: 'Aurora',
    subtitle: 'Electric Violet & Cyan',
    primary: '#8B5CF6',
    secondary: '#06B6D4',
    accent: '#EC4899',
    gradient: ['#7C3AED', '#06B6D4', '#EC4899'],
    ringGradient: ['#8B5CF6', '#06B6D4'],
    glassCardBg: 'rgba(30, 27, 75, 0.62)',
    glassBorder: 'rgba(167, 139, 250, 0.28)',
    glassHighlight: 'rgba(255, 255, 255, 0.12)',
    ringGlow: 'rgba(139, 92, 246, 0.45)',
    cardGlow: 'rgba(124, 58, 237, 0.25)',
    blobs: [
      { color: 'rgba(124, 58, 237, 0.40)', top: -60, left: -40, size: 300 },
      { color: 'rgba(6, 182, 212, 0.32)', top: 220, right: -60, size: 280 },
      { color: 'rgba(236, 72, 153, 0.24)', bottom: 120, left: -20, size: 260 },
    ],
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    subtitle: 'Crimson Flame & Amber',
    primary: '#F97316',
    secondary: '#EC4899',
    accent: '#8B5CF6',
    gradient: ['#F97316', '#EC4899', '#8B5CF6'],
    ringGradient: ['#F97316', '#EC4899'],
    glassCardBg: 'rgba(67, 20, 7, 0.62)',
    glassBorder: 'rgba(251, 146, 60, 0.28)',
    glassHighlight: 'rgba(255, 255, 255, 0.12)',
    ringGlow: 'rgba(249, 115, 22, 0.45)',
    cardGlow: 'rgba(249, 115, 22, 0.25)',
    blobs: [
      { color: 'rgba(249, 115, 22, 0.40)', top: -60, right: -40, size: 300 },
      { color: 'rgba(236, 72, 153, 0.32)', top: 240, left: -60, size: 280 },
      { color: 'rgba(139, 92, 246, 0.24)', bottom: 100, right: -20, size: 260 },
    ],
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    subtitle: 'Deep Marine & Azure',
    primary: '#0EA5E9',
    secondary: '#2563EB',
    accent: '#14B8A6',
    gradient: ['#0EA5E9', '#2563EB', '#14B8A6'],
    ringGradient: ['#38BDF8', '#0EA5E9'],
    glassCardBg: 'rgba(8, 47, 73, 0.62)',
    glassBorder: 'rgba(56, 189, 248, 0.28)',
    glassHighlight: 'rgba(255, 255, 255, 0.12)',
    ringGlow: 'rgba(14, 165, 233, 0.45)',
    cardGlow: 'rgba(14, 165, 233, 0.25)',
    blobs: [
      { color: 'rgba(14, 165, 233, 0.40)', top: -50, left: -50, size: 300 },
      { color: 'rgba(37, 99, 235, 0.32)', top: 260, right: -50, size: 280 },
      { color: 'rgba(20, 184, 166, 0.24)', bottom: 80, left: -30, size: 260 },
    ],
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    subtitle: 'Neon Emerald & Lime',
    primary: '#10B981',
    secondary: '#84CC16',
    accent: '#0D9488',
    gradient: ['#10B981', '#84CC16', '#0D9488'],
    ringGradient: ['#34D399', '#10B981'],
    glassCardBg: 'rgba(6, 78, 59, 0.62)',
    glassBorder: 'rgba(52, 211, 153, 0.28)',
    glassHighlight: 'rgba(255, 255, 255, 0.12)',
    ringGlow: 'rgba(16, 185, 129, 0.45)',
    cardGlow: 'rgba(16, 185, 129, 0.25)',
    blobs: [
      { color: 'rgba(16, 185, 129, 0.40)', top: -60, left: -40, size: 300 },
      { color: 'rgba(132, 204, 22, 0.28)', top: 230, right: -60, size: 280 },
      { color: 'rgba(13, 148, 136, 0.24)', bottom: 120, left: -20, size: 260 },
    ],
  },
  rose: {
    id: 'rose',
    name: 'Rose Gold',
    subtitle: 'Ruby Red & Peach',
    primary: '#F43F5E',
    secondary: '#FB7185',
    accent: '#F59E0B',
    gradient: ['#F43F5E', '#FB7185', '#F59E0B'],
    ringGradient: ['#FB7185', '#F43F5E'],
    glassCardBg: 'rgba(76, 5, 25, 0.62)',
    glassBorder: 'rgba(251, 113, 133, 0.28)',
    glassHighlight: 'rgba(255, 255, 255, 0.12)',
    ringGlow: 'rgba(244, 63, 94, 0.45)',
    cardGlow: 'rgba(244, 63, 94, 0.25)',
    blobs: [
      { color: 'rgba(244, 63, 94, 0.40)', top: -60, right: -40, size: 300 },
      { color: 'rgba(251, 113, 133, 0.32)', top: 250, left: -50, size: 280 },
      { color: 'rgba(245, 158, 11, 0.24)', bottom: 90, right: -30, size: 260 },
    ],
  },
  graphite: {
    id: 'graphite',
    name: 'Graphite',
    subtitle: 'Stealth Titanium & Slate',
    primary: '#94A3B8',
    secondary: '#64748B',
    accent: '#38BDF8',
    gradient: ['#475569', '#334155', '#1E293B'],
    ringGradient: ['#CBD5E1', '#64748B'],
    glassCardBg: 'rgba(30, 41, 59, 0.70)',
    glassBorder: 'rgba(148, 163, 184, 0.28)',
    glassHighlight: 'rgba(255, 255, 255, 0.12)',
    ringGlow: 'rgba(148, 163, 184, 0.35)',
    cardGlow: 'rgba(71, 85, 105, 0.25)',
    blobs: [
      { color: 'rgba(148, 163, 184, 0.28)', top: -50, left: -40, size: 300 },
      { color: 'rgba(71, 85, 105, 0.32)', top: 240, right: -50, size: 280 },
      { color: 'rgba(56, 189, 248, 0.18)', bottom: 100, left: -20, size: 260 },
    ],
  },
};

export const getGlassTheme = (id: GlassThemeId = 'aurora'): GlassThemeConfig => {
  return GLASS_THEMES[id] || GLASS_THEMES.aurora;
};
