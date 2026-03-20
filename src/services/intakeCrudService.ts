import { authFetchJson, authFetch } from "./apiConfig";
import type { DayAnalysisResponse } from "../types/medicalApiTypes";
import type {
  CreateDayRequest,
  CreateMealRequest,
  UpdateMealRequest,
  MealIntake,
  CreateIngredientRequest,
  UpdateIngredientRequest,
} from "../types/intakeCrudTypes";

const BASE =
  (import.meta.env.VITE_INTAKE_API_URL as string | undefined) ??
  "https://api.intake.equilibraco.com";

// ── DÍA ───────────────────────────────────────────────────────────────────────

export const createDay = (
  payload: CreateDayRequest,
): Promise<DayAnalysisResponse> =>
  authFetchJson(`${BASE}/api/v1/intakes/day`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateDayProfileVersion = (
  dayId: number,
  profileVersion: number,
): Promise<DayAnalysisResponse> =>
  authFetchJson(`${BASE}/api/v1/intakes/day/${dayId}/profile-version`, {
    method: "PATCH",
    body: JSON.stringify({ profile_version: profileVersion }),
  });

export const deleteDay = (
  dayId: number,
): Promise<{ message: string; data: string }> =>
  authFetchJson(`${BASE}/api/v1/intakes/day/${dayId}`, { method: "DELETE" });

// ── PLATO ─────────────────────────────────────────────────────────────────────

export const createMeal = (
  dayId: number,
  payload: CreateMealRequest,
): Promise<DayAnalysisResponse> =>
  authFetchJson(`${BASE}/api/v1/intakes/days/${dayId}/meals`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateMeal = (
  dayId: number,
  mealId: number,
  payload: UpdateMealRequest,
): Promise<MealIntake> =>
  authFetchJson(`${BASE}/api/v1/intakes/days/${dayId}/meals/${mealId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteMeal = (
  dayId: number,
  mealId: number,
): Promise<DayAnalysisResponse> =>
  authFetchJson(`${BASE}/api/v1/intakes/days/${dayId}/meals/${mealId}`, {
    method: "DELETE",
  });

export const toggleMealFavorite = (
  dayId: number,
  mealId: number,
  isFavorite: boolean,
): Promise<MealIntake> => {
  const params = new URLSearchParams({ is_favorite: String(isFavorite) });
  return authFetchJson(
    `${BASE}/api/v1/intakes/days/${dayId}/meals/${mealId}/favorite?${params}`,
    {
      method: "PATCH",
    },
  );
};

// ── INGREDIENTES ──────────────────────────────────────────────────────────────

export const createIngredient = (
  dayId: number,
  mealId: number,
  payload: CreateIngredientRequest,
): Promise<DayAnalysisResponse> =>
  authFetchJson(
    `${BASE}/api/v1/intakes/days/${dayId}/meals/${mealId}/ingredients`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

export const createBulkIngredients = (
  dayId: number,
  mealId: number,
  ingredients: CreateIngredientRequest[],
): Promise<DayAnalysisResponse> =>
  authFetchJson(
    `${BASE}/api/v1/intakes/days/${dayId}/meals/${mealId}/ingredients/bulk`,
    {
      method: "POST",
      body: JSON.stringify(ingredients),
    },
  );

export const updateIngredient = (
  dayId: number,
  mealId: number,
  ingredientId: number,
  payload: UpdateIngredientRequest,
): Promise<DayAnalysisResponse> =>
  authFetchJson(
    `${BASE}/api/v1/intakes/days/${dayId}/meals/${mealId}/ingredients/${ingredientId}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );

export const deleteIngredient = (
  dayId: number,
  mealId: number,
  ingredientId: number,
): Promise<DayAnalysisResponse> =>
  authFetchJson(
    `${BASE}/api/v1/intakes/days/${dayId}/meals/${mealId}/ingredients/${ingredientId}`,
    { method: "DELETE" },
  );

// ── HISTORIAL DEL PACIENTE (para plantillas de platos) ───────────────────────

export interface CustomerDayHistory {
  id: number;
  date: string;
  meals?: Array<{
    id: number;
    meal_name: string;
    slot_id?: string | null;
    ingredients?: Array<{
      id: number;
      food_id: number;
      food_name: string;
      quantity?: number | null;
      unit?: string | null;
    }>;
  }>;
}

export const listCustomerMeals = async (
  patientUuid: string,
): Promise<CustomerDayHistory[]> => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30); // 30 días de historia

  const params = new URLSearchParams({
    start_date: start.toISOString().split("T")[0],
    end_date: end.toISOString().split("T")[0],
  });

  const res = await authFetchJson<
    CustomerDayHistory[] | { data: CustomerDayHistory[] }
  >(`${BASE}/api/v1/intakes/day/range/${patientUuid}?${params}`);
  return Array.isArray(res)
    ? res
    : ((res as { data: CustomerDayHistory[] }).data ?? []);
};

// ── CACHE (best-effort, silently ignored) ─────────────────────────────────────

export const invalidateDayCache = async (params: {
  customer_id: string;
  date: string;
  profile_version?: number;
  pattern_id?: string;
}): Promise<void> => {
  try {
    await authFetch(`${BASE}/api/v1/cache/invalidate-day`, {
      method: "POST",
      body: JSON.stringify(params),
    });
  } catch {
    // Silently ignore — cache invalidation is best-effort
  }
};
