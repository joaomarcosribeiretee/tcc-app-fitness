import { API_BASE_URL } from '../infra/apiConfig';
import { DietPlan, Food, Meal } from '../domain/entities/DietPlan';

export interface DietAnamnesisPayload {
  usuario_id: number;
  sexo: string;
  idade: number;
  altura: number;
  pesoatual: number;
  pesodesejado: number;
  objetivo: string;
  data_meta: string;
  avalicao_rotina: string;
  orcamento: string;
  alimentos_acessiveis: boolean;
  come_fora: boolean;
  tipo_alimentacao: string;
  alimentos_gosta: string;
  alimentos_nao_gosta: string;
  qtd_refeicoes: number;
  lanche_entre_refeicoes: boolean;
  horario_alimentacao: string;
  prepara_propria_refeicao: boolean;
  onde_come: string;
  possui_alergias: boolean;
  possui_condicao_medica: string;
  uso_suplementos: boolean;
}

interface IADietMeal {
  calorias: number;
  alimentos: string;
  tipoRefeicao: string;
}

export interface IADietPlanResponse {
  nome: string;
  descricao: string;
  usuario: number;
  refeicoes: IADietMeal[];
}

interface PreviewResponse {
  message: string;
  plano: IADietPlanResponse;
}

interface ConfirmResponse {
  message: string;
  programa: string | null;
  treinosIds: unknown[];
  plano: IADietPlanResponse;
}

interface BackendDietPlan {
  id_dieta: number;
  nome: string | null;
  descricao: string | null;
  calorias: number | null;
}

interface BackendMeal {
  id_refeicao: number;
  tipo_refeicao: string | null;
  id_dieta: number | null;
  calorias: number | null;
  alimentos: string | null;
}

const DEFAULT_MEAL_TIMES: Record<string, string> = {
  'café da manhã': '08:00',
  'cafe da manha': '08:00',
  'lanche': '10:30',
  'lanche da manhã': '10:30',
  'lanche da tarde': '16:00',
  almoço: '12:30',
  jantar: '19:30',
  ceia: '22:00',
};

const sanitizeString = (value: string | null | undefined): string => {
  if (!value) {
    return '';
  }
  return value.toString().trim();
};

const parseFoods = (alimentos: string | null): Food[] => {
  if (!alimentos) {
    return [];
  }

  const normalized = alimentos.replace(/\n+/g, ';');
  let entries = normalized
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean);

  if (entries.length <= 1) {
    const commaSeparated = alimentos
      .split(', ')
      .map((item) => item.trim())
      .filter(Boolean);
    if (commaSeparated.length > 1) {
      entries = commaSeparated;
    }
  }

  return entries.map((entry) => {
    let name = sanitizeString(entry);
    let quantity = '';

    const parts = entry.split(' - ').map(part => part.trim());
    if (parts.length >= 2) {
      name = sanitizeString(parts[0]);
      quantity = sanitizeString(parts.slice(1).join(' - '));
    }

    const food: Food = {
      name: name || 'Alimento',
    };

    if (quantity) {
      food.quantity = quantity;
    }

    return food;
  });
};

const normalizeMealTime = (tipo: string): string => {
  const normalized = tipo.toLowerCase();
  return DEFAULT_MEAL_TIMES[normalized] ?? 'Horário não informado';
};

const mapIAToMeals = (meals: IADietMeal[] | undefined): Meal[] => {
  if (!meals || meals.length === 0) {
    return [];
  }

  return meals.map((meal, index) => {
    const name = sanitizeString(meal.tipoRefeicao) || `Refeição ${index + 1}`;
    const totalCalories = Number(meal.calorias) || 0;

    return {
      id: `ia-meal-${index + 1}`,
      name,
      time: normalizeMealTime(name),
      foods: parseFoods(meal.alimentos),
      totalCalories,
    };
  });
};

const sumCalories = (meals: Meal[]): number => {
  return meals.reduce((acc, meal) => acc + (meal.totalCalories || 0), 0);
};

const mapToDietPlan = (plan: IADietPlanResponse): DietPlan => {
  const meals = mapIAToMeals(plan.refeicoes);

  return {
    id: `ia-plan-${Date.now()}`,
    name: sanitizeString(plan.nome) || 'Plano de dieta',
    description: sanitizeString(plan.descricao),
    meals,
    totalDailyCalories: sumCalories(meals),
    createdAt: new Date(),
  };
};

const mapBackendMeals = (meals: BackendMeal[]): Meal[] => {
  return meals.map((meal, index) => {
    const name = sanitizeString(meal.tipo_refeicao) || `Refeição ${index + 1}`;
    const totalCalories = Number(meal.calorias) || 0;

    return {
      id: String(meal.id_refeicao ?? `meal-${index + 1}`),
      name,
      time: normalizeMealTime(name),
      foods: parseFoods(meal.alimentos),
      totalCalories,
    };
  });
};

const mapBackendPlan = (plan: BackendDietPlan, meals: Meal[]): DietPlan => {
  const totalDailyCalories = plan.calorias != null ? Number(plan.calorias) : sumCalories(meals);

  return {
    id: String(plan.id_dieta),
    name: sanitizeString(plan.nome) || 'Plano de dieta',
    description: sanitizeString(plan.descricao),
    meals,
    totalDailyCalories,
    createdAt: new Date(),
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
      // ignorar erro de parse
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
};

const fetchMealsByDiet = async (dietId: number): Promise<Meal[]> => {
  const meals = await httpGet<BackendMeal[]>(`${API_BASE_URL}/api/refeicoes_dieta?idDieta=${dietId}`);
  return mapBackendMeals(meals ?? []);
};

export const fetchDietMeals = fetchMealsByDiet;

export const generateDietPlanFromIA = async (
  payload: DietAnamnesisPayload
): Promise<{ dietPlan: DietPlan; rawPlan: IADietPlanResponse }> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/gpt/dieta`, {
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
      let message = 'Falha ao gerar dieta inteligente';
      try {
        const body = await response.json();
        if (body?.detail) {
          message = body.detail;
        }
      } catch (error) {
        // ignorar erro de parse
      }
      throw new Error(message);
    }

    const data = (await response.json()) as PreviewResponse;
    const dietPlan = mapToDietPlan(data.plano);
    return { dietPlan, rawPlan: data.plano };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Tempo limite excedido ao gerar a dieta');
    }
    throw error instanceof Error ? error : new Error('Erro desconhecido ao gerar a dieta');
  }
};

export const confirmDietPlan = async (rawPlan: IADietPlanResponse): Promise<ConfirmResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/gpt/dieta/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ plano: rawPlan }),
  });

  if (!response.ok) {
    let message = 'Erro ao confirmar plano de dieta';
    try {
      const body = await response.json();
      if (body?.detail) {
        message = body.detail;
      }
    } catch (error) {
      // ignorar erro de parse
    }
    throw new Error(message);
  }

  return (await response.json()) as ConfirmResponse;
};

export const fetchUserDietPlans = async (userId: number): Promise<DietPlan[]> => {
  if (!Number.isFinite(userId)) {
    throw new Error('ID de usuário inválido');
  }

  const backendPlans = await httpGet<BackendDietPlan[]>(`${API_BASE_URL}/api/dietas_usuario?idUsuario=${userId}`);

  if (!backendPlans || backendPlans.length === 0) {
    return [];
  }

  const plansWithMeals = await Promise.all(
    backendPlans.map(async (plan) => {
      try {
        const meals = await fetchMealsByDiet(plan.id_dieta);
        return mapBackendPlan(plan, meals);
      } catch (error) {
        console.warn(`Falha ao carregar refeições da dieta ${plan.id_dieta}:`, error);
        return mapBackendPlan(plan, []);
      }
    })
  );

  return plansWithMeals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

const mapBackendPlanSummary = (plan: BackendDietPlan): DietPlan => {
  return {
    id: String(plan.id_dieta),
    name: sanitizeString(plan.nome) || 'Plano de dieta',
    description: sanitizeString(plan.descricao),
    meals: [],
    totalDailyCalories: plan.calorias != null ? Number(plan.calorias) : 0,
    createdAt: new Date(),
  };
};

export const fetchUserDietPlansSummary = async (userId: number): Promise<DietPlan[]> => {
  if (!Number.isFinite(userId)) {
    throw new Error('ID de usuário inválido');
  }

  const backendPlans = await httpGet<BackendDietPlan[]>(`${API_BASE_URL}/api/dietas_usuario?idUsuario=${userId}`);
  if (!backendPlans || backendPlans.length === 0) {
    return [];
  }

  return backendPlans
    .map(mapBackendPlanSummary)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const requestDietPlanAdjustments = async ({
  anamnesis,
  currentPlan,
  adjustments,
}: {
  anamnesis: DietAnamnesisPayload;
  currentPlan: IADietPlanResponse;
  adjustments: string;
}): Promise<{ dietPlan: DietPlan; rawPlan: IADietPlanResponse }> => {
  const response = await fetch(`${API_BASE_URL}/api/gpt/dieta/ajustar`, {
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
    let message = 'Erro ao solicitar ajustes da dieta';
    try {
      const body = await response.json();
      if (body?.detail) {
        message = body.detail;
      }
    } catch (error) {
      // ignorar erro de parse
    }
    throw new Error(message);
  }

  const data = (await response.json()) as PreviewResponse;
  const dietPlan = mapToDietPlan(data.plano);
  return { dietPlan, rawPlan: data.plano };
};
