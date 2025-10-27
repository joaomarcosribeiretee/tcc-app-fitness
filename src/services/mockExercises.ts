/**
 * Mock exercises service para Treino Rápido
 * Por enquanto usa dados mock, mas já preparado para integração com ExerciseDB
 */

export interface AvailableExercise {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
}

// Grupos musculares para filtro
export const MUSCLE_GROUPS = [
  'Peito',
  'Costas',
  'Ombros',
  'Braços',
  'Pernas',
  'Glúteos',
  'Panturrilhas',
  'Abdômen',
] as const;

export type MuscleGroup = typeof MUSCLE_GROUPS[number];

/**
 * Lista mockada de exercícios disponíveis
 */
export const MOCK_EXERCISES: AvailableExercise[] = [
  { id: '1', name: 'Supino Reto com Barra', bodyPart: 'Peito', target: 'Peitoral Superior', equipment: 'Barra' },
  { id: '2', name: 'Supino Inclinado com Halteres', bodyPart: 'Peito', target: 'Peitoral Superior', equipment: 'Halteres' },
  { id: '3', name: 'Crucifixo', bodyPart: 'Peito', target: 'Peitoral', equipment: 'Halteres' },
  { id: '4', name: 'Supino Declinado', bodyPart: 'Peito', target: 'Peitoral Inferior', equipment: 'Barra' },
  { id: '5', name: 'Flexão de Braço', bodyPart: 'Peito', target: 'Peitoral', equipment: 'Peso Corporal' },
  { id: '6', name: 'Barra Fixa', bodyPart: 'Costas', target: 'Latíssimo', equipment: 'Barra' },
  { id: '7', name: 'Remada Curvada', bodyPart: 'Costas', target: 'Latíssimo', equipment: 'Barra' },
  { id: '8', name: 'Puxada Frontal', bodyPart: 'Costas', target: 'Latíssimo', equipment: 'Máquina' },
  { id: '9', name: 'Remada Unilateral', bodyPart: 'Costas', target: 'Latíssimo', equipment: 'Halteres' },
  { id: '10', name: 'Cavalinho', bodyPart: 'Costas', target: 'Inferior das Costas', equipment: 'Barra' },
  { id: '11', name: 'Desenvolvimento com Halteres', bodyPart: 'Ombros', target: 'Deltoides', equipment: 'Halteres' },
  { id: '12', name: 'Elevação Lateral', bodyPart: 'Ombros', target: 'Deltoides Laterais', equipment: 'Halteres' },
  { id: '13', name: 'Crucifixo Inverso', bodyPart: 'Ombros', target: 'Deltoides Posteriores', equipment: 'Halteres' },
  { id: '14', name: 'Desenvolvimento Militar', bodyPart: 'Ombros', target: 'Deltoides', equipment: 'Barra' },
  { id: '15', name: 'Rosca Direta', bodyPart: 'Braços', target: 'Bíceps', equipment: 'Barra' },
  { id: '16', name: 'Rosca Alternada', bodyPart: 'Braços', target: 'Bíceps', equipment: 'Halteres' },
  { id: '17', name: 'Tríceps Pulley', bodyPart: 'Braços', target: 'Tríceps', equipment: 'Cabo' },
  { id: '18', name: 'Tríceps Testa', bodyPart: 'Braços', target: 'Tríceps', equipment: 'Barra' },
  { id: '19', name: 'Rosca Concentrada', bodyPart: 'Braços', target: 'Bíceps', equipment: 'Halteres' },
  { id: '20', name: 'Agachamento Livre', bodyPart: 'Pernas', target: 'Quadríceps', equipment: 'Barra' },
  { id: '21', name: 'Leg Press', bodyPart: 'Pernas', target: 'Quadríceps', equipment: 'Máquina' },
  { id: '22', name: 'Extensão de Pernas', bodyPart: 'Pernas', target: 'Quadríceps', equipment: 'Máquina' },
  { id: '23', name: 'Flexão de Pernas', bodyPart: 'Pernas', target: 'Posterior', equipment: 'Máquina' },
  { id: '24', name: 'Afundo', bodyPart: 'Pernas', target: 'Quadríceps', equipment: 'Halteres' },
  { id: '25', name: 'Elevação Pélvica', bodyPart: 'Glúteos', target: 'Glúteos', equipment: 'Barra' },
  { id: '26', name: 'Agachamento Sumô', bodyPart: 'Glúteos', target: 'Glúteos', equipment: 'Barra' },
  { id: '27', name: 'Coice no Cabo', bodyPart: 'Glúteos', target: 'Glúteos', equipment: 'Cabo' },
  { id: '28', name: 'Panturrilha em Pé', bodyPart: 'Panturrilhas', target: 'Panturrilhas', equipment: 'Máquina' },
  { id: '29', name: 'Panturrilha Sentado', bodyPart: 'Panturrilhas', target: 'Panturrilhas', equipment: 'Máquina' },
  { id: '30', name: 'Panturrilha no Leg Press', bodyPart: 'Panturrilhas', target: 'Panturrilhas', equipment: 'Máquina' },
  { id: '31', name: 'Abdominal Crunch', bodyPart: 'Abdômen', target: 'Reto Abdominal', equipment: 'Peso Corporal' },
  { id: '32', name: 'Prancha', bodyPart: 'Abdômen', target: 'Core', equipment: 'Peso Corporal' },
  { id: '33', name: 'Abdominal no Banco', bodyPart: 'Abdômen', target: 'Reto Abdominal', equipment: 'Banco' },
];

/**
 * Busca exercícios por grupo muscular
 */
export function getExercisesByMuscleGroup(muscleGroup: MuscleGroup): AvailableExercise[] {
  return MOCK_EXERCISES.filter(ex => ex.bodyPart === muscleGroup);
}

/**
 * Busca todos os exercícios
 */
export function getAllExercises(): AvailableExercise[] {
  return MOCK_EXERCISES;
}

/**
 * Busca exercício por ID
 */
export function getExerciseById(id: string): AvailableExercise | undefined {
  return MOCK_EXERCISES.find(ex => ex.id === id);
}

/**
 * Busca exercícios por nome
 */
export function searchExercises(query: string): AvailableExercise[] {
  const lowerQuery = query.toLowerCase();
  return MOCK_EXERCISES.filter(ex => 
    ex.name.toLowerCase().includes(lowerQuery) ||
    ex.bodyPart.toLowerCase().includes(lowerQuery) ||
    ex.target.toLowerCase().includes(lowerQuery)
  );
}

