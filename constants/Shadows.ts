import { Platform, ViewStyle } from 'react-native';

export const Shadows = {
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    android: {
      elevation: 3,
    },
  })!,

  elevated: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
    },
    android: {
      elevation: 6,
    },
  })!,

  subtle: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    android: {
      elevation: 1,
    },
  })!,
} as const;
