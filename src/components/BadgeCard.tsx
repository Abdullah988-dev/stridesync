import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
  useReducedMotion,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/themeContext';
import { useTranslation } from '../i18n/i18nContext';
import { Badge } from '../store/useAchievementsStore';
import { Translations } from '../i18n/translations';
import { PressableScale } from './animated/PressableScale';

export interface BadgeCardProps {
  badge: Badge;
  onPress?: () => void;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const BadgeCard: React.FC<BadgeCardProps> = ({ badge, onPress }) => {
  const { colors, typography, borderRadius } = useAppTheme();
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();

  const isUnlocked = Boolean(badge.unlockedAt);
  const title = t(badge.titleKey as keyof Translations);
  const description = t(badge.descKey as keyof Translations);

  // 3D Flip & Shine Animation for Unlocked Badges
  const flip = useSharedValue(isUnlocked ? 1 : 0);
  const shineTranslate = useSharedValue(0);

  useEffect(() => {
    if (isUnlocked && !reducedMotion) {
      flip.value = withSpring(1, { damping: 12, stiffness: 120 });
      shineTranslate.value = withRepeat(
        withTiming(1, { duration: 2500 }),
        -1,
        false
      );
    }
  }, [isUnlocked, reducedMotion]);

  const flipStyle = useAnimatedStyle(() => {
    if (reducedMotion) return {};
    const rotateY = `${interpolate(flip.value, [0, 1], [180, 0])}deg`;
    return {
      transform: [{ rotateY }],
    };
  });

  const shineStyle = useAnimatedStyle(() => {
    if (reducedMotion || !isUnlocked) return {};
    const translateX = interpolate(shineTranslate.value, [0, 1], [-100, 100]);
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.96}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: borderRadius.xl,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      {/* 1. Icon Slot (Fixed 52px height) */}
      <View style={styles.iconSlot}>
        <Animated.View style={flipStyle}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: colors.divider,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <Ionicons
              name={badge.iconName as any}
              size={26}
              color={isUnlocked ? colors.primary : colors.textMuted}
            />

            {/* Shine Sweep Effect for Unlocked Badges */}
            {isUnlocked && !reducedMotion && (
              <AnimatedLinearGradient
                colors={['transparent', 'rgba(255, 255, 255, 0.3)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[StyleSheet.absoluteFill, shineStyle]}
              />
            )}
          </View>
        </Animated.View>
      </View>

      {/* 2. Title Slot (Fixed 40px height for 100% horizontal alignment) */}
      <View style={styles.titleSlot}>
        <Text
          style={[
            typography.caption,
            styles.titleText,
            { color: colors.text },
          ]}
          numberOfLines={2}
        >
          {title}
        </Text>
      </View>

      {/* 3. Description Slot (Fixed 42px height for 100% horizontal alignment) */}
      <View style={styles.descSlot}>
        <Text
          style={[
            typography.small,
            styles.descText,
            { color: colors.textSecondary },
          ]}
          numberOfLines={3}
        >
          {description}
        </Text>
      </View>

      {/* 4. Footer Status Pill (Fixed 28px height, identical background and shape) */}
      <View style={styles.footerSlot}>
        {isUnlocked ? (
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: colors.divider,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={12}
              color={colors.primary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                typography.small,
                { color: colors.text, fontWeight: '700', fontSize: 11 },
              ]}
            >
              {t('unlocked')}
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: colors.divider,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <Ionicons
              name="lock-closed"
              size={11}
              color={colors.textMuted}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                typography.small,
                { color: colors.textMuted, fontWeight: '600', fontSize: 11 },
              ]}
            >
              {t('locked')}
            </Text>
          </View>
        )}
      </View>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 206,
    alignItems: 'center',
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
  iconSlot: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    overflow: 'hidden',
  },
  titleSlot: {
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    paddingHorizontal: 2,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16.5,
    textAlign: 'center',
  },
  descSlot: {
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    paddingHorizontal: 2,
  },
  descText: {
    fontSize: 10.5,
    lineHeight: 14,
    textAlign: 'center',
  },
  footerSlot: {
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
});
