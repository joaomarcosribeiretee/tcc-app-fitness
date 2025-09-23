import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { screenStyles } from '../auth/styles/appStyles';
import { colors } from '../auth/styles/colors';

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={screenStyles.centered}>
      <Text style={{ color: colors.primary, fontSize: 20, marginBottom: 16 }}>Home</Text>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingVertical: 12, paddingHorizontal: 20, backgroundColor: colors.accent, borderRadius: 12 }}>
        <Text style={{ color: colors.buttonText, fontWeight: 'bold' }}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}


