import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CONFETTI_COLORS = [
  '#10B981', // emerald
  '#0284C7', // blue
  '#F59E0B', // amber
  '#EC4899', // pink
  '#8B5CF6', // violet
  '#34D399', // mint
  '#F43F5E', // rose
];

interface ParticleProps {
  x: number;
  delay: number;
  color: string;
  size: number;
}

const ConfettiParticle: React.FC<ParticleProps> = ({ x, delay, color, size }) => {
  const translateY = useRef(new Animated.Value(-30)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT + 20,
          duration: 2500 + Math.random() * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(1800),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, [delay]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${360 * (Math.random() > 0.5 ? 2 : -2)}deg`],
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: x,
          width: size,
          height: size * (Math.random() > 0.5 ? 1.5 : 0.8),
          backgroundColor: color,
          opacity,
          transform: [{ translateY }, { rotate: spin }],
        },
      ]}
    />
  );
};

export const ConfettiOverlay: React.FC = () => {
  const particles = useRef(
    Array.from({ length: 45 }, (_, i) => ({
      id: i,
      x: Math.random() * (SCREEN_WIDTH - 20),
      delay: Math.random() * 800,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 8 + Math.random() * 8,
    }))
  ).current;

  return (
    <View pointerEvents="none" style={styles.overlay}>
      {particles.map((p) => (
        <ConfettiParticle key={p.id} {...p} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  particle: {
    position: 'absolute',
    top: 0,
    borderRadius: 2,
  },
});
