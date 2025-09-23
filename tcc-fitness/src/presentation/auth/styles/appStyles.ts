import { StyleSheet } from 'react-native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { colors } from './colors';

export const appHeaderOptions: NativeStackNavigationOptions = {
  title: 'WEIGHT',
  headerStyle: { backgroundColor: colors.header },
  headerTintColor: colors.primary,
  headerTitleStyle: { fontWeight: '800' as '800', color: colors.primary },
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


