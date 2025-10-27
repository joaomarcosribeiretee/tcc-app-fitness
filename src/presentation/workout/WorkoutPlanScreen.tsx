import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import SuccessModal from '../components/ui/SuccessModal';
import RejectModal from '../components/ui/RejectModal';
import { workoutPlanStyles } from '../styles/workoutPlanStyles';
import { WorkoutPlan } from '../../domain/entities/WorkoutPlan';
import { addWorkoutPlan, loadWorkoutPlans } from '../../infra/workoutPlanStorage';
import * as secure from '../../infra/secureStore';

interface WorkoutPlanScreenProps {
  navigation: any;
  route: {
    params?: {
      workoutPlan?: WorkoutPlan;
      fromHome?: boolean;
    };
  };
}

const WorkoutPlanScreen = ({ navigation, route }: WorkoutPlanScreenProps) => {
  const workoutPlan = route.params?.workoutPlan;
  const fromHome = route.params?.fromHome || false;
  
  // Estado para controlar o salvamento e evitar múltiplos cliques
  const [isSaving, setIsSaving] = useState(false);
  
  // Estado para controlar o modal de sucesso
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Estado para controlar o modal de recusa
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  // Estado para controlar o modal de logout
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Função para lidar com o botão de configurações (logout)
  const handleSettingsPress = useCallback(() => {
    setShowLogoutModal(true);
  }, []);

  if (!workoutPlan) {
    return (
      <View style={workoutPlanStyles.container}>
        <AppHeader 
          title="WEIGHT" 
          onSettingsPress={handleSettingsPress} 
        />
        <View style={workoutPlanStyles.emptyState}>
          <Text style={workoutPlanStyles.emptyText}>Plano não encontrado</Text>
          <Text style={workoutPlanStyles.emptySubtext}>
            Crie um treino inteligente para visualizar seu plano
          </Text>
        </View>
      </View>
    );
  }

  const handleAccept = useCallback(async () => {
    // Bloquear múltiplos cliques - se já está salvando, ignora
    if (isSaving) {
      console.log('Already saving, ignoring click');
      return;
    }
    
    if (!workoutPlan) {
      Alert.alert('Erro', 'Plano de treino não encontrado');
      return;
    }
    
    try {
      // Marca como salvando para desabilitar o botão
      setIsSaving(true);
      console.log('Saving workout plan:', workoutPlan.name);
      
      // Salvar o plano de treino
      await addWorkoutPlan(workoutPlan);
      console.log('Workout plan saved successfully');
      
      // Libera o estado de salvamento
      setIsSaving(false);
      
      // Mostra o modal de sucesso ao invés de navegar diretamente
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Error in handleAccept:', error);
      setIsSaving(false); // Libera o botão em caso de erro
      Alert.alert(
        'Erro', 
        `Não foi possível salvar o treino: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }, [isSaving, workoutPlan, navigation]);

  // Função para lidar com o fechamento do modal de sucesso
  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false);
    
    // Navegar para a tela principal após fechar o modal
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main', params: { screen: 'Workout' } }],
    });
  }, [navigation]);

  const handleReject = () => {
    setShowRejectModal(true);
  };

  // Função para confirmar a recusa
  const handleRejectConfirm = useCallback(() => {
    setShowRejectModal(false);
    
    // Navegar para a tela principal após recusar
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main', params: { screen: 'Workout' } }],
    });
  }, [navigation]);

  // Função para cancelar a recusa
  const handleRejectCancel = useCallback(() => {
    setShowRejectModal(false);
  }, []);

  // Função para confirmar o logout
  const handleLogoutConfirm = useCallback(async () => {
    try {
      // Limpar o token do SecureStore
      await secure.deleteItem('auth_token');
      console.log('Token removido do SecureStore');
      
      setShowLogoutModal(false);
      
      // Navegar para a tela de login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, navegar para login
      setShowLogoutModal(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  }, [navigation]);

  // Função para cancelar o logout
  const handleLogoutCancel = useCallback(() => {
    setShowLogoutModal(false);
  }, []);

  const handleRequestChanges = () => {
    navigation.navigate('WorkoutAdjustments', { workoutPlan });
  };

  const handleDayPress = (dayId: string, routineType: string, dayName: string) => {
    navigation.navigate('WorkoutDetail', { 
      routineType,
      dayName,
      planId: workoutPlan.id,
      dayId: dayId, // Passar o ID do dia específico
      fromHome: fromHome,
      workoutPlan: workoutPlan // Passar o plano atual (ainda não salvo)
    });
  };

  return (
    <View style={workoutPlanStyles.container}>
      <AppHeader title="WEIGHT" onSettingsPress={handleSettingsPress} />
      
      <ScrollView style={workoutPlanStyles.content} showsVerticalScrollIndicator={false}>
        {/* Cabeçalho do Plano */}
        <View style={workoutPlanStyles.header}>
          <Text style={workoutPlanStyles.badge}>TREINO CRIADO</Text>
          <Text style={workoutPlanStyles.planName}>{workoutPlan.name}</Text>
          <Text style={workoutPlanStyles.planDescription}>{workoutPlan.description}</Text>
        </View>

        {/* Lista de Dias */}
        <View style={workoutPlanStyles.daysSection}>
          <Text style={workoutPlanStyles.sectionTitle}>Rotina Semanal</Text>
          
          {workoutPlan.days.map((day, index) => (
            <TouchableOpacity
              key={day.id}
              style={workoutPlanStyles.dayCard}
              onPress={() => handleDayPress(day.id, day.routineType, day.name)}
              activeOpacity={0.7}
            >
              <View style={workoutPlanStyles.dayNumberBadge}>
                <Text style={workoutPlanStyles.dayNumberText}>{day.dayNumber}</Text>
              </View>
              
              <View style={workoutPlanStyles.dayInfo}>
                <Text style={workoutPlanStyles.dayName}>{day.name}</Text>
                <Text style={workoutPlanStyles.dayType}>
                  {day.routineType.toUpperCase()}
                </Text>
              </View>
              
              <Text style={workoutPlanStyles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info adicional */}
        <View style={workoutPlanStyles.infoBox}>
          <Text style={workoutPlanStyles.infoText}>
            Toque em cada dia para ver os exercícios detalhados
          </Text>
        </View>
      </ScrollView>

      {/* Botões de Ação - só mostra se não veio da Home */}
      {!fromHome && (
        <View style={workoutPlanStyles.buttonContainer}>
          <TouchableOpacity
            style={[
              workoutPlanStyles.acceptButton,
              isSaving && workoutPlanStyles.acceptButtonDisabled
            ]}
            onPress={handleAccept}
            disabled={isSaving}
            activeOpacity={isSaving ? 1 : 0.7}
          >
            {isSaving ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={workoutPlanStyles.acceptButtonText}>SALVANDO...</Text>
              </View>
            ) : (
              <Text style={workoutPlanStyles.acceptButtonText}>✓ ACEITAR TREINO</Text>
            )}
          </TouchableOpacity>

          <View style={workoutPlanStyles.secondaryButtons}>
            <TouchableOpacity
              style={[
                workoutPlanStyles.changesButton,
                isSaving && workoutPlanStyles.buttonDisabled
              ]}
              onPress={handleRequestChanges}
              disabled={isSaving}
            >
              <Text style={workoutPlanStyles.changesButtonText}>Pedir Alterações</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                workoutPlanStyles.rejectButton,
                isSaving && workoutPlanStyles.buttonDisabled
              ]}
              onPress={handleReject}
              disabled={isSaving}
            >
              <Text style={workoutPlanStyles.rejectButtonText}>Recusar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Botão Voltar - só mostra se veio da Home */}
      {fromHome && (
        <View style={workoutPlanStyles.buttonContainer}>
          <TouchableOpacity
            style={workoutPlanStyles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={workoutPlanStyles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Modal de Sucesso */}
      <SuccessModal
        visible={showSuccessModal}
        title="Treino salvo com sucesso!"
        message="Seu programa foi aceito e já está disponível na aba 'Treinos'. Você pode iniciá-lo a qualquer momento."
        buttonText="Fechar"
        onClose={handleSuccessModalClose}
      />
      
      {/* Modal de Recusa */}
      <RejectModal
        visible={showRejectModal}
        title="Recusar Treino"
        message="Tem certeza que deseja recusar este plano de treino? Esta ação não pode ser desfeita."
        confirmText="Sim, recusar"
        cancelText="Cancelar"
        onConfirm={handleRejectConfirm}
        onCancel={handleRejectCancel}
      />
      
      {/* Modal de Logout */}
      <RejectModal
        visible={showLogoutModal}
        title="Sair da conta"
        message="Tem certeza que deseja sair da sua conta? Você precisará fazer login novamente."
        confirmText="Sim, sair"
        cancelText="Cancelar"
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </View>
  );
};

export default WorkoutPlanScreen;

