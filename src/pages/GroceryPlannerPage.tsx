import React, { useState, useMemo, useEffect } from "react";
import { ModalPortal } from "../components/ui/ModalPortal";
import BottomSheet from "../components/common/BottomSheet";
import { FoodResultsModal } from "../features/patient/components/MealModal/components/FoodResultsModal";
import { usePatientFoodsStore } from "../stores/patientFoodsStore";
import type { CustomerFood } from "../types/intakeCrudTypes";
import type {
  GroceryPlanItemWithCalc,
  GroceryPlanSummaryResponse,
  MacroTargets,
  RegisterPurchaseItem,
} from "../types/groceryPlanTypes";
import * as groceryPlanService from "../services/groceryPlanService";

// ─── Props ───────────────────────────────────────────────────────────────────

interface GroceryPlannerPageProps {
  patientUuid: string;
  patientName: string;
  medicoId: string;
  onClose: () => void;
  /** Pre-filled from day.requirements.total — editable by tapping "Editar" */
  requirementsPreset?: MacroTargets;
}

type Step = "config" | "items" | "market" | "plans";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computeItem(
  food: CustomerFood,
  daily_grams: number,
  item_days: number,
): GroceryPlanItemWithCalc {
  const raw_equivalent_factor =
    (food.raw_equivalent_factor as number | null | undefined) ?? 1.0;
  const raw_grams_total = daily_grams * raw_equivalent_factor * item_days;
  const protein_contribution =
    (daily_grams / 100) * (food.proteins_g ?? 0) * item_days;
  const carbs_contribution =
    (daily_grams / 100) * (food.carbs_g ?? 0) * item_days;
  const fat_contribution = (daily_grams / 100) * (food.fats_g ?? 0) * item_days;
  const fiber_contribution =
    (daily_grams / 100) * (food.fiber_g ?? 0) * item_days;
  const sugar_contribution =
    (daily_grams / 100) * (food.sugars_g ?? 0) * item_days;
  return {
    food_id: food.food_id,
    food_name: food.food_name,
    daily_grams,
    item_days,
    raw_equivalent_factor,
    proteins_g: food.proteins_g ?? 0,
    carbs_g: food.carbs_g ?? 0,
    fats_g: food.fats_g ?? 0,
    fiber_g: food.fiber_g ?? 0,
    sugars_g: food.sugars_g ?? 0,
    raw_grams_total,
    protein_contribution,
    carbs_contribution,
    fat_contribution,
    fiber_contribution,
    sugar_contribution,
  };
}

function compliancePct(contribution: number, target: number): number {
  if (target <= 0) return 0;
  return (contribution / target) * 100;
}

function compliancePillClass(pct: number, hasTarget: boolean): string {
  if (!hasTarget)
    return "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400";
  if (pct >= 90 && pct <= 110)
    return "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300";
  if (pct > 110)
    return "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300";
  return "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300";
}

function formatColombianDate(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
}

const STEP_TITLES: Record<Step, string> = {
  config: "Nuevo plan",
  items: "Agregar alimentos",
  market: "Lista de mercado",
  plans: "Planes guardados",
};

const STEP_ORDER: Step[] = ["config", "items", "market", "plans"];

// ─── Component ───────────────────────────────────────────────────────────────

const GroceryPlannerPage: React.FC<GroceryPlannerPageProps> = ({
  patientUuid,
  patientName,
  medicoId,
  onClose,
  requirementsPreset,
}) => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>("config");
  const [planName, setPlanName] = useState("Lista de mercado");
  const [daysCount, setDaysCount] = useState(7);
  const [macroTargets, setMacroTargets] = useState<MacroTargets>(
    requirementsPreset ?? {
      proteins_g: 0,
      carbs_g: 0,
      fats_g: 0,
      fiber_g: 0,
      sugars_g: 0,
    },
  );
  const [editingTargets, setEditingTargets] = useState(!requirementsPreset);
  const [items, setItems] = useState<GroceryPlanItemWithCalc[]>([]);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [foodSearchQuery, setFoodSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<CustomerFood | null>(null);
  const [pendingGrams, setPendingGrams] = useState(100);
  const [pendingDays, setPendingDays] = useState(7);
  const [saving, setSaving] = useState(false);
  const [savedPlanId, setSavedPlanId] = useState<number | null>(null);
  const [savedPlans, setSavedPlans] = useState<GroceryPlanSummaryResponse[]>(
    [],
  );
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [deletingPlanId, setDeletingPlanId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [purchaseSheetOpen, setPurchaseSheetOpen] = useState(false);
  const [purchaseInputs, setPurchaseInputs] = useState<
    {
      food_id: number;
      food_name: string;
      quantity_raw_g: number;
      price_paid: number;
    }[]
  >([]);
  const [registeringPurchase, setRegisteringPurchase] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // ── Food store ─────────────────────────────────────────────────────────────
  const loadFoods = usePatientFoodsStore((s) => s.loadFoods);
  const getFoodsByPatient = usePatientFoodsStore((s) => s.getFoodsByPatient);

  useEffect(() => {
    loadFoods(patientUuid);
  }, [patientUuid, loadFoods]);

  const allFoods = getFoodsByPatient(patientUuid);
  const searchResults = useMemo(() => {
    const q = foodSearchQuery.trim().toLowerCase();
    if (!q) return allFoods.slice(0, 30);
    return allFoods.filter((f) => f.food_name.toLowerCase().includes(q));
  }, [allFoods, foodSearchQuery]);

  // ── Load saved plans on mount ──────────────────────────────────────────────
  useEffect(() => {
    setLoadingPlans(true);
    groceryPlanService
      .listPlans(patientUuid)
      .then(setSavedPlans)
      .catch(console.error)
      .finally(() => setLoadingPlans(false));
  }, [patientUuid]);

  // ── Derived totals ─────────────────────────────────────────────────────────
  const totals = useMemo(
    () => ({
      totalProtein: items.reduce((s, i) => s + i.protein_contribution, 0),
      totalCarbs: items.reduce((s, i) => s + i.carbs_contribution, 0),
      totalFat: items.reduce((s, i) => s + i.fat_contribution, 0),
      totalFiber: items.reduce((s, i) => s + i.fiber_contribution, 0),
      totalSugar: items.reduce((s, i) => s + i.sugar_contribution, 0),
    }),
    [items],
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleBack = () => {
    const idx = STEP_ORDER.indexOf(step);
    if (idx <= 0) {
      onClose();
    } else {
      setStep(STEP_ORDER[idx - 1]);
    }
  };

  const handleDaysChange = (delta: number) => {
    setDaysCount((prev) => Math.min(30, Math.max(1, prev + delta)));
  };

  const recomputeItemField = (
    item: GroceryPlanItemWithCalc,
    daily_grams: number,
    item_days: number,
  ): GroceryPlanItemWithCalc => {
    const food: CustomerFood = {
      food_id: item.food_id,
      food_name: item.food_name,
      proteins_g: item.proteins_g,
      carbs_g: item.carbs_g,
      fats_g: item.fats_g,
      fiber_g: item.fiber_g,
      sugars_g: item.sugars_g,
      raw_equivalent_factor: item.raw_equivalent_factor,
    };
    return computeItem(food, Math.max(0, daily_grams), Math.max(1, item_days));
  };

  const handleItemGramsChange = (food_id: number, grams: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.food_id !== food_id
          ? item
          : recomputeItemField(item, grams, item.item_days),
      ),
    );
  };

  const handleItemDaysChange = (food_id: number, days: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.food_id !== food_id
          ? item
          : recomputeItemField(item, item.daily_grams, days),
      ),
    );
  };

  const handleRemoveItem = (food_id: number) => {
    setItems((prev) => prev.filter((i) => i.food_id !== food_id));
  };

  const handleFoodSelect = (food: CustomerFood) => {
    setShowFoodSearch(false);
    setSelectedFood(food);
    setPendingGrams(food.custom_serving_size ?? food.serving_size ?? 100);
    setPendingDays(daysCount);
  };

  const handleConfirmAddFood = () => {
    if (!selectedFood) return;
    setItems((prev) => {
      const exists = prev.find((i) => i.food_id === selectedFood.food_id);
      if (exists) {
        return prev.map((i) =>
          i.food_id === selectedFood.food_id
            ? computeItem(selectedFood, pendingGrams, pendingDays)
            : i,
        );
      }
      return [...prev, computeItem(selectedFood, pendingGrams, pendingDays)];
    });
    setSelectedFood(null);
  };

  const handleSavePlan = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await groceryPlanService.createPlan(patientUuid, medicoId, {
        name: planName,
        days_count: daysCount,
        items: items.map((i) => ({
          food_id: i.food_id,
          food_name: i.food_name,
          daily_grams: i.daily_grams,
          raw_equivalent_factor: i.raw_equivalent_factor,
          proteins_g: i.proteins_g,
          carbs_g: i.carbs_g,
          fats_g: i.fats_g,
          fiber_g: i.fiber_g,
          sugars_g: i.sugars_g,
        })),
      });
      setSavedPlanId(res.id);
      // Refresh saved plans list
      const updated = await groceryPlanService.listPlans(patientUuid);
      setSavedPlans(updated);
      setStep("plans");
    } catch (err) {
      console.error("Error guardando plan:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (planId: number) => {
    setDeletingPlanId(planId);
    try {
      await groceryPlanService.deletePlan(planId, patientUuid);
      setSavedPlans((prev) => prev.filter((p) => p.id !== planId));
    } catch (err) {
      console.error("Error eliminando plan:", err);
    } finally {
      setDeletingPlanId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleViewPlan = async (planId: number) => {
    try {
      const plan = await groceryPlanService.getPlan(planId, patientUuid);
      setPlanName(plan.name);
      setDaysCount(plan.days_count);
      const loaded: GroceryPlanItemWithCalc[] = plan.items.map((item) => {
        const factor = item.raw_equivalent_factor ?? 1.0;
        return {
          ...item,
          item_days: plan.days_count,
          raw_equivalent_factor: factor,
          raw_grams_total: item.daily_grams * factor * plan.days_count,
          protein_contribution:
            (item.daily_grams / 100) * item.proteins_g * plan.days_count,
          carbs_contribution:
            (item.daily_grams / 100) * item.carbs_g * plan.days_count,
          fat_contribution:
            (item.daily_grams / 100) * item.fats_g * plan.days_count,
          fiber_contribution:
            (item.daily_grams / 100) * item.fiber_g * plan.days_count,
          sugar_contribution:
            (item.daily_grams / 100) * item.sugars_g * plan.days_count,
        };
      });
      setItems(loaded);
      setStep("market");
    } catch (err) {
      console.error("Error cargando plan:", err);
    }
  };

  const handleDownloadCsv = () => {
    const rows = [
      [
        "Alimento",
        "g_dia",
        "dias",
        "factor",
        "total_crudo_g",
        "total_crudo_kg",
      ],
      ...items.map((item) => {
        const totalCrudoG = Math.round(item.raw_grams_total / 10) * 10;
        return [
          item.food_name,
          item.daily_grams.toString(),
          item.item_days.toString(),
          item.raw_equivalent_factor.toFixed(2),
          totalCrudoG.toString(),
          (totalCrudoG / 1000).toFixed(3),
        ];
      }),
    ];
    const csvContent = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mercado-${patientName}-${daysCount}dias.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenPurchaseSheet = () => {
    setPurchaseInputs(
      items.map((item) => ({
        food_id: item.food_id,
        food_name: item.food_name,
        quantity_raw_g: Math.round(item.raw_grams_total / 10) * 10,
        price_paid: 0,
      })),
    );
    setPurchaseSheetOpen(true);
  };

  const handleRegisterPurchase = async () => {
    setRegisteringPurchase(true);
    try {
      const payload: RegisterPurchaseItem[] = purchaseInputs.map((p) => ({
        food_id: p.food_id,
        food_name: p.food_name,
        quantity_raw_g: p.quantity_raw_g,
        price_paid: p.price_paid,
        price_unit_weight:
          p.quantity_raw_g > 0 ? p.price_paid / p.quantity_raw_g : 0,
      }));
      await groceryPlanService.registerPurchase(patientUuid, payload);
      setPurchaseSuccess(true);
      setPurchaseSheetOpen(false);
      setTimeout(() => setPurchaseSuccess(false), 3000);
    } catch (err) {
      console.error("Error registrando compras:", err);
    } finally {
      setRegisteringPurchase(false);
    }
  };

  // ── Render helpers ─────────────────────────────────────────────────────────

  const macroLabels: {
    key: keyof MacroTargets;
    label: string;
    total: number;
  }[] = [
    { key: "proteins_g", label: "Prot", total: totals.totalProtein },
    { key: "carbs_g", label: "Carb", total: totals.totalCarbs },
    { key: "fats_g", label: "Gras", total: totals.totalFat },
    { key: "fiber_g", label: "Fibra", total: totals.totalFiber },
    { key: "sugars_g", label: "Azúc", total: totals.totalSugar },
  ];

  const progressBarClass = (pct: number, hasTarget: boolean) => {
    if (!hasTarget) return "bg-gray-300 dark:bg-gray-600";
    if (pct >= 90 && pct <= 110) return "bg-green-500";
    if (pct > 110) return "bg-orange-500";
    return "bg-red-500";
  };

  // ── Step: config ───────────────────────────────────────────────────────────
  const renderConfig = () => (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-6">
      {/* Plan name */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Nombre del plan
        </label>
        <input
          type="text"
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          className="w-full min-h-[44px] px-3 text-base rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Nombre del plan"
        />
      </div>

      {/* Days count */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Días del plan
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleDaysChange(-1)}
            className="w-11 h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xl text-gray-700 dark:text-gray-300 flex items-center justify-center active:bg-gray-100 dark:active:bg-gray-700"
          >
            −
          </button>
          <span className="flex-1 text-center text-lg font-semibold text-gray-900 dark:text-white">
            {daysCount}
          </span>
          <button
            type="button"
            onClick={() => handleDaysChange(1)}
            className="w-11 h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xl text-gray-700 dark:text-gray-300 flex items-center justify-center active:bg-gray-100 dark:active:bg-gray-700"
          >
            +
          </button>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          × {daysCount} días ={" "}
          {daysCount >= 7
            ? `${(daysCount / 7).toFixed(1)} semanas`
            : `${daysCount} días`}
        </p>
      </div>

      {/* Macro targets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Objetivos nutricionales (por día)
          </p>
          <button
            type="button"
            onClick={() => setEditingTargets((v) => !v)}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-colors"
          >
            {editingTargets ? "Listo" : "Editar"}
          </button>
        </div>

        {editingTargets ? (
          /* ── Editable inputs ── */
          (
            [
              { key: "proteins_g" as const, label: "Proteínas (g)" },
              { key: "carbs_g" as const, label: "Carbohidratos (g)" },
              { key: "fats_g" as const, label: "Grasas (g)" },
              { key: "fiber_g" as const, label: "Fibra (g)" },
              { key: "sugars_g" as const, label: "Azúcares (g)" },
            ] as { key: keyof MacroTargets; label: string }[]
          ).map(({ key, label }) => (
            <div key={key} className="space-y-0.5">
              <label className="text-xs text-gray-500 dark:text-gray-400">
                {label}
              </label>
              <input
                type="number"
                min={0}
                value={macroTargets[key] || ""}
                onChange={(e) =>
                  setMacroTargets((prev) => ({
                    ...prev,
                    [key]: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full min-h-[44px] px-3 text-base rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0"
              />
              {macroTargets[key] > 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  × {daysCount} días ={" "}
                  {(macroTargets[key] * daysCount).toFixed(0)}g en el periodo
                </p>
              )}
            </div>
          ))
        ) : (
          /* ── Read-only summary ── */
          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700 px-4 py-3 space-y-2">
            {(
              [
                {
                  key: "proteins_g" as const,
                  label: "Proteínas",
                  color: "text-red-600 dark:text-red-400",
                },
                {
                  key: "carbs_g" as const,
                  label: "Carbohidratos",
                  color: "text-amber-600 dark:text-amber-400",
                },
                {
                  key: "fats_g" as const,
                  label: "Grasas",
                  color: "text-yellow-600 dark:text-yellow-400",
                },
                {
                  key: "fiber_g" as const,
                  label: "Fibra",
                  color: "text-green-600 dark:text-green-400",
                },
                {
                  key: "sugars_g" as const,
                  label: "Azúcares",
                  color: "text-pink-600 dark:text-pink-400",
                },
              ] as { key: keyof MacroTargets; label: string; color: string }[]
            ).map(({ key, label, color }) => (
              <div
                key={key}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-600 dark:text-gray-300">
                  {label}
                </span>
                <span className={`font-semibold ${color}`}>
                  {macroTargets[key] > 0 ? (
                    `${macroTargets[key].toFixed(0)} g/día`
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 font-normal text-xs">
                      sin objetivo
                    </span>
                  )}
                </span>
              </div>
            ))}
            {requirementsPreset && (
              <p className="text-xs text-gray-400 dark:text-gray-500 pt-1 border-t border-gray-100 dark:border-gray-700">
                Calculado desde el perfil nutricional del paciente
              </p>
            )}
          </div>
        )}
      </div>

      {/* Continue */}
      <button
        type="button"
        onClick={() => setStep("items")}
        disabled={!planName.trim()}
        className="w-full min-h-[44px] rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continuar →
      </button>
    </div>
  );

  // ── Step: items ────────────────────────────────────────────────────────────
  const renderItems = () => (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Macro compliance summary bar */}
      <div className="px-4 py-2 flex items-center gap-1.5 flex-wrap border-b border-gray-100 dark:border-gray-800">
        <span className="text-xs text-gray-400 dark:text-gray-500 mr-1">
          {daysCount}d
        </span>
        {macroLabels.map(({ key, label, total }) => {
          const target = macroTargets[key] * daysCount;
          const pct = compliancePct(total, target);
          const hasTarget = macroTargets[key] > 0;
          return (
            <span
              key={key}
              className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${compliancePillClass(pct, hasTarget)}`}
            >
              {label}{" "}
              {hasTarget ? `${Math.round(pct)}%` : `${total.toFixed(0)}g`}
            </span>
          );
        })}
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 pb-36">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <span className="text-5xl">🛒</span>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Sin alimentos — agrega uno abajo
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.food_id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 px-4 py-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {item.food_name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.food_id)}
                  className="p-1 rounded-lg text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0"
                  aria-label="Eliminar"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              {/* Grams + days inputs */}
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="number"
                  min={0}
                  value={item.daily_grams || ""}
                  onChange={(e) =>
                    handleItemGramsChange(
                      item.food_id,
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  className="w-20 min-h-[44px] px-3 text-base rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  g/día ×
                </span>
                <input
                  type="number"
                  min={1}
                  max={daysCount}
                  value={item.item_days || ""}
                  onChange={(e) =>
                    handleItemDaysChange(
                      item.food_id,
                      Math.min(daysCount, parseInt(e.target.value) || 1),
                    )
                  }
                  className="w-16 min-h-[44px] px-3 text-base rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  días
                </span>
              </div>
              {/* Raw grams result */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  = {Math.round(item.raw_grams_total / 10) * 10}g crudo
                  {item.raw_grams_total >= 1000
                    ? ` (${(item.raw_grams_total / 1000).toFixed(2)} kg)`
                    : ""}
                </span>
                {item.raw_equivalent_factor !== 1.0 && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    (factor ×{item.raw_equivalent_factor.toFixed(2)} aplicado)
                  </span>
                )}
              </div>
              {/* Contributions */}
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Nutrientes: P {item.protein_contribution.toFixed(0)}g · C{" "}
                {item.carbs_contribution.toFixed(0)}g · G{" "}
                {item.fat_contribution.toFixed(0)}g
              </p>
            </div>
          ))
        )}
      </div>

      {/* Bottom fixed bar */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 py-3 space-y-2 pb-safe">
        <button
          type="button"
          onClick={() => setShowFoodSearch(true)}
          className="w-full min-h-[44px] rounded-xl border-2 border-dashed border-green-400 dark:border-green-600 text-green-600 dark:text-green-400 font-medium text-sm flex items-center justify-center gap-2 active:bg-green-50 dark:active:bg-green-950/20"
        >
          <span className="text-lg leading-none">＋</span> Agregar alimento
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setStep("market")}
            disabled={items.length === 0}
            className="flex-1 min-h-[44px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ver lista →
          </button>
          <button
            type="button"
            onClick={handleSavePlan}
            disabled={items.length === 0 || saving}
            className="flex-1 min-h-[44px] rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                Guardando…
              </>
            ) : (
              "Guardar plan"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // ── Step: market ───────────────────────────────────────────────────────────
  const renderMarket = () => (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-6">
      <div className="space-y-0.5">
        <p className="text-base font-semibold text-gray-900 dark:text-white">
          Lista de mercado · {daysCount} días
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {patientName}
        </p>
      </div>

      {/* Items table */}
      <div className="space-y-2">
        {/* Header */}
        <div className="grid grid-cols-5 gap-1 px-2 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
          <span className="col-span-2">Alimento</span>
          <span className="text-right">g/día</span>
          <span className="text-right">Días</span>
          <span className="text-right">Total crudo</span>
        </div>
        {items.map((item) => {
          const totalCrudoG = Math.round(item.raw_grams_total / 10) * 10;
          const totalCrudoKg = totalCrudoG / 1000;
          return (
            <div
              key={item.food_id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 px-3 py-3 space-y-1"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {item.food_name}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>
                  {item.daily_grams}g/día × {item.item_days} días
                  {item.raw_equivalent_factor !== 1.0
                    ? ` × ${item.raw_equivalent_factor.toFixed(2)}`
                    : ""}
                </span>
                <span className="font-semibold text-sm text-gray-900 dark:text-white">
                  {totalCrudoKg >= 1
                    ? `${totalCrudoKg.toFixed(2)} kg`
                    : `${totalCrudoG}g`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Macro compliance footer */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Cumplimiento nutricional · {daysCount} días
        </p>
        {macroLabels.map(({ key, label, total }) => {
          const target = macroTargets[key] * daysCount;
          const pct = compliancePct(total, target);
          const hasTarget = macroTargets[key] > 0;
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-300">
                  {label}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {total.toFixed(0)}g
                  {hasTarget &&
                    ` / ${target.toFixed(0)}g · ${Math.round(pct)}%`}
                </span>
              </div>
              {hasTarget && (
                <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${progressBarClass(pct, hasTarget)}`}
                    style={{ width: `${Math.min(pct, 150)}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleDownloadCsv}
          className="w-full min-h-[44px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Descargar CSV
        </button>
        {savedPlanId == null && (
          <button
            type="button"
            onClick={handleSavePlan}
            disabled={saving}
            className="w-full min-h-[44px] rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium text-sm flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                Guardando…
              </>
            ) : (
              "Guardar plan"
            )}
          </button>
        )}
        <button
          type="button"
          onClick={handleOpenPurchaseSheet}
          className="w-full min-h-[44px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <span>🛍️</span> Registrar compras
        </button>
      </div>

      {/* Purchase success toast */}
      {purchaseSuccess && (
        <div className="fixed bottom-8 left-4 right-4 z-[70] bg-green-600 text-white text-sm font-medium px-4 py-3 rounded-2xl shadow-xl text-center">
          Precios actualizados ✓
        </div>
      )}
    </div>
  );

  // ── Step: plans ────────────────────────────────────────────────────────────
  const renderPlans = () => (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-6">
      {loadingPlans ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 dark:border-green-500" />
        </div>
      ) : savedPlans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <span className="text-5xl">📋</span>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            No hay planes guardados aún
          </p>
          <button
            type="button"
            onClick={() => setStep("config")}
            className="px-4 min-h-[44px] rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium text-sm transition-colors"
          >
            Crear nuevo plan
          </button>
        </div>
      ) : (
        savedPlans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 px-4 py-4 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {plan.name}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {plan.days_count} días · {plan.items_count} alimentos ·{" "}
                  {formatColombianDate(plan.created_at)}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  confirmDeleteId === plan.id
                    ? handleDeletePlan(plan.id)
                    : setConfirmDeleteId(plan.id)
                }
                disabled={deletingPlanId === plan.id}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                aria-label={
                  confirmDeleteId === plan.id
                    ? "Confirmar eliminación"
                    : "Eliminar plan"
                }
              >
                {deletingPlanId === plan.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500" />
                ) : confirmDeleteId === plan.id ? (
                  <span className="text-xs text-red-500 font-medium px-1">
                    ¿Eliminar?
                  </span>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                )}
              </button>
            </div>
            {confirmDeleteId === plan.id && (
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="text-xs text-gray-400 underline"
              >
                Cancelar
              </button>
            )}
            <button
              type="button"
              onClick={() => handleViewPlan(plan.id)}
              className="w-full min-h-[40px] rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-colors"
            >
              Ver lista de mercado
            </button>
          </div>
        ))
      )}
    </div>
  );

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <ModalPortal isOpen>
      <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 flex flex-col">
        {/* Fixed top bar */}
        <div className="flex-shrink-0 sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="Volver"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <p className="flex-1 text-base font-semibold text-gray-900 dark:text-white truncate">
            {STEP_TITLES[step]}
          </p>
          {/* Plans icon button with badge */}
          <button
            type="button"
            onClick={() => setStep("plans")}
            className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="Planes guardados"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            {savedPlans.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-green-500 text-white text-[10px] flex items-center justify-center px-1 font-bold">
                {savedPlans.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        {step === "config" && renderConfig()}
        {step === "items" && renderItems()}
        {step === "market" && renderMarket()}
        {step === "plans" && renderPlans()}
      </div>

      {/* Food search modal */}
      <FoodResultsModal
        isOpen={showFoodSearch}
        onClose={() => setShowFoodSearch(false)}
        query={foodSearchQuery}
        onQueryChange={setFoodSearchQuery}
        results={searchResults}
        onSelect={handleFoodSelect}
        patientUuid={patientUuid}
      />

      {/* Quantity picker bottom sheet */}
      <BottomSheet
        isOpen={selectedFood !== null}
        onClose={() => setSelectedFood(null)}
        title={selectedFood?.food_name ?? ""}
      >
        <div className="px-4 pb-6 space-y-4">
          {/* Grams stepper */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Gramos por día
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPendingGrams((p) => Math.max(0, p - 10))}
                className="w-11 h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xl text-gray-700 dark:text-gray-300 flex items-center justify-center"
              >
                −
              </button>
              <input
                type="number"
                min={0}
                value={pendingGrams || ""}
                onChange={(e) =>
                  setPendingGrams(parseFloat(e.target.value) || 0)
                }
                className="flex-1 min-h-[44px] text-center text-base rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={() => setPendingGrams((p) => p + 10)}
                className="w-11 h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xl text-gray-700 dark:text-gray-300 flex items-center justify-center"
              >
                +
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400 w-10">
                g/día
              </span>
            </div>
          </div>

          {/* Days stepper */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Número de días
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPendingDays((p) => Math.max(1, p - 1))}
                className="w-11 h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xl text-gray-700 dark:text-gray-300 flex items-center justify-center"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                max={daysCount}
                value={pendingDays || ""}
                onChange={(e) =>
                  setPendingDays(
                    Math.min(daysCount, parseInt(e.target.value) || 1),
                  )
                }
                className="flex-1 min-h-[44px] text-center text-base rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={() =>
                  setPendingDays((p) => Math.min(daysCount, p + 1))
                }
                className="w-11 h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xl text-gray-700 dark:text-gray-300 flex items-center justify-center"
              >
                +
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400 w-10">
                días
              </span>
            </div>
          </div>

          {/* Live preview */}
          {pendingGrams > 0 && (
            <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-xl px-4 py-3 text-sm">
              <span className="text-gray-600 dark:text-gray-300">
                {pendingGrams}g/día × {pendingDays} días
                {selectedFood?.raw_equivalent_factor != null &&
                selectedFood.raw_equivalent_factor !== 1.0
                  ? ` × ${(selectedFood.raw_equivalent_factor as number).toFixed(2)}`
                  : ""}{" "}
                ={" "}
              </span>
              <span className="font-bold text-indigo-700 dark:text-indigo-300">
                {Math.round(
                  (pendingGrams *
                    ((selectedFood?.raw_equivalent_factor as
                      | number
                      | null
                      | undefined) ?? 1.0) *
                    pendingDays) /
                    10,
                ) * 10}
                g crudo
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleConfirmAddFood}
            className="w-full min-h-[44px] rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium text-sm transition-colors"
          >
            Agregar al plan
          </button>
        </div>
      </BottomSheet>

      {/* Register purchases bottom sheet */}
      <BottomSheet
        isOpen={purchaseSheetOpen}
        onClose={() => setPurchaseSheetOpen(false)}
        title="Registrar compras"
      >
        <div className="px-4 pb-6 space-y-3 overflow-y-auto max-h-[60vh]">
          {purchaseInputs.map((p, idx) => (
            <div
              key={p.food_id}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 space-y-2"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {p.food_name}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    Cantidad (g crudo)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={p.quantity_raw_g || ""}
                    onChange={(e) =>
                      setPurchaseInputs((prev) =>
                        prev.map((item, i) =>
                          i === idx
                            ? {
                                ...item,
                                quantity_raw_g: parseFloat(e.target.value) || 0,
                              }
                            : item,
                        ),
                      )
                    }
                    className="w-full min-h-[44px] px-2 text-base rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    Precio (COP)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={p.price_paid || ""}
                    onChange={(e) =>
                      setPurchaseInputs((prev) =>
                        prev.map((item, i) =>
                          i === idx
                            ? {
                                ...item,
                                price_paid: parseFloat(e.target.value) || 0,
                              }
                            : item,
                        ),
                      )
                    }
                    className="w-full min-h-[44px] px-2 text-base rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleRegisterPurchase}
            disabled={registeringPurchase}
            className="w-full min-h-[44px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {registeringPurchase ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                Registrando…
              </>
            ) : (
              "Confirmar compra"
            )}
          </button>
        </div>
      </BottomSheet>
    </ModalPortal>
  );
};

export default GroceryPlannerPage;
