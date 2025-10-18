import React from 'react';
import { Text, Image, StyleSheet } from 'react-native';

interface TabIconProps {
  name: string;
  focused: boolean;
}

export const TabIcon = ({ name, focused }: TabIconProps) => {
  const getIconSource = () => {
    switch (name) {
      case 'Workout':
        return require('../../../../assets/icons/dumbell2.png');
      case 'Diet':
        return require('../../../../assets/icons/diet 1.png');
      case 'Profile':
        return require('../../../../assets/icons/User.png');
      default:
        return null;
    }
  };

  const iconSource = getIconSource();
  
  if (iconSource) {
    return (
      <Image 
        source={iconSource} 
        style={[
          bottomTabBarStyles.iconImage, 
          { opacity: focused ? 1 : 0.4 }
        ]}
        resizeMode="contain"
      />
    );
  }

  return null;
};

export const bottomTabBarStyles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#151F2B',
    borderTopWidth: 2,
    borderColor: '#151F2B',
    borderTopColor: '#787F84',
    paddingBottom: 16,
    paddingTop: 16,
    height: 85,
  },
  icon: {
    fontSize: 38,
    textAlign: 'center',
  },
  iconImage: {
    width: 48,
    height: 38,
    tintColor: '#787F84', // Cor dos ícones
    alignSelf: 'center',
  },
});
