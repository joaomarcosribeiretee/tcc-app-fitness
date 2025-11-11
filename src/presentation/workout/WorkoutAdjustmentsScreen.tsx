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
import * as secure from '../../infra/secureStore';
import {
  AnamnesePayload,
  IAPlanResponse,
  requestWorkoutPlanAdjustments,
} from '../../services/workoutPlanService';

interface WorkoutAdjustmentsScreenProps {
  navigation: any;
  route: {
    params?: {
      workoutPlan?: WorkoutPlan;
      rawPlan?: IAPlanResponse;
      anamnesis?: AnamnesePayload;
    };
  };
}

const WorkoutAdjustmentsScreen = ({ navigation, route }: WorkoutAdjustmentsScreenProps) => {
  const workoutPlan = route.params?.workoutPlan;
  const rawPlan = route.params?.rawPlan;
  const anamnesis = route.params?.anamnesis;
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

    if (!workoutPlan || !rawPlan || !anamnesis) {
      Alert.alert('Erro', 'Não foi possível enviar o pedido de alteração no momento.');
      return;
    }

    try {
      setIsSubmitting(true);
      setLoadingStep(1);
      setLoadingStep(2);

      // Enviando solicitação para ajustes
      const { workoutPlan: adjustedPlan, rawPlan: adjustedRawPlan } = await requestWorkoutPlanAdjustments({
        anamnesis,
        currentPlan: rawPlan,
        adjustments: adjustmentText,
      });

      setLoadingStep(3);

      setIsSubmitting(false);
      setLoadingStep(0);

      await new Promise((resolve) => setTimeout(resolve, 150));

      navigation.replace('WorkoutPlan', {
        workoutPlan: adjustedPlan,
        rawPlan: adjustedRawPlan,
        anamnesis,
        fromHome: false,
      });
    } catch (error) {
      console.error('Error submitting adjustments:', error);
      setIsSubmitting(false);
      setLoadingStep(0);
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Não foi possível processar sua solicitação. Tente novamente.'
      );
    }
  }, [adjustmentText, workoutPlan, rawPlan, anamnesis, navigation]);

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
          loadingStep === 2 ? 'Gerando novo treino...' :
          'Processando...'
        }
        subtitle={
          loadingStep === 1 ? 'Preparando seu pedido para a IA' :
          loadingStep === 2 ? 'A IA está criando o novo plano personalizado' :
          'Aguarde, estamos quase lá'
        }
      />
    </KeyboardAvoidingView>
  );
};

export default WorkoutAdjustmentsScreen;
