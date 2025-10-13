import React, { memo } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { headerStyles } from '../../styles/headerStyles';

interface AppHeaderProps {
  title?: string;
  onSettingsPress?: () => void;
}

// Ícone memoizado para evitar re-renders desnecessários
const SettingsIcon = memo(() => (
  <Image 
    source={require('../../../../assets/icons/Settings.png')} 
    style={headerStyles.iconImage}
    resizeMode="contain"
  />
));

export const AppHeader = memo(({ 
  title = "WEIGHT", 
  onSettingsPress 
}: AppHeaderProps) => {
  return (
    <SafeAreaView style={headerStyles.safeArea}>
      <View style={headerStyles.container}>
        {/* Main Header */}
        <View style={headerStyles.headerBar}>
          <View style={headerStyles.iconButton} />
          
          <Text style={headerStyles.headerTitle}>{title}</Text>
          
          <TouchableOpacity 
            style={headerStyles.iconButton} 
            onPress={onSettingsPress}
            activeOpacity={0.7}
          >
            <SettingsIcon />
          </TouchableOpacity>
        </View>
        
        {/* Separator Line */}
        <View style={headerStyles.separator} />
      </View>
    </SafeAreaView>
  );
});

