/**
 * ExerciseDB API Integration
 * 
 * Para usar a API do ExerciseDB, você precisará:
 * 1. Criar uma conta em: https://rapidapi.com/
 * 2. Inscrever-se na API ExerciseDB: https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb
 * 3. Adicionar sua chave API aqui
 * 
 * Documentação: https://edb-docs.up.railway.app/
 */

const RAPIDAPI_KEY = process.env.EXERCISE_DB_API_KEY || 'SUA_CHAVE_API_AQUI';
const BASE_URL = 'https://exercisedb.p.rapidapi.com';

interface ExerciseDBExercise {
  bodyPart: string;
  equipment: string;
  gifUrl: string;
  id: string;
  name: string;
  target: string;
  secondaryMuscles: string[];
  instructions: string[];
}

/**
 * Busca todos os exercícios disponíveis
 */
export async function getAllExercises(): Promise<ExerciseDBExercise[]> {
  try {
    const response = await fetch(`${BASE_URL}/exercises`, {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching exercises:', error);
    throw error;
  }
}

/**
 * Busca exercícios por grupo muscular
 * Exemplos de target: 'chest', 'back', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings'
 */
export async function getExercisesByTarget(target: string): Promise<ExerciseDBExercise[]> {
  try {
    const response = await fetch(`${BASE_URL}/exercises/target/${target}`, {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching exercises for target ${target}:`, error);
    throw error;
  }
}

/**
 * Busca exercícios por parte do corpo
 * Exemplos de bodyPart: 'back', 'cardio', 'chest', 'lower arms', 'lower legs', 'neck', 'shoulders', 'upper arms', 'upper legs', 'waist'
 */
export async function getExercisesByBodyPart(bodyPart: string): Promise<ExerciseDBExercise[]> {
  try {
    const response = await fetch(`${BASE_URL}/exercises/bodyPart/${bodyPart}`, {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching exercises for body part ${bodyPart}:`, error);
    throw error;
  }
}

/**
 * Busca exercícios por equipamento
 * Exemplos de equipment: 'barbell', 'dumbbell', 'body weight', 'cable', 'machine'
 */
export async function getExercisesByEquipment(equipment: string): Promise<ExerciseDBExercise[]> {
  try {
    const response = await fetch(`${BASE_URL}/exercises/equipment/${equipment}`, {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching exercises for equipment ${equipment}:`, error);
    throw error;
  }
}

/**
 * Busca um exercício específico por ID
 */
export async function getExerciseById(id: string): Promise<ExerciseDBExercise> {
  try {
    const response = await fetch(`${BASE_URL}/exercises/exercise/${id}`, {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching exercise ${id}:`, error);
    throw error;
  }
}

/**
 * Exemplo de uso para criar um treino Upper com dados reais da API:
 * 
 * const createUpperWorkout = async () => {
 *   const chestExercises = await getExercisesByTarget('chest');
 *   const backExercises = await getExercisesByTarget('lats');
 *   const shoulderExercises = await getExercisesByTarget('delts');
 *   
 *   // Selecionar alguns exercícios de cada grupo
 *   const upperExercises = [
 *     ...chestExercises.slice(0, 2),
 *     ...backExercises.slice(0, 2),
 *     ...shoulderExercises.slice(0, 2)
 *   ];
 *   
 *   return upperExercises;
 * };
 */

