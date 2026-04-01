// ── Day CRUD ──────────────────────────────────────────────────────────────────

export interface CreateDayRequest {
  customer_id: string;
  date: string; // YYYY-MM-DD
  profile_version?: number;
  pattern_id?: string;
  training_day?: boolean;
  notes?: string;
}

// ── Meal CRUD ─────────────────────────────────────────────────────────────────

export interface CreateMealRequest {
  meal_name: string;
  meal_type?: string;
  slot_id?: string;
  meal_time?: string; // HH:MM
  notes?: string;
}

export interface UpdateMealRequest {
  meal_name?: string;
  meal_time?: string;
  notes?: string;
}

/** Returned by updateMeal and toggleMealFavorite */
export interface MealIntake {
  id: number;
  day_id: number;
  meal_name: string;
  meal_type?: string | null;
  slot_id?: string | null;
  slot_order?: number | null;
  meal_time?: string | null;
  is_favorite?: boolean | null;
  notes?: string | null;
  [key: string]: unknown;
}

// ── Ingredient CRUD ───────────────────────────────────────────────────────────

export interface CreateIngredientRequest {
  food_id: number;
  food_name: string;
  quantity: number;
  unit: string;
}

export interface UpdateIngredientRequest {
  quantity?: number;
  unit?: string;
}

// ── Foods ─────────────────────────────────────────────────────────────────────

export interface CustomerFood {
  food_id: number;
  food_name: string;
  serving_size?: number | null;
  serving_unit?: string | null;
  custom_serving_size?: number | null;
  custom_serving_unit?: string | null;
  // Nutritional data per 100g (returned by alimentos API)
  proteins_g?: number | null;
  carbs_g?: number | null;
  fats_g?: number | null;
  fiber_g?: number | null;
  sugars_g?: number | null;
  kcal?: number | null;
  // Cooking factor: grams_raw = registered_g × factor. <1 gains weight (rice≈0.33), =1 no change (apple), >1 loses weight (chicken≈1.43)
  raw_equivalent_factor?: number | null;
  [key: string]: unknown;
}
