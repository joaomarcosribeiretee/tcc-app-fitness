export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl?: string;
  sets?: number;
  reps?: string;
  rest?: string;
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  duration: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
}

export type RoutineType = 'upper' | 'lower' | 'push' | 'pull' | 'legs' | 'fullbody';

