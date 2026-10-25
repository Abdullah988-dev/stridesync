import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../theme/themeContext';
import { useTranslation } from '../../i18n/i18nContext';
import { PressableScale } from '../animated/PressableScale';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
}) => {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const { isRTL } = useTranslation();

  return (
    <View
      style={[
        styles.container,
        {
          paddingLeft: spacing.lg,
          paddingRight: rightAction ? spacing.lg : spacing.lg + 44,
          paddingVertical: spacing.md,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
      ]}
    >
      <View style={[styles.leftContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {showBack && (
          <PressableScale
            onPress={onBack}
            scaleTo={0.88}
            style={[
              styles.backButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.cardBorder,
                borderRadius: borderRadius.md,
                [isRTL ? 'marginLeft' : 'marginRight']: spacing.sm,
              },
            ]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons
              name={isRTL ? 'chevron-forward' : 'chevron-back'}
              size={22}
              color={colors.text}
            />
          </PressableScale>
        )}
        <View style={{ flex: 1 }}>
          <Text
            style={[
              typography.h2,
              { color: colors.text, textAlign: isRTL ? 'right' : 'left' },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                typography.caption,
                { color: colors.textSecondary, marginTop: 2, textAlign: isRTL ? 'right' : 'left' },
              ]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {rightAction && <View style={styles.rightContainer}>{rightAction}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
  },
  leftContainer: {
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  rightContainer: {
    marginLeft: 12,
  },
});
