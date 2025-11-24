export interface Food {
  name: string;
  quantity?: string;
  calories?: number;
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
