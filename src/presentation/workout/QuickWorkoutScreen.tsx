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
  Modal,
  FlatList,
  Image
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppHeader } from '../components/layout/AppHeader';
import RejectModal from '../components/ui/RejectModal';
import { executionStyles } from '../styles/executionStyles';
import { quickWorkoutStyles } from '../styles/quickWorkoutStyles';
import { Exercise } from '../../domain/entities/Workout';
import { AvailableExercise, getAllExercises, searchExercises, getExercisesByMuscleGroup, MUSCLE_GROUPS, MuscleGroup } from '../../services/mockExercises';
import { formatVolume } from '../../utils/formatters';

interface QuickWorkoutScreenProps {
  navigation: any;
  route: any;
}

interface ExerciseSet {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
}

const QuickWorkoutScreen = ({ navigation }: QuickWorkoutScreenProps) => {
  // ===== ESTADO PRINCIPAL =====
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseSets, setExerciseSets] = useState<{[key: string]: ExerciseSet[]}>({});
  
  // ===== ESTADO PARA TIMER E VOLUME =====
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // ===== ESTADO PARA MODAL DE ADICIONAR EXERCÍCIO =====
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | null>(null);
  const [availableExercises, setAvailableExercises] = useState<AvailableExercise[]>([]);
  
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

  // ===== INICIALIZAÇÃO =====
  useEffect(() => {
    // Carregar exercícios disponíveis
    setAvailableExercises(getAllExercises());
    
    // Iniciar timer automaticamente
    if (!isWorkoutActive) {
      startWorkoutTimer();
    }

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

  // ===== FUNÇÕES PARA ADICIONAR EXERCÍCIO =====
  const handleAddExercise = useCallback((exercise: AvailableExercise) => {
    // Criar novo exercício no formato Exercise
    const newExercise: Exercise = {
      id: `quick_${exercise.id}_${Date.now()}`,
      name: exercise.name,
      bodyPart: exercise.bodyPart,
      target: exercise.target,
      equipment: exercise.equipment,
      sets: 0 // Inicialmente sem sets
    };

    setExercises(prev => [...prev, newExercise]);
    
    // Inicializar com um set vazio
    setExerciseSets(prev => ({
      ...prev,
      [newExercise.id]: [{
        id: `${newExercise.id}-set-1`,
        weight: '',
        reps: '',
        completed: false
      }]
    }));

    // Fechar modal
    setShowExerciseModal(false);
    setSearchQuery('');
    setSelectedMuscleGroup(null);
  }, []);

  // ===== FUNÇÕES PARA GERENCIAR SETS =====
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

  // ===== FUNÇÕES PARA BUSCA E FILTRO =====
  const getFilteredExercises = useCallback(() => {
    let filtered = availableExercises;

    // Filtrar por busca
    if (searchQuery.trim()) {
      filtered = searchExercises(searchQuery);
    }

    // Filtrar por grupo muscular
    if (selectedMuscleGroup) {
      filtered = getExercisesByMuscleGroup(selectedMuscleGroup);
      
      // Aplicar busca também no filtro de grupo
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(ex => 
          ex.name.toLowerCase().includes(query) ||
          ex.target.toLowerCase().includes(query)
        );
      }
    }

    return filtered;
  }, [availableExercises, searchQuery, selectedMuscleGroup]);

  // ===== FUNÇÕES PARA FINALIZAR TREINO =====
  const handleFinishWorkout = () => {
    if (exercises.length === 0) {
      Alert.alert('Aviso', 'Adicione pelo menos um exercício para finalizar o treino.');
      return;
    }

    stopWorkoutTimer();
    
    const totalVolume = calculateTotalVolume();
    const completedSets = calculateCompletedSets();
    const totalSets = calculateTotalSets();
    
    // Navegar para tela de finalização
    navigation.navigate('WorkoutSummary', {
      workoutData: {
        elapsedTime,
        totalVolume,
        completedSets,
        totalSets,
        exercises,
        exerciseSets,
        workoutName: 'Treino Rápido',
        dayName: undefined,
        isQuickWorkout: true
      }
    });
  };

  // ===== FUNÇÕES PARA CANCELAR TREINO =====
  const handleCancelWorkout = () => {
    setShowCancelModal(true);
  };

  const confirmCancelWorkout = () => {
    stopWorkoutTimer();
    navigation.goBack();
  };

  // ===== FUNÇÕES AUXILIARES =====
  const getCompletedSetsCount = (exerciseId: string) => {
    return exerciseSets[exerciseId]?.filter(set => set.completed).length || 0;
  };

  const getTotalSetsCount = (exerciseId: string) => {
    return exerciseSets[exerciseId]?.length || 0;
  };

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
          <Text style={executionStyles.workoutTitle}>TREINO RÁPIDO</Text>
          <Text style={executionStyles.workoutDescription}>
            Adicione exercícios e treine no seu ritmo
          </Text>
        </View>

        {/* Timer e Volume */}
        <View style={executionStyles.statsContainer}>
          <View style={executionStyles.statCard}>
            <View style={executionStyles.statContent}>
              <Text style={executionStyles.statValue}>{formatTime(elapsedTime)}</Text>
              <Text style={executionStyles.statLabel}>Tempo</Text>
            </View>
          </View>

          <View style={executionStyles.statCard}>
            <View style={executionStyles.statContent}>
              <Text style={executionStyles.statValue}>{formatVolume(calculateTotalVolume())}</Text>
              <Text style={executionStyles.statLabel}>Volume (kg)</Text>
            </View>
          </View>

          <View style={executionStyles.statCard}>
            <View style={executionStyles.statContent}>
              <Text style={executionStyles.statValue}>{calculateCompletedSets()}/{calculateTotalSets()}</Text>
              <Text style={executionStyles.statLabel}>Sets</Text>
            </View>
          </View>
        </View>

        {/* Botão Adicionar Exercício */}
        <TouchableOpacity 
          style={quickWorkoutStyles.addExerciseButton}
          onPress={() => setShowExerciseModal(true)}
          activeOpacity={0.7}
        >
          <Text style={quickWorkoutStyles.addExerciseButtonText}>+ Adicionar Exercício</Text>
        </TouchableOpacity>

        {/* Lista de exercícios */}
        {exercises.length > 0 && (
          <View style={executionStyles.exercisesContainer}>
            {exercises.map((exercise) => (
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
                        style={quickWorkoutStyles.deleteSetButton}
                        onPress={() => handleRemoveSet(exercise.id, set.id)}
                      >
                        <Image 
                          source={require('../../../assets/Trash 2.png')} 
                          style={quickWorkoutStyles.deleteSetIcon}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {/* Botão Adicionar Set */}
                  <TouchableOpacity
                    style={quickWorkoutStyles.addSetButton}
                    onPress={() => handleAddSet(exercise.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={quickWorkoutStyles.addSetButtonText}>+ Adicionar Set</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {exercises.length === 0 && (
          <View style={quickWorkoutStyles.emptyState}>
            <Text style={quickWorkoutStyles.emptyStateText}>
              Nenhum exercício adicionado ainda
            </Text>
            <Text style={quickWorkoutStyles.emptyStateSubtext}>
              Clique em "+ Adicionar Exercício" para começar
            </Text>
          </View>
        )}
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

      {/* Modal para adicionar exercício */}
      <Modal
        visible={showExerciseModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowExerciseModal(false)}
      >
        <View style={quickWorkoutStyles.modalContainer}>
          <AppHeader title="WEIGHT" onSettingsPress={() => {}} />
          <View style={quickWorkoutStyles.modalContent}>
            {/* Header do Modal */}
            <View style={quickWorkoutStyles.modalHeader}>
              <Text style={quickWorkoutStyles.modalTitle}>Adicionar Exercício</Text>
              <TouchableOpacity 
                onPress={() => setShowExerciseModal(false)}
                style={quickWorkoutStyles.modalCloseButton}
              >
                <Text style={quickWorkoutStyles.modalCloseButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Busca */}
            <View style={quickWorkoutStyles.searchContainer}>
              <TextInput
                style={quickWorkoutStyles.searchInput}
                placeholder="Buscar exercício..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Filtros por grupo muscular - Layout Grid Compacto */}
            <View style={quickWorkoutStyles.filterContainer}>
              <TouchableOpacity
                style={[
                  quickWorkoutStyles.filterButton,
                  selectedMuscleGroup === null && quickWorkoutStyles.filterButtonActive
                ]}
                onPress={() => setSelectedMuscleGroup(null)}
              >
                <Text style={[
                  quickWorkoutStyles.filterButtonText,
                  selectedMuscleGroup === null && quickWorkoutStyles.filterButtonTextActive
                ]}>Todos</Text>
              </TouchableOpacity>
              
              {MUSCLE_GROUPS.map((group) => (
                <TouchableOpacity
                  key={group}
                  style={[
                    quickWorkoutStyles.filterButton,
                    selectedMuscleGroup === group && quickWorkoutStyles.filterButtonActive
                  ]}
                  onPress={() => setSelectedMuscleGroup(group)}
                >
                  <Text style={[
                    quickWorkoutStyles.filterButtonText,
                    selectedMuscleGroup === group && quickWorkoutStyles.filterButtonTextActive
                  ]}>{group}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Lista de exercícios */}
            <FlatList
              data={getFilteredExercises()}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={quickWorkoutStyles.exerciseItem}
                  onPress={() => handleAddExercise(item)}
                  activeOpacity={0.7}
                >
                  <View style={quickWorkoutStyles.exerciseItemInfo}>
                    <Text style={quickWorkoutStyles.exerciseItemName}>{item.name}</Text>
                    <Text style={quickWorkoutStyles.exerciseItemTarget}>
                      {item.bodyPart} • {item.target}
                    </Text>
                  </View>
                  <Text style={quickWorkoutStyles.exerciseItemAdd}>+</Text>
                </TouchableOpacity>
              )}
              style={quickWorkoutStyles.exerciseList}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default QuickWorkoutScreen;

