import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../theme/themeContext';
import { useTranslation } from '../i18n/i18nContext';
import { Button } from '../components/common/Button';
import { PressableScale } from '../components/animated/PressableScale';
import { triggerHaptic } from '../utils/soundHaptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const { t, isRTL } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const slides = [
    {
      id: '1',
      title: t('onboardingTitle1'),
      desc: t('onboardingDesc1'),
      icon: 'footsteps' as const,
      color: colors.primary,
      gradient: colors.primaryGradient || [colors.primary, '#00D2FF'],
      bg: colors.primaryLight,
    },
    {
      id: '2',
      title: t('onboardingTitle2'),
      desc: t('onboardingDesc2'),
      icon: 'fitness' as const,
      color: colors.secondary,
      gradient: colors.secondaryGradient || [colors.secondary, '#00C853'],
      bg: colors.secondaryLight,
    },
    {
      id: '3',
      title: t('onboardingTitle3'),
      desc: t('onboardingDesc3'),
      icon: 'trophy' as const,
      color: colors.accent,
      gradient: colors.accentGradient || [colors.accent, '#FF9500'],
      bg: colors.accentLight,
    },
  ];

  const handleNext = () => {
    triggerHaptic('light');
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    triggerHaptic('light');
    onComplete();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Bar with Skip */}
      <View
        style={[
          styles.topBar,
          {
            paddingHorizontal: spacing.lg,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        <View style={styles.brandRow}>
          <LinearGradient
            colors={colors.primaryGradient || [colors.primary, '#00B4D8']}
            style={[styles.brandIconCircle, { borderRadius: borderRadius.full }]}
          >
            <Ionicons name="flash" size={16} color="#FFFFFF" />
          </LinearGradient>
          <Text style={[typography.h3, { color: colors.text, marginHorizontal: 8 }]}>
            {t('appName')}
          </Text>
        </View>

        {currentIndex < slides.length - 1 && (
          <PressableScale onPress={handleSkip} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={[typography.bodyBold, { color: colors.textMuted }]}>{t('skip')}</Text>
          </PressableScale>
        )}
      </View>

      {/* Slide Carousel */}
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: SCREEN_WIDTH, paddingHorizontal: spacing.xxl }]}>
            <LinearGradient
              colors={item.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.illustrationWrapper,
                {
                  borderRadius: borderRadius.full,
                  shadowColor: item.color,
                  shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: 0.35,
                  shadowRadius: 20,
                  elevation: 10,
                },
              ]}
            >
              <Ionicons name={item.icon} size={84} color="#FFFFFF" />
            </LinearGradient>

            <Text
              style={[
                typography.h1,
                {
                  color: colors.text,
                  textAlign: 'center',
                  marginTop: spacing.xxl,
                },
              ]}
            >
              {item.title}
            </Text>

            <Text
              style={[
                typography.bodyLarge,
                {
                  color: colors.textSecondary,
                  textAlign: 'center',
                  marginTop: spacing.md,
                },
              ]}
            >
              {item.desc}
            </Text>
          </View>
        )}
      />

      {/* Bottom Controls */}
      <View style={[styles.bottomBar, { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xl }]}>
        {/* Animated Stretching Pagination Dots */}
        <View style={styles.paginationRow}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: currentIndex === i ? colors.primary : colors.divider,
                  width: currentIndex === i ? 28 : 8,
                  borderRadius: 4,
                },
              ]}
            />
          ))}
        </View>

        <Button
          title={currentIndex === slides.length - 1 ? t('getStarted') : t('next')}
          variant="gradient"
          size="lg"
          onPress={handleNext}
          style={{ width: '100%', marginTop: spacing.lg }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIconCircle: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  illustrationWrapper: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    alignItems: 'center',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dot: {
    height: 8,
    marginHorizontal: 4,
  },
});
