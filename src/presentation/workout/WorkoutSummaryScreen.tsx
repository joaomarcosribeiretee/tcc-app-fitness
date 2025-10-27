import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import { executionStyles } from '../styles/executionStyles';
import { WorkoutHistoryService } from '../../infra/workoutHistoryService';
import type { WorkoutRecord } from '../../infra/workoutHistoryService';
import UserService from '../../infra/userService';

interface WorkoutSummaryProps {
  navigation: any;
  route: {
    params: {
      workoutData: {
        elapsedTime: number;
        totalVolume: number;
        completedSets: number;
        totalSets: number;
        exercises: any[];
        exerciseSets: { [key: string]: any[] };
        workoutName: string;
        dayName?: string;
        isQuickWorkout?: boolean;
      };
    };
  };
}

const WorkoutSummaryScreen = ({ navigation, route }: WorkoutSummaryProps) => {
  const { workoutData } = route.params;
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // ===== FUNÇÕES DE FORMATAÇÃO =====
  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  }, []);

  const getMuscleGroups = useCallback((): string[] => {
    const muscleGroups = new Set<string>();
    if (workoutData.exercises && Array.isArray(workoutData.exercises)) {
      workoutData.exercises.forEach(exercise => {
        if (exercise && exercise.bodyPart && typeof exercise.bodyPart === 'string' && exercise.bodyPart.trim().length > 0) {
          muscleGroups.add(exercise.bodyPart.trim());
        }
      });
    }
    const groups = Array.from(muscleGroups).filter(g => g && g.length > 0);
    console.log('💪 Muscle groups extraídos:', groups);
    return groups;
  }, [workoutData.exercises]);

  const getExerciseStats = useCallback(() => {
    if (!workoutData.exercises || !Array.isArray(workoutData.exercises)) {
      return [];
    }
    
    const stats = workoutData.exercises.map(exercise => {
      if (!exercise || !exercise.id) {
        return {
          name: 'Exercício não encontrado',
          completedSets: 0,
          totalSets: 0,
          volume: 0,
          bodyPart: 'N/A'
        };
      }
      
      const sets = workoutData.exerciseSets[exercise.id] || [];
      const completedSets = sets.filter(set => set.completed).length;
      const totalWeight = sets.reduce((sum, set) => {
        if (set.completed && set.weight && set.reps) {
          return sum + (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0);
        }
        return sum;
      }, 0);
      
      return {
        name: exercise.name || 'Exercício',
        completedSets,
        totalSets: sets.length,
        volume: totalWeight,
        bodyPart: exercise.bodyPart || 'N/A'
      };
    });
    
    return stats;
  }, [workoutData.exercises, workoutData.exerciseSets]);

  // ===== FUNÇÕES DE SALVAMENTO =====
  const saveWorkout = useCallback(async () => {
    setIsSaving(true);
    
    try {
      // Obter ID do usuário atual
      const userId = await UserService.getCurrentUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      console.log('💾 Preparando para salvar treino completo...');
      console.log('📊 Dados disponíveis:', {
        exercisesCount: workoutData.exercises?.length,
        exerciseSetsCount: Object.keys(workoutData.exerciseSets || {}).length,
        totalVolume: workoutData.totalVolume,
        duration: workoutData.elapsedTime
      });

      // Construir array completo de exercícios com dados detalhados
      const exercises: any[] = [];
      
      if (workoutData.exercises && Array.isArray(workoutData.exercises)) {
        workoutData.exercises.forEach((exercise: any) => {
          if (!exercise || !exercise.id) return;
          
          const sets = workoutData.exerciseSets[exercise.id] || [];
          const completedSets = sets.filter((set: any) => set.completed).length;
          
          // Calcular volume total deste exercício
          const totalWeight = sets.reduce((sum: number, set: any) => {
            if (set.completed && set.weight && set.reps) {
              return sum + (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0);
            }
            return sum;
          }, 0);
          
          // Construir array de sets completos
          const setsRecord = sets.map((set: any, index: number) => ({
            setId: `set_${exercise.id}_${index}`,
            setNumber: index + 1,
            weight: parseFloat(set.weight) || 0,
            reps: parseInt(set.reps) || 0,
            completed: set.completed || false
          }));
          
          exercises.push({
            id: exercise.id,
            name: exercise.name || 'Exercício',
            bodyPart: exercise.bodyPart || 'N/A',
            target: exercise.target || 'N/A',
            equipment: exercise.equipment || 'N/A',
            completedSets: completedSets,
            totalSets: sets.length,
            volume: totalWeight,
            sets: setsRecord
          });
        });
      }

      // Criar registro completo do treino
      const trimmedNotes = workoutNotes.trim();
      // Só incluir notes se não estiver vazia
      const notesValue = trimmedNotes.length > 0 ? trimmedNotes : undefined;
      
      const workoutRecord: WorkoutRecord = {
        id: `workout_${Date.now()}`,
        userId: userId,
        date: new Date().toISOString(),
        name: workoutData.workoutName || 'Treino',
        dayName: workoutData.dayName,
        duration: workoutData.elapsedTime,
        totalVolume: workoutData.totalVolume,
        completedSets: workoutData.completedSets,
        totalSets: workoutData.totalSets,
        muscleGroups: getMuscleGroups(),
        exercises: exercises, // Dados completos incluindo sets
        ...(notesValue && { notes: notesValue }), // Só inclui notes se tiver valor
        createdAt: new Date().toISOString()
      };

      console.log('✅ Estrutura do treino preparada:', {
        id: workoutRecord.id,
        exercisesCount: workoutRecord.exercises.length,
        totalVolume: workoutRecord.totalVolume
      });

      // Salvar usando o serviço de histórico
      await WorkoutHistoryService.saveWorkout(workoutRecord);
      
      console.log('✅ Treino salvo com sucesso, mostrando modal customizado...');
      
      // Usar modal customizado diretamente (Alert.alert não funciona no ambiente atual)
      setShowSuccessModal(true);
      console.log('✅ Modal customizado ativado');
    } catch (error) {
      console.error('❌ Erro ao salvar treino:', error);
      Alert.alert('Erro', 'Não foi possível salvar o treino. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  }, [workoutData, workoutNotes, getMuscleGroups, navigation]);

  const handleNavigateToHome = useCallback(() => {
    console.log('🏠 Navegando para tela inicial...');
    navigation.reset({
      index: 0,
      routes: [
        { name: 'Main', params: { screen: 'Workout' } }
      ],
    });
  }, [navigation]);

  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false);
    handleNavigateToHome();
  }, [handleNavigateToHome]);

  const handleBack = useCallback(() => {
    // Voltar para a tela de execução do treino
    navigation.goBack();
  }, [navigation]);

  return (
    <KeyboardAvoidingView 
      style={executionStyles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppHeader title="WEIGHT" onSettingsPress={() => {}} />
      
      <ScrollView style={executionStyles.content} showsVerticalScrollIndicator={false}>
        {/* Header de Finalização */}
        <View style={executionStyles.summaryHeader}>
          <Text style={executionStyles.summaryTitle}>Treino Finalizado!</Text>
          <Text style={executionStyles.summarySubtitle}>
            {workoutData.workoutName}
            {workoutData.dayName && ` • ${workoutData.dayName}`}
          </Text>
        </View>

        {/* Notas do Treino - Movido para o topo */}
        <View style={executionStyles.section}>
          <Text style={executionStyles.sectionTitle}>Notas do Treino</Text>
          <Text style={executionStyles.sectionSubtitle}>
            Adicione observações sobre como foi o treino (opcional)
          </Text>
          <TextInput
            style={executionStyles.notesInput}
            placeholder="Ex: Treino muito bom, senti mais força hoje, próximo treino aumentar peso no supino..."
            placeholderTextColor="#999999"
            value={workoutNotes}
            onChangeText={setWorkoutNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Estatísticas Principais */}
        <View style={executionStyles.statsContainer}>
          <View style={executionStyles.statCard}>
            <View style={executionStyles.statContent}>
              <Text style={executionStyles.statValue}>{formatTime(workoutData.elapsedTime)}</Text>
              <Text style={executionStyles.statLabel}>Duração</Text>
            </View>
          </View>

          <View style={executionStyles.statCard}>
            <View style={executionStyles.statContent}>
              <Text style={executionStyles.statValue}>{workoutData.totalVolume.toFixed(0)}</Text>
              <Text style={executionStyles.statLabel}>Volume (kg)</Text>
            </View>
          </View>

          <View style={executionStyles.statCard}>
            <View style={executionStyles.statContent}>
              <Text style={executionStyles.statValue}>{workoutData.completedSets}/{workoutData.totalSets}</Text>
              <Text style={executionStyles.statLabel}>Sets</Text>
            </View>
          </View>
        </View>

        {/* Grupos Musculares */}
        <View style={executionStyles.section}>
          <Text style={executionStyles.sectionTitle}>Grupos Musculares</Text>
          <View style={executionStyles.muscleGroupsContainer}>
            {getMuscleGroups().map((muscle, index) => (
              <View key={index} style={executionStyles.muscleGroupTag}>
                <Text style={executionStyles.muscleGroupText}>{muscle}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Resumo dos Exercícios */}
        <View style={executionStyles.section}>
          <Text style={executionStyles.sectionTitle}>Resumo dos Exercícios</Text>
          {getExerciseStats().map((exercise, index) => (
            <View key={index} style={executionStyles.exerciseSummaryCard}>
              <View style={executionStyles.exerciseSummaryHeader}>
                <Text style={executionStyles.exerciseSummaryName}>{exercise.name}</Text>
                <Text style={executionStyles.exerciseSummaryBodyPart}>{exercise.bodyPart}</Text>
              </View>
              <View style={executionStyles.exerciseSummaryStats}>
                <View style={executionStyles.exerciseSummaryStat}>
                  <Text style={executionStyles.exerciseSummaryStatValue}>{exercise.completedSets}/{exercise.totalSets}</Text>
                  <Text style={executionStyles.exerciseSummaryStatLabel}>Sets</Text>
                </View>
                <View style={executionStyles.exerciseSummaryStat}>
                  <Text style={executionStyles.exerciseSummaryStatValue}>{exercise.volume.toFixed(0)}</Text>
                  <Text style={executionStyles.exerciseSummaryStatLabel}>Volume</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Botões de Ação */}
      <View style={executionStyles.buttonContainer}>
        <TouchableOpacity
          style={[executionStyles.finishButton, isSaving && executionStyles.finishButtonDisabled]}
          onPress={saveWorkout}
          disabled={isSaving}
        >
          <Text style={executionStyles.finishButtonText}>
            {isSaving ? 'Salvando...' : 'Salvar Treino'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={executionStyles.backButton}
          onPress={handleBack}
          disabled={isSaving}
        >
          <Text style={executionStyles.backButtonText}>Voltar para o Treino</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Sucesso - Padrão do App */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleSuccessModalClose}
      >
        <View style={executionStyles.modalOverlay}>
          <View style={executionStyles.modalContainer}>
            {/* Ícone de sucesso */}
            <View style={executionStyles.iconContainer}>
              <Text style={executionStyles.checkIcon}>✓</Text>
            </View>

            {/* Título */}
            <Text style={executionStyles.modalTitle}>Treino Salvo!</Text>

            {/* Mensagem */}
            <Text style={executionStyles.modalMessage}>
              Seu treino foi salvo com sucesso e já está disponível no seu perfil.
            </Text>

            {/* Botão de fechar */}
            <TouchableOpacity
              style={executionStyles.modalButton}
              onPress={handleSuccessModalClose}
              activeOpacity={0.8}
            >
              <Text style={executionStyles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default WorkoutSummaryScreen;
