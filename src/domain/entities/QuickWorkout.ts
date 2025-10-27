/**
 * Entidades para Treino Rápido
 * 
 * Clean Architecture - Domain Layer
 * Define a estrutura de dados para treinos rápidos onde o usuário
 * adiciona exercícios e sets dinamicamente (estilo Hevy app)
 */

export interface QuickWorkoutSet {
  setId: string;
  setNumber: number;
  weight: number; // kg
  reps: number;
  rir?: number; // Reps In Reserve (opcional)
  completed: boolean;
}

export interface QuickWorkoutExercise {
  id: string;
  exerciseId: string; // ID do exercício da base de dados
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  sets: QuickWorkoutSet[];
}

export interface QuickWorkout {
  id: string;
  exercises: QuickWorkoutExercise[];
  startTime?: Date;
  endTime?: Date;
  notes?: string;
}

/**
 * Totaliza o volume de um exercício
 */
export function calculateExerciseVolume(exercise: QuickWorkoutExercise): number {
  return exercise.sets.reduce((total, set) => {
    return total + (set.weight * set.reps);
  }, 0);
}

/**
 * Totaliza o volume de um treino completo
 */
export function calculateTotalVolume(workout: QuickWorkout): number {
  return workout.exercises.reduce((total, exercise) => {
    return total + calculateExerciseVolume(exercise);
  }, 0);
}

/**
 * Conta o total de sets completados
 */
export function countCompletedSets(workout: QuickWorkout): number {
  return workout.exercises.reduce((total, exercise) => {
    return total + exercise.sets.filter(set => set.completed).length;
  }, 0);
}

/**
 * Conta o total de sets (completados ou não)
 */
export function countTotalSets(workout: QuickWorkout): number {
  return workout.exercises.reduce((total, exercise) => {
    return total + exercise.sets.length;
  }, 0);
}

/**
 * Extrai grupos musculares únicos do treino
 */
export function extractMuscleGroups(workout: QuickWorkout): string[] {
  const groups = new Set<string>();
  workout.exercises.forEach(exercise => {
    groups.add(exercise.bodyPart);
  });
  return Array.from(groups);
}

