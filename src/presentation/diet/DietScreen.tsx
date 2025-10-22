import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import RejectModal from '../components/ui/RejectModal';
import { colors } from '../styles/colors';
import * as secure from '../../infra/secureStore';

const DietScreen = ({ navigation }: any) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleSettings = () => {
    setShowLogoutModal(true);
  };

  const handleLogout = async () => {
    try {
      await secure.deleteItem('auth_token');
      console.log('Token removido do SecureStore');
      setShowLogoutModal(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      setShowLogoutModal(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader 
        title="WEIGHT"
        onSettingsPress={handleSettings}
      />

      <RejectModal
        visible={showLogoutModal}
        title="Sair da conta"
        message="Tem certeza que deseja sair da sua conta? Você precisará fazer login novamente."
        confirmText="Sim, sair"
        cancelText="Cancelar"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
      
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
