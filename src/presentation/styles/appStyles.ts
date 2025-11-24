import { StyleSheet } from 'react-native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { colors } from './colors';
import { fonts } from './fonts';

export const appHeaderOptions: NativeStackNavigationOptions = {
  title: 'WEIGHT',
  headerStyle: { backgroundColor: colors.header },
  headerTintColor: colors.primary,
  headerTitleStyle: { fontFamily: fonts.mogra, color: colors.primary, fontSize: 28 },
  headerTitleAlign: 'center',
  headerShadowVisible: false,
};

export const screenStyles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


