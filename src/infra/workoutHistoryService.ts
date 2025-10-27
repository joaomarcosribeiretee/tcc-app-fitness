/**
 * Histórico de Treinos - Serviço de Armazenamento
 * 
 * Este serviço gerencia o armazenamento e recuperação de treinos concluídos.
 * Atualmente usa armazenamento local (SecureStore) mas está preparado para
 * integração futura com backend.
 * 
 * Arquitetura: Clean Architecture - Camada de Infra
 * Dados: Todos os treinos são isolados por userId para segurança
 */

import * as secure from './secureStore';

/**
 * Registro completo de um treino executado
 * Este é o formato que será salvo e exibido na tela de Perfil
 */
export interface WorkoutRecord {
  id: string;
  userId: string; // ID do usuário que realizou o treino
  date: string; // ISO string da data/hora
  name: string; // Nome do treino (ex: "UPPER LOWER")
  dayName?: string; // Nome do dia (ex: "Upper 1", "Push 1")
  
  // Estatísticas gerais
  duration: number; // Duração total em segundos
  totalVolume: number; // Volume total em kg
  completedSets: number; // Séries completadas
  totalSets: number; // Total de séries
  
  // Dados dos exercícios
  muscleGroups: string[]; // Grupos musculares trabalhados
  exercises: ExerciseRecord[]; // Lista detalhada de exercícios
  
  // Observações do usuário (opcional - só salvo se preenchido)
  notes?: string;
  
  // Metadata
  createdAt: string; // ISO string da criação do registro
}

/**
 * Dados de um exercício executado dentro do treino
 */
export interface ExerciseRecord {
  id: string;
  name: string;
  bodyPart: string; // Parte do corpo trabalhada
  target: string; // Músculo alvo
  equipment: string; // Equipamento usado
  completedSets: number; // Séries completadas
  totalSets: number; // Total de séries programadas
  volume: number; // Volume total deste exercício (kg)
  sets: SetRecord[]; // Dados detalhados de cada série
}

/**
 * Dados de uma série individual executada
 */
export interface SetRecord {
  setId: string;
  setNumber: number; // 1, 2, 3, etc
  weight: number; // Carga em kg
  reps: number; // Repetições realizadas
  completed: boolean; // Se a série foi completada
}

/**
 * Serviço de Histórico de Treinos
 * 
 * Gerenciamento completo de treinos concluídos:
 * - Salvamento de treinos completos com todos os dados
 * - Recuperação por usuário (isolamento)
 * - Estatísticas e filtros
 * - Preparado para integração com backend futuro
 */
export class WorkoutHistoryService {
  private static readonly WORKOUTS_KEY = 'workout_history';

  /**
   * Salva um treino concluído no histórico
   * @param workout - Registro completo do treino executado
   */
  static async saveWorkout(workout: WorkoutRecord): Promise<void> {
    try {
      console.log('💾 Salvando treino:', workout.id);
      
      // Buscar treinos existentes
      const existingWorkouts = await this.getWorkouts();
      
      // Adicionar novo treino
      const updatedWorkouts = [...existingWorkouts, workout];
      
      // Ordenar por data (mais recente primeiro)
      updatedWorkouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Salvar usando SecureStore (compatível React Native)
      await secure.setItem(
        this.WORKOUTS_KEY,
        JSON.stringify(updatedWorkouts)
      );
      
      console.log('✅ Treino salvo com sucesso:', workout.id);
    } catch (error) {
      console.error('❌ Erro ao salvar treino:', error);
      throw new Error('Falha ao salvar treino');
    }
  }

  /**
   * Busca todos os treinos salvos
   * @param userId - ID do usuário para filtrar (opcional, mas recomendado)
   * @returns Array de treinos ordenados por data (mais recente primeiro)
   */
  static async getWorkouts(userId?: string): Promise<WorkoutRecord[]> {
    try {
      const data = await secure.getItem(this.WORKOUTS_KEY);
      if (!data) {
        console.log('📭 Nenhum treino encontrado no histórico');
        return [];
      }

      const allWorkouts = JSON.parse(data) as WorkoutRecord[];
      
      // Filtrar por usuário se fornecido
      let workouts = userId 
        ? allWorkouts.filter((workout: WorkoutRecord) => workout.userId === userId)
        : allWorkouts;
      
      // Ordenar por data (mais recente primeiro)
      workouts = workouts.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      console.log(`📋 Carregados ${workouts.length} treinos${userId ? ` para usuário ${userId}` : ''}`);
      return workouts;
    } catch (error) {
      console.error('❌ Erro ao buscar treinos:', error);
      return [];
    }
  }

  /**
   * Busca treinos por período
   */
  static async getWorkoutsByPeriod(startDate: Date, endDate: Date): Promise<WorkoutRecord[]> {
    try {
      const allWorkouts = await this.getWorkouts();
      return allWorkouts.filter(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate >= startDate && workoutDate <= endDate;
      });
    } catch (error) {
      console.error('Erro ao buscar treinos por período:', error);
      return [];
    }
  }

  /**
   * Busca treinos por grupo muscular
   */
  static async getWorkoutsByMuscleGroup(muscleGroup: string): Promise<WorkoutRecord[]> {
    try {
      const allWorkouts = await this.getWorkouts();
      return allWorkouts.filter(workout => 
        workout.muscleGroups.includes(muscleGroup)
      );
    } catch (error) {
      console.error('Erro ao buscar treinos por grupo muscular:', error);
      return [];
    }
  }

  /**
   * Remove um treino do histórico
   * @param workoutId - ID do treino a ser removido
   */
  static async deleteWorkout(workoutId: string): Promise<void> {
    try {
      const allWorkouts = await this.getWorkouts();
      const filteredWorkouts = allWorkouts.filter(workout => workout.id !== workoutId);
      
      await secure.setItem(
        this.WORKOUTS_KEY,
        JSON.stringify(filteredWorkouts)
      );
      
      console.log('✅ Treino removido:', workoutId);
    } catch (error) {
      console.error('❌ Erro ao remover treino:', error);
      throw new Error('Falha ao remover treino');
    }
  }

  /**
   * Calcula estatísticas gerais
   */
  static async getWorkoutStats(): Promise<{
    totalWorkouts: number;
    totalVolume: number;
    totalDuration: number;
    averageWorkoutDuration: number;
    favoriteMuscleGroups: { [key: string]: number };
    recentWorkouts: WorkoutRecord[];
  }> {
    try {
      const allWorkouts = await this.getWorkouts();
      
      const totalWorkouts = allWorkouts.length;
      const totalVolume = allWorkouts.reduce((sum, workout) => sum + workout.totalVolume, 0);
      const totalDuration = allWorkouts.reduce((sum, workout) => sum + workout.duration, 0);
      const averageWorkoutDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts : 0;
      
      // Contar grupos musculares mais trabalhados
      const muscleGroupCount: { [key: string]: number } = {};
      allWorkouts.forEach(workout => {
        workout.muscleGroups.forEach(muscle => {
          muscleGroupCount[muscle] = (muscleGroupCount[muscle] || 0) + 1;
        });
      });
      
      // Últimos 7 treinos
      const recentWorkouts = allWorkouts.slice(0, 7);
      
      return {
        totalWorkouts,
        totalVolume,
        totalDuration,
        averageWorkoutDuration,
        favoriteMuscleGroups: muscleGroupCount,
        recentWorkouts
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      return {
        totalWorkouts: 0,
        totalVolume: 0,
        totalDuration: 0,
        averageWorkoutDuration: 0,
        favoriteMuscleGroups: {},
        recentWorkouts: []
      };
    }
  }

  /**
   * Limpa todo o histórico de treinos
   */
  static async clearHistory(): Promise<void> {
    try {
      await secure.deleteItem(this.WORKOUTS_KEY);
      console.log('✅ Histórico de treinos limpo');
    } catch (error) {
      console.error('❌ Erro ao limpar histórico:', error);
      throw new Error('Falha ao limpar histórico');
    }
  }

  /**
   * Exporta dados para backup
   * @returns Array com todos os treinos salvos
   */
  static async exportData(): Promise<WorkoutRecord[]> {
    try {
      return await this.getWorkouts();
    } catch (error) {
      console.error('❌ Erro ao exportar dados:', error);
      throw new Error('Falha ao exportar dados');
    }
  }

  /**
   * Importa dados de backup
   * @param workouts - Array de treinos para importar
   */
  static async importData(workouts: WorkoutRecord[]): Promise<void> {
    try {
      await secure.setItem(
        this.WORKOUTS_KEY,
        JSON.stringify(workouts)
      );
      console.log('✅ Dados importados com sucesso');
    } catch (error) {
      console.error('❌ Erro ao importar dados:', error);
      throw new Error('Falha ao importar dados');
    }
  }
}
