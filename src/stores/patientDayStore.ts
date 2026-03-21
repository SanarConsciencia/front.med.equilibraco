import { create } from "zustand";
import { useAppStore } from "./appStore";
import * as medicalDayService from "../services/medicalDayService";
import * as intakeCrudService from "../services/intakeCrudService";
import type { DayAnalysisResponse } from "../types/medicalApiTypes";
import type {
  CreateDayRequest,
  CreateMealRequest,
  UpdateMealRequest,
  MealIntake,
  CreateIngredientRequest,
  UpdateIngredientRequest,
} from "../types/intakeCrudTypes";

interface PatientDayState {
  daysByKey: Record<string, DayAnalysisResponse>;
  loadingKeys: Set<string>;
  errorByKey: Record<string, string>;

  loadDay: (patientUuid: string, date: string) => Promise<void>;
  getDayByKey: (key: string) => DayAnalysisResponse | undefined;
  isLoading: (key: string) => boolean;
  getError: (key: string) => string | undefined;
  _updateFromAnalysis: (
    patientUuid: string,
    date: string,
    data: DayAnalysisResponse,
  ) => void;

  // Clinical notes
  saveDayFeedback: (
    patientUuid: string,
    date: string,
    dayIntakeId: number,
    contenido: string,
    scoreGeneral?: number,
  ) => Promise<void>;
  deleteDayFeedback: (
    patientUuid: string,
    date: string,
    dayIntakeId: number,
  ) => Promise<void>;
  saveMealNote: (
    patientUuid: string,
    date: string,
    mealIntakeId: number,
    doctorNote: string,
  ) => Promise<void>;
  deleteMealNote: (
    patientUuid: string,
    date: string,
    mealIntakeId: number,
  ) => Promise<void>;

  // Day CRUD
  createDay: (
    patientUuid: string,
    date: string,
    payload: Omit<CreateDayRequest, "customer_id" | "date">,
  ) => Promise<void>;
  deleteDay: (
    patientUuid: string,
    date: string,
    dayId: number,
  ) => Promise<void>;

  // Meal CRUD
  createMeal: (
    patientUuid: string,
    date: string,
    dayId: number,
    payload: CreateMealRequest,
  ) => Promise<void>;
  updateMeal: (
    patientUuid: string,
    date: string,
    dayId: number,
    mealId: number,
    payload: UpdateMealRequest,
  ) => Promise<MealIntake>;
  deleteMeal: (
    patientUuid: string,
    date: string,
    dayId: number,
    mealId: number,
  ) => Promise<void>;

  // Ingredient CRUD
  createBulkIngredients: (
    patientUuid: string,
    date: string,
    dayId: number,
    mealId: number,
    ingredients: CreateIngredientRequest[],
  ) => Promise<void>;
  updateIngredient: (
    patientUuid: string,
    date: string,
    dayId: number,
    mealId: number,
    ingredientId: number,
    payload: UpdateIngredientRequest,
  ) => Promise<void>;
  deleteIngredient: (
    patientUuid: string,
    date: string,
    dayId: number,
    mealId: number,
    ingredientId: number,
  ) => Promise<void>;
}

export const usePatientDayStore = create<PatientDayState>((set, get) => ({
  daysByKey: {},
  loadingKeys: new Set<string>(),
  errorByKey: {},

  // ── Lectura ───────────────────────────────────────────────────────────────

  loadDay: async (patientUuid, date) => {
    const key = `${patientUuid}-${date}`;
    const doctorId = useAppStore.getState().user?.id;
    if (!doctorId) throw new Error("No hay médico autenticado");

    set((s) => {
      const next = new Set(s.loadingKeys);
      next.add(key);
      return { loadingKeys: next, errorByKey: { ...s.errorByKey, [key]: "" } };
    });

    try {
      const data = await medicalDayService.getPatientDay(
        doctorId,
        patientUuid,
        date,
      );
      get()._updateFromAnalysis(patientUuid, date, data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar el día";
      set((s) => ({ errorByKey: { ...s.errorByKey, [key]: msg } }));
      throw err;
    } finally {
      set((s) => {
        const next = new Set(s.loadingKeys);
        next.delete(key);
        return { loadingKeys: next };
      });
    }
  },

  getDayByKey: (key) => get().daysByKey[key],
  isLoading: (key) => get().loadingKeys.has(key),
  getError: (key) => get().errorByKey[key],

  _updateFromAnalysis: (patientUuid, date, data) => {
    const key = `${patientUuid}-${date}`;
    set((s) => ({ daysByKey: { ...s.daysByKey, [key]: data } }));
  },

  // ── Notas clínicas ────────────────────────────────────────────────────────

  saveDayFeedback: async (
    patientUuid,
    date,
    dayIntakeId,
    contenido,
    scoreGeneral,
  ) => {
    const medicoId = useAppStore.getState().user?.id;
    if (!medicoId) throw new Error("No hay médico autenticado");
    await medicalDayService.saveDayFeedback(
      dayIntakeId,
      medicoId,
      contenido,
      scoreGeneral,
    );
    await get().loadDay(patientUuid, date);
  },

  saveMealNote: async (patientUuid, date, mealIntakeId, doctorNote) => {
    const doctorId = useAppStore.getState().user?.id;
    if (!doctorId) throw new Error("No hay médico autenticado");
    await medicalDayService.saveMealNote(mealIntakeId, doctorNote, doctorId);
    await get().loadDay(patientUuid, date);
  },

  deleteDayFeedback: async (patientUuid, date, dayIntakeId) => {
    await medicalDayService.deleteDayFeedback(dayIntakeId);
    await get().loadDay(patientUuid, date);
  },

  deleteMealNote: async (patientUuid, date, mealIntakeId) => {
    await medicalDayService.deleteMealNote(mealIntakeId);
    await get().loadDay(patientUuid, date);
  },

  // ── CRUD día ──────────────────────────────────────────────────────────────

  createDay: async (patientUuid, date, payload) => {
    const data = await intakeCrudService.createDay({
      ...payload,
      customer_id: patientUuid,
      date,
    });
    get()._updateFromAnalysis(patientUuid, date, data);
    intakeCrudService.invalidateDayCache({ customer_id: patientUuid, date });
  },

  deleteDay: async (patientUuid, date, dayId) => {
    await intakeCrudService.deleteDay(dayId);
    set((s) => {
      const key = `${patientUuid}-${date}`;
      const next = { ...s.daysByKey };
      delete next[key];
      return { daysByKey: next };
    });
    intakeCrudService.invalidateDayCache({ customer_id: patientUuid, date });
  },

  // ── CRUD plato ────────────────────────────────────────────────────────────

  createMeal: async (patientUuid, date, dayId, payload) => {
    const data = await intakeCrudService.createMeal(dayId, payload);
    get()._updateFromAnalysis(patientUuid, date, data);
    intakeCrudService.invalidateDayCache({ customer_id: patientUuid, date });
  },

  updateMeal: async (patientUuid, date, _dayId, mealId, payload) => {
    const key = `${patientUuid}-${date}`;
    const existing = get().daysByKey[key];
    if (!existing) throw new Error("No hay datos del día en el store");
    const dayId = existing.day.id;
    const updatedMeal = await intakeCrudService.updateMeal(
      dayId,
      mealId,
      payload,
    );
    set((s) => {
      const day = s.daysByKey[key];
      if (!day) return s;
      const meals = day.day.meals?.map((m) =>
        m.id === mealId ? { ...m, ...updatedMeal } : m,
      );
      return {
        daysByKey: {
          ...s.daysByKey,
          [key]: { ...day, day: { ...day.day, meals } },
        },
      };
    });
    return updatedMeal;
  },

  deleteMeal: async (patientUuid, date, dayId, mealId) => {
    const data = await intakeCrudService.deleteMeal(dayId, mealId);
    get()._updateFromAnalysis(patientUuid, date, data);
    intakeCrudService.invalidateDayCache({ customer_id: patientUuid, date });
  },

  // ── CRUD ingredientes ─────────────────────────────────────────────────────

  createBulkIngredients: async (
    patientUuid,
    date,
    dayId,
    mealId,
    ingredients,
  ) => {
    const data = await intakeCrudService.createBulkIngredients(
      dayId,
      mealId,
      ingredients,
    );
    get()._updateFromAnalysis(patientUuid, date, data);
    intakeCrudService.invalidateDayCache({ customer_id: patientUuid, date });
  },

  updateIngredient: async (
    patientUuid,
    date,
    dayId,
    mealId,
    ingredientId,
    payload,
  ) => {
    const data = await intakeCrudService.updateIngredient(
      dayId,
      mealId,
      ingredientId,
      payload,
    );
    get()._updateFromAnalysis(patientUuid, date, data);
    intakeCrudService.invalidateDayCache({ customer_id: patientUuid, date });
  },

  deleteIngredient: async (patientUuid, date, dayId, mealId, ingredientId) => {
    const data = await intakeCrudService.deleteIngredient(
      dayId,
      mealId,
      ingredientId,
    );
    get()._updateFromAnalysis(patientUuid, date, data);
    intakeCrudService.invalidateDayCache({ customer_id: patientUuid, date });
  },
}));
