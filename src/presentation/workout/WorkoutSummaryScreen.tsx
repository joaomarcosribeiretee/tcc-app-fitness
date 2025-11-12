import React, { useState, useCallback, useMemo } from 'react';
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
import type { WorkoutSessionPayload } from '../../infra/workoutHistoryService';
import UserService from '../../infra/userService';
import { Exercise } from '../../domain/entities/Workout';

interface ExerciseSetSummary {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
}

interface WorkoutSummaryData {
  treinoId: number;
  elapsedTime: number;
  totalVolume: number;
  completedSets: number;
  totalSets: number;
  exercises: Exercise[];
  exerciseSets: Record<string, ExerciseSetSummary[]>;
  workoutName?: string;
  dayName?: string;
  workoutDescription?: string;
  workoutDifficulty?: string;
  workoutDuration?: number | null;
  workoutStartTimestamp?: string;
}

type WorkoutSummaryProps = {
  navigation: any;
  route: { params: { workoutData: WorkoutSummaryData } };
};

const normalizeLabel = (value?: string | null) =>
  (value ?? '')
    .normalize('NFD')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .toLowerCase()
    .trim();

const WorkoutSummaryScreen = ({ navigation, route }: WorkoutSummaryProps) => {
  const { workoutData } = route.params;

  const validExercises = useMemo(() => Array.isArray(workoutData.exercises) ? workoutData.exercises : [], [workoutData.exercises]);

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
    if (validExercises.length > 0) {
      validExercises.forEach((exercise: { bodyPart?: string } | null) => {
        if (exercise?.bodyPart && typeof exercise.bodyPart === 'string') {
          muscleGroups.add(exercise.bodyPart.trim());
        }
      });
    }
    const groups = Array.from(muscleGroups).filter(g => g && g.length > 0);
    return groups;
  }, [validExercises]);

  const getExerciseStats = useCallback(() => {
    if (validExercises.length === 0) {
      return [];
    }
    
    const stats = validExercises.map(
      (
        exercise: {
          id?: string;
          name?: string;
          bodyPart?: string;
          target?: string;
          equipment?: string;
        } | null
      ) => {
      if (!exercise || !exercise.id) {
        return {
          name: 'Exercício não encontrado',
          completedSets: 0,
          totalSets: 0,
          volume: 0,
          bodyPart: 'N/A'
        };
      }
      
      const sets = workoutData.exerciseSets?.[exercise.id] || [];
      const completedSets = sets.filter((set: any) => set?.completed === true).length;
      const totalWeight = sets.reduce((sum: number, set: any) => {
        if (set?.completed) {
          const weightValue = Number.parseFloat(set.weight);
          const repsValue = Number.parseInt(set.reps, 10);
          const safeWeight = Number.isFinite(weightValue) && weightValue >= 0 ? weightValue : 0;
          const safeReps = Number.isFinite(repsValue) && repsValue > 0 ? repsValue : 0;
          return sum + safeWeight * safeReps;
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
  }, [validExercises, workoutData.exerciseSets]);

  // ===== FUNÇÕES DE SALVAMENTO =====
  const saveWorkout = useCallback(async () => {
    setIsSaving(true);
    
    try {
      // Obter ID do usuário atual
      const userId = await UserService.getCurrentUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      if (!workoutData || !workoutData.treinoId) {
        throw new Error('Dados do treino incompletos');
      }

      const trimmedNotes = workoutNotes.trim();
      const finishedAt = new Date().toISOString();
      const startedAt = workoutData.workoutStartTimestamp || new Date(Date.now() - workoutData.elapsedTime * 1000).toISOString();

      const processedExercises = validExercises
        .map((exercise) => {
          if (!exercise?.id) {
            return null;
          }

          const backendExerciseId = Number(exercise.id);
          if (!Number.isFinite(backendExerciseId)) {
            return null;
          }

          const sets = workoutData.exerciseSets?.[exercise.id] || [];
          const formattedSets = sets
            .map((set) => {
              if (!set.completed) {
                return null;
              }

              const repsValue = Number.parseInt(set.reps, 10);
              if (!Number.isFinite(repsValue) || repsValue <= 0) {
                return null;
              }

              const rawWeight = Number.parseFloat(set.weight);
              const safeWeight = Number.isFinite(rawWeight) && rawWeight >= 0 ? rawWeight : 0;

              return {
                weight: safeWeight,
                reps: repsValue,
                completed: true,
              };
            })
            .filter(Boolean) as { weight: number; reps: number; completed: boolean }[];

          if (formattedSets.length === 0) {
            return null;
          }

          return {
            backendExerciseId,
            id: exercise.id,
            name: exercise.name || 'Exercício',
            bodyPart: exercise.bodyPart || 'N/A',
            target: exercise.target || 'N/A',
            equipment: exercise.equipment || 'N/A',
            sets: formattedSets,
          };
        })
        .filter(Boolean) as {
          backendExerciseId: number;
          id: string;
          name: string;
          bodyPart: string;
          target: string;
          equipment: string;
          sets: { weight: number; reps: number; completed: boolean }[];
        }[];

      if (processedExercises.length === 0) {
        Alert.alert('Dados incompletos', 'Marque pelo menos uma série concluída com carga e repetições para salvar o treino.');
        return;
      }

      const payload: WorkoutSessionPayload = {
        userId: userId,
        treinoId: workoutData.treinoId,
        workoutName: workoutData.workoutName || 'Treino',
        dayName: workoutData.dayName,
        durationSeconds: workoutData.elapsedTime,
        totalVolume: workoutData.totalVolume,
        completedSets: workoutData.completedSets,
        totalSets: workoutData.totalSets,
        muscleGroups: getMuscleGroups(),
        notes: trimmedNotes.length > 0 ? trimmedNotes : undefined,
        startedAt,
        finishedAt,
        workoutDescription: workoutData.workoutDescription,
        workoutDifficulty: workoutData.workoutDifficulty,
        workoutDuration: workoutData.workoutDuration ?? undefined,
        exercises: processedExercises.map((exercise) => ({
          id: exercise.id,
          backendExerciseId: exercise.backendExerciseId,
          name: exercise.name,
          bodyPart: exercise.bodyPart,
          target: exercise.target,
          equipment: exercise.equipment,
          sets: exercise.sets,
        })),
      };

      await WorkoutHistoryService.saveWorkout(payload);

      setShowSuccessModal(true);
    } catch (error) {
      console.error('❌ Erro ao salvar treino:', error);
      Alert.alert('Erro', 'Não foi possível salvar o treino. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  }, [workoutData, workoutNotes, validExercises, getMuscleGroups]);

  const handleNavigateToHome = useCallback(() => {
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

  const headerTitle = workoutData.workoutName?.trim() || '';
  const headerDay = workoutData.dayName?.trim() || '';
  const headerSubtitle = headerDay && normalizeLabel(headerDay) !== normalizeLabel(headerTitle)
    ? `${headerTitle}${headerTitle && headerDay ? ' • ' : ''}${headerDay}`
    : headerTitle || headerDay;

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
            {headerSubtitle}
          </Text>
          {workoutData.workoutDescription && (
            <Text style={executionStyles.summaryDescription}>{workoutData.workoutDescription}</Text>
          )}
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
          {getExerciseStats().map((exercise: any, index: number) => (
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
