import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppHeader } from '../components/layout/AppHeader';
import { homeStyles } from '../../presentation/styles/homeStyles';
import { WorkoutPlan } from '../../domain/entities/WorkoutPlan';
import { loadWorkoutPlans } from '../../infra/workoutPlanStorage';

const HomeScreen = ({ navigation }: any) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);

  // Carrega os planos salvos quando a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      const loadPlans = async () => {
        try {
          const plans = await loadWorkoutPlans();
          setWorkoutPlans(plans);
        } catch (error) {
          console.error('Error loading plans:', error);
        }
      };
      loadPlans();
    }, [])
  );

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

  const handleProgramPress = (workoutPlan: WorkoutPlan) => {
    navigation.navigate('WorkoutPlan', { workoutPlan, fromHome: true });
  };

  return (
    <View style={homeStyles.container}>
      <AppHeader title="WEIGHT" onSettingsPress={handleSettings} />

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
        <View style={homeStyles.titleContainer}>
          <Text style={homeStyles.title}>Meu Plano</Text>
          <View style={homeStyles.titleUnderline} />
        </View>

        {/* Programas de Treino */}
        <View style={homeStyles.section}>
          <Text style={homeStyles.sectionTitle}>Programas de Treino</Text>
          
          {workoutPlans.length === 0 ? (
            <View style={homeStyles.programsContainer}>
              <Text style={homeStyles.emptyText}>Nenhum programa criado ainda</Text>
              <Text style={homeStyles.emptySubtext}>Crie seu primeiro programa de treino</Text>
            </View>
          ) : (
            <View style={homeStyles.programsList}>
              {workoutPlans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={homeStyles.programCard}
                  onPress={() => handleProgramPress(plan)}
                  activeOpacity={0.7}
                >
                  <View style={homeStyles.programHeader}>
                    <Text style={homeStyles.programName}>{plan.name}</Text>
                    <Text style={homeStyles.programChevron}>›</Text>
                  </View>
                  <Text style={homeStyles.programDescription}>{plan.description}</Text>
                  <View style={homeStyles.programFooter}>
                    <Text style={homeStyles.programDays}>{plan.days.length} dias</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
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