import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';
import { triggerHaptic } from '../../utils/soundHaptics';

export interface PressableScaleProps extends PressableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: 'light' | 'medium' | 'heavy' | 'none';
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PressableScale: React.FC<PressableScaleProps> = ({
  children,
  style,
  scaleTo = 0.96,
  haptic = 'light',
  onPress,
  onPressIn,
  onPressOut,
  disabled,
  ...props
}) => {
  const scale = useSharedValue(1);
  const reducedMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => {
    if (reducedMotion) return {};
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = (e: any) => {
    if (!disabled && !reducedMotion) {
      scale.value = withSpring(scaleTo, { damping: 15, stiffness: 300 });
    }
    if (haptic !== 'none' && !disabled) {
      triggerHaptic(haptic as any);
    }
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    if (!disabled && !reducedMotion) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
    onPressOut?.(e);
  };

  return (
    <AnimatedPressable
      android_ripple={Platform.OS === 'android' ? { color: 'rgba(255, 255, 255, 0.12)' } : undefined}
      style={[style, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
};
