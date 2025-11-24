import { API_BASE_URL } from '../infra/apiConfig';
import { WorkoutPlan, WorkoutPlanDay } from '../domain/entities/WorkoutPlan';
import { Exercise, RoutineType } from '../domain/entities/Workout';

export interface AnamnesePayload {
  usuario_id: number;
  idade: number;
  sexo: string;
  peso: number;
  experiencia: string;
  tempo_treino: string;
  dias_semana: string;
  tempo_treino_por_dia: string;
  objetivos: string[];
  objetivo_especifico: string;
  lesao: string;
  condicao_medica: string;
  exercicio_nao_gosta: string;
  equipamentos?: string;
}

interface IAPlanExercise {
  nomeExercicio: string;
  equipamento: string;
  grupoMuscular: string;
  series: number;
  repeticoes: number;
  descansoSegundos: number;
}

interface IAPlanTreino {
  nome: string;
  descricao: string;
  idUsuario: number;
  duracaoMinutos: number;
  dificuldade: string;
  exercicios: IAPlanExercise[];
}

export interface IAPlanResponse {
  programaTreino: {
    nomePrograma: string;
    descricaoPrograma: string;
  };
  treinos: IAPlanTreino[];
}

interface PreviewResponse {
  message: string;
  plano: IAPlanResponse;
}

interface ConfirmResponse {
  message: string;
  programa: {
    id_programa_treino: number;
    nome: string;
    descricao: string;
  };
  treinosIds: number[];
  plano: IAPlanResponse;
}

interface BackendProgramaTreino {
  id_programa_treino: number;
  id_usu: number;
  nome: string | null;
  descricao: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface BackendTreinoPrograma {
  id: number;
  nome: string | null;
  descricao: string | null;
  duracao: number | null;
  dificuldade: string | null;
}

interface BackendTreinoExercise {
  id_ex_treino: number;
  nome_exercicio: string | null;
  grupo_muscular: string | null;
  equipamento: string | null;
  descanso: number | null;
  series: number | null;
  reps: number | null;
}

const toRoutineType = (value?: string | null): RoutineType => {
  const normalized = (value || '').toLowerCase();
  if (['upper', 'lower', 'push', 'pull', 'legs', 'fullbody'].includes(normalized)) {
    return normalized as RoutineType;
  }

  if (normalized.includes('upper')) return 'upper';
  if (normalized.includes('lower')) return 'lower';
  if (normalized.includes('push')) return 'push';
  if (normalized.includes('pull')) return 'pull';
  if (normalized.includes('perna') || normalized.includes('legs')) return 'legs';

  return 'fullbody';
};

const mapExercises = (exercises: IAPlanExercise[] | undefined): Exercise[] => {
  if (!exercises || exercises.length === 0) {
    return [];
  }

  return exercises.map((exercise, index) => {
    const name = (exercise.nomeExercicio || '').trim();
    const muscle = (exercise.grupoMuscular || '').trim();
    const equipment = (exercise.equipamento || '').trim();
    const setsNumber = Number(exercise.series);
    const repsNumber = Number(exercise.repeticoes);
    const restNumber = Number(exercise.descansoSegundos);

    const sets = Number.isFinite(setsNumber) && setsNumber > 0 ? setsNumber : undefined;
    const repsValue = Number.isFinite(repsNumber) && repsNumber > 0 ? repsNumber : undefined;
    const restSeconds = Number.isFinite(restNumber) && restNumber > 0 ? restNumber : undefined;

    return {
      id: `ia-${index + 1}`,
      name: name.length > 0 ? name : `Exercício ${index + 1}`,
      bodyPart: muscle.length > 0 ? muscle : 'Personalizado',
      target: muscle.length > 0 ? muscle : 'Personalizado',
      equipment: equipment.length > 0 ? equipment : 'A definir',
      sets,
      reps: repsValue != null ? String(repsValue) : undefined,
      rest: restSeconds != null ? `${restSeconds}s` : undefined,
    };
  });
};

const mapTreinos = (treinos: IAPlanTreino[] | undefined): WorkoutPlanDay[] => {
  if (!treinos || treinos.length === 0) {
    return [];
  }

  return treinos.map((treino, index) => ({
    id: `day-${index + 1}`,
    dayNumber: index + 1,
    routineType: toRoutineType(treino.descricao ?? treino.dificuldade ?? treino.nome),
    name: treino.nome || `Treino ${index + 1}`,
    exercises: mapExercises(treino.exercicios),
    completed: false,
    description: treino.descricao,
    duration: treino.duracaoMinutos,
    difficulty: treino.dificuldade,
  }));
};

const mapToWorkoutPlan = (response: IAPlanResponse): WorkoutPlan => {
  const planName = response?.programaTreino?.nomePrograma || 'Treino Personalizado';
  const planDescription = response?.programaTreino?.descricaoPrograma || '';

  return {
    id: String(Date.now()),
    name: planName,
    description: planDescription,
    createdAt: new Date(),
    days: mapTreinos(response?.treinos),
  };
};

const httpGet = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    let message = `Falha na requisição (${response.status})`;
    try {
      const body = await response.json();
      if (body?.detail) {
        message = body.detail;
      }
    } catch (error) {
      // ignore parse error
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
};

const mapBackendExercises = (exercicios: BackendTreinoExercise[] | undefined): Exercise[] => {
  if (!exercicios) {
    return [];
  }

  return exercicios.map((item, index) => ({
    id: String(item.id_ex_treino ?? `${index + 1}`),
    name: item.nome_exercicio || `Exercício ${index + 1}`,
    bodyPart: item.grupo_muscular || 'Geral',
    target: item.grupo_muscular || 'Personalizado',
    equipment: item.equipamento || 'Corpo Livre',
    sets: item.series != null ? Number(item.series) : undefined,
    reps: item.reps != null ? String(item.reps) : undefined,
    rest: item.descanso != null ? `${item.descanso}s` : undefined,
  }));
};

const fetchTreinosPersistidos = async (
  userId: number,
  programId: number
): Promise<WorkoutPlanDay[]> => {
  const treinos = await httpGet<BackendTreinoPrograma[]>(
    `${API_BASE_URL}/api/treinos-programa?user_id=${userId}&id_programa=${programId}`
  );

  const days: WorkoutPlanDay[] = [];

  for (let index = 0; index < treinos.length; index += 1) {
    const treino = treinos[index];
    const exercicios = await httpGet<BackendTreinoExercise[]>(
      `${API_BASE_URL}/api/exercicios-treinos?user_id=${userId}&id_treino=${treino.id}`
    );

    days.push({
      id: String(treino.id),
      dayNumber: index + 1,
      routineType: toRoutineType(treino.nome ?? treino.descricao ?? treino.dificuldade),
      name: treino.nome || `Treino ${index + 1}`,
      exercises: mapBackendExercises(exercicios),
      completed: false,
      description: treino.descricao,
      duration: treino.duracao,
      difficulty: treino.dificuldade,
    });
  }

  return days;
};

const mapBackendProgramas = (
  programas: BackendProgramaTreino[] | undefined,
  treinos: Record<string, WorkoutPlanDay[]>
): WorkoutPlan[] => {
  if (!programas) return [];

  return programas.map((programa) => {
    const key = String(programa.id_programa_treino);
    const days = treinos[key] ?? [];
    const createdAt = programa.created_at ? new Date(programa.created_at) : new Date();

    return {
      id: key,
      name: programa.nome || 'Programa sem título',
      description: programa.descricao || '',
      createdAt,
      days,
    } as WorkoutPlan;
  });
};

export const generateWorkoutPlanFromIA = async (
  payload: AnamnesePayload
): Promise<{ workoutPlan: WorkoutPlan; rawPlan: IAPlanResponse }> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/gpt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = 'Falha ao gerar treino inteligente';
      try {
        const errorBody = await response.json();
        errorMessage = errorBody.detail || errorMessage;
      } catch (err) {
        console.warn('Erro ao ler corpo de erro do backend:', err);
      }
      throw new Error(errorMessage);
    }

    const data = (await response.json()) as PreviewResponse;
    const workoutPlan = mapToWorkoutPlan(data.plano);
    return { workoutPlan, rawPlan: data.plano };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Tempo limite excedido ao gerar o treino');
    }
    throw error instanceof Error ? error : new Error('Erro desconhecido ao gerar o treino');
  }
};

export const requestWorkoutPlanAdjustments = async ({
  anamnesis,
  currentPlan,
  adjustments,
}: {
  anamnesis: AnamnesePayload;
  currentPlan: IAPlanResponse;
  adjustments: string;
}): Promise<{ workoutPlan: WorkoutPlan; rawPlan: IAPlanResponse }> => {
  const response = await fetch(`${API_BASE_URL}/api/gpt/ajustar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      anamnese: anamnesis,
      planoAtual: currentPlan,
      ajustes: adjustments,
    }),
  });

  if (!response.ok) {
    let errorMessage = 'Erro ao solicitar ajustes do treino';
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.detail || errorMessage;
    } catch (err) {
      console.warn('Erro ao ler corpo de erro do backend:', err);
    }
    throw new Error(errorMessage);
  }

  const data = (await response.json()) as PreviewResponse;
  const workoutPlan = mapToWorkoutPlan(data.plano);
  return { workoutPlan, rawPlan: data.plano };
};

export const confirmWorkoutPlan = async (rawPlan: IAPlanResponse): Promise<ConfirmResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/gpt/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ plano: rawPlan }),
  });

  if (!response.ok) {
    let errorMessage = 'Erro ao confirmar plano de treino';
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.detail || errorMessage;
    } catch (err) {
      console.warn('Erro ao ler corpo de erro do backend:', err);
    }
    throw new Error(errorMessage);
  }

  return (await response.json()) as ConfirmResponse;
};

export const fetchProgramWorkouts = async (
  userId: number,
  programId: string | number
): Promise<WorkoutPlanDay[]> => {
  if (!Number.isFinite(userId)) {
    throw new Error('ID de usuário inválido');
  }

  return fetchTreinosPersistidos(userId, Number(programId));
};

export const fetchWorkoutExercises = async (
  userId: number,
  treinoId: string | number
): Promise<Exercise[]> => {
  if (!Number.isFinite(userId)) {
    throw new Error('ID de usuário inválido');
  }

  const exercicios = await httpGet<BackendTreinoExercise[]>(
    `${API_BASE_URL}/api/exercicios-treinos?user_id=${userId}&id_treino=${treinoId}`
  );

  return mapBackendExercises(exercicios);
};

export const fetchUserWorkoutPlans = async (userId: number): Promise<WorkoutPlan[]> => {
  if (!Number.isFinite(userId)) {
    throw new Error('ID de usuário inválido');
  }

  const programas = await httpGet<BackendProgramaTreino[]>(
    `${API_BASE_URL}/api/programas?userId=${userId}`
  );

  const treinosByProgram: Record<string, WorkoutPlanDay[]> = {};

  await Promise.all(
    programas.map(async (programa) => {
      if (programa.id_programa_treino == null) return;
      try {
        treinosByProgram[String(programa.id_programa_treino)] = await fetchTreinosPersistidos(
          userId,
          programa.id_programa_treino
        );
      } catch (error) {
        console.warn(`Erro ao carregar treinos do programa ${programa.id_programa_treino}:`, error);
        treinosByProgram[String(programa.id_programa_treino)] = [];
      }
    })
  );

  const plans = mapBackendProgramas(programas, treinosByProgram);
  return plans.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const fetchUserWorkoutProgramsSummary = async (userId: number): Promise<WorkoutPlan[]> => {
  if (!Number.isFinite(userId)) {
    throw new Error('ID de usuário inválido');
  }

  const programas = await httpGet<BackendProgramaTreino[]>(
    `${API_BASE_URL}/api/programas?userId=${userId}`
  );

  const plans = mapBackendProgramas(programas, {});
  return plans.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};
