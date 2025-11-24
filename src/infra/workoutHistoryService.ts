import { API_BASE_URL } from './apiConfig';

export interface SetRecord {
  setId: string;
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface ExerciseRecord {
  id: string;
  backendExerciseId?: number;
  sessionExerciseId?: number;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  completedSets: number;
  totalSets: number;
  volume: number;
  sets: SetRecord[];
}

export interface WorkoutRecord {
  id: string;
  sessionId: number;
  treinoId: number;
  userId: string;
  date: string;
  name: string;
  dayName?: string;
  description?: string;
  difficulty?: string;
  plannedDuration?: number | null;
  duration: number;
  totalVolume: number;
  completedSets: number;
  totalSets: number;
  muscleGroups: string[];
  exercises: ExerciseRecord[];
  notes?: string;
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
}

export interface WorkoutSessionPayloadExercise {
  id: string;
  backendExerciseId: number;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  sets: Array<{
    weight: number;
    reps: number;
    completed: boolean;
  }>;
}

export interface WorkoutSessionPayload {
  userId: string;
  treinoId: number;
  workoutName: string;
  dayName?: string;
  workoutDescription?: string;
  workoutDifficulty?: string;
  workoutDuration?: number | null;
  durationSeconds: number;
  totalVolume: number;
  completedSets: number;
  totalSets: number;
  muscleGroups: string[];
  notes?: string;
  startedAt?: string;
  finishedAt?: string;
  exercises: WorkoutSessionPayloadExercise[];
}

interface BackendSessionSummary {
  id_sessao: number;
  duracao_sessao: number | null;
  descricao: string | null;
  id_treino: number;
  treino_nome: string | null;
  qtd_exercicios: number | null;
}

interface BackendSessionSeries {
  id_ex_treino: number;
  nome_exercicio?: string | null;
  equipamento?: string | null;
  id_serie?: number | null;
  numero_serie?: number | null;
  repeticoes?: number | null;
  carga?: number | string | null;
}

interface CreateSessionResponse {
  id_sessao: number;
  series?: Array<{
    id_sessao: number;
    id_ex_treino: number;
    numero_serie: number;
    repeticoes: number;
    carga: number;
  }>;
}

interface SessionMetaExercise {
  backendExerciseId?: number;
  id?: string;
  name?: string;
  bodyPart?: string;
  target?: string;
  equipment?: string;
  sets?: Array<{
    setNumber: number;
    weight: number;
    reps: number;
  }>;
}

interface SessionMeta {
  workoutName?: string;
  dayName?: string;
  workoutDescription?: string;
  workoutDifficulty?: string;
  workoutDuration?: number | null;
  notes?: string;
  totalVolume?: number;
  completedSets?: number;
  totalSets?: number;
  muscleGroups?: string[];
  startedAt?: string;
  finishedAt?: string;
  durationSeconds?: number;
  exercises?: SessionMetaExercise[];
}

const buildMeta = (payload: WorkoutSessionPayload): SessionMeta => ({
  workoutName: payload.workoutName,
  dayName: payload.dayName,
  workoutDescription: payload.workoutDescription,
  workoutDifficulty: payload.workoutDifficulty,
  workoutDuration: payload.workoutDuration ?? null,
  notes: payload.notes,
  totalVolume: payload.totalVolume,
  completedSets: payload.completedSets,
  totalSets: payload.totalSets,
  muscleGroups: payload.muscleGroups,
  startedAt: payload.startedAt,
  finishedAt: payload.finishedAt,
  durationSeconds: payload.durationSeconds,
  exercises: payload.exercises.map((exercise) => ({
    backendExerciseId: exercise.backendExerciseId,
    id: exercise.id,
    name: exercise.name,
    bodyPart: exercise.bodyPart,
    target: exercise.target,
    equipment: exercise.equipment,
    sets: (exercise.sets || []).map((set, index) => ({
      setNumber: index + 1,
      weight: Number.isFinite(set.weight) && set.weight >= 0 ? set.weight : 0,
      reps: Number.isFinite(set.reps) && set.reps > 0 ? set.reps : 0,
    })),
  })),
});

const parseMeta = (descricao: unknown): SessionMeta => {
  if (typeof descricao !== 'string' || descricao.trim().length === 0) {
    return {};
  }

  try {
    const parsed = JSON.parse(descricao);
    if (parsed && typeof parsed === 'object') {
      return parsed as SessionMeta;
    }
  } catch (error) {
    console.warn('⚠️ Não foi possível interpretar metadados da sessão:', error);
  }

  return {};
};

const httpPost = async <T>(url: string, body: unknown): Promise<T> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let detail = `Falha na requisição (${response.status})`;
    try {
      const message = await response.json();
      detail = message?.detail || detail;
    } catch (error) {
      // ignore
    }
    throw new Error(detail);
  }

  return (await response.json()) as T;
};

const httpGet = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    let detail = `Falha na requisição (${response.status})`;
    try {
      const message = await response.json();
      detail = message?.detail || detail;
    } catch (error) {
      // ignore
    }
    throw new Error(detail);
  }

  return (await response.json()) as T;
};

const groupSeriesByExercise = (series: CreateSessionResponse['series']): Map<number, CreateSessionResponse['series']> => {
  const map = new Map<number, CreateSessionResponse['series']>();
  if (!series) {
    return map;
  }

  series.forEach((item) => {
    const key = item.id_ex_treino;
    const existing = map.get(key) ?? [];
    existing.push(item);
    map.set(key, existing);
  });

  return map;
};

const collectMuscleGroups = (exercises: ExerciseRecord[]): string[] => {
  const set = new Set<string>();
  exercises.forEach((exercise) => {
    if (exercise.bodyPart && exercise.bodyPart.trim().length > 0) {
      set.add(exercise.bodyPart.trim());
    }
  });
  return Array.from(set);
};

export class WorkoutHistoryService {
  static async saveWorkout(payload: WorkoutSessionPayload): Promise<WorkoutRecord> {
    if (!payload.exercises || payload.exercises.length === 0) {
      throw new Error('Nenhum exercício informado para a sessão.');
    }

    const exercisesPayload = payload.exercises
      .map((exercise) => {
        if (!Number.isFinite(exercise.backendExerciseId)) {
          return null;
        }

        const validSets = exercise.sets.filter((set) => set.completed);
        if (validSets.length === 0) {
          return null;
        }

        return {
          id_exercicio: exercise.backendExerciseId,
          repeticoes: validSets.map((set) => Math.max(1, Math.round(set.reps))),
          cargas: validSets.map((set) => Number(set.weight ?? 0)),
        };
      })
      .filter(Boolean) as Array<{ id_exercicio: number; repeticoes: number[]; cargas: number[] }>;

    if (exercisesPayload.length === 0) {
      throw new Error('Nenhuma série válida encontrada para salvar a sessão.');
    }

    const meta = buildMeta(payload);
    const finishedAt = meta.finishedAt || new Date().toISOString();

    const result = await httpPost<CreateSessionResponse>(`${API_BASE_URL}/api/sessoes`, {
      duracao: Math.round(payload.durationSeconds),
      descricao: JSON.stringify(meta),
      id_treino: payload.treinoId,
      exercicios: exercisesPayload,
    });

    const seriesByExercise = groupSeriesByExercise(result.series);

    const exercises = payload.exercises.map<ExerciseRecord>((exercise) => {
      const recordedSeries = seriesByExercise.get(exercise.backendExerciseId) ?? [];

      const metaSets = (exercise.sets || []).map((set, index) => ({
        setId: `meta_${result.id_sessao}_${exercise.backendExerciseId}_${index + 1}`,
        setNumber: index + 1,
        weight: Number.isFinite(set.weight) && set.weight >= 0 ? set.weight : 0,
        reps: Number.isFinite(set.reps) && set.reps > 0 ? set.reps : 0,
        completed: true,
      }));

      const fallbackSeries = metaSets.map((set) => ({
        id_sessao: result.id_sessao,
        id_ex_treino: exercise.backendExerciseId,
        numero_serie: set.setNumber,
        repeticoes: Math.max(1, Math.round(set.reps)),
        carga: Number.isFinite(set.weight) && set.weight >= 0 ? set.weight : 0,
      }));

      const series = recordedSeries.length > 0 ? recordedSeries : fallbackSeries;

      const sets: SetRecord[] = series.map((item, index) => ({
        setId: `sessao_${result.id_sessao}_${exercise.backendExerciseId}_${index + 1}`,
        setNumber: item.numero_serie && item.numero_serie > 0 ? item.numero_serie : index + 1,
        weight: Number(item.carga ?? 0),
        reps: Number(item.repeticoes ?? 0),
        completed: true,
      }));

      const finalSets = sets.length > 0 ? sets : metaSets;

      const volume = finalSets.reduce((sum, set) => sum + set.weight * set.reps, 0);

      return {
        id: exercise.id,
        backendExerciseId: exercise.backendExerciseId,
        name: exercise.name,
        bodyPart: exercise.bodyPart,
        target: exercise.target,
        equipment: exercise.equipment,
        completedSets: finalSets.length,
        totalSets: finalSets.length,
        volume,
        sets: finalSets,
      };
    });

    const totalVolume = exercises.reduce((sum, exercise) => sum + exercise.volume, 0);
    const totalSets = exercises.reduce((sum, exercise) => sum + exercise.totalSets, 0);

    const deltaMuscleGroups = meta.muscleGroups?.length ? meta.muscleGroups : collectMuscleGroups(exercises);

    return {
      id: String(result.id_sessao),
      sessionId: result.id_sessao,
      treinoId: payload.treinoId,
      userId: payload.userId,
      date: finishedAt,
      name: payload.workoutName,
      dayName: payload.dayName,
      description: payload.workoutDescription,
      difficulty: payload.workoutDifficulty,
      plannedDuration: payload.workoutDuration ?? null,
      duration: payload.durationSeconds,
      totalVolume,
      completedSets: totalSets,
      totalSets,
      muscleGroups: deltaMuscleGroups,
      exercises,
      notes: payload.notes,
      startedAt: meta.startedAt,
      finishedAt,
      createdAt: finishedAt,
    };
  }

  static async getWorkouts(userId?: string): Promise<WorkoutRecord[]> {
    if (!userId) {
      return [];
    }

    const numericUserId = Number(userId);
    if (!Number.isFinite(numericUserId)) {
      console.warn('⚠️ ID de usuário inválido ao buscar sessões:', userId);
      return [];
    }

    try {
      const sessions = await httpGet<BackendSessionSummary[]>(
        `${API_BASE_URL}/api/sessoes/perfil?id_usuario=${numericUserId}`
      );

      const workouts = await Promise.all(
        sessions.map(async (session) => {
          try {
            const meta = parseMeta(session.descricao);
            const rawRecordedExercises = await httpGet<any[]>(
              `${API_BASE_URL}/api/sessoes/exercicios?id_sessao=${session.id_sessao}`
            );
            console.log('[WorkoutHistoryService] Sessão', session.id_sessao, 'payload bruto:', rawRecordedExercises);
            const metaExercises = new Map<number, SessionMetaExercise>();
            meta.exercises?.forEach((exercise) => {
              if (exercise?.backendExerciseId != null) {
                metaExercises.set(Number(exercise.backendExerciseId), exercise);
              }
            });

            let exercises: ExerciseRecord[] = [];

            if (Array.isArray(rawRecordedExercises) && rawRecordedExercises.length > 0 && Array.isArray(rawRecordedExercises[0]?.series)) {
              exercises = rawRecordedExercises.map((exercise) => {
                const backendId = Number(exercise.id_ex_treino);
                const metaInfo = metaExercises.get(backendId);
                const sets: SetRecord[] = (exercise.series ?? []).map((serie: any, index: number) => ({
                  setId: `sessao_${session.id_sessao}_${backendId}_${index + 1}`,
                  setNumber: Number(serie.numero_serie) > 0 ? Number(serie.numero_serie) : index + 1,
                  weight: Number(serie.carga ?? 0),
                  reps: Number(serie.repeticoes ?? 0),
                  completed: true,
                }));

                const volume = sets.reduce((sum: number, set: SetRecord) => sum + set.weight * set.reps, 0);

                return {
                  id: metaInfo?.id || String(backendId),
                  backendExerciseId: backendId,
                  sessionExerciseId: undefined,
                  name: metaInfo?.name || exercise.nome_exercicio || 'Exercício',
                  bodyPart: metaInfo?.bodyPart || 'Personalizado',
                  target: metaInfo?.target || metaInfo?.bodyPart || 'Personalizado',
                  equipment: metaInfo?.equipment || exercise.equipamento || 'A definir',
                  completedSets: sets.length,
                  totalSets: sets.length,
                  volume,
                  sets,
                } as ExerciseRecord;
              });
            } else {
              const flatSeries: BackendSessionSeries[] = (rawRecordedExercises as BackendSessionSeries[]) ?? [];
              const seriesByExercise = new Map<number, BackendSessionSeries[]>();
              flatSeries.forEach((serie) => {
                const key = serie.id_ex_treino;
                if (typeof key !== 'number') return;
                const list = seriesByExercise.get(key) ?? [];
                list.push(serie);
                seriesByExercise.set(key, list);
              });

              exercises = Array.from(seriesByExercise.entries()).map(([exerciseId, series]) => {
                const metaInfo = metaExercises.get(exerciseId);
                const primary = series[0];

                const sets: SetRecord[] = series.map((item, index) => ({
                  setId: `sessao_${session.id_sessao}_${exerciseId}_${index + 1}`,
                  setNumber: item.numero_serie && item.numero_serie > 0 ? item.numero_serie : index + 1,
                  weight: Number(item.carga ?? 0),
                  reps: Number(item.repeticoes ?? 0),
                  completed: true,
                }));

                const volume = sets.reduce((sum: number, set: SetRecord) => sum + set.weight * set.reps, 0);

                return {
                  id: metaInfo?.id || String(exerciseId),
                  backendExerciseId: exerciseId,
                  sessionExerciseId: primary?.id_serie ?? undefined,
                  name: metaInfo?.name || primary?.nome_exercicio || 'Exercício',
                  bodyPart: metaInfo?.bodyPart || 'Personalizado',
                  target: metaInfo?.target || metaInfo?.bodyPart || 'Personalizado',
                  equipment: metaInfo?.equipment || primary?.equipamento || 'A definir',
                  completedSets: sets.length,
                  totalSets: sets.length,
                  volume,
                  sets,
                } as ExerciseRecord;
              });
            }

            const muscleGroups = (meta.muscleGroups && meta.muscleGroups.length > 0)
              ? meta.muscleGroups
              : collectMuscleGroups(exercises);

            const totalVolume = exercises.reduce((sum, exercise) => sum + exercise.volume, 0);
            const totalSets = exercises.reduce((sum, exercise) => sum + exercise.totalSets, 0);

            const finishedAt = meta.finishedAt || new Date().toISOString();
            const duration = session.duracao_sessao ?? meta.durationSeconds ?? 0;

            return {
              id: String(session.id_sessao),
              sessionId: session.id_sessao,
              treinoId: session.id_treino,
              userId: String(userId),
              date: finishedAt,
              name: meta.workoutName || session.treino_nome || 'Treino',
              dayName: meta.dayName,
              description: meta.workoutDescription,
              difficulty: meta.workoutDifficulty,
              plannedDuration: meta.workoutDuration ?? null,
              duration,
              totalVolume,
              completedSets: totalSets,
              totalSets,
              muscleGroups,
              exercises,
              notes: meta.notes,
              startedAt: meta.startedAt,
              finishedAt,
              createdAt: finishedAt,
            } as WorkoutRecord;
          } catch (error) {
            console.error('❌ Falha ao processar sessão de treino:', error);
            return null;
          }
        })
      );

      return workouts
        .filter((workout): workout is WorkoutRecord => Boolean(workout))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('❌ Erro ao buscar sessões de treino:', error);
      return [];
    }
  }

  static async getWorkoutsByPeriod(startDate: Date, endDate: Date, userId?: string): Promise<WorkoutRecord[]> {
    const workouts = await this.getWorkouts(userId);
    return workouts.filter((workout) => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= startDate && workoutDate <= endDate;
    });
  }

  static async getWorkoutsByMuscleGroup(muscleGroup: string, userId?: string): Promise<WorkoutRecord[]> {
    const workouts = await this.getWorkouts(userId);
    return workouts.filter((workout) => workout.muscleGroups.includes(muscleGroup));
  }

  static async deleteWorkout(): Promise<void> {
    throw new Error('Remover sessões não está disponível pelo aplicativo.');
  }

  static async getWorkoutStats(userId?: string): Promise<{
    totalWorkouts: number;
    totalVolume: number;
    totalDuration: number;
    averageWorkoutDuration: number;
    favoriteMuscleGroups: { [key: string]: number };
    recentWorkouts: WorkoutRecord[];
  }> {
    const workouts = await this.getWorkouts(userId);

    const totalWorkouts = workouts.length;
    const totalVolume = workouts.reduce((sum, workout) => sum + workout.totalVolume, 0);
    const totalDuration = workouts.reduce((sum, workout) => sum + workout.duration, 0);
      const averageWorkoutDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts : 0;
      
    const favoriteMuscleGroups: { [key: string]: number } = {};
    workouts.forEach((workout) => {
      workout.muscleGroups.forEach((group) => {
        favoriteMuscleGroups[group] = (favoriteMuscleGroups[group] || 0) + 1;
      });
    });

    const recentWorkouts = workouts.slice(0, 7);
      
      return {
        totalWorkouts,
        totalVolume,
        totalDuration,
        averageWorkoutDuration,
      favoriteMuscleGroups,
      recentWorkouts,
    };
  }

  static async clearHistory(): Promise<void> {
    throw new Error('Limpar histórico não é suportado com persistência em backend.');
  }

  static async exportData(userId?: string): Promise<WorkoutRecord[]> {
    return this.getWorkouts(userId);
  }

  static async importData(): Promise<void> {
    throw new Error('Importação de dados não é suportada com persistência em backend.');
  }
}
