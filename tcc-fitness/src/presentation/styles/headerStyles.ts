import { StyleSheet } from 'react-native';
import { fonts } from './fonts';

export const headerStyles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#151F2B',
  },
  container: {
    backgroundColor: '#151F2B',
  },
  headerBar: {
    backgroundColor: '#151F2B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 56,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    color: '#787F84',
  },
  iconImage: {
    width: 24,
    height: 24,
    tintColor: '#787F84',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: fonts.mogra,
    color: '#787F84',
    letterSpacing: 2,
    textAlign: 'center',
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#787F84',
  },
});
