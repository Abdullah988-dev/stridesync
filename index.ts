import { Buffer } from 'buffer';
(globalThis as any).Buffer = (globalThis as any).Buffer || Buffer;

import { LogBox } from 'react-native';

// Suppress Expo Go informational warnings regarding remote push notifications
LogBox.ignoreLogs([
  'expo-notifications',
  '`expo-notifications`',
  'Push notifications',
]);

// Filter out informational warnings from the terminal console
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  const message = args.map((a) => (typeof a === 'string' ? a : '')).join(' ');
  if (message.includes('expo-notifications') || message.includes('Push notifications')) {
    return;
  }
  originalWarn(...args);
};

import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
