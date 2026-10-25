import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/themeContext';
import { useTranslation } from '../i18n/i18nContext';
import { getQuoteForToday } from '../utils/quotes';

export const DailyQuoteCard: React.FC = () => {
  const { colors, typography, borderRadius, spacing, shadows } = useAppTheme();
  const { t, isRTL } = useTranslation();
  const quote = getQuoteForToday();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: borderRadius.xl,
          borderColor: colors.cardBorder,
          padding: spacing.lg,
          ...shadows.subtle,
        },
      ]}
    >
      <View style={[styles.headerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View
          style={[
            styles.bulbCircle,
            {
              backgroundColor: colors.accentLight,
              borderRadius: borderRadius.full,
            },
          ]}
        >
          <Ionicons name="bulb-outline" size={18} color={colors.accent} />
        </View>

        <Text
          style={[
            typography.caption,
            {
              color: colors.accent,
              fontWeight: '700',
              marginHorizontal: 8,
            },
          ]}
        >
          {t('motivationalQuote')}
        </Text>
      </View>

      <Text
        style={[
          typography.body,
          {
            color: colors.text,
            fontStyle: 'italic',
            marginTop: spacing.sm,
            textAlign: isRTL ? 'right' : 'left',
            lineHeight: 22,
          },
        ]}
      >
        "{quote.text}"
      </Text>

      <Text
        style={[
          typography.caption,
          {
            color: colors.textMuted,
            marginTop: 8,
            textAlign: isRTL ? 'left' : 'right',
            fontWeight: '600',
          },
        ]}
      >
        — {quote.author}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    marginVertical: 8,
  },
  headerRow: {
    alignItems: 'center',
  },
  bulbCircle: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
