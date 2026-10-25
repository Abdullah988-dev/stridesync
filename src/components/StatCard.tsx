import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/themeContext';
import { PressableScale } from './animated/PressableScale';

export interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  iconName,
  color,
  bgColor,
  onPress,
}) => {
  const { colors, typography, borderRadius, spacing, shadows } = useAppTheme();

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.96}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: borderRadius.xl,
          borderColor: colors.cardBorder,
          ...shadows.subtle,
        },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: bgColor,
            borderRadius: borderRadius.md,
            marginBottom: spacing.sm,
          },
        ]}
      >
        <Ionicons name={iconName} size={20} color={color} />
      </View>

      <Text style={[typography.caption, { color: colors.textSecondary }]}>{title}</Text>

      <View style={styles.valueRow}>
        <Text style={[typography.h3, { color: colors.text, fontWeight: '700' }]}>{value}</Text>
        {unit && (
          <Text
            style={[
              typography.caption,
              { color: colors.textMuted, marginLeft: 4, alignSelf: 'flex-end', marginBottom: 2 },
            ]}
          >
            {unit}
          </Text>
        )}
      </View>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
    minWidth: 95,
  },
  iconContainer: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
});
