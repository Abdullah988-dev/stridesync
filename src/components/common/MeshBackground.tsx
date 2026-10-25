import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';
import { useAppTheme } from '../../theme/themeContext';
import { useAuthStore } from '../../store/useAuthStore';
import { useUserStore } from '../../store/useUserStore';
import { getGlassTheme, GlassThemeId } from '../../theme/glassTheme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MeshBackgroundProps {
  children?: React.ReactNode;
}

export const MeshBackground: React.FC<MeshBackgroundProps> = ({ children }) => {
  const { colors } = useAppTheme();
  const { isAuthenticated, isGuest } = useAuthStore();
  const glassThemeId = useUserStore((s) => (s as any).glassTheme as GlassThemeId | undefined) || 'aurora';
  const reducedMotion = useReducedMotion();

  const isLiquidGlassActive = isAuthenticated && !isGuest;
  const currentTheme = getGlassTheme(glassThemeId);

  // Animated drift values for ambient blobs
  const floatAnim1 = useSharedValue(0);
  const floatAnim2 = useSharedValue(0);

  useEffect(() => {
    if (!isLiquidGlassActive || reducedMotion) return;

    floatAnim1.value = withRepeat(
      withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );

    floatAnim2.value = withRepeat(
      withTiming(1, { duration: 11000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [isLiquidGlassActive, reducedMotion]);

  const blob1Style = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: floatAnim1.value * 25 - 12 },
        { translateY: floatAnim1.value * 35 - 18 },
        { scale: 1 + floatAnim1.value * 0.08 },
      ],
    };
  });

  const blob2Style = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: -floatAnim2.value * 30 + 15 },
        { translateY: -floatAnim2.value * 28 + 14 },
        { scale: 1 + floatAnim2.value * 0.1 },
      ],
    };
  });

  // Guest / Simple mode fallback: pure matte solid background
  if (!isLiquidGlassActive) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {children}
      </View>
    );
  }

  // Registered / Liquid Glass mode: ambient multi-layered gradient mesh
  const [b1, b2, b3] = currentTheme.blobs;

  return (
    <View style={[styles.root, { backgroundColor: '#090D16' }]}>
      {/* Background Ambient Mesh Blobs */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Blob 1 */}
        {b1 && (
          <Animated.View
            style={[
              styles.meshBlob,
              {
                width: b1.size,
                height: b1.size,
                borderRadius: b1.size / 2,
                backgroundColor: b1.color,
                top: b1.top,
                left: b1.left,
                right: b1.right,
                bottom: b1.bottom,
              },
              reducedMotion ? undefined : blob1Style,
            ]}
          />
        )}

        {/* Blob 2 */}
        {b2 && (
          <Animated.View
            style={[
              styles.meshBlob,
              {
                width: b2.size,
                height: b2.size,
                borderRadius: b2.size / 2,
                backgroundColor: b2.color,
                top: b2.top,
                left: b2.left,
                right: b2.right,
                bottom: b2.bottom,
              },
              reducedMotion ? undefined : blob2Style,
            ]}
          />
        )}

        {/* Blob 3 */}
        {b3 && (
          <View
            style={[
              styles.meshBlob,
              {
                width: b3.size,
                height: b3.size,
                borderRadius: b3.size / 2,
                backgroundColor: b3.color,
                top: b3.top,
                left: b3.left,
                right: b3.right,
                bottom: b3.bottom,
                opacity: 0.8,
              },
            ]}
          />
        )}

        {/* Micro-dot ambient noise / overlay tint for deep depth */}
        <View style={[StyleSheet.absoluteFill, styles.darkOverlay]} />
      </View>

      {/* Screen Content */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  meshBlob: {
    position: 'absolute',
    opacity: 0.85,
  },
  darkOverlay: {
    backgroundColor: 'rgba(9, 13, 22, 0.45)',
  },
});
