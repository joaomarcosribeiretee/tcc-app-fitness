import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import { homeStyles } from '../../presentation/styles/homeStyles';  

const HomeScreen = ({ navigation }: any) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleSettings = () => {
    setShowLogoutModal(true);
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    // Reseta a pilha de navegação para Login, sem possibilidade de voltar
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <View style={homeStyles.container}>
      {/* Header */}
      <AppHeader 
        title="WEIGHT"
        onSettingsPress={handleSettings}
      />

      {/* Modal de Logout */}
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

      <ScrollView style={homeStyles.content} showsVerticalScrollIndicator={false}>
        {/* Título principal */}
        <View style={homeStyles.titleContainer}>
          <Text style={homeStyles.title}>Meu Plano</Text>
          <View style={homeStyles.titleUnderline} />
        </View>

        {/* Treino Rápido */}
        <View style={homeStyles.section}>
          <Text style={homeStyles.sectionTitle}>Treino rápido</Text>
          <TouchableOpacity style={homeStyles.quickWorkoutButton}>
            <Text style={homeStyles.quickWorkoutText}>Começar agora</Text>
          </TouchableOpacity>
        </View>

        {/* Programas de Treino */}
        <View style={homeStyles.section}>
          <Text style={homeStyles.sectionTitle}>Programas de Treino</Text>
          
          {/* Lista de programas (vazia inicialmente) */}
          <View style={homeStyles.programsContainer}>
            <Text style={homeStyles.emptyText}>Nenhum programa criado ainda</Text>
            <Text style={homeStyles.emptySubtext}>Crie seu primeiro programa de treino</Text>
          </View>
        </View>

        {/* Botão Treino Inteligente */}
        <TouchableOpacity 
          style={homeStyles.smartWorkoutButton}
          onPress={() => navigation.navigate('IntelligentWorkout')}
        >
          <Text style={homeStyles.smartWorkoutText}>CRIAR TREINO INTELIGENTE</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;