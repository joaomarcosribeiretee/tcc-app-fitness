import * as secure from './secureStore';
import { WorkoutPlan } from '../domain/entities/WorkoutPlan';

const STORAGE_KEY = 'workout_plans';

/**
 * Salva os planos de treino no storage
 */
export async function saveWorkoutPlans(plans: WorkoutPlan[]): Promise<void> {
  try {
    const json = JSON.stringify(plans);
    await secure.setItem(STORAGE_KEY, json);
  } catch (error) {
    console.error('Error saving workout plans:', error);
    throw error;
  }
}

/**
 * Carrega os planos de treino do storage
 */
export async function loadWorkoutPlans(): Promise<WorkoutPlan[]> {
  try {
    const json = await secure.getItem(STORAGE_KEY);
    if (!json) return [];
    
    const plans = JSON.parse(json);
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
 * Adiciona um novo plano de treino
 */
export async function addWorkoutPlan(plan: WorkoutPlan): Promise<void> {
  try {
    console.log('Loading existing plans...');
    const plans = await loadWorkoutPlans();
    console.log('Existing plans count:', plans.length);
    
    console.log('Adding new plan:', plan.name);
    plans.push(plan);
    
    console.log('Saving plans... Total:', plans.length);
    await saveWorkoutPlans(plans);
    console.log('Plans saved successfully');
  } catch (error) {
    console.error('Error adding workout plan:', error);
    throw error;
  }
}

/**
 * Remove um plano de treino
 */
export async function removeWorkoutPlan(planId: string): Promise<void> {
  try {
    const plans = await loadWorkoutPlans();
    const filtered = plans.filter(p => p.id !== planId);
    await saveWorkoutPlans(filtered);
  } catch (error) {
    console.error('Error removing workout plan:', error);
    throw error;
  }
}

/**
 * Limpa todos os planos
 */
export async function clearWorkoutPlans(): Promise<void> {
  try {
    await secure.deleteItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing workout plans:', error);
    throw error;
  }
}

