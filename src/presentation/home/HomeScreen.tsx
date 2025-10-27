import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppHeader } from '../components/layout/AppHeader';
import RejectModal from '../components/ui/RejectModal';
import { homeStyles } from '../../presentation/styles/homeStyles';
import { WorkoutPlan } from '../../domain/entities/WorkoutPlan';
import { loadWorkoutPlans } from '../../infra/workoutPlanStorage';
import * as secure from '../../infra/secureStore';

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

  const handleProgramPress = (workoutPlan: WorkoutPlan) => {
    navigation.navigate('WorkoutPlan', { workoutPlan, fromHome: true });
  };

  return (
    <View style={homeStyles.container}>
      <AppHeader title="WEIGHT" onSettingsPress={handleSettings} />

      <RejectModal
        visible={showLogoutModal}
        title="Sair da conta"
        message="Tem certeza que deseja sair da sua conta? Você precisará fazer login novamente."
        confirmText="Sim, sair"
        cancelText="Cancelar"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      <ScrollView style={homeStyles.content} showsVerticalScrollIndicator={false}>
        <View style={homeStyles.titleContainer}>
          <Text style={homeStyles.title}>Meu Plano</Text>
          <View style={homeStyles.titleUnderline} />
        </View>

        {/* Botão Treino Rápido */}
        <TouchableOpacity 
          style={homeStyles.quickWorkoutButton}
          onPress={() => navigation.navigate('QuickWorkout')}
        >
          <Text style={homeStyles.quickWorkoutText}>TREINO RÁPIDO</Text>
        </TouchableOpacity>

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