import { create } from "zustand";

interface MedicoMealsModalState {
  activeMealId: number | null;
  patientUuid: string | null;
  date: string | null;
  openMeal: (mealId: number, patientUuid: string, date: string) => void;
  closeMeal: () => void;
}

export const useMedicoMealsModalStore = create<MedicoMealsModalState>(
  (set) => ({
    activeMealId: null,
    patientUuid: null,
    date: null,
    openMeal: (mealId, patientUuid, date) =>
      set({ activeMealId: mealId, patientUuid, date }),
    closeMeal: () => set({ activeMealId: null, patientUuid: null, date: null }),
  }),
);
