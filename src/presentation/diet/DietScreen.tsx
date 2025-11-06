import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppHeader } from '../components/layout/AppHeader';
import RejectModal from '../components/ui/RejectModal';
import { colors } from '../styles/colors';
import { homeStyles } from '../styles/homeStyles';
import { DietPlan } from '../../domain/entities/DietPlan';
import { loadDietPlans } from '../../infra/dietPlanStorage';
import * as secure from '../../infra/secureStore';

const DietScreen = ({ navigation }: any) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);

  // Carrega os planos salvos quando a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      const loadPlans = async () => {
        try {
          const plans = await loadDietPlans();
          setDietPlans(plans);
        } catch (error) {
          console.error('Error loading diet plans:', error);
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

  const handleDietPlanPress = (dietPlan: DietPlan) => {
    navigation.navigate('DietPlan', { dietPlan, fromHome: true });
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
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Minha Dieta</Text>
          <View style={styles.titleUnderline} />
        </View>

        {/* Botão Dieta Inteligente */}
        <TouchableOpacity 
          style={styles.smartDietButton}
          onPress={() => navigation.navigate('IntelligentDiet')}
        >
          <Text style={styles.smartDietText}>CRIAR DIETA INTELIGENTE</Text>
        </TouchableOpacity>

        {/* Programas de Dieta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minhas Dietas</Text>
          
          {dietPlans.length === 0 ? (
            <View style={styles.programsContainer}>
              <Text style={styles.emptyText}>Nenhuma dieta criada ainda</Text>
              <Text style={styles.emptySubtext}>Crie sua primeira dieta inteligente</Text>
            </View>
          ) : (
            <View style={styles.programsList}>
              {dietPlans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={styles.programCard}
                  onPress={() => handleDietPlanPress(plan)}
                  activeOpacity={0.7}
                >
                  <View style={styles.programHeader}>
                    <Text style={styles.programName}>{plan.name}</Text>
                    <Text style={styles.programChevron}>›</Text>
                  </View>
                  <Text style={styles.programDescription}>{plan.description}</Text>
                  <View style={styles.programFooter}>
                    <Text style={styles.programDays}>{plan.totalDailyCalories} kcal/dia</Text>
                    <Text style={styles.programDays}>{plan.meals.length} refeições</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
  },
  titleContainer: {
    marginTop: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#787F84',
    marginBottom: 8,
  },
  titleUnderline: {
    width: '100%',
    height: 3,
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  smartDietButton: {
    backgroundColor: '#449B5B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  smartDietText: {
    color: colors.buttonText,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#787F84',
    marginBottom: 16,
  },
  programsContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  emptyText: {
    color: colors.primary,
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    color: colors.secondary,
    fontSize: 14,
    textAlign: 'center',
  },
  programsList: {
    gap: 12,
  },
  programCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  programName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  programChevron: {
    fontSize: 32,
    color: colors.accent,
    fontWeight: '300',
  },
  programDescription: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  programFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  programDays: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
    textTransform: 'uppercase',
  },
});

export default DietScreen;
