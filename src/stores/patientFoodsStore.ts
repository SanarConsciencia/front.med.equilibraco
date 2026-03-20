import { create } from "zustand";
import * as foodsService from "../services/foodsService";
import type { CustomerFood } from "../types/intakeCrudTypes";

interface PatientFoodsState {
  foodsByPatient: Record<string, CustomerFood[]>;
  loadingPatients: Set<string>;

  loadFoods: (patientUuid: string) => Promise<void>;
  getFoodsByPatient: (patientUuid: string) => CustomerFood[];
  adjustServing: (
    patientUuid: string,
    foodId: number,
    servingSize: number,
    servingUnit: string,
  ) => Promise<void>;
}

export const usePatientFoodsStore = create<PatientFoodsState>((set, get) => ({
  foodsByPatient: {},
  loadingPatients: new Set<string>(),

  loadFoods: async (patientUuid) => {
    set((s) => {
      const next = new Set(s.loadingPatients);
      next.add(patientUuid);
      return { loadingPatients: next };
    });
    try {
      const foods = await foodsService.getPatientFoods(patientUuid);
      set((s) => ({
        foodsByPatient: { ...s.foodsByPatient, [patientUuid]: foods },
      }));
    } finally {
      set((s) => {
        const next = new Set(s.loadingPatients);
        next.delete(patientUuid);
        return { loadingPatients: next };
      });
    }
  },

  getFoodsByPatient: (patientUuid) => get().foodsByPatient[patientUuid] ?? [],

  adjustServing: async (patientUuid, foodId, servingSize, servingUnit) => {
    await foodsService.adjustServing(
      patientUuid,
      foodId,
      servingSize,
      servingUnit,
    );
    await get().loadFoods(patientUuid);
  },
}));
