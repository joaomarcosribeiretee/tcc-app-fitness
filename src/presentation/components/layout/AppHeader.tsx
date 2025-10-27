import React, { memo } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { headerStyles } from '../../styles/headerStyles';

interface AppHeaderProps {
  title?: string;
  onSettingsPress?: () => void;
}

// Ícone memoizado para evitar re-renders desnecessários
const LogoutIcon = memo(() => (
  <Image 
    source={require('../../../../assets/logout.png')} 
    style={headerStyles.iconImage}
    resizeMode="contain"
  />
));

export const AppHeader = memo(({ 
  title = "WEIGHT", 
  onSettingsPress
}: AppHeaderProps) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[headerStyles.safeArea, { paddingTop: insets.top }]}>
      <View style={headerStyles.container}>
        {/* Main Header */}
        <View style={headerStyles.headerBar}>
          <View style={headerStyles.iconButton} />
          
          <Text style={headerStyles.headerTitle}>{title}</Text>
          
          <TouchableOpacity 
            style={headerStyles.iconButtonRight} 
            onPress={onSettingsPress}
            activeOpacity={0.7}
          >
            <LogoutIcon />
          </TouchableOpacity>
        </View>
        
        {/* Separator Line */}
        <View style={headerStyles.separator} />
      </View>
    </View>
  );
});

