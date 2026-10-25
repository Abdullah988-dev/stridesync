import { NavigatorScreenParams } from '@react-navigation/native';

export type BottomTabParamList = {
  Home: undefined;
  Statistics: undefined;
  Achievements: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  ProfileSetup: undefined;
  Auth: { mode?: 'login' | 'register' } | undefined;
  MainTabs: NavigatorScreenParams<BottomTabParamList> | undefined;
  ProfileEdit: undefined;
  BatteryGuide: undefined;
};
