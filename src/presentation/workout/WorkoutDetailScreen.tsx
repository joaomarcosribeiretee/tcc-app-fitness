import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import RejectModal from '../components/ui/RejectModal';
import { workoutDetailStyles } from '../styles/workoutDetailStyles';
import { mockWorkouts } from '../../data/mockWorkouts';
import { RoutineType, Exercise } from '../../domain/entities/Workout';
import { loadWorkoutPlans } from '../../infra/workoutPlanStorage';
import { WorkoutPlanDay } from '../../domain/entities/WorkoutPlan';
import { deleteItem } from '../../infra/secureStore';

interface WorkoutDetailScreenProps {
  navigation: any;
  route: {
    params?: {
      routineType?: RoutineType;
      dayName?: string;
      planId?: string;
      fromHome?: boolean;
      dayId?: string; // ID do dia específico no plano
      workoutPlan?: any; // Plano atual (ainda não salvo)
    };
  };
}

const WorkoutDetailScreen = ({ navigation, route }: WorkoutDetailScreenProps) => {
  const routineType: RoutineType = route.params?.routineType || 'upper';
  const dayName = route.params?.dayName;
  const fromHome = route.params?.fromHome || false;
  const planId = route.params?.planId;
  const dayId = route.params?.dayId;
  const workoutPlan = route.params?.workoutPlan; // Plano atual (ainda não salvo)
  
  const [workoutDay, setWorkoutDay] = useState<WorkoutPlanDay | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Carregar os exercícios do dia específico do plano
  useEffect(() => {
    const loadWorkoutDay = async () => {
      console.log('=== WorkoutDetailScreen Debug ===');
      console.log('planId:', planId, 'dayId:', dayId, 'routineType:', routineType);
      console.log('workoutPlan:', workoutPlan ? 'Presente' : 'Ausente');
      
      try {
        // PRIORIDADE 1: Usar plano atual (ainda não salvo) se disponível
        if (workoutPlan && dayId) {
          console.log('✅ Usando plano atual (ainda não salvo)');
          const day = workoutPlan.days.find(d => d.id === dayId);
          if (day) {
            setWorkoutDay(day);
            setExercises(day.exercises);
            console.log('✅ Exercícios carregados do plano atual:', day.exercises.map(ex => ({ name: ex.name, sets: ex.sets })));
          } else {
            console.log('❌ Dia não encontrado no plano atual');
          }
        }
        // PRIORIDADE 2: Buscar do plano salvo
        else if (planId && dayId) {
          console.log('🔍 Buscando do plano salvo...');
          const plans = await loadWorkoutPlans();
          console.log('Planos encontrados:', plans.length);
          const plan = plans.find(p => p.id === planId);
          console.log('Plano encontrado:', plan ? 'Sim' : 'Não');
          
          if (plan) {
            const day = plan.days.find(d => d.id === dayId);
            console.log('Dia encontrado:', day ? 'Sim' : 'Não');
            if (day) {
              setWorkoutDay(day);
              setExercises(day.exercises);
              console.log('✅ Exercícios carregados do plano salvo:', day.exercises.map(ex => ({ name: ex.name, sets: ex.sets })));
            }
          }
        }
        // PRIORIDADE 3: Fallback para mockWorkouts
        else {
          console.log('🔄 Usando fallback para mockWorkouts');
          const mockWorkout = mockWorkouts[routineType];
          if (mockWorkout) {
            setExercises(mockWorkout.exercises);
            console.log('✅ Exercícios carregados do mock:', mockWorkout.exercises.map(ex => ({ name: ex.name, sets: ex.sets })));
          }
        }
      } catch (error) {
        console.error('❌ Error loading workout day:', error);
        // Fallback para mockWorkouts em caso de erro
        const mockWorkout = mockWorkouts[routineType];
        if (mockWorkout) {
          setExercises(mockWorkout.exercises);
        }
      } finally {
        setLoading(false);
        console.log('===============================');
      }
    };

    loadWorkoutDay();
  }, [planId, dayId, routineType, workoutPlan]);

  const workout = mockWorkouts[routineType];

  const handleStartWorkout = () => {
    navigation.navigate('WorkoutExecution', {
      routineType,
      dayName,
      planId,
      dayId,
      exercises: exercises, // Passar os exercícios específicos
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSettings = () => {
    setShowLogoutModal(true);
  };

  const handleLogout = async () => {
    try {
      await deleteItem('auth_token');
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

  if (!workout) {
    return (
      <View style={workoutDetailStyles.container}>
        <AppHeader title="WEIGHT" onSettingsPress={handleSettings} />
        <View style={workoutDetailStyles.emptyState}>
          <Text style={workoutDetailStyles.emptyText}>Treino não encontrado</Text>
          <Text style={workoutDetailStyles.emptySubtext}>
            Selecione um treino válido para visualizar
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={workoutDetailStyles.container}>
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

      <ScrollView style={workoutDetailStyles.content} showsVerticalScrollIndicator={false}>
        {/* Cabeçalho com informações do treino */}
        <View style={workoutDetailStyles.headerInfo}>
          {dayName && (
            <Text style={workoutDetailStyles.dayBadge}>{dayName}</Text>
          )}
          <Text style={workoutDetailStyles.routineName}>{workout.name}</Text>
          <Text style={workoutDetailStyles.routineDescription}>{workout.description}</Text>
          
          <View style={workoutDetailStyles.routineInfoRow}>
            <View style={workoutDetailStyles.infoItem}>
              <Text style={workoutDetailStyles.infoLabel}>Duração:</Text>
              <Text style={workoutDetailStyles.infoValue}>{workout.duration}</Text>
            </View>
            
            <View style={workoutDetailStyles.infoItem}>
              <Text style={workoutDetailStyles.infoLabel}>Exercícios:</Text>
              <Text style={workoutDetailStyles.infoValue}>{exercises.length}</Text>
            </View>
            
            <View style={workoutDetailStyles.difficultyBadge}>
              <Text style={workoutDetailStyles.difficultyText}>{workout.difficulty}</Text>
            </View>
          </View>
        </View>

        {/* Lista de exercícios */}
        <View style={workoutDetailStyles.exercisesList}>
          <Text style={workoutDetailStyles.sectionTitle}>Exercícios</Text>
          
          {exercises.map((exercise, index) => (
            <View key={exercise.id} style={workoutDetailStyles.exerciseCard}>
              <View style={workoutDetailStyles.exerciseHeader}>
                <View style={workoutDetailStyles.exerciseInfo}>
                  <Text style={workoutDetailStyles.exerciseName}>{exercise.name}</Text>
                  <Text style={workoutDetailStyles.exerciseTarget}>
                    {exercise.bodyPart} • {exercise.target}
                  </Text>
                  <Text style={workoutDetailStyles.exerciseEquipment}>
                    {exercise.equipment}
                  </Text>
                </View>
                
                <View style={workoutDetailStyles.exerciseNumber}>
                  <Text style={workoutDetailStyles.exerciseNumberText}>{index + 1}</Text>
                </View>
              </View>
              
              <View style={workoutDetailStyles.exerciseDetails}>
                <View style={workoutDetailStyles.detailItem}>
                  <Text style={workoutDetailStyles.detailLabel}>Séries</Text>
                  <Text style={workoutDetailStyles.detailValue}>{exercise.sets || '-'}</Text>
                </View>
                
                <View style={workoutDetailStyles.detailItem}>
                  <Text style={workoutDetailStyles.detailLabel}>Repetições</Text>
                  <Text style={workoutDetailStyles.detailValue}>{exercise.reps || '-'}</Text>
                </View>
                
                <View style={workoutDetailStyles.detailItem}>
                  <Text style={workoutDetailStyles.detailLabel}>Descanso</Text>
                  <Text style={workoutDetailStyles.detailValue}>{exercise.rest || '-'}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Botões de ação */}
      <View style={workoutDetailStyles.buttonContainer}>
        {/* Só mostra o botão INICIAR TREINO se vier da tela inicial */}
        {fromHome && (
          <TouchableOpacity
            style={workoutDetailStyles.startButton}
            onPress={handleStartWorkout}
          >
            <Text style={workoutDetailStyles.startButtonText}>INICIAR TREINO</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={workoutDetailStyles.backButton}
          onPress={handleBack}
        >
          <Text style={workoutDetailStyles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WorkoutDetailScreen;

