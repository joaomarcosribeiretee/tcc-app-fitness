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
import { executionStyles } from '../styles/executionStyles';
import { mockWorkouts } from '../../data/mockWorkouts';
import { RoutineType, Exercise } from '../../domain/entities/Workout';

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

  // Inicializar os sets quando os exercícios mudarem
  React.useEffect(() => {
    console.log('WorkoutExecutionScreen - useEffect executado, exercises.length:', exercises.length);
    console.log('WorkoutExecutionScreen - Exercícios recebidos:', exercises.map(ex => ({ name: ex.name, sets: ex.sets })));
    
    if (exercises.length === 0) return;
    
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
  }, [exercises]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleFinishWorkout = () => {
    Alert.alert(
      'Treino Concluído!',
      'Parabéns! Você completou seu treino com sucesso.',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Main', { screen: 'Workout' })
        }
      ]
    );
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
    setExerciseSets(prev => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map(set => 
        set.id === setId 
          ? { ...set, [field]: value }
          : set
      )
    }));
  }, []);

  const getCompletedSetsCount = (exerciseId: string) => {
    return exerciseSets[exerciseId]?.filter(set => set.completed).length || 0;
  };

  const getTotalSetsCount = (exerciseId: string) => {
    return exerciseSets[exerciseId]?.length || 0;
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
                  </View>
                ))}
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
          onPress={handleBack}
        >
          <Text style={executionStyles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default WorkoutExecutionScreen;
