import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/themeContext';
import { useTranslation } from '../i18n/i18nContext';
import { formatSteps } from '../utils/calculations';

interface ProgressRingProps {
  steps: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  steps,
  goal,
  size = 250,
  strokeWidth = 18,
}) => {
  const { colors, typography, borderRadius } = useAppTheme();
  const { t } = useTranslation();

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const rawProgress = goal > 0 ? steps / goal : 0;
  const progress = Math.min(1, Math.max(0, rawProgress));
  const strokeDashoffset = circumference - progress * circumference;
  const percentage = Math.round(rawProgress * 100);
  const isGoalReached = steps >= goal && goal > 0;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} />
            <Stop offset="100%" stopColor={isGoalReached ? '#34D399' : colors.secondary} />
          </LinearGradient>
        </Defs>

        {/* Background Track Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.ringBackground}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Foreground Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Center Metrics */}
      <View style={styles.innerContent}>
        <View
          style={[
            styles.iconBadge,
            {
              backgroundColor: isGoalReached ? colors.primaryLight : colors.divider,
              borderRadius: borderRadius.full,
            },
          ]}
        >
          <Ionicons
            name={isGoalReached ? 'trophy' : 'footsteps'}
            size={22}
            color={isGoalReached ? colors.primaryDark : colors.primary}
          />
        </View>

        <Text style={[typography.hero, { color: colors.text, marginTop: 4 }]}>
          {formatSteps(steps)}
        </Text>

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
            {percentage}%
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
  svg: {
    position: 'absolute',
  },
  innerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadge: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 8,
    borderWidth: 1,
  },
});
