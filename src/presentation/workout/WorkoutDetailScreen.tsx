import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { AppHeader } from '../components/layout/AppHeader';
import { workoutDetailStyles } from '../styles/workoutDetailStyles';
import { mockWorkouts } from '../../data/mockWorkouts';
import { RoutineType } from '../../domain/entities/Workout';

interface WorkoutDetailScreenProps {
  navigation: any;
  route: {
    params?: {
      routineType?: RoutineType;
      dayName?: string;
      planId?: string;
    };
  };
}

const WorkoutDetailScreen = ({ navigation, route }: WorkoutDetailScreenProps) => {
  const routineType: RoutineType = route.params?.routineType || 'upper';
  const dayName = route.params?.dayName;
  const workout = mockWorkouts[routineType];

  const handleStartWorkout = () => {
    Alert.alert(
      'Iniciar Treino',
      'Funcionalidade de execução de treino será implementada em breve!',
      [{ text: 'OK' }]
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (!workout) {
    return (
      <View style={workoutDetailStyles.container}>
        <AppHeader title="WEIGHT" onSettingsPress={() => {}} />
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
      <AppHeader title="WEIGHT" onSettingsPress={() => {}} />
      
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
              <Text style={workoutDetailStyles.infoValue}>{workout.exercises.length}</Text>
            </View>
            
            <View style={workoutDetailStyles.difficultyBadge}>
              <Text style={workoutDetailStyles.difficultyText}>{workout.difficulty}</Text>
            </View>
          </View>
        </View>

        {/* Lista de exercícios */}
        <View style={workoutDetailStyles.exercisesList}>
          <Text style={workoutDetailStyles.sectionTitle}>Exercícios</Text>
          
          {workout.exercises.map((exercise, index) => (
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
        <TouchableOpacity
          style={workoutDetailStyles.startButton}
          onPress={handleStartWorkout}
        >
          <Text style={workoutDetailStyles.startButtonText}>INICIAR TREINO</Text>
        </TouchableOpacity>
        
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

