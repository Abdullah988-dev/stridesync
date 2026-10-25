import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useReducedMotion,
} from 'react-native-reanimated';

interface StaggerItemProps {
  children: React.ReactNode;
  index?: number;
  delayStep?: number;
  direction?: 'down' | 'up';
  style?: StyleProp<ViewStyle>;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({
  children,
  index = 0,
  delayStep = 35,
  direction = 'down',
  style,
}) => {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <Animated.View style={style}>{children}</Animated.View>;
  }

  const animation = direction === 'down' ? FadeInDown : FadeInUp;

  return (
    <Animated.View
      entering={animation.duration(200).delay(Math.min(index * delayStep, 140))}
      style={style}
    >
      {children}
    </Animated.View>
  );
};
