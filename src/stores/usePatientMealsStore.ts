import { create } from "zustand";
import { listCustomerMeals } from "../services/intakeCrudService";
import type { CustomerDayHistory } from "../services/intakeCrudService";

export interface QuickAccessFood {
  food_id: number;
  food_name: string;
  count: number;
}

export type { CustomerDayHistory };

type Meal = NonNullable<CustomerDayHistory["meals"]>[number];

interface PatientMealsState {
  daysByPatient: Record<string, CustomerDayHistory[]>;
  loadingPatients: Set<string>;

  loadMeals: (patientUuid: string) => Promise<void>;
  getMealsByPatient: (patientUuid: string) => Meal[];
  getTopUsedFoods: (patientUuid: string, limit?: number) => QuickAccessFood[];
}

export const usePatientMealsStore = create<PatientMealsState>((set, get) => ({
  daysByPatient: {},
  loadingPatients: new Set(),

  loadMeals: async (patientUuid) => {
    if (get().loadingPatients.has(patientUuid)) return;
    // Don't reload if already loaded
    if (get().daysByPatient[patientUuid]) return;

    set((s) => {
      const next = new Set(s.loadingPatients);
      next.add(patientUuid);
      return { loadingPatients: next };
    });

    try {
      const days = await listCustomerMeals(patientUuid);
      set((s) => ({
        daysByPatient: { ...s.daysByPatient, [patientUuid]: days },
      }));
    } catch {
      // Templates are optional — silently ignore errors
    } finally {
      set((s) => {
        const next = new Set(s.loadingPatients);
        next.delete(patientUuid);
        return { loadingPatients: next };
      });
    }
  },

  getMealsByPatient: (patientUuid) => {
    const days = get().daysByPatient[patientUuid] ?? [];
    return days.flatMap((d) => d.meals ?? []);
  },

  getTopUsedFoods: (patientUuid, limit = 10) => {
    const meals = get().getMealsByPatient(patientUuid);
    const freq = new Map<number, QuickAccessFood>();

    for (const meal of meals) {
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

    return Array.from(freq.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },
}));

/** Selector hook — reads top used foods for a specific patient */
export function useTopUsedFoods(
  patientUuid: string,
  limit = 10,
): QuickAccessFood[] {
  return usePatientMealsStore((s) => s.getTopUsedFoods(patientUuid, limit));
}
