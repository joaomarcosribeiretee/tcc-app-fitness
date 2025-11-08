import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import RejectModal from '../components/ui/RejectModal';
import { workoutDetailStyles } from '../styles/workoutDetailStyles';
import { mockWorkouts } from '../../data/mockWorkouts';
import { RoutineType, Exercise } from '../../domain/entities/Workout';
import { WorkoutPlan, WorkoutPlanDay } from '../../domain/entities/WorkoutPlan';
import { deleteItem } from '../../infra/secureStore';
import userService from '../../infra/userService';
import { fetchProgramWorkouts, fetchWorkoutExercises } from '../../services/workoutPlanService';

interface WorkoutDetailScreenProps {
  navigation: any;
  route: {
    params?: {
      routineType?: RoutineType;
      dayName?: string;
      planId?: string;
      fromHome?: boolean;
      dayId?: string; // ID do dia específico no plano
      workoutPlan?: WorkoutPlan; // Plano atual (ainda não salvo)
    };
  };
}

const normalizeText = (value?: string | null): string | null => {
  if (!value) return null;

  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  if (normalized.includes('iniciante')) return 'Iniciante';
  if (normalized.includes('intermediario') || normalized.includes('intermediário')) return 'Intermediário';
  if (normalized.includes('avancado') || normalized.includes('avançado')) return 'Avançado';

  if (normalized.startsWith('upper')) return 'Upper Body';
  if (normalized.startsWith('lower')) return 'Lower Body';
  if (normalized.startsWith('push')) return 'Push Day';
  if (normalized.startsWith('pull')) return 'Pull Day';
  if (normalized.startsWith('legs') || normalized.startsWith('perna')) return 'Leg Day';
  if (normalized.startsWith('fullbody')) return 'Full Body';

  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatDifficulty = (value?: string | null, fallback?: string | null): string => {
  const normalized = normalizeText(value);
  if (normalized) return normalized;

  const fallbackNormalized = normalizeText(fallback);
  if (fallbackNormalized) return fallbackNormalized;

  return 'Personalizado';
};

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
    let isMounted = true;

    const loadWorkoutDay = async () => {
      console.log('=== WorkoutDetailScreen Debug ===');
      console.log('planId:', planId, 'dayId:', dayId, 'routineType:', routineType);
      console.log('workoutPlan:', workoutPlan ? 'Presente' : 'Ausente');

      setLoading(true);

      try {
        let resolvedDay: WorkoutPlanDay | null = null;
        let resolvedExercises: Exercise[] = [];

        if (workoutPlan?.days?.length) {
          const localDay = workoutPlan.days.find((day) => {
            if (dayId) {
              return String(day.id) === String(dayId);
            }
            if (dayName) {
              return day.name === dayName;
            }
            return false;
          });

          if (localDay) {
            console.log('📄 Usando plano recebido por parâmetro');
            resolvedDay = localDay;
            resolvedExercises = localDay.exercises ?? [];
          }
        }

        const userId = await userService.getCurrentUserId();
        const numericUserId = userId ? Number(userId) : null;

        if (!resolvedDay && planId && dayId && numericUserId != null) {
          console.log('🔍 Buscando treino do backend...');
          const remoteDays = await fetchProgramWorkouts(numericUserId, planId);
          resolvedDay = remoteDays.find((day) => String(day.id) === String(dayId)) ?? null;
          resolvedExercises = resolvedDay?.exercises ?? [];
          console.log('Dia encontrado no backend:', resolvedDay ? 'Sim' : 'Não');
        }

        if (resolvedDay && (!resolvedDay.exercises || resolvedDay.exercises.length === 0) && numericUserId != null) {
          console.log('ℹ️ Dia sem exercícios locais, consultando detalhes do backend');
          const exercisesFromBackend = await fetchWorkoutExercises(numericUserId, resolvedDay.id);
          resolvedExercises = exercisesFromBackend;
          resolvedDay = { ...resolvedDay, exercises: exercisesFromBackend };
          console.log('✅ Exercícios carregados do backend:', exercisesFromBackend.map(ex => ({ name: ex.name, sets: ex.sets })));
        }

        if (isMounted) {
          if (resolvedDay) {
            setWorkoutDay(resolvedDay);
            setExercises(resolvedExercises);
          } else if (!planId) {
            const fallbackWorkout = mockWorkouts[routineType];
            if (fallbackWorkout) {
              const fallbackDay: WorkoutPlanDay = {
                id: routineType,
                dayNumber: 1,
                routineType,
                name: fallbackWorkout.name,
                exercises: fallbackWorkout.exercises,
                completed: false,
                description: fallbackWorkout.description,
                duration: null,
                difficulty: fallbackWorkout.difficulty,
              };
              setWorkoutDay(fallbackDay);
              setExercises(fallbackWorkout.exercises);
            } else {
              setWorkoutDay(null);
              setExercises([]);
            }
          } else {
            setWorkoutDay(null);
            setExercises([]);
          }
        }
      } catch (error) {
        console.error('❌ Error loading workout day:', error);
        if (isMounted) {
          if (!planId) {
            const fallbackWorkout = mockWorkouts[routineType];
            if (fallbackWorkout) {
              const fallbackDay: WorkoutPlanDay = {
                id: routineType,
                dayNumber: 1,
                routineType,
                name: fallbackWorkout.name,
                exercises: fallbackWorkout.exercises,
                completed: false,
                description: fallbackWorkout.description,
                duration: null,
                difficulty: fallbackWorkout.difficulty,
              };
              setWorkoutDay(fallbackDay);
              setExercises(fallbackWorkout.exercises);
            } else {
              setWorkoutDay(null);
              setExercises([]);
            }
          } else {
            setWorkoutDay(null);
            setExercises([]);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('===============================');
        }
      }
    };

    loadWorkoutDay();

    return () => {
      isMounted = false;
    };
  }, [planId, dayId, dayName, routineType, workoutPlan]);

  if (loading) {
    return (
      <View style={workoutDetailStyles.container}>
        <AppHeader title="WEIGHT" onSettingsPress={() => setShowLogoutModal(true)} />
        <View style={workoutDetailStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={workoutDetailStyles.loadingText}>Carregando treino...</Text>
        </View>
      </View>
    );
  }

  const fallbackWorkout = !planId ? mockWorkouts[routineType] : undefined;

  if (!workoutDay && !fallbackWorkout) {
    return (
      <View style={workoutDetailStyles.container}>
        <AppHeader title="WEIGHT" onSettingsPress={() => setShowLogoutModal(true)} />
        <View style={workoutDetailStyles.emptyState}>
          <Text style={workoutDetailStyles.emptyText}>Treino não encontrado</Text>
          <Text style={workoutDetailStyles.emptySubtext}>
            Selecione um treino válido para visualizar
          </Text>
        </View>
      </View>
    );
  }

  const displayName = workoutDay?.name ?? dayName ?? fallbackWorkout?.name ?? 'Treino';
  const displayDescription = workoutDay?.description ?? fallbackWorkout?.description ?? '';
  const displayDifficulty = formatDifficulty(
    workoutDay?.difficulty,
    fallbackWorkout?.difficulty ?? workoutDay?.routineType ?? routineType
  );
  const displayDuration = workoutDay?.duration != null
    ? `${workoutDay.duration} min`
    : fallbackWorkout?.duration ?? '-';

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
          <Text style={workoutDetailStyles.routineName}>{displayName}</Text>
          <Text style={workoutDetailStyles.routineDescription}>{displayDescription}</Text>
          
          <View style={workoutDetailStyles.routineInfoRow}>
            <View style={workoutDetailStyles.infoItem}>
              <Text style={workoutDetailStyles.infoLabel}>Duração:</Text>
              <Text style={workoutDetailStyles.infoValue}>{displayDuration}</Text>
            </View>
            
            <View style={workoutDetailStyles.infoItem}>
              <Text style={workoutDetailStyles.infoLabel}>Exercícios:</Text>
              <Text style={workoutDetailStyles.infoValue}>{exercises.length}</Text>
            </View>
            
            <View style={workoutDetailStyles.difficultyBadge}>
              <Text style={workoutDetailStyles.difficultyText}>{displayDifficulty}</Text>
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
                    {exercise.bodyPart}
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

