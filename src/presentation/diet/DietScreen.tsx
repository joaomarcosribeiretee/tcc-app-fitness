import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import { colors } from '../styles/colors';
import { homeStyles } from '../styles/homeStyles';

const DietScreen = ({ navigation }: any) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleSettings = () => {
    setShowLogoutModal(true);
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <View style={styles.container}>
      <AppHeader 
        title="WEIGHT"
        onSettingsPress={handleSettings}
      />

      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={homeStyles.modalOverlay}>
          <View style={homeStyles.modalContent}>
            <Text style={homeStyles.modalTitle}>Sair da conta</Text>
            <Text style={homeStyles.modalText}>Tem certeza que deseja sair?</Text>
            
            <View style={homeStyles.modalButtons}>
              <TouchableOpacity 
                style={homeStyles.modalButtonCancel}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={homeStyles.modalButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={homeStyles.modalButtonConfirm}
                onPress={handleLogout}
              >
                <Text style={homeStyles.modalButtonConfirmText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      <View style={styles.content}>
        <Text style={styles.title}>Minha Dieta</Text>
        <Text style={styles.subtitle}>Em breve...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: colors.secondary,
  },
});

export default DietScreen;
