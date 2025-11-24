import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import LoadingModal from '../components/ui/LoadingModal';
import RejectModal from '../components/ui/RejectModal';
import { workoutAdjustmentsStyles } from '../styles/adjustmentsStyles';
import { DietPlan } from '../../domain/entities/DietPlan';
import {
  DietAnamnesisPayload,
  IADietPlanResponse,
  requestDietPlanAdjustments,
} from '../../services/dietPlanService';
import * as secure from '../../infra/secureStore';

interface DietAdjustmentsScreenProps {
  navigation: any;
  route: {
    params?: {
      dietPlan?: DietPlan;
      rawPlan?: IADietPlanResponse;
      anamnesis?: DietAnamnesisPayload;
    };
  };
}

const DietAdjustmentsScreen = ({ navigation, route }: DietAdjustmentsScreenProps) => {
  const originalDietPlan = route.params?.dietPlan;
  const rawPlan = route.params?.rawPlan;
  const anamnesis = route.params?.anamnesis;
  const [adjustmentText, setAdjustmentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const handleSettingsPress = useCallback(() => {
    setShowLogoutModal(true);
  }, []);

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

  const handleLogoutCancel = useCallback(() => {
    setShowLogoutModal(false);
  }, []);

  if (!originalDietPlan) {
    return (
      <View style={workoutAdjustmentsStyles.container}>
        <AppHeader 
          title="WEIGHT" 
          onSettingsPress={handleSettingsPress} 
        />
        <View style={workoutAdjustmentsStyles.emptyState}>
          <Text style={workoutAdjustmentsStyles.emptyText}>Plano não encontrado</Text>
          <Text style={workoutAdjustmentsStyles.emptySubtext}>
            Crie uma dieta inteligente para solicitar alterações
          </Text>
        </View>
      </View>
    );
  }

  const handleSubmit = useCallback(async () => {
    if (!adjustmentText.trim()) {
      Alert.alert('Atenção', 'Por favor, descreva o que você gostaria de alterar na sua dieta.');
      return;
    }

    if (!anamnesis || !rawPlan) {
      Alert.alert('Erro', 'Não foi possível recuperar os dados completos do plano. Gere uma nova dieta.');
      return;
    }

    try {
      setIsSubmitting(true);
      setLoadingStep(1);

      const { dietPlan: updatedPlan, rawPlan: updatedRawPlan } = await requestDietPlanAdjustments({
        anamnesis,
        currentPlan: rawPlan,
        adjustments: adjustmentText,
      });

      setLoadingStep(3);
      setIsSubmitting(false);
      setLoadingStep(0);

      navigation.replace('DietPlan', {
        dietPlan: updatedPlan,
        rawPlan: updatedRawPlan,
        anamnesis,
        fromHome: false,
      });
    } catch (error) {
      console.error('Error submitting adjustments:', error);
      setIsSubmitting(false);
      setLoadingStep(0);
      const message = error instanceof Error ? error.message : 'Não foi possível processar sua solicitação. Tente novamente.';
      Alert.alert('Erro', message);
    }
  }, [adjustmentText, originalDietPlan, navigation, anamnesis, rawPlan]);

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
            Escreva abaixo o que você gostaria de alterar na sua dieta.
          </Text>
        </View>

        {/* Informações do Plano */}
        <View style={workoutAdjustmentsStyles.planInfo}>
          <Text style={workoutAdjustmentsStyles.planName}>{originalDietPlan.name}</Text>
          <Text style={workoutAdjustmentsStyles.planDescription}>
            {originalDietPlan.description}
          </Text>
        </View>

        {/* Campo de Texto */}
        <View style={workoutAdjustmentsStyles.inputContainer}>
          <TextInput
            style={workoutAdjustmentsStyles.textInput}
            value={adjustmentText}
            onChangeText={setAdjustmentText}
            placeholder="Exemplo: 'Quero mais proteína', 'Não quero carboidratos no jantar', 'Dieta mais calórica', 'Aumentar número de refeições', etc."
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
          <Text style={workoutAdjustmentsStyles.tipsTitle}>Dicas:</Text>
          <Text style={workoutAdjustmentsStyles.tipText}>
            • Seja específico sobre alimentos que quer adicionar ou remover
          </Text>
          <Text style={workoutAdjustmentsStyles.tipText}>
            • Mencione preferências alimentares ou restrições
          </Text>
          <Text style={workoutAdjustmentsStyles.tipText}>
            • Indique se quer mais ou menos calorias
          </Text>
          <Text style={workoutAdjustmentsStyles.tipText}>
            • Fale sobre horários de refeições ou quantidade
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
          'Gerando nova dieta...'
        }
        subtitle={
          loadingStep === 1 ? 'Enviando suas alterações para análise' :
          loadingStep === 2 ? 'A IA está analisando e criando um novo plano' :
          'Finalizando a dieta personalizada'
        }
      />
    </KeyboardAvoidingView>
  );
};

export default DietAdjustmentsScreen;

