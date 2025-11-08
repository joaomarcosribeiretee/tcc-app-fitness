import { RoutineType, Exercise } from './Workout';

export interface WorkoutPlanDay {
  id: string;
  dayNumber: number;
  routineType: RoutineType;
  name: string;
  exercises: Exercise[]; // Cada dia tem seus exercícios específicos
  completed?: boolean;
  description?: string | null;
  duration?: number | null;
  difficulty?: string | null;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  days: WorkoutPlanDay[];
  createdAt: Date;
}

// Planos de treino simulados (futuramente virão da IA)
export const generateMockWorkoutPlan = (): WorkoutPlan => {
  // Importar os exercícios dos mockWorkouts
  const { mockWorkouts } = require('../../data/mockWorkouts');
  
  return {
    id: 'plan-1',
    name: 'UPPER LOWER',
    description: 'Treino dividido em membros superiores e inferiores',
    createdAt: new Date(),
    days: [
      {
        id: 'day-1',
        dayNumber: 1,
        routineType: 'upper',
        name: 'Upper 1',
        exercises: mockWorkouts.upper.exercises,
      },
      {
        id: 'day-2',
        dayNumber: 2,
        routineType: 'lower',
        name: 'Lower 1',
        exercises: mockWorkouts.lower.exercises,
      },
      {
        id: 'day-3',
        dayNumber: 3,
        routineType: 'upper',
        name: 'Upper 2',
        exercises: mockWorkouts.upper.exercises,
      },
      {
        id: 'day-4',
        dayNumber: 4,
        routineType: 'lower',
        name: 'Lower 2',
        exercises: mockWorkouts.lower.exercises,
      },
    ],
  };
};

export const generatePushPullLegsPlan = (): WorkoutPlan => {
  // Importar os exercícios dos mockWorkouts
  const { mockWorkouts } = require('../../data/mockWorkouts');
  
  return {
    id: 'plan-2',
    name: 'PUSH PULL LEGS',
    description: 'Divisão clássica de empurrar, puxar e pernas',
    createdAt: new Date(),
    days: [
      {
        id: 'day-1',
        dayNumber: 1,
        routineType: 'push',
        name: 'Push 1',
        exercises: mockWorkouts.push.exercises,
      },
      {
        id: 'day-2',
        dayNumber: 2,
        routineType: 'pull',
        name: 'Pull 1',
        exercises: mockWorkouts.pull.exercises,
      },
      {
        id: 'day-3',
        dayNumber: 3,
        routineType: 'legs',
        name: 'Legs 1',
        exercises: mockWorkouts.legs.exercises,
      },
      {
        id: 'day-4',
        dayNumber: 4,
        routineType: 'push',
        name: 'Push 2',
        exercises: mockWorkouts.push.exercises,
      },
      {
        id: 'day-5',
        dayNumber: 5,
        routineType: 'pull',
        name: 'Pull 2',
        exercises: mockWorkouts.pull.exercises,
      },
      {
        id: 'day-6',
        dayNumber: 6,
        routineType: 'legs',
        name: 'Legs 2',
        exercises: mockWorkouts.legs.exercises,
      },
    ],
  };
};

