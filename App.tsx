import React, { useEffect, useState, useCallback } from 'react';
import { AppState, AppStateStatus, View, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

import { ThemeProvider, useAppTheme } from './src/theme/themeContext';
import { I18nProvider } from './src/i18n/i18nContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';

import { useUserStore } from './src/store/useUserStore';
import { useStepsStore } from './src/store/useStepsStore';
import { useAchievementsStore } from './src/store/useAchievementsStore';
import { useAuthStore } from './src/store/useAuthStore';
import { useWaterStore } from './src/store/useWaterStore';
import { notificationService } from './src/services/notifications';
import { liveNotificationService } from './src/services/liveNotificationService';
import { waterNotificationService } from './src/services/waterNotificationService';
import { stepService } from './src/services/stepService';

// Keep native splash screen visible while bootstrapping
SplashScreen.preventAutoHideAsync().catch(() => {
  // Gracefully ignored in environments where auto-hide isn't available
});

const AppContent: React.FC = () => {
  const { isDark, colors } = useAppTheme();
  const { syncSensorSteps } = useStepsStore();

  useEffect(() => {
    // Sync sensor steps when app returns to foreground
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        syncSensorSteps();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [syncSensorSteps]);

  const navTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: colors.primary,
          background: colors.background,
          card: colors.card,
          text: colors.text,
          border: colors.cardBorder,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: colors.primary,
          background: colors.background,
          card: colors.card,
          text: colors.text,
          border: colors.cardBorder,
        },
      };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <NavigationContainer theme={navTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <AppNavigator />
      </NavigationContainer>
    </View>
  );
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [isReady, setIsReady] = useState(false);
  const { theme, language, setTheme, setLanguage, loadUserProfile } = useUserStore();
  const { initStepsStore } = useStepsStore();
  const { loadAchievements } = useAchievementsStore();

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await loadUserProfile().catch((err) => console.warn('loadUserProfile err:', err));
        await loadAchievements().catch((err) => console.warn('loadAchievements err:', err));
        await initStepsStore().catch((err) => console.warn('initStepsStore err:', err));
        await useAuthStore.getState().loadAuth().catch((err) => console.warn('loadAuth err:', err));
        await useWaterStore.getState().loadWater().catch((err) => console.warn('loadWater err:', err));

        const authState = useAuthStore.getState();
        if (authState.isAuthenticated && !authState.isGuest) {
          await waterNotificationService.scheduleHydrationReminders().catch(() => {});
        }

        // Initialize persistent live step notification only if user has finished onboarding
        const user = useUserStore.getState();
        if (user.isOnboarded && user.notificationsEnabled) {
          try {
            await notificationService.requestPermissions();
            await liveNotificationService.initNotificationChannels();
            const metrics = stepService.getCurrentMetrics();
            await liveNotificationService.updateLiveStepNotification(
              {
                steps: metrics.steps,
                goal: user.dailyGoal,
                distanceKm: metrics.distanceKm,
                calories: metrics.calories,
                activeMinutes: metrics.activeMinutes,
                units: user.units,
                language: user.language,
                isPaused: metrics.isPaused,
              },
              true
            );
          } catch (notifErr) {
            console.warn('Initial live notification setup skipped:', notifErr);
          }
        }
      } catch (err) {
        console.warn('Bootstrap error:', err);
      } finally {
        setIsReady(true);
      }
    };
    bootstrap();
  }, []);

  useEffect(() => {
    if (isReady && (fontsLoaded || fontError)) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isReady, fontsLoaded, fontError]);

  useEffect(() => {
    const fallback = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 1500);
    return () => clearTimeout(fallback);
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if ((fontsLoaded || fontError) && isReady) {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn('Splash hide error:', e);
      }
    }
  }, [fontsLoaded, fontError, isReady]);

  if (!isReady && !fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View style={styles.rootContainer} onLayout={onLayoutRootView}>
        <ErrorBoundary>
          <ThemeProvider userThemeMode={theme} onThemeChange={setTheme}>
            <I18nProvider userLanguage={language} onLanguageChange={setLanguage}>
              <AppContent />
            </I18nProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
});
