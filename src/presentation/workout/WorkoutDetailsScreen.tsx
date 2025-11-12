import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity
} from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import { workoutDetailStyles } from '../styles/workoutDetailStyles';
import type { WorkoutRecord } from '../../infra/workoutHistoryService';
import { formatVolume, formatTime } from '../../utils/formatters';

interface WorkoutDetailsScreenProps {
  navigation: any;
  route: {
    params: {
      workout: WorkoutRecord;
    };
  };
}

const WorkoutDetailsScreen = ({ navigation, route }: WorkoutDetailsScreenProps) => {
  const { workout } = route.params;

  console.log('🔍 WorkoutDetailsScreen >> workout recebido:', workout);
  workout.exercises?.forEach((exercise, index) => {
    console.log(`   └─ Exercício [${index}]`, {
      id: exercise.id,
      nome: exercise.name,
      totalSets: exercise.totalSets,
      completedSets: exercise.completedSets,
      volume: exercise.volume,
      sets: exercise.sets,
    });
  });

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Funções de formatação agora importadas de utils/formatters.ts

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={workoutDetailStyles.container}>
      <AppHeader 
        title="WEIGHT"
        onSettingsPress={() => {}}
      />
      
      <ScrollView 
        style={workoutDetailStyles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header do Treino */}
        <View style={workoutDetailStyles.workoutHeader}>
          <Text style={workoutDetailStyles.workoutTitle}>{workout.name || 'Treino'}</Text>
          <Text style={workoutDetailStyles.workoutDate}>{formatDate(workout.date || new Date().toISOString())}</Text>
          
          {workout.notes && typeof workout.notes === 'string' && workout.notes.trim().length > 0 && (
            <Text style={workoutDetailStyles.workoutNotes}>"{workout.notes}"</Text>
          )}
        </View>

        {/* Estatísticas do Treino */}
        <View style={workoutDetailStyles.statsContainer}>
          <View style={workoutDetailStyles.statCard}>
            <Text style={workoutDetailStyles.statValue}>{formatTime(workout.duration || 0)}</Text>
            <Text style={workoutDetailStyles.statLabel}>Tempo</Text>
          </View>
          <View style={workoutDetailStyles.statCard}>
            <Text style={workoutDetailStyles.statValue}>{formatVolume(workout.totalVolume || 0)}</Text>
            <Text style={workoutDetailStyles.statLabel}>Volume</Text>
          </View>
          <View style={workoutDetailStyles.statCard}>
            <Text style={workoutDetailStyles.statValue}>{workout.completedSets || 0}/{workout.totalSets || 0}</Text>
            <Text style={workoutDetailStyles.statLabel}>Sets</Text>
          </View>
        </View>

        {/* Grupos Musculares */}
        <View style={workoutDetailStyles.section}>
          <Text style={workoutDetailStyles.sectionTitle}>Grupos Musculares</Text>
          <View style={workoutDetailStyles.muscleGroupsContainer}>
            {workout.muscleGroups?.map((muscle, index) => (
              <View key={index} style={workoutDetailStyles.muscleGroupTag}>
                <Text style={workoutDetailStyles.muscleGroupText}>{muscle || 'N/A'}</Text>
              </View>
            )) || []}
          </View>
        </View>

        {/* Exercícios Detalhados */}
        <View style={workoutDetailStyles.section}>
          <Text style={workoutDetailStyles.sectionTitle}>Exercícios Realizados</Text>
          <Text style={workoutDetailStyles.sectionSubtitle}>
            Detalhes de cada exercício com cargas e repetições
          </Text>
          
          {workout.exercises?.map((exercise, index) => (
            <View key={exercise.id || index} style={workoutDetailStyles.historyExerciseCard}>
              <View style={workoutDetailStyles.historyExerciseHeader}>
                <Text style={workoutDetailStyles.historyExerciseName}>{exercise.name || 'Exercício'}</Text>
                <Text style={workoutDetailStyles.historyExerciseBodyPart}>{exercise.bodyPart || 'N/A'}</Text>
              </View>
              
              <View style={workoutDetailStyles.historyExerciseStats}>
                <View style={workoutDetailStyles.historyExerciseStat}>
                  <Text style={workoutDetailStyles.historyExerciseStatValue}>{exercise.completedSets || 0}/{exercise.totalSets || 0}</Text>
                  <Text style={workoutDetailStyles.historyExerciseStatLabel}>Sets</Text>
                </View>
                <View style={workoutDetailStyles.historyExerciseStat}>
                  <Text style={workoutDetailStyles.historyExerciseStatValue}>{formatVolume(exercise.volume || 0)}</Text>
                  <Text style={workoutDetailStyles.historyExerciseStatLabel}>Volume</Text>
                </View>
              </View>
              
              {/* Exibir sets individuais se disponíveis */}
              {exercise.sets && Array.isArray(exercise.sets) && exercise.sets.length > 0 && (
                <View style={{ marginTop: 12 }}>
                  <Text style={{ 
                    color: '#8E8E93', 
                    fontSize: 12, 
                    marginBottom: 8,
                    fontWeight: '600'
                  }}>Séries:</Text>
                  {exercise.sets.map((set, setIndex) => (
                    <View key={set.setId || setIndex} style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      backgroundColor: set.completed ? 'rgba(0, 122, 255, 0.1)' : 'rgba(142, 142, 147, 0.1)',
                      borderRadius: 6,
                      marginBottom: 4
                    }}>
                      <Text style={{ 
                        color: set.completed ? '#007AFF' : '#8E8E93',
                        fontSize: 14,
                        fontWeight: '500'
                      }}>
                        Set {set.setNumber}
                      </Text>
                      <Text style={{ 
                        color: set.completed ? '#007AFF' : '#8E8E93',
                        fontSize: 14 
                      }}>
                        {set.weight}kg x {set.reps} reps
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )) || []}
        </View>
      </ScrollView>

      {/* Botão Voltar */}
      <View style={workoutDetailStyles.historyButtonContainer}>
        <TouchableOpacity
          style={workoutDetailStyles.historyBackButton}
          onPress={handleBack}
        >
          <Text style={workoutDetailStyles.historyBackButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WorkoutDetailsScreen;
