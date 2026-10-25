import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
  interpolateColor,
  useReducedMotion,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../theme/themeContext';
import { useTranslation } from '../../i18n/i18nContext';
import { AnimatedCounter } from './AnimatedCounter';
import { formatSteps } from '../../utils/calculations';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface AnimatedRingProps {
  steps: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
  isWalking?: boolean;
}

export const AnimatedRing: React.FC<AnimatedRingProps> = ({
  steps,
  goal,
  size = 260,
  strokeWidth = 20,
  isWalking = true,
}) => {
  const { colors, typography, borderRadius } = useAppTheme();
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Shared values
  const progress = useSharedValue(0);
  const pulseGlow = useSharedValue(1);
  const iconBounce = useSharedValue(0);

  const rawPercentage = goal > 0 ? (steps / goal) * 100 : 0;
  const targetFraction = Math.min(1.2, Math.max(0, goal > 0 ? steps / goal : 0));
  const isGoalReached = steps >= goal && goal > 0;

  useEffect(() => {
    if (reducedMotion) {
      progress.value = targetFraction;
    } else {
      progress.value = withTiming(targetFraction, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [targetFraction, reducedMotion]);

  // Subtle pulsing glow while actively walking
  useEffect(() => {
    if (isWalking && !reducedMotion) {
      pulseGlow.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 900, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      iconBounce.value = withRepeat(
        withSequence(
          withTiming(-4, { duration: 400, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 400, easing: Easing.in(Easing.quad) })
        ),
        -1,
        true
      );
    } else {
      pulseGlow.value = 1;
      iconBounce.value = 0;
    }
  }, [isWalking, reducedMotion]);

  // Animated circle props
  const animatedCircleProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - progress.value * circumference;
    return {
      strokeDashoffset,
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    if (reducedMotion) return {};
    return {
      transform: [{ scale: pulseGlow.value }],
      opacity: interpolate(pulseGlow.value, [1, 1.08], [0.6, 1]),
    };
  });

  const iconStyle = useAnimatedStyle(() => {
    if (reducedMotion) return {};
    return {
      transform: [{ translateY: iconBounce.value }],
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer Pulse Glow Ring */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            width: size - 10,
            height: size - 10,
            borderRadius: borderRadius.full,
            backgroundColor: isGoalReached ? 'rgba(52, 211, 153, 0.15)' : colors.ringGlow,
          },
          glowStyle,
        ]}
      />

      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} />
            <Stop offset="50%" stopColor={isGoalReached ? '#34D399' : colors.secondary} />
            <Stop offset="100%" stopColor={isGoalReached ? '#F59E0B' : '#06B6D4'} />
          </LinearGradient>
        </Defs>

        {/* Background track circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.ringBackground}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Animated active progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringGrad)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedCircleProps}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Center Metrics Content */}
      <View style={styles.innerContent}>
        <Animated.View
          style={[
            styles.iconBadge,
            {
              backgroundColor: isGoalReached ? colors.primaryLight : colors.divider,
              borderRadius: borderRadius.full,
            },
            iconStyle,
          ]}
        >
          <Ionicons
            name={isGoalReached ? 'trophy' : 'footsteps'}
            size={24}
            color={isGoalReached ? colors.primaryDark : colors.primary}
          />
        </Animated.View>

        <AnimatedCounter
          value={steps}
          duration={1200}
          style={[typography.hero, { color: colors.text, marginTop: 4 }]}
        />

        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          {t('ofGoal', { goal: formatSteps(goal) })}
        </Text>

        <View
          style={[
            styles.percentPill,
            {
              backgroundColor: isGoalReached ? colors.primaryLight : colors.divider,
              borderRadius: borderRadius.full,
              borderColor: isGoalReached ? colors.primary : 'transparent',
            },
          ]}
        >
          {isGoalReached && (
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={colors.primaryDark}
              style={{ marginRight: 4 }}
            />
          )}
          <Text
            style={[
              typography.small,
              { color: isGoalReached ? colors.primaryDark : colors.textSecondary },
            ]}
          >
            {Math.round(rawPercentage)}%
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  glowRing: {
    position: 'absolute',
  },
  svg: {
    position: 'absolute',
  },
  innerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadge: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
    borderWidth: 1,
  },
});
