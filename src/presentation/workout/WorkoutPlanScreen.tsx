import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import SuccessModal from '../components/ui/SuccessModal';
import RejectModal from '../components/ui/RejectModal';
import { workoutPlanStyles } from '../styles/workoutPlanStyles';
import { WorkoutPlan, WorkoutPlanDay } from '../../domain/entities/WorkoutPlan';
import * as secure from '../../infra/secureStore';
import userService from '../../infra/userService';
import {
  fetchProgramWorkouts,
  confirmWorkoutPlan,
  IAPlanResponse,
  AnamnesePayload,
} from '../../services/workoutPlanService';

interface WorkoutPlanScreenProps {
  navigation: any;
  route: {
    params?: {
      workoutPlan?: WorkoutPlan;
      fromHome?: boolean;
      rawPlan?: IAPlanResponse;
      anamnesis?: AnamnesePayload;
    };
  };
}

const normalizeText = (value?: string | null): string | null => {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const normalized = trimmed.toLowerCase();

  if (normalized.includes('iniciante')) return 'Iniciante';
  if (normalized.includes('intermediario') || normalized.includes('intermediário')) return 'Intermediário';
  if (normalized.includes('avancado') || normalized.includes('avançado')) return 'Avançado';

  if (normalized.startsWith('upper')) return 'Upper Body';
  if (normalized.startsWith('lower')) return 'Lower Body';
  if (normalized.startsWith('push')) return 'Push Day';
  if (normalized.startsWith('pull')) return 'Pull Day';
  if (normalized.startsWith('legs') || normalized.startsWith('perna')) return 'Leg Day';
  if (normalized.startsWith('fullbody')) return 'Full Body';

  return trimmed
    .replace(/[_-]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatDifficulty = (value?: string | null, fallback?: string | null): string | null => {
  const normalized = normalizeText(value);
  if (normalized) return normalized;

  const fallbackNormalized = normalizeText(fallback);
  if (fallbackNormalized) return fallbackNormalized;

  return null;
};

const getDaySubtitle = (day: WorkoutPlanDay): string => {
  return (
    formatDifficulty(day.difficulty, day.routineType) ??
    'Treino Personalizado'
  );
};

const WorkoutPlanScreen = ({ navigation, route }: WorkoutPlanScreenProps) => {
  const workoutPlan = route.params?.workoutPlan;
  const fromHome = route.params?.fromHome || false;
  const initialRawPlan = route.params?.rawPlan ?? null;
  const initialAnamnesis = route.params?.anamnesis ?? null;
  
  const [planDetails, setPlanDetails] = useState<WorkoutPlan | null>(workoutPlan ?? null);
  const [rawPlan, setRawPlan] = useState<IAPlanResponse | null>(initialRawPlan);
  const [anamnesis, setAnamnesis] = useState<AnamnesePayload | null>(initialAnamnesis);
  const [isLoadingDays, setIsLoadingDays] = useState(false);
  
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

  useEffect(() => {
    if (workoutPlan) {
      setPlanDetails(workoutPlan);
    }
    if (initialRawPlan) {
      setRawPlan(initialRawPlan);
    }
    if (initialAnamnesis) {
      setAnamnesis(initialAnamnesis);
    }
  }, [workoutPlan, initialRawPlan, initialAnamnesis]);

  useEffect(() => {
    const fetchPersistedDays = async () => {
      if (!fromHome) return;
      if (!planDetails) return;
      if (planDetails.days && planDetails.days.length > 0) return;

      const userId = await userService.getCurrentUserId();
      if (!userId) return;

      setIsLoadingDays(true);
      try {
        const programId = Number(planDetails.id);
        if (!Number.isFinite(programId)) {
          return;
        }
        const days = await fetchProgramWorkouts(Number(userId), programId);
        setPlanDetails((prev) => (prev ? { ...prev, days } : prev));
      } catch (error) {
        console.warn('Erro ao carregar treinos do programa:', error);
      } finally {
        setIsLoadingDays(false);
      }
    };

    fetchPersistedDays();
  }, [fromHome, planDetails?.id, planDetails?.days?.length]);

  if (!planDetails) {
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
    
    if (!planDetails || !rawPlan) {
      Alert.alert('Erro', 'Plano de treino não encontrado');
      return;
    }
    
    try {
      setIsSaving(true);

      const confirmResult = await confirmWorkoutPlan(rawPlan);

      const userId = await userService.getCurrentUserId();
      let daysToApply: WorkoutPlanDay[] = planDetails.days;
      let programId = planDetails.id;

      if (
        userId &&
        confirmResult?.programa?.id_programa_treino != null
      ) {
        programId = String(confirmResult.programa.id_programa_treino);
        try {
          const persistedDays = await fetchProgramWorkouts(
            Number(userId),
            confirmResult.programa.id_programa_treino
          );
          if (persistedDays.length) {
            daysToApply = persistedDays;
          }
        } catch (error) {
          console.warn('Não foi possível carregar o plano persistido:', error);
        }
      }

      setPlanDetails({
        id: programId,
        name: confirmResult.programa?.nome || planDetails.name,
        description: confirmResult.programa?.descricao || planDetails.description,
        createdAt: new Date(),
        days: daysToApply,
      });
      setRawPlan(null);

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error in handleAccept:', error);
      Alert.alert(
        'Erro',
        `Não foi possível confirmar o treino: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, planDetails, navigation]);

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
    if (!planDetails || !rawPlan || !anamnesis) {
      Alert.alert('Erro', 'Não foi possível preparar o pedido de alterações.');
      return;
    }

    navigation.navigate('WorkoutAdjustments', {
      workoutPlan: planDetails,
      rawPlan,
      anamnesis,
    });
  };

  const handleDayPress = (dayId: string, routineType: string, dayName: string) => {
    if (isLoadingDays) {
      Alert.alert('Carregando', 'Aguarde enquanto carregamos os treinos.');
      return;
    }

    if (!planDetails) {
      return;
    }

    const day = planDetails.days.find((item) => item.id === dayId);
    if (!day) {
      Alert.alert('Erro', 'Dia de treino não encontrado.');
      return;
    }

    navigation.navigate('WorkoutDetail', { 
      routineType: day.routineType || routineType,
      dayName: day.name || dayName,
      planId: planDetails.id,
      dayId: dayId, // Passar o ID do dia específico
      fromHome: fromHome,
      workoutPlan: planDetails, // Mantém para fluxos que precisam do plano completo
      dayData: day,
    });
  };

  return (
    <View style={workoutPlanStyles.container}>
      <AppHeader title="WEIGHT" onSettingsPress={handleSettingsPress} />
      
      <ScrollView style={workoutPlanStyles.content} showsVerticalScrollIndicator={false}>
        {/* Cabeçalho do Plano */}
        <View style={workoutPlanStyles.header}>
          <Text style={workoutPlanStyles.badge}>TREINO CRIADO</Text>
          <Text style={workoutPlanStyles.planName}>{planDetails.name}</Text>
          <Text style={workoutPlanStyles.planDescription}>{planDetails.description}</Text>
        </View>

        {/* Lista de Dias */}
        <View style={workoutPlanStyles.daysSection}>
          <Text style={workoutPlanStyles.sectionTitle}>Rotina Semanal</Text>
          
          {planDetails.days.length === 0 ? (
            isLoadingDays ? (
              <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={workoutPlanStyles.infoText}>Carregando treinos do programa...</Text>
              </View>
            ) : (
              <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                <Text style={workoutPlanStyles.infoText}>Nenhum dia de treino encontrado para este programa.</Text>
              </View>
            )
          ) : (
            planDetails.days.map((day) => (
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
                    {getDaySubtitle(day)}
                  </Text>
                </View>
                
                <Text style={workoutPlanStyles.chevron}>›</Text>
              </TouchableOpacity>
            ))
          )}
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

