import { TextStyle, Platform } from 'react-native';

const fontFamilyRegular = Platform.select({
  ios: 'Poppins-Regular',
  android: 'Poppins_400Regular',
  default: 'System',
});

const fontFamilyMedium = Platform.select({
  ios: 'Poppins-Medium',
  android: 'Poppins_500Medium',
  default: 'System',
});

const fontFamilySemiBold = Platform.select({
  ios: 'Poppins-SemiBold',
  android: 'Poppins_600SemiBold',
  default: 'System',
});

const fontFamilyBold = Platform.select({
  ios: 'Poppins-Bold',
  android: 'Poppins_700Bold',
  default: 'System',
});

export const typography = {
  hero: {
    fontFamily: fontFamilyBold,
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: -1.5,
  } as TextStyle,
  h1: {
    fontFamily: fontFamilyBold,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.8,
  } as TextStyle,
  h2: {
    fontFamily: fontFamilyBold,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
  } as TextStyle,
  h3: {
    fontFamily: fontFamilySemiBold,
    fontSize: 19,
    fontWeight: '600',
    letterSpacing: -0.2,
  } as TextStyle,
  bodyLarge: {
    fontFamily: fontFamilyMedium,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  } as TextStyle,
  body: {
    fontFamily: fontFamilyRegular,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
  } as TextStyle,
  bodyBold: {
    fontFamily: fontFamilySemiBold,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
  } as TextStyle,
  caption: {
    fontFamily: fontFamilyMedium,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  } as TextStyle,
  small: {
    fontFamily: fontFamilySemiBold,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
  } as TextStyle,
};
