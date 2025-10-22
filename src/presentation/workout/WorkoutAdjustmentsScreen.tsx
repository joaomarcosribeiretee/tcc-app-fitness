import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import LoadingModal from '../components/ui/LoadingModal';
import RejectModal from '../components/ui/RejectModal';
import { workoutAdjustmentsStyles } from '../styles/adjustmentsStyles';
import { WorkoutPlan } from '../../domain/entities/WorkoutPlan';
import { mockWorkouts } from '../../data/mockWorkouts';
import * as secure from '../../infra/secureStore';

interface WorkoutAdjustmentsScreenProps {
  navigation: any;
  route: {
    params?: {
      workoutPlan?: WorkoutPlan;
    };
  };
}

const WorkoutAdjustmentsScreen = ({ navigation, route }: WorkoutAdjustmentsScreenProps) => {
  const workoutPlan = route.params?.workoutPlan;
  const [adjustmentText, setAdjustmentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // Função para lidar com o botão de configurações (logout)
  const handleSettingsPress = useCallback(() => {
    setShowLogoutModal(true);
  }, []);

  // Função para confirmar o logout
  const handleLogoutConfirm = useCallback(async () => {
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
  }, [navigation]);

  // Função para cancelar o logout
  const handleLogoutCancel = useCallback(() => {
    setShowLogoutModal(false);
  }, []);

  if (!workoutPlan) {
    return (
      <View style={workoutAdjustmentsStyles.container}>
        <AppHeader 
          title="WEIGHT" 
          onSettingsPress={handleSettingsPress} 
        />
        <View style={workoutAdjustmentsStyles.emptyState}>
          <Text style={workoutAdjustmentsStyles.emptyText}>Plano não encontrado</Text>
          <Text style={workoutAdjustmentsStyles.emptySubtext}>
            Crie um treino inteligente para solicitar alterações
          </Text>
        </View>
      </View>
    );
  }

  const handleSubmit = useCallback(async () => {
    if (!adjustmentText.trim()) {
      Alert.alert('Atenção', 'Por favor, descreva o que você gostaria de alterar no seu treino.');
      return;
    }

    try {
      setIsSubmitting(true);
      setLoadingStep(1);
      
      // Simular envio para a IA (futuramente será uma API real)
      console.log('Solicitação de alteração:', {
        planId: workoutPlan.id,
        planName: workoutPlan.name,
        adjustments: adjustmentText.trim()
      });
      
      // Etapa 1: Enviando solicitação (1 segundo)
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoadingStep(2);
      
      // Etapa 2: Processando com IA (2 segundos)
      await new Promise(resolve => setTimeout(resolve, 2000));
      setLoadingStep(3);
      
      // Simular geração de novo treino (PPL ao invés de Upper/Lower)
      // Incluir os exercícios específicos de cada dia
      const newWorkoutPlan: WorkoutPlan = {
        id: `plan-${Date.now()}`, // Novo ID único
        name: 'PUSH PULL LEGS',
        description: 'Treino dividido em empurrar, puxar e pernas - baseado nas suas alterações',
        createdAt: new Date(),
        days: [
          {
            id: 'day-1',
            dayNumber: 1,
            routineType: 'push' as const,
            name: 'Push 1',
            exercises: mockWorkouts.push.exercises,
          },
          {
            id: 'day-2',
            dayNumber: 2,
            routineType: 'pull' as const,
            name: 'Pull 1',
            exercises: mockWorkouts.pull.exercises,
          },
          {
            id: 'day-3',
            dayNumber: 3,
            routineType: 'legs' as const,
            name: 'Legs 1',
            exercises: mockWorkouts.legs.exercises,
          },
          {
            id: 'day-4',
            dayNumber: 4,
            routineType: 'push' as const,
            name: 'Push 2',
            exercises: mockWorkouts.push.exercises,
          },
          {
            id: 'day-5',
            dayNumber: 5,
            routineType: 'pull' as const,
            name: 'Pull 2',
            exercises: mockWorkouts.pull.exercises,
          },
          {
            id: 'day-6',
            dayNumber: 6,
            routineType: 'legs' as const,
            name: 'Legs 2',
            exercises: mockWorkouts.legs.exercises,
          },
        ],
      };
      
      // Esconder o loading antes da navegação para evitar flash
      setIsSubmitting(false);
      setLoadingStep(0);
      
      // Pequeno delay para garantir transição suave
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navegar de volta para a tela de aceitar/recusar o novo treino
      // Usando replace para substituir a tela de ajustes no histórico
      navigation.replace('WorkoutPlan', {
        workoutPlan: newWorkoutPlan,
        fromHome: false // Vem de alterações, não da tela inicial
      });
      
    } catch (error) {
      console.error('Error submitting adjustments:', error);
      setIsSubmitting(false);
      setLoadingStep(0);
      Alert.alert(
        'Erro',
        'Não foi possível processar sua solicitação. Tente novamente.'
      );
    }
  }, [adjustmentText, workoutPlan, navigation]);

  const handleCancel = useCallback(() => {
    if (adjustmentText.trim()) {
      Alert.alert(
        'Cancelar Alterações',
        'Tem certeza que deseja cancelar? Suas alterações serão perdidas.',
        [
          { text: 'Continuar Editando', style: 'cancel' },
          { 
            text: 'Sim, cancelar', 
            style: 'destructive',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [adjustmentText, navigation]);

  return (
    <KeyboardAvoidingView 
      style={workoutAdjustmentsStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <AppHeader 
        title="WEIGHT" 
        onSettingsPress={handleSettingsPress} 
      />
      
      <ScrollView 
        style={workoutAdjustmentsStyles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cabeçalho */}
        <View style={workoutAdjustmentsStyles.header}>
          <Text style={workoutAdjustmentsStyles.title}>
            Deseja ajustar algo no seu plano?
          </Text>
          <Text style={workoutAdjustmentsStyles.subtitle}>
            Escreva abaixo o que você gostaria de alterar no seu treino.
          </Text>
        </View>

        {/* Informações do Plano */}
        <View style={workoutAdjustmentsStyles.planInfo}>
          <Text style={workoutAdjustmentsStyles.planName}>{workoutPlan.name}</Text>
          <Text style={workoutAdjustmentsStyles.planDescription}>
            {workoutPlan.description}
          </Text>
        </View>

        {/* Campo de Texto */}
        <View style={workoutAdjustmentsStyles.inputContainer}>
          <TextInput
            style={workoutAdjustmentsStyles.textInput}
            value={adjustmentText}
            onChangeText={setAdjustmentText}
            placeholder="Exemplo: 'Quero mais foco em costas', 'Não quero supino reto', 'Treino mais curto', etc."
            placeholderTextColor="#888888"
            multiline
            textAlignVertical="top"
            maxLength={500}
            editable={!isSubmitting}
          />
          <Text style={workoutAdjustmentsStyles.characterCount}>
            {adjustmentText.length}/500
          </Text>
        </View>

        {/* Dicas */}
        <View style={workoutAdjustmentsStyles.tipsContainer}>
          <Text style={workoutAdjustmentsStyles.tipsTitle}>💡 Dicas:</Text>
          <Text style={workoutAdjustmentsStyles.tipText}>
            • Seja específico sobre exercícios que quer adicionar ou remover
          </Text>
          <Text style={workoutAdjustmentsStyles.tipText}>
            • Mencione grupos musculares que quer focar mais
          </Text>
          <Text style={workoutAdjustmentsStyles.tipText}>
            • Indique se quer treino mais curto ou longo
          </Text>
          <Text style={workoutAdjustmentsStyles.tipText}>
            • Fale sobre equipamentos disponíveis ou restrições
          </Text>
        </View>
      </ScrollView>

      {/* Botões */}
      <View style={workoutAdjustmentsStyles.buttonContainer}>
        <TouchableOpacity
          style={[
            workoutAdjustmentsStyles.cancelButton,
            isSubmitting && workoutAdjustmentsStyles.buttonDisabled
          ]}
          onPress={handleCancel}
          disabled={isSubmitting}
          activeOpacity={0.7}
        >
          <Text style={workoutAdjustmentsStyles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            workoutAdjustmentsStyles.submitButton,
            (isSubmitting || !adjustmentText.trim()) && workoutAdjustmentsStyles.buttonDisabled
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || !adjustmentText.trim()}
          activeOpacity={0.7}
        >
          <Text style={workoutAdjustmentsStyles.submitButtonText}>
            {isSubmitting ? 'Enviando...' : 'Enviar'}
          </Text>
        </TouchableOpacity>
      </View>
      
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

      {/* Modal de Carregamento */}
      <LoadingModal
        visible={isSubmitting}
        title={
          loadingStep === 1 ? 'Enviando solicitação...' :
          loadingStep === 2 ? 'Processando com IA...' :
          'Gerando novo treino...'
        }
        subtitle={
          loadingStep === 1 ? 'Enviando suas alterações para análise' :
          loadingStep === 2 ? 'A IA está analisando e criando um novo plano' :
          'Finalizando o treino personalizado'
        }
      />
    </KeyboardAvoidingView>
  );
};

export default WorkoutAdjustmentsScreen;
