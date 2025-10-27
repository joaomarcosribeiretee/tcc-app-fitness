import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppHeader } from '../components/layout/AppHeader';
import RejectModal from '../components/ui/RejectModal';
import { executionStyles } from '../styles/executionStyles';
import { mockWorkouts } from '../../data/mockWorkouts';
import { RoutineType, Exercise } from '../../domain/entities/Workout';
import { formatVolume } from '../../utils/formatters';

interface WorkoutExecutionScreenProps {
  navigation: any;
  route: {
    params?: {
      routineType?: RoutineType;
      dayName?: string;
      planId?: string;
      dayId?: string;
      exercises?: Exercise[]; // Exercícios específicos do plano
    };
  };
}

interface ExerciseSet {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
}

const WorkoutExecutionScreen = ({ navigation, route }: WorkoutExecutionScreenProps) => {
  const routineType: RoutineType = route.params?.routineType || 'upper';
  const dayName = route.params?.dayName;
  
  // Usar os exercícios passados como parâmetro ou fallback para mockWorkouts
  const passedExercises = route.params?.exercises;
  const mockWorkout = mockWorkouts[routineType];
  const exercises = passedExercises || mockWorkout?.exercises || [];
  
  // Estado para controlar os sets de cada exercício
  const [exerciseSets, setExerciseSets] = useState<{[key: string]: ExerciseSet[]}>({});
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isWorkoutCompleted, setIsWorkoutCompleted] = useState(false);
  
  // ===== ESTADO PARA TIMER E VOLUME =====
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0); // em segundos
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // ===== ESTADO PARA MODAL DE CANCELAR TREINO =====
  const [showCancelModal, setShowCancelModal] = useState(false);

  // ===== FUNÇÕES PARA TIMER =====
  const startWorkoutTimer = useCallback(() => {
    if (!isWorkoutActive && !intervalRef.current) {
      setWorkoutStartTime(new Date());
      setIsWorkoutActive(true);
      
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
  }, [isWorkoutActive]);

  const stopWorkoutTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsWorkoutActive(false);
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // ===== FUNÇÕES PARA CÁLCULO DE VOLUME =====
  const calculateTotalVolume = useCallback((): number => {
    let totalVolume = 0;
    
    Object.values(exerciseSets).forEach(sets => {
      sets.forEach(set => {
        if (set.completed && set.weight && set.reps) {
          const weight = parseFloat(set.weight) || 0;
          const reps = parseInt(set.reps) || 0;
          totalVolume += weight * reps;
        }
      });
    });
    
    return totalVolume;
  }, [exerciseSets]);

  const calculateCompletedSets = useCallback((): number => {
    let completedSets = 0;
    
    Object.values(exerciseSets).forEach(sets => {
      completedSets += sets.filter(set => set.completed).length;
    });
    
    return completedSets;
  }, [exerciseSets]);

  const calculateTotalSets = useCallback((): number => {
    let totalSets = 0;
    
    Object.values(exerciseSets).forEach(sets => {
      totalSets += sets.length;
    });
    
    return totalSets;
  }, [exerciseSets]);

  // ===== EFFECTS =====
  
  // Inicializar os sets quando os exercícios mudarem
  React.useEffect(() => {
    // Debug logs (apenas uma vez por mudança de exercícios)
    console.log('WorkoutExecutionScreen - useEffect executado, exercises.length:', exercises.length);
    console.log('WorkoutExecutionScreen - route.params:', route.params);
    console.log('WorkoutExecutionScreen - routineType:', routineType);
    console.log('WorkoutExecutionScreen - passedExercises:', passedExercises);
    console.log('WorkoutExecutionScreen - mockWorkout:', mockWorkout);
    console.log('WorkoutExecutionScreen - exercises:', exercises);
    
    if (exercises.length === 0) {
      console.log('WorkoutExecutionScreen - Nenhum exercício encontrado');
      return;
    }
    
    const sets: {[key: string]: ExerciseSet[]} = {};
    exercises.forEach((exercise) => {
      // Usar sempre o número de séries do exercício (não usar padrão)
      const numSets = exercise.sets;
      console.log(`WorkoutExecutionScreen - Exercício: ${exercise.name}, Séries: ${exercise.sets}, Sets criados: ${numSets}`);
      if (numSets && numSets > 0) {
        sets[exercise.id] = Array.from({ length: numSets }, (_, index) => ({
          id: `${exercise.id}-set-${index + 1}`,
          weight: '',
          reps: '',
          completed: false
        }));
      }
    });
    console.log('WorkoutExecutionScreen - Sets finais criados:', Object.keys(sets).map(key => ({ exerciseId: key, setsCount: sets[key].length })));
    setExerciseSets(sets);
    
    // Iniciar timer automaticamente quando os exercícios são carregados
    if (!isWorkoutActive) {
      startWorkoutTimer();
    }
  }, [exercises, isWorkoutActive, startWorkoutTimer]);

  // Cleanup do timer quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // ===== REINICIAR TIMER AO VOLTAR PARA A TELA =====
  useFocusEffect(
    useCallback(() => {
      // Quando a tela recebe foco (volta da tela de resumo)
      if (!isWorkoutActive && intervalRef.current === null) {
        // Reiniciar o timer se ele não estiver rodando
        startWorkoutTimer();
      }
      
      return () => {
        // Não parar o timer quando a tela perde foco
        // O timer continua rodando em background
      };
    }, [isWorkoutActive, startWorkoutTimer])
  );

  const handleBack = () => {
    navigation.goBack();
  };

  const handleFinishWorkout = () => {
    stopWorkoutTimer();
    
    const totalVolume = calculateTotalVolume();
    const completedSets = calculateCompletedSets();
    const totalSets = calculateTotalSets();
    
    // Navegar para tela de finalização com os dados do treino
    navigation.navigate('WorkoutSummary', {
      workoutData: {
        elapsedTime,
        totalVolume,
        completedSets,
        totalSets,
        exercises,
        exerciseSets,
        workoutName: mockWorkout?.name || 'Treino Personalizado',
        dayName
      }
    });
  };

  const handleSetComplete = useCallback((exerciseId: string, setId: string) => {
    setExerciseSets(prev => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map(set => 
        set.id === setId 
          ? { ...set, completed: !set.completed }
          : set
      )
    }));
  }, []);

  const handleSetChange = useCallback((exerciseId: string, setId: string, field: 'weight' | 'reps', value: string) => {
    // Permitir apenas números e vírgula/ponto para decimais
    const numericValue = value.replace(/[^0-9.,]/g, '').replace(',', '.');
    
    setExerciseSets(prev => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map(set => 
        set.id === setId 
          ? { ...set, [field]: numericValue }
          : set
      )
    }));
  }, []);

  const handleAddSet = useCallback((exerciseId: string) => {
    setExerciseSets(prev => {
      const currentSets = prev[exerciseId] || [];
      const newSetNumber = currentSets.length + 1;
      
      return {
        ...prev,
        [exerciseId]: [
          ...currentSets,
          {
            id: `${exerciseId}-set-${newSetNumber}`,
            weight: '',
            reps: '',
            completed: false
          }
        ]
      };
    });
  }, []);

  const handleRemoveSet = useCallback((exerciseId: string, setId: string) => {
    setExerciseSets(prev => ({
      ...prev,
      [exerciseId]: prev[exerciseId].filter(set => set.id !== setId)
    }));
  }, []);

  const getCompletedSetsCount = (exerciseId: string) => {
    return exerciseSets[exerciseId]?.filter(set => set.completed).length || 0;
  };

  const getTotalSetsCount = (exerciseId: string) => {
    return exerciseSets[exerciseId]?.length || 0;
  };

  // ===== FUNÇÕES PARA CANCELAR TREINO =====
  const handleCancelWorkout = () => {
    setShowCancelModal(true);
  };

  const confirmCancelWorkout = () => {
    // Parar o timer
    stopWorkoutTimer();
    // Voltar para a tela anterior
    navigation.goBack();
  };

  if (exercises.length === 0) {
    return (
      <View style={executionStyles.container}>
        <AppHeader title="WEIGHT" onSettingsPress={() => {}} />
        <View style={executionStyles.emptyState}>
          <Text style={executionStyles.emptyText}>Treino não encontrado</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={executionStyles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppHeader title="WEIGHT" onSettingsPress={() => {}} />
      
      {/* Modal de confirmação para cancelar treino */}
      <RejectModal
        visible={showCancelModal}
        title="Cancelar Treino?"
        message="Você tem certeza que deseja descartar este treino? Todo o progresso será perdido."
        confirmText="SIM"
        cancelText="NÃO"
        onConfirm={confirmCancelWorkout}
        onCancel={() => setShowCancelModal(false)}
      />
      
      <ScrollView style={executionStyles.content} showsVerticalScrollIndicator={false}>
        {/* Header do treino */}
        <View style={executionStyles.workoutHeader}>
          {dayName && (
            <Text style={executionStyles.dayBadge}>{dayName}</Text>
          )}
          <Text style={executionStyles.workoutTitle}>
            {mockWorkout?.name || 'Treino Personalizado'}
          </Text>
          <Text style={executionStyles.workoutDescription}>
            {mockWorkout?.description || 'Treino gerado pela IA'}
          </Text>
        </View>

        {/* Timer e Volume - Estilo Hevy */}
        <View style={executionStyles.statsContainer}>
          {/* Timer */}
          <View style={executionStyles.statCard}>
            <View style={executionStyles.statContent}>
              <Text style={executionStyles.statValue}>{formatTime(elapsedTime)}</Text>
              <Text style={executionStyles.statLabel}>Tempo</Text>
            </View>
          </View>

          {/* Volume Total */}
          <View style={executionStyles.statCard}>
            <View style={executionStyles.statContent}>
              <Text style={executionStyles.statValue}>{formatVolume(calculateTotalVolume())}</Text>
              <Text style={executionStyles.statLabel}>Volume (kg)</Text>
            </View>
          </View>

          {/* Sets Completados */}
          <View style={executionStyles.statCard}>
            <View style={executionStyles.statContent}>
              <Text style={executionStyles.statValue}>{calculateCompletedSets()}/{calculateTotalSets()}</Text>
              <Text style={executionStyles.statLabel}>Sets</Text>
            </View>
          </View>
        </View>

        {/* Lista de exercícios */}
        <View style={executionStyles.exercisesContainer}>
          {exercises.map((exercise, exerciseIndex) => (
            <View key={exercise.id} style={executionStyles.exerciseCard}>
              {/* Header do exercício */}
              <View style={executionStyles.exerciseHeader}>
                <View style={executionStyles.exerciseInfo}>
                  <Text style={executionStyles.exerciseName}>{exercise.name}</Text>
                  <Text style={executionStyles.exerciseTarget}>
                    {exercise.bodyPart} • {exercise.target}
                  </Text>
                </View>
                <View style={executionStyles.exerciseProgress}>
                  <Text style={executionStyles.progressText}>
                    {getCompletedSetsCount(exercise.id)}/{getTotalSetsCount(exercise.id)} sets
                  </Text>
                </View>
              </View>

              {/* Sets do exercício */}
              <View style={executionStyles.setsContainer}>
                <View style={executionStyles.setsHeader}>
                  <Text style={[executionStyles.setHeaderText, { width: 40 }]}>Set</Text>
                  <Text style={[executionStyles.setHeaderText, { width: 80, marginHorizontal: 6 }]}>Peso (kg)</Text>
                  <Text style={[executionStyles.setHeaderText, { width: 80, marginHorizontal: 6 }]}>Reps</Text>
                  <Text style={[executionStyles.setHeaderText, { width: 40, marginLeft: 6 }]}>✓</Text>
                  <Text style={[executionStyles.setHeaderText, { width: 44 }]}></Text>
                </View>

                {exerciseSets[exercise.id]?.map((set, setIndex) => (
                  <View key={set.id} style={executionStyles.setRow}>
                    <Text style={executionStyles.setNumber}>{setIndex + 1}</Text>

                    <TextInput
                      style={[
                        executionStyles.setInput,
                        set.completed && executionStyles.setInputCompleted
                      ]}
                      value={set.weight}
                      onChangeText={(value) => handleSetChange(exercise.id, set.id, 'weight', value)}
                      placeholder="0"
                      keyboardType="numeric"
                      editable={!set.completed}
                    />

                    <TextInput
                      style={[
                        executionStyles.setInput,
                        set.completed && executionStyles.setInputCompleted
                      ]}
                      value={set.reps}
                      onChangeText={(value) => handleSetChange(exercise.id, set.id, 'reps', value)}
                      placeholder="0"
                      keyboardType="numeric"
                      editable={!set.completed}
                    />

                    <TouchableOpacity
                      style={[
                        executionStyles.completeButton,
                        set.completed && executionStyles.completeButtonActive
                      ]}
                      onPress={() => handleSetComplete(exercise.id, set.id)}
                    >
                      <Text style={[
                        executionStyles.completeButtonText,
                        set.completed && executionStyles.completeButtonTextActive
                      ]}>
                        {set.completed ? '✓' : '○'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center', marginLeft: 6 }}
                      onPress={() => handleRemoveSet(exercise.id, set.id)}
                    >
                      <Image 
                        source={require('../../../assets/Trash 2.png')} 
                        style={{ width: 20, height: 20, tintColor: '#FF6B6B' }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Botão Adicionar Set */}
                <TouchableOpacity
                  style={executionStyles.addSetButton}
                  onPress={() => handleAddSet(exercise.id)}
                  activeOpacity={0.7}
                >
                  <Text style={executionStyles.addSetButtonText}>+ Adicionar Set</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Botões de ação */}
      <View style={executionStyles.buttonContainer}>
        <TouchableOpacity
          style={executionStyles.finishButton}
          onPress={handleFinishWorkout}
        >
          <Text style={executionStyles.finishButtonText}>FINALIZAR TREINO</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={executionStyles.backButton}
          onPress={handleCancelWorkout}
        >
          <Text style={executionStyles.backButtonText}>CANCELAR TREINO</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default WorkoutExecutionScreen;
