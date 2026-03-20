import { useMemo } from "react";
import { usePatientMealsStore } from "../../../../../stores/usePatientMealsStore";
import type { CustomerDayHistory } from "../../../../../stores/usePatientMealsStore";
import type { IngredientInput } from "../types";

interface Suggestion {
  food_id: number;
  food_name: string;
}

// Stable empty fallback — avoids creating new array references in Zustand selectors
const EMPTY_DAYS: CustomerDayHistory[] = [];

/** Returns quick-access food suggestions, excluding foods already in the meal */
export function useIngredientSuggestions(
  presentIngredients: IngredientInput[],
  patientUuid: string,
): Suggestion[] {
  // Select raw days (stable reference) to avoid creating new arrays in the
  // Zustand selector, which would cause an infinite re-render loop.
  const rawDays = usePatientMealsStore(
    (s) => s.daysByPatient[patientUuid] ?? EMPTY_DAYS,
  );

  const topFoods = useMemo(() => {
    const freq = new Map<
      number,
      { food_id: number; food_name: string; count: number }
    >();
    for (const day of rawDays) {
      for (const meal of day.meals ?? []) {
        for (const ing of meal.ingredients ?? []) {
          const existing = freq.get(ing.food_id);
          if (existing) {
            existing.count++;
          } else {
            freq.set(ing.food_id, {
              food_id: ing.food_id,
              food_name: ing.food_name,
              count: 1,
            });
          }
        }
      }
    }
    return Array.from(freq.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }, [rawDays]);

  return useMemo(() => {
    const presentIds = new Set(presentIngredients.map((i) => i.food_id));
    const seen = new Set<number>();
    const result: Suggestion[] = [];

    for (const food of topFoods) {
      if (presentIds.has(food.food_id)) continue;
      if (seen.has(food.food_id)) continue;
      seen.add(food.food_id);
      result.push({ food_id: food.food_id, food_name: food.food_name });
      if (result.length >= 8) break;
    }

    return result;
  }, [presentIngredients, topFoods]);
}
