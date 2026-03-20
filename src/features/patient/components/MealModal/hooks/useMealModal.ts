import { useState, useCallback, useMemo, useEffect } from "react";
import { usePatientDayStore } from "../../../../../stores/patientDayStore";
import { usePatientFoodsStore } from "../../../../../stores/patientFoodsStore";
import { useIngredientSuggestions } from "./useIngredientSuggestions";
import type { SerializedMeal } from "../../../../../types/medicalApiTypes";
import type { CustomerFood } from "../../../../../types/intakeCrudTypes";
import type { IngredientInput } from "../types";

// Stable empty array — avoids creating new references inside Zustand selectors
const EMPTY_FOODS: CustomerFood[] = [];

export function useMealModal(
  meal: SerializedMeal,
  patientUuid: string,
  date: string,
  isOpen: boolean,
  onClose: () => void,
  onSave?: () => Promise<void>,
) {
  // ── ui state ───────────────────────────────────────────────────────────────
  const [pendingIngredients, setPendingIngredients] = useState<
    IngredientInput[]
  >([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [ingredientModalFood, setIngredientModalFood] =
    useState<CustomerFood | null>(null);
  // Index into pendingIngredients (null = adding new)
  const [editingIngredientIndex, setEditingIngredientIndex] = useState<
    number | null
  >(null);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  // ── day store data (targets + base from other meals) ─────────────────────
  const dayKey = `${patientUuid}-${date}`;
  const dayData = usePatientDayStore((s) => s.getDayByKey(dayKey));

  // ── foods lookup ──────────────────────────────────────────────────────────
  const patientFoods = usePatientFoodsStore(
    (s) => s.foodsByPatient[patientUuid] ?? EMPTY_FOODS,
  );
  const loadFoods = usePatientFoodsStore((s) => s.loadFoods);

  // ── auto-load foods ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && patientUuid) {
      loadFoods(patientUuid);
    }
  }, [isOpen, patientUuid, loadFoods]);

  // ── reset when modal opens ─────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      const base: IngredientInput[] = (meal.ingredients ?? []).map((ing) => ({
        id: ing.id,
        food_id: ing.food_id,
        food_name: ing.food_name,
        quantity: ing.quantity ?? 100,
        unit: ing.unit ?? "g",
      }));
      setPendingIngredients(base);
      setHasChanges(false);
      setError(null);
      setSearchQuery("");
      setShowFoodSearch(false);
      setShowUnsavedDialog(false);
      setIngredientModalFood(null);
      setEditingIngredientIndex(null);
    }
  }, [isOpen, meal.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const dayTargets = useMemo(() => {
    const t = dayData?.requirements?.total;
    if (!t) return null;
    return {
      proteins_g: t.proteins_g ?? 0,
      carbs_g: t.carbs_g ?? 0,
      fats_g: t.fats_g ?? 0,
      fiber_g: t.fiber_g ?? 0,
      sugars_g: t.sugars_g ?? 0,
    };
  }, [dayData]);

  const dayBase = useMemo(() => {
    const contribs = dayData?.contributions;
    if (!contribs) return { protein: 0, carbs: 0, fat: 0, fiber: 0, sugars: 0 };
    const total = contribs.total;
    const thisMeal = contribs.by_meal?.find(
      (m) => m.meal_name === meal.meal_name,
    );
    return {
      protein: (total.proteins_g ?? 0) - (thisMeal?.totals?.proteins_g ?? 0),
      carbs: (total.carbs_g ?? 0) - (thisMeal?.totals?.carbs_g ?? 0),
      fat: (total.fats_g ?? 0) - (thisMeal?.totals?.fats_g ?? 0),
      fiber: (total.fiber_g ?? 0) - (thisMeal?.totals?.fiber_g ?? 0),
      sugars: (total.sugars_g ?? 0) - (thisMeal?.totals?.sugars_g ?? 0),
    };
  }, [dayData, meal.meal_name]);

  const foodsMap = useMemo(() => {
    const map = new Map<number, CustomerFood>();
    patientFoods.forEach((f) => map.set(f.food_id, f));
    return map;
  }, [patientFoods]);

  // ── search results ─────────────────────────────────────────────────────────
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return patientFoods
      .filter((f) => f.food_name?.toLowerCase().includes(q))
      .slice(0, 30);
  }, [patientFoods, searchQuery]);

  // ── visible ingredients (non-deleted) ─────────────────────────────────────
  const visibleIngredients = useMemo(
    () => pendingIngredients.filter((i) => !i._deleted),
    [pendingIngredients],
  );

  // ── real-time pending nutrition ───────────────────────────────────────────
  const pendingNutrition = useMemo(() => {
    let protein = 0,
      carbs = 0,
      fat = 0,
      fiber = 0,
      sugars = 0;
    visibleIngredients.forEach((ing) => {
      const food = foodsMap.get(ing.food_id);
      if (!food) return;
      const f = ing.quantity / 100;
      protein += (food.proteins_g ?? 0) * f;
      carbs += (food.carbs_g ?? 0) * f;
      fat += (food.fats_g ?? 0) * f;
      fiber += (food.fiber_g ?? 0) * f;
      sugars += (food.sugars_g ?? 0) * f;
    });
    return { protein, carbs, fat, fiber, sugars };
  }, [visibleIngredients, foodsMap]);

  // ── suggestions ───────────────────────────────────────────────────────────
  const suggestions = useIngredientSuggestions(visibleIngredients, patientUuid);

  // ── ingredient handlers ───────────────────────────────────────────────────
  const handleSuggestionClick = useCallback(
    (food: { food_id: number; food_name: string }) => {
      const fullFood =
        foodsMap.get(food.food_id) ??
        ({ food_id: food.food_id, food_name: food.food_name } as CustomerFood);
      setIngredientModalFood(fullFood);
      setEditingIngredientIndex(null);
    },
    [foodsMap],
  );

  const handleDeleteIngredient = useCallback((ing: IngredientInput) => {
    setPendingIngredients((prev) => {
      if (ing.id) {
        // Existing server ingredient — mark deleted
        return prev.map((p) => (p === ing ? { ...p, _deleted: true } : p));
      } else {
        // New (unsaved) ingredient — remove entirely
        return prev.filter((p) => p !== ing);
      }
    });
    setHasChanges(true);
  }, []);

  const handleEditClick = useCallback(
    (ing: IngredientInput) => {
      const idx = pendingIngredients.indexOf(ing);
      setEditingIngredientIndex(idx !== -1 ? idx : null);
      const fullFood =
        foodsMap.get(ing.food_id) ??
        ({ food_id: ing.food_id, food_name: ing.food_name } as CustomerFood);
      setIngredientModalFood(fullFood);
    },
    [pendingIngredients, foodsMap],
  );

  const handleSelectFromSearch = useCallback((food: CustomerFood) => {
    setIngredientModalFood(food);
    setEditingIngredientIndex(null);
    setShowFoodSearch(false);
    setSearchQuery("");
  }, []);

  const handleSaveIngredient = useCallback(
    (food: CustomerFood, quantity: number, unit: string) => {
      if (editingIngredientIndex !== null) {
        setPendingIngredients((prev) =>
          prev.map((ing, i) =>
            i === editingIngredientIndex
              ? {
                  ...ing,
                  food_id: food.food_id,
                  food_name: food.food_name,
                  quantity,
                  unit,
                }
              : ing,
          ),
        );
      } else {
        setPendingIngredients((prev) => [
          ...prev,
          {
            food_id: food.food_id,
            food_name: food.food_name,
            quantity,
            unit,
            _isNew: true,
          },
        ]);
      }
      setHasChanges(true);
      setIngredientModalFood(null);
      setEditingIngredientIndex(null);
    },
    [editingIngredientIndex],
  );

  const handleCloseIngredientModal = useCallback(() => {
    setIngredientModalFood(null);
    setEditingIngredientIndex(null);
  }, []);

  const handleLoadTemplate = useCallback(
    (templateIngredients: IngredientInput[]) => {
      setPendingIngredients((prev) => {
        const existing = prev.filter((i) => !i._isNew);
        return [
          ...existing,
          ...templateIngredients.map((ti) => ({
            ...ti,
            id: undefined,
            _isNew: true as const,
            _deleted: false,
          })),
        ];
      });
      setHasChanges(true);
      setShowTemplatesModal(false);
    },
    [],
  );

  // ── close handling ────────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    if (hasChanges) {
      setShowUnsavedDialog(true);
    } else {
      onClose();
    }
  }, [hasChanges, onClose]);

  const handleConfirmClose = useCallback(() => {
    setShowUnsavedDialog(false);
    onClose();
  }, [onClose]);

  const handleCancelClose = useCallback(() => {
    setShowUnsavedDialog(false);
  }, []);

  // ── bulk save ─────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!hasChanges) {
      onClose();
      return;
    }

    const dayId = dayData?.day?.id;
    if (!dayId) {
      setError("No se encontró el día activo");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const store = usePatientDayStore.getState();
      const originalIngMap = new Map(
        (meal.ingredients ?? []).map((i) => [i.id, i]),
      );

      // 1. Delete marked ingredients
      const toDelete = pendingIngredients.filter((i) => i.id && i._deleted);
      for (const ing of toDelete) {
        await store.deleteIngredient(
          patientUuid,
          date,
          dayId,
          meal.id,
          ing.id!,
        );
      }

      // 2. Update changed existing ingredients
      const toUpdate = pendingIngredients.filter(
        (i) => i.id && !i._deleted && !i._isNew,
      );
      for (const ing of toUpdate) {
        const orig = originalIngMap.get(ing.id!);
        if (
          orig &&
          (orig.quantity !== ing.quantity || (orig.unit ?? "g") !== ing.unit)
        ) {
          await store.updateIngredient(
            patientUuid,
            date,
            dayId,
            meal.id,
            ing.id!,
            { quantity: ing.quantity, unit: ing.unit },
          );
        }
      }

      // 3. Bulk-create new ingredients
      const toCreate = pendingIngredients.filter(
        (i) => i._isNew && !i._deleted,
      );
      if (toCreate.length > 0) {
        await store.createBulkIngredients(
          patientUuid,
          date,
          dayId,
          meal.id,
          toCreate.map((i) => ({
            food_id: i.food_id,
            food_name: i.food_name,
            quantity: i.quantity,
            unit: i.unit,
          })),
        );
      }

      setHasChanges(false);
      if (onSave) await onSave();
      onClose();
    } catch (err) {
      setError(
        (err instanceof Error ? err.message : null) ??
          "Error al guardar ingredientes",
      );
    } finally {
      setSaving(false);
    }
  }, [
    hasChanges,
    patientUuid,
    date,
    dayData,
    pendingIngredients,
    meal,
    onSave,
    onClose,
  ]);

  // ── derived editing ingredient (for IngredientModal initial values) ───────
  const editingIngredient =
    editingIngredientIndex !== null
      ? pendingIngredients[editingIngredientIndex]
      : null;

  return {
    pendingIngredients,
    visibleIngredients,
    hasChanges,
    saving,
    error,
    searchQuery,
    setSearchQuery,
    showFoodSearch,
    setShowFoodSearch,
    showTemplatesModal,
    setShowTemplatesModal,
    showUnsavedDialog,
    ingredientModalFood,
    editingIngredient,
    pendingNutrition,
    dayBase,
    dayTargets,
    foodsMap,
    searchResults,
    suggestions,
    handleSuggestionClick,
    handleDeleteIngredient,
    handleEditClick,
    handleSelectFromSearch,
    handleSaveIngredient,
    handleCloseIngredientModal,
    handleLoadTemplate,
    handleSave,
    handleClose,
    handleConfirmClose,
    handleCancelClose,
  };
}
