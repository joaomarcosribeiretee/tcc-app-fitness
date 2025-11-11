import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import SuccessModal from '../components/ui/SuccessModal';
import RejectModal from '../components/ui/RejectModal';
import { workoutPlanStyles } from '../styles/workoutPlanStyles';
import { DietPlan, Meal, Food } from '../../domain/entities/DietPlan';
import * as secure from '../../infra/secureStore';
import {
  confirmDietPlan,
  IADietPlanResponse,
  DietAnamnesisPayload,
  fetchDietMeals,
} from '../../services/dietPlanService';

interface DietPlanScreenProps {
  navigation: any;
  route: {
    params?: {
      dietPlan?: DietPlan;
      rawPlan?: IADietPlanResponse;
      anamnesis?: DietAnamnesisPayload;
      fromHome?: boolean;
    };
  };
}

const DietPlanScreen = ({ navigation, route }: DietPlanScreenProps) => {
  const initialDietPlan = route.params?.dietPlan ?? null;
  const initialRawPlan = route.params?.rawPlan ?? null;
  const initialAnamnesis = route.params?.anamnesis ?? null;
  const fromHome = route.params?.fromHome || false;
  
  const [planDetails, setPlanDetails] = useState<DietPlan | null>(initialDietPlan);
  const [rawPlan, setRawPlan] = useState<IADietPlanResponse | null>(initialRawPlan);
  const [anamnesis, setAnamnesis] = useState<DietAnamnesisPayload | null>(initialAnamnesis);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);

  const handleSettingsPress = useCallback(() => {
    setShowLogoutModal(true);
  }, []);

  useEffect(() => {
    setPlanDetails(initialDietPlan);
    setRawPlan(initialRawPlan);
    setAnamnesis(initialAnamnesis);
  }, [initialDietPlan, initialRawPlan, initialAnamnesis]);

  useEffect(() => {
    const loadMeals = async () => {
      if (!fromHome) return;
      if (!planDetails) return;
      if (planDetails.meals && planDetails.meals.length > 0) return;

      const dietId = Number(planDetails.id);
      if (!Number.isFinite(dietId)) {
        return;
      }

      setIsLoadingMeals(true);
      try {
        const meals = await fetchDietMeals(dietId);
        const totalFromMeals = meals.reduce((acc, meal) => acc + (meal.totalCalories || 0), 0);
        setPlanDetails((prev) =>
          prev
            ? {
                ...prev,
                meals,
                totalDailyCalories: prev.totalDailyCalories || totalFromMeals,
              }
            : prev
        );
      } catch (error) {
        console.warn('Erro ao carregar refeições da dieta:', error);
      } finally {
        setIsLoadingMeals(false);
      }
    };

    loadMeals();
  }, [fromHome, planDetails?.id, planDetails?.meals?.length]);

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
            Crie uma dieta inteligente para visualizar seu plano
          </Text>
        </View>
      </View>
    );
  }

  const handleAccept = useCallback(async () => {
    if (isSaving) {
      console.log('Already saving, ignoring click');
      return;
    }
    
    if (!planDetails) {
      Alert.alert('Erro', 'Plano de dieta não encontrado');
      return;
    }
    
    try {
      setIsSaving(true);
      console.log('Saving diet plan:', planDetails.name);
      
      if (!rawPlan) {
        throw new Error('Plano original não disponível para confirmação. Gere novamente a dieta.');
      }

      await confirmDietPlan(rawPlan);
      
      setIsSaving(false);
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Error in handleAccept:', error);
      setIsSaving(false);
      Alert.alert(
        'Erro', 
        `Não foi possível salvar a dieta: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }, [isSaving, planDetails, navigation, rawPlan]);

  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false);
    
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main', params: { screen: 'Diet' } }],
    });
  }, [navigation]);

  const handleReject = () => {
    setShowRejectModal(true);
  };

  const handleRejectConfirm = useCallback(() => {
    setShowRejectModal(false);
    
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main', params: { screen: 'Diet' } }],
    });
  }, [navigation]);

  const handleRejectCancel = useCallback(() => {
    setShowRejectModal(false);
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

  const handleRequestChanges = () => {
    if (!planDetails || !rawPlan || !anamnesis) {
      Alert.alert('Recurso indisponível', 'Não foi possível recuperar os dados necessários. Gere a dieta novamente.');
      return;
    }
    navigation.navigate('DietAdjustments', { dietPlan: planDetails, rawPlan, anamnesis });
  };

  const renderMeal = (meal: Meal) => {
    return (
      <View key={meal.id} style={workoutPlanStyles.dayCard}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={workoutPlanStyles.dayName}>{meal.name}</Text>
            <Text style={[workoutPlanStyles.dayType, { fontSize: 14 }]}>{meal.time}</Text>
          </View>
          <Text style={[workoutPlanStyles.dayType, { marginBottom: 16, fontSize: 14, fontWeight: '600' }]}>
            {meal.totalCalories} kcal
          </Text>
          
          {meal.foods.map((food: Food, index: number) => (
            <View 
              key={index}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 10,
                paddingTop: index === 0 ? 12 : 10,
                borderTopWidth: index === 0 ? 1 : 0,
                borderTopColor: '#787F84',
                borderBottomWidth: index === meal.foods.length - 1 ? 0 : 1,
                borderBottomColor: '#787F84'
              }}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ fontSize: 15, color: '#FFFFFF', fontWeight: '500', marginBottom: 4 }}>
                  {food.name}
                </Text>
                {food.quantity && (
                  <Text style={{ fontSize: 13, color: '#787F84' }}>
                    {food.quantity}
                  </Text>
                )}
              </View>
              {typeof food.calories === 'number' && food.calories > 0 && (
                <Text style={{ fontSize: 14, color: '#787F84', fontWeight: '600', minWidth: 60, textAlign: 'right' }}>
                  {food.calories} kcal
                </Text>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={workoutPlanStyles.container}>
      <AppHeader title="WEIGHT" onSettingsPress={handleSettingsPress} />
      
      <ScrollView style={workoutPlanStyles.content} showsVerticalScrollIndicator={false}>
        {/* Cabeçalho do Plano */}
        <View style={workoutPlanStyles.header}>
          <Text style={workoutPlanStyles.badge}>Dieta criada</Text>
          <Text style={workoutPlanStyles.planName}>{planDetails.name}</Text>
          <Text style={workoutPlanStyles.planDescription}>{planDetails.description}</Text>
          <Text style={[workoutPlanStyles.planDescription, { marginTop: 8, fontWeight: '600' }]}>
            Total diário: {planDetails.totalDailyCalories} kcal
          </Text>
        </View>

        {/* Lista de Refeições */}
        <View style={workoutPlanStyles.daysSection}>
          <Text style={workoutPlanStyles.sectionTitle}>Refeições diárias</Text>
          {isLoadingMeals && (!planDetails.meals || planDetails.meals.length === 0) ? (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={workoutPlanStyles.infoText}>Carregando refeições...</Text>
            </View>
          ) : (
            (planDetails.meals ?? []).map((meal) => renderMeal(meal))
          )}
        </View>

        {/* Info adicional */}
        <View style={workoutPlanStyles.infoBox}>
          <Text style={workoutPlanStyles.infoText}>
            Esta dieta é a mesma para todos os dias da semana
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
              <Text style={workoutPlanStyles.acceptButtonText}>✓ Aceitar dieta</Text>
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
        title="Dieta salva com sucesso!"
        message="Seu programa foi aceito e já está disponível na aba 'Dieta'. Você pode visualizá-lo a qualquer momento."
        buttonText="Fechar"
        onClose={handleSuccessModalClose}
      />
      
      {/* Modal de Recusa */}
      <RejectModal
        visible={showRejectModal}
        title="Recusar Dieta"
        message="Tem certeza que deseja recusar este plano de dieta? Esta ação não pode ser desfeita."
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

export default DietPlanScreen;
