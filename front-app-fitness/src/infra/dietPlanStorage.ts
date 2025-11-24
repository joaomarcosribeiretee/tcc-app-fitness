import * as secure from './secureStore';
import { DietPlan } from '../domain/entities/DietPlan';

/**
 * Extrai o userId do token
 */
async function getCurrentUserId(): Promise<string | null> {
  try {
    const token = await secure.getItem('auth_token');
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length >= 2) {
      return parts[1];
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
  return `diet_plans_${userId}`;
}

/**
 * Salva os planos de dieta no storage do usuário atual
 */
export async function saveDietPlans(plans: DietPlan[]): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }
    
    const storageKey = getUserStorageKey(userId);
    const json = JSON.stringify(plans);
    await secure.setItem(storageKey, json);
    console.log(`Saved ${plans.length} diet plans for user ${userId}`);
  } catch (error) {
    console.error('Error saving diet plans:', error);
    throw error;
  }
}

/**
 * Carrega os planos de dieta do storage do usuário atual
 */
export async function loadDietPlans(): Promise<DietPlan[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.log('No user logged in, returning empty plans');
      return [];
    }
    
    const storageKey = getUserStorageKey(userId);
    const json = await secure.getItem(storageKey);
    if (!json) {
      console.log(`No diet plans found for user ${userId}`);
      return [];
    }
    
    const plans = JSON.parse(json);
    console.log(`Loaded ${plans.length} diet plans for user ${userId}`);
    
    // Reconverter as datas
    return plans.map((plan: any) => ({
      ...plan,
      createdAt: new Date(plan.createdAt),
    }));
  } catch (error) {
    console.error('Error loading diet plans:', error);
    return [];
  }
}

/**
 * Adiciona um novo plano de dieta para o usuário atual
 */
export async function addDietPlan(plan: DietPlan): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }
    
    console.log(`Adding diet plan "${plan.name}" for user ${userId}`);
    const plans = await loadDietPlans();
    console.log('Existing diet plans count:', plans.length);
    
    plans.push(plan);
    
    await saveDietPlans(plans);
    console.log('Diet plan added successfully');
  } catch (error) {
    console.error('Error adding diet plan:', error);
    throw error;
  }
}

/**
 * Remove um plano de dieta do usuário atual
 */
export async function removeDietPlan(planId: string): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }
    
    const plans = await loadDietPlans();
    const filtered = plans.filter(p => p.id !== planId);
    await saveDietPlans(filtered);
    console.log(`Removed diet plan ${planId} for user ${userId}`);
  } catch (error) {
    console.error('Error removing diet plan:', error);
    throw error;
  }
}

