import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { ProfileSetupScreen } from '../screens/ProfileSetupScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { BottomTabNavigator } from './BottomTabNavigator';
import { ProfileEditScreen } from '../screens/ProfileEditScreen';
import { BatteryOptimizationScreen } from '../screens/BatteryOptimizationScreen';
import { useUserStore } from '../store/useUserStore';
import { useAppTheme } from '../theme/themeContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { isOnboarded, isLoaded } = useUserStore();
  const { colors } = useAppTheme();

  if (!isLoaded) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={isOnboarded ? 'MainTabs' : 'Onboarding'}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Onboarding">
        {({ navigation }) => (
          <OnboardingScreen
            onComplete={() => {
              // Reset navigation stack so onboarding is permanently removed
              navigation.reset({
                index: 0,
                routes: [{ name: 'ProfileSetup' }],
              });
            }}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="ProfileSetup">
        {({ navigation }) => (
          <ProfileSetupScreen
            onComplete={() => {
              // Reset navigation stack so setup is permanently removed
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
            }}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />

      <Stack.Screen name="Auth">
        {({ navigation, route }) => (
          <AuthScreen
            initialMode={route.params?.mode || 'register'}
            onSuccess={() => navigation.navigate('MainTabs')}
            onContinueGuest={() => navigation.navigate('MainTabs')}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="ProfileEdit">
        {({ navigation }) => (
          <ProfileEditScreen onBack={() => navigation.goBack()} />
        )}
      </Stack.Screen>

      <Stack.Screen name="BatteryGuide">
        {({ navigation }) => (
          <BatteryOptimizationScreen onBack={() => navigation.goBack()} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
