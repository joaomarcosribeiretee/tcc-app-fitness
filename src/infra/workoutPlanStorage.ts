import * as secure from './secureStore';
import { WorkoutPlan } from '../domain/entities/WorkoutPlan';

/**
 * Extrai o userId do token
 * Token format: "mock.{userId}" ou JWT
 */
async function getCurrentUserId(): Promise<string | null> {
  try {
    const token = await secure.getItem('auth_token');
    if (!token) return null;
    
    // Se for JWT, tentar decodificar
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return String(payload.sub?.id || '');
    } catch {
      // Se não for JWT, tentar formato antigo "mock.{userId}"
      const parts = token.split('.');
      if (parts.length >= 2) {
        return parts[1];
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
}

/**
 * Gera a chave de storage específica para o usuário
 */
function getUserStorageKey(userId: string): string {
  return `workout_plans_${userId}`;
}

/**
 * Salva os planos de treino no storage do usuário atual
 */
export async function saveWorkoutPlans(plans: WorkoutPlan[]): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }
    
    const storageKey = getUserStorageKey(userId);
    const json = JSON.stringify(plans);
    await secure.setItem(storageKey, json);
    console.log(`Saved ${plans.length} plans for user ${userId}`);
  } catch (error) {
    console.error('Error saving workout plans:', error);
    throw error;
  }
}

/**
 * Carrega os planos de treino do storage do usuário atual
 */
export async function loadWorkoutPlans(): Promise<WorkoutPlan[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.log('No user logged in, returning empty plans');
      return [];
    }
    
    const storageKey = getUserStorageKey(userId);
    const json = await secure.getItem(storageKey);
    if (!json) {
      console.log(`No plans found for user ${userId}`);
      return [];
    }
    
    const plans = JSON.parse(json);
    console.log(`Loaded ${plans.length} plans for user ${userId}`);
    
    // Reconverter as datas
    return plans.map((plan: any) => ({
      ...plan,
      createdAt: new Date(plan.createdAt),
    }));
  } catch (error) {
    console.error('Error loading workout plans:', error);
    return [];
  }
}

/**
 * Adiciona um novo plano de treino para o usuário atual
 */
export async function addWorkoutPlan(plan: WorkoutPlan): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }
    
    console.log(`Adding plan "${plan.name}" for user ${userId}`);
    const plans = await loadWorkoutPlans();
    console.log('Existing plans count:', plans.length);
    
    plans.push(plan);
    
    await saveWorkoutPlans(plans);
    console.log('Plan added successfully');
  } catch (error) {
    console.error('Error adding workout plan:', error);
    throw error;
  }
}

/**
 * Remove um plano de treino do usuário atual
 */
export async function removeWorkoutPlan(planId: string): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }
    
    const plans = await loadWorkoutPlans();
    const filtered = plans.filter(p => p.id !== planId);
    await saveWorkoutPlans(filtered);
    console.log(`Removed plan ${planId} for user ${userId}`);
  } catch (error) {
    console.error('Error removing workout plan:', error);
    throw error;
  }
}

/**
 * Limpa todos os planos do usuário atual
 * (Útil para logout ou reset de dados)
 */
export async function clearWorkoutPlans(): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.log('No user logged in, nothing to clear');
      return;
    }
    
    const storageKey = getUserStorageKey(userId);
    await secure.deleteItem(storageKey);
    console.log(`Cleared all plans for user ${userId}`);
  } catch (error) {
    console.error('Error clearing workout plans:', error);
    throw error;
  }
}
