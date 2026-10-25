import React, { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  useReducedMotion,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../theme/themeContext';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface ShimmerSkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const ShimmerSkeleton: React.FC<ShimmerSkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const { colors, isDark } = useAppTheme();
  const progress = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!reducedMotion) {
      progress.value = withRepeat(
        withTiming(1, { duration: 1200 }),
        -1, // infinite
        false
      );
    }
  }, [reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => {
    if (reducedMotion) return {};
    const translateX = interpolate(progress.value, [0, 1], [-200, 200]);
    return {
      transform: [{ translateX }],
    };
  });

  const baseBg = isDark ? '#1E293B' : '#E2E8F0';
  const shimmerHighlight = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.4)';

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: baseBg,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <AnimatedLinearGradient
        colors={[baseBg, shimmerHighlight, baseBg]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[StyleSheet.absoluteFill, animatedStyle]}
      />
    </View>
  );
};
