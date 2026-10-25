import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '../../theme/themeContext';
import { useTranslation } from '../../i18n/i18nContext';
import { useAuthStore } from '../../store/useAuthStore';
import { useUserStore } from '../../store/useUserStore';
import { getGlassTheme, GlassThemeId } from '../../theme/glassTheme';
import { triggerHaptic } from '../../utils/soundHaptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const AnimatedTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { colors, typography, borderRadius } = useAppTheme();
  const { isRTL } = useTranslation();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();

  const { isAuthenticated, isGuest } = useAuthStore();
  const glassThemeId = useUserStore((s) => s.glassTheme as GlassThemeId) || 'aurora';
  const isMember = isAuthenticated && !isGuest;
  const currentTheme = getGlassTheme(glassThemeId);

  const numTabs = state.routes.length;
  // Margined floating bottom bar
  const barHorizontalMargin = 16;
  const barWidth = SCREEN_WIDTH - barHorizontalMargin * 2;
  const tabWidth = barWidth / numTabs;

  const indicatorTranslateX = useSharedValue(0);

  useEffect(() => {
    const targetX = isRTL
      ? (numTabs - 1 - state.index) * tabWidth
      : state.index * tabWidth;

    if (reducedMotion) {
      indicatorTranslateX.value = targetX;
    } else {
      indicatorTranslateX.value = withSpring(targetX, {
        damping: 26,
        stiffness: 380,
        mass: 0.5,
      });
    }
  }, [state.index, tabWidth, isRTL, numTabs, reducedMotion]);

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorTranslateX.value }],
    };
  });

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: isMember ? currentTheme.glassCardBg : colors.surface,
            borderColor: isMember ? currentTheme.glassBorder : colors.cardBorder,
            borderRadius: borderRadius.xxl,
            width: barWidth,
            overflow: 'hidden',
          },
        ]}
      >
        {/* Background Frosted Glass Blur for Registered Members */}
        {isMember && (
          <BlurView
            intensity={45}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        )}

        {/* Sliding Pill Indicator */}
        <Animated.View
          style={[
            styles.activeIndicator,
            {
              width: tabWidth - 12,
              marginHorizontal: 6,
              borderRadius: borderRadius.xl,
              backgroundColor: isMember ? 'rgba(255, 255, 255, 0.12)' : colors.primaryLight,
            },
            indicatorStyle,
          ]}
        />

        {/* Tab Buttons */}
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const getIconName = (): keyof typeof Ionicons.glyphMap => {
            if (route.name === 'Home') return isFocused ? 'footsteps' : 'footsteps-outline';
            if (route.name === 'Statistics') return isFocused ? 'bar-chart' : 'bar-chart-outline';
            if (route.name === 'Achievements') return isFocused ? 'trophy' : 'trophy-outline';
            return isFocused ? 'settings' : 'settings-outline';
          };

          const activeColor = isMember ? currentTheme.primary : colors.primaryDark;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              triggerHaptic('light');
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={[styles.tabButton, { width: tabWidth }]}
            >
              <Ionicons
                name={getIconName()}
                size={isFocused ? 24 : 22}
                color={isFocused ? activeColor : colors.textMuted}
              />
              <Text
                style={[
                  typography.small,
                  {
                    color: isFocused ? activeColor : colors.textMuted,
                    marginTop: 2,
                    fontWeight: isFocused ? '700' : '500',
                  },
                ]}
                numberOfLines={1}
              >
                {typeof label === 'string' ? label : route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
    pointerEvents: 'box-none',
  },
  container: {
    flexDirection: 'row',
    height: 64,
    alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 8,
  },
  activeIndicator: {
    position: 'absolute',
    top: 6,
    bottom: 6,
  },
  tabButton: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
