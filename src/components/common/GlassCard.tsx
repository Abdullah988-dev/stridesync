import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../theme/themeContext';
import { useAuthStore } from '../../store/useAuthStore';
import { useUserStore } from '../../store/useUserStore';
import { getGlassTheme, GlassThemeId } from '../../theme/glassTheme';

export interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  blurIntensity?: number;
  variant?: 'default' | 'glow' | 'accent' | 'flat';
  noPadding?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  contentStyle,
  blurIntensity = 38,
  variant = 'default',
  noPadding = false,
}) => {
  const { colors, borderRadius, spacing } = useAppTheme();
  const { isAuthenticated, isGuest } = useAuthStore();
  const glassThemeId = useUserStore((s) => (s as any).glassTheme as GlassThemeId | undefined) || 'aurora';

  const isLiquidGlass = isAuthenticated && !isGuest;
  const currentTheme = getGlassTheme(glassThemeId);

  // 1. Guest Mode: Clean solid matte card
  if (!isLiquidGlass) {
    return (
      <View
        style={[
          styles.guestBase,
          {
            backgroundColor: colors.surface,
            borderColor: colors.cardBorder,
            borderRadius: borderRadius.xl,
            padding: noPadding ? 0 : spacing.lg,
          },
          style,
        ]}
      >
        <View style={contentStyle}>{children}</View>
      </View>
    );
  }

  // 2. Registered User: Frosted Liquid Glass Card with specular border & glow
  const isGlow = variant === 'glow' || variant === 'accent';
  const borderColor = isGlow ? currentTheme.glassBorder : 'rgba(255, 255, 255, 0.16)';
  const shadowColor = isGlow ? currentTheme.cardGlow : 'rgba(0, 0, 0, 0.5)';

  return (
    <View
      style={[
        styles.glassContainer,
        {
          borderRadius: borderRadius.xl,
          borderColor,
          shadowColor,
        },
        style,
      ]}
    >
      {/* Background Frosted Glass Blur */}
      {Platform.OS === 'web' ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: currentTheme.glassCardBg,
              backdropFilter: 'blur(24px)',
            } as any,
          ]}
        />
      ) : (
        <BlurView
          intensity={blurIntensity}
          tint="dark"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: currentTheme.glassCardBg },
          ]}
        />
      )}

      {/* Top Specular Reflection Highlight */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.18)', 'rgba(255, 255, 255, 0.02)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.specularGradient}
        pointerEvents="none"
      />

      {/* Content */}
      <View
        style={[
          styles.contentWrapper,
          {
            padding: noPadding ? 0 : spacing.lg,
          },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  guestBase: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  glassContainer: {
    borderWidth: 1.2,
    overflow: 'hidden',
    position: 'relative',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  specularGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 48,
  },
  contentWrapper: {
    position: 'relative',
    zIndex: 1,
  },
});
