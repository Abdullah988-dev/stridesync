import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useAppTheme } from '../../theme/themeContext';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'elevated' | 'glass' | 'outlined' | 'flat';
}

export const Card: React.FC<CardProps> = ({ children, style, variant = 'elevated' }) => {
  const { colors, borderRadius, shadows, spacing } = useAppTheme();

  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      backgroundColor: colors.card,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
    };

    if (variant === 'elevated') {
      return {
        ...base,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        ...shadows.card,
      };
    }

    if (variant === 'glass') {
      return {
        ...base,
        backgroundColor: colors.surfaceGlass,
        borderWidth: 1,
        borderColor: colors.cardGlassBorder,
        ...shadows.subtle,
      };
    }

    if (variant === 'outlined') {
      return {
        ...base,
        borderWidth: 1.5,
        borderColor: colors.border,
      };
    }

    return {
      ...base,
      backgroundColor: colors.surface,
    };
  };

  return <View style={[getContainerStyle(), style]}>{children}</View>;
};
