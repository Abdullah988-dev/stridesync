import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabParamList, RootStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { StatisticsScreen } from '../screens/StatisticsScreen';
import { AchievementsScreen } from '../screens/AchievementsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AnimatedTabBar } from '../components/animated/AnimatedTabBar';
import { useTranslation } from '../i18n/i18nContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const Tab = createBottomTabNavigator<BottomTabParamList>();

export const BottomTabNavigator: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Tab.Navigator
      backBehavior="initialRoute" // When pressing back on any tab, navigates to Home tab first!
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        lazy: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t('navHome'),
        }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          tabBarLabel: t('navStats'),
        }}
      />
      <Tab.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{
          tabBarLabel: t('navAchievements'),
        }}
      />
      <Tab.Screen
        name="Settings"
        options={{
          tabBarLabel: t('navSettings'),
        }}
      >
        {() => (
          <SettingsScreen
            onNavigateToProfile={() => navigation.navigate('ProfileEdit')}
            onNavigateToBatteryGuide={() => navigation.navigate('BatteryGuide')}
            onNavigateToAuth={(mode) => navigation.navigate('Auth', { mode })}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};
