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
  idExercicio: number;
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

interface IAPlanResponse {
  mensagem?: string;
  programa: {
    id_programa_treino: number;
    nome: string;
    descricao: string;
  };
  treinosIds: number[];
  plano: {
    programaTreino: {
      nomePrograma: string;
      descricaoPrograma: string;
    };
    treinos: IAPlanTreino[];
  };
}

interface BackendProgramaTreino {
  id_programa_treino: number;
  id_usu: number;
  nome: string | null;
  descricao: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface BackendProgramasResponse {
  programas_treino: BackendProgramaTreino[];
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
  nome: string | null;
  grupo_muscular: string | null;
  equipamento: string | null;
  descanso: number | null;
  series: number | null;
}

interface BackendExercisesResponse {
  exercicios: BackendTreinoExercise[];
}

function toRoutineType(value?: string | null): RoutineType {
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
}

function mapExercises(exercises: IAPlanExercise[] | undefined): Exercise[] {
  if (!exercises || exercises.length === 0) {
    return [];
  }

  return exercises.map((exercise) => ({
    id: String(exercise.idExercicio),
    name: `Exercício ${exercise.idExercicio}`,
    bodyPart: 'Desconhecido',
    target: 'Personalizado',
    equipment: 'A definir',
    sets: exercise.series,
    reps: String(exercise.repeticoes),
    rest: `${exercise.descansoSegundos}s`,
  }));
}

function mapTreinos(treinos: IAPlanTreino[] | undefined): WorkoutPlanDay[] {
  if (!treinos || treinos.length === 0) {
    return [];
  }

  return treinos.map((treino, index) => ({
    id: String(treino.nome ?? treino.descricao ?? `day-${index + 1}`),
    dayNumber: index + 1,
    routineType: toRoutineType(treino.descricao ?? treino.dificuldade ?? treino.nome),
    name: treino.nome || `Treino ${index + 1}`,
    exercises: mapExercises(treino.exercicios),
    completed: false,
    description: treino.descricao,
    duration: treino.duracaoMinutos,
    difficulty: treino.dificuldade,
  }));
}

function mapToWorkoutPlan(response: IAPlanResponse): WorkoutPlan {
  const program = response.programa;
  const rawPlan = response.plano;

  const planName = rawPlan?.programaTreino?.nomePrograma || program?.nome || 'Treino Personalizado';
  const planDescription = rawPlan?.programaTreino?.descricaoPrograma || program?.descricao || '';

  const days = mapTreinos(rawPlan?.treinos);

  return {
    id: String(program?.id_programa_treino ?? Date.now()),
    name: planName,
    description: planDescription,
    createdAt: new Date(),
    days,
  };
}

async function httpGet<T>(url: string): Promise<T> {
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
}

export async function generateWorkoutPlanFromIA(
  payload: AnamnesePayload
): Promise<{ workoutPlan: WorkoutPlan; response: IAPlanResponse }> {
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

    const data = (await response.json()) as IAPlanResponse;
    const workoutPlan = mapToWorkoutPlan(data);
    return { workoutPlan, response: data };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Tempo limite excedido ao gerar o treino');
    }
    throw error instanceof Error ? error : new Error('Erro desconhecido ao gerar o treino');
  }
}

function mapProgramWorkouts(treinos: BackendTreinoPrograma[] | undefined): WorkoutPlanDay[] {
  if (!treinos) return [];

  return treinos.map((treino, index) => ({
    id: String(treino.id),
    dayNumber: index + 1,
    routineType: toRoutineType(treino.nome ?? treino.descricao ?? treino.dificuldade),
    name: treino.nome || `Treino ${index + 1}`,
    exercises: [],
    completed: false,
    description: treino.descricao,
    duration: treino.duracao,
    difficulty: treino.dificuldade,
  }));
}

function mapBackendProgramas(
  programas: BackendProgramaTreino[] | undefined,
  treinosByProgram: Map<number, WorkoutPlanDay[]> | undefined
): WorkoutPlan[] {
  if (!programas) return [];

  return programas.map((programa) => {
    const days = treinosByProgram?.get(programa.id_programa_treino) ?? [];
    const createdAt = programa.created_at ? new Date(programa.created_at) : new Date();

    return {
      id: String(programa.id_programa_treino),
      name: programa.nome || 'Programa sem título',
      description: programa.descricao || '',
      createdAt,
      days,
    } as WorkoutPlan;
  });
}

export async function fetchProgramWorkouts(
  userId: number,
  programId: string | number
): Promise<WorkoutPlanDay[]> {
  if (!Number.isFinite(userId)) {
    throw new Error('ID de usuário inválido');
  }

  const treinos = await httpGet<BackendTreinoPrograma[]>(
    `${API_BASE_URL}/api/treinos-programa?user_id=${userId}&id_programa=${programId}`
  );

  return mapProgramWorkouts(treinos);
}

export async function fetchUserWorkoutPlans(userId: number): Promise<WorkoutPlan[]> {
  if (!Number.isFinite(userId)) {
    throw new Error('ID de usuário inválido');
  }

  const programasRes = await httpGet<BackendProgramasResponse>(
    `${API_BASE_URL}/api/programas?userId=${userId}`
  );

  const programas = programasRes?.programas_treino ?? [];
  const treinosByProgram = new Map<number, WorkoutPlanDay[]>();

  await Promise.all(
    programas.map(async (programa) => {
      const programId = programa.id_programa_treino;
      if (programId == null) return;

      try {
        const days = await fetchProgramWorkouts(userId, programId);
        treinosByProgram.set(programId, days);
      } catch (error) {
        console.error(`Erro ao carregar treinos do programa ${programId}:`, error);
        treinosByProgram.set(programId, []);
      }
    })
  );

  const workoutPlans = mapBackendProgramas(programas, treinosByProgram);
  return workoutPlans.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

function mapBackendExerciseDetails(exercicios: BackendTreinoExercise[] | undefined): Exercise[] {
  if (!exercicios) {
    return [];
  }

  return exercicios.map((item, index) => ({
    id: String(item.id_ex_treino ?? `${index + 1}`),
    name: item.nome || `Exercício ${index + 1}`,
    bodyPart: item.grupo_muscular || 'Geral',
    target: item.grupo_muscular || 'Personalizado',
    equipment: item.equipamento || 'Corpo Livre',
    sets: item.series != null ? Number(item.series) : undefined,
    rest: item.descanso != null ? `${item.descanso}s` : undefined,
  }));
}

export async function fetchWorkoutExercises(
  userId: number,
  treinoId: string | number
): Promise<Exercise[]> {
  if (!Number.isFinite(userId)) {
    throw new Error('ID de usuário inválido');
  }

  const response = await httpGet<BackendExercisesResponse>(
    `${API_BASE_URL}/api/exercicios-treinos?user_id=${userId}&id_treino=${treinoId}`
  );

  return mapBackendExerciseDetails(response?.exercicios);
}
