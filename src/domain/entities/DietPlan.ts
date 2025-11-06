export interface Food {
  name: string;
  quantity: string;
  calories: number;
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  foods: Food[];
  totalCalories: number;
}

export interface DietPlan {
  id: string;
  name: string;
  description: string;
  meals: Meal[];
  totalDailyCalories: number;
  createdAt: Date;
}

// Plano de dieta simulado (futuramente virá da IA)
export const generateMockDietPlan = (): DietPlan => {
  return {
    id: `diet-plan-${Date.now()}`,
    name: 'DIETA EQUILIBRADA',
    description: 'Plano nutricional balanceado para perda de peso saudável',
    totalDailyCalories: 1800,
    createdAt: new Date(),
    meals: [
      {
        id: 'meal-1',
        name: 'Café da Manhã',
        time: '08:00',
        totalCalories: 450,
        foods: [
          { name: 'Aveia', quantity: '50g', calories: 200 },
          { name: 'Banana', quantity: '1 unidade média', calories: 100 },
          { name: 'Leite desnatado', quantity: '200ml', calories: 70 },
          { name: 'Mel', quantity: '1 colher de sopa', calories: 80 }
        ]
      },
      {
        id: 'meal-2',
        name: 'Lanche da Manhã',
        time: '10:30',
        totalCalories: 150,
        foods: [
          { name: 'Iogurte grego', quantity: '100g', calories: 100 },
          { name: 'Castanhas', quantity: '10 unidades', calories: 50 }
        ]
      },
      {
        id: 'meal-3',
        name: 'Almoço',
        time: '13:00',
        totalCalories: 600,
        foods: [
          { name: 'Peito de frango grelhado', quantity: '150g', calories: 250 },
          { name: 'Arroz integral', quantity: '100g cozido', calories: 130 },
          { name: 'Brócolis', quantity: '150g', calories: 50 },
          { name: 'Azeite de oliva', quantity: '1 colher de sopa', calories: 120 },
          { name: 'Salada verde', quantity: '100g', calories: 50 }
        ]
      },
      {
        id: 'meal-4',
        name: 'Lanche da Tarde',
        time: '16:00',
        totalCalories: 200,
        foods: [
          { name: 'Maçã', quantity: '1 unidade média', calories: 80 },
          { name: 'Queijo cottage', quantity: '50g', calories: 50 },
          { name: 'Biscoito integral', quantity: '2 unidades', calories: 70 }
        ]
      },
      {
        id: 'meal-5',
        name: 'Jantar',
        time: '19:30',
        totalCalories: 400,
        foods: [
          { name: 'Salmão grelhado', quantity: '120g', calories: 250 },
          { name: 'Batata-doce assada', quantity: '150g', calories: 130 },
          { name: 'Salada de folhas', quantity: '100g', calories: 20 }
        ]
      }
    ]
  };
};
