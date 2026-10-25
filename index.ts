import { Buffer } from 'buffer';
(globalThis as any).Buffer = (globalThis as any).Buffer || Buffer;

import { LogBox } from 'react-native';

// Suppress Expo Go informational warnings regarding remote push notifications
LogBox.ignoreLogs([
  'expo-notifications',
  '`expo-notifications`',
  'Push notifications',
]);

// Global error safety handler
const globalErrorUtils = (globalThis as any).ErrorUtils;
if (globalErrorUtils) {
  const defaultHandler = globalErrorUtils.getGlobalHandler && globalErrorUtils.getGlobalHandler();
  globalErrorUtils.setGlobalHandler((error: any, isFatal: boolean) => {
    console.warn('Unhandled React Native error caught:', error);
    if (!isFatal && defaultHandler) {
      defaultHandler(error, isFatal);
    }
  });
}

import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
