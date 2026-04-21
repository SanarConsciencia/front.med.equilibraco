import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { usePatientDayStore } from "../stores/patientDayStore";
import { usePatientFoodsStore } from "../stores/patientFoodsStore";
import { useAppStore } from "../stores/appStore";
import { usePatientData } from "../hooks/usePatientData";
import {
  requestNutritionReport,
  buildNutritionPayload,
  buildClaudePromptText,
  downloadBlob,
} from "../services/nutrition-report.service";
import { todayColombia } from "../utils/date";
import type { Customer } from "../services/api";
import type { SerializedMeal } from "../types/medicalApiTypes";
import DatePicker from "../components/patient/DatePicker";
import DayOverview from "../components/day/DayOverview";
import DayFeedbackPanel from "../components/day/DayFeedbackPanel";
import MealCard from "../components/day/MealCard";
import MealFormModal from "../components/day/MealFormModal";
import type { MealFormData } from "../components/day/MealFormModal";
import { GlobalMealModal } from "../components/common/GlobalMealModal";
import NutriAnalysisPage from "./NutriAnalysisPage";
import GroceryPlannerPage from "./GroceryPlannerPage";

const PatientDayPage: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // The customer info is passed as state when navigating from Customers page
  const customer = location.state?.customer as Customer | undefined;
  const patientName = customer?.customer_full_name ?? uuid ?? "—";

  const [date, setDate] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("date") ?? todayColombia();
  });

  const [mealFormOpen, setMealFormOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<SerializedMeal | null>(null);
  const [creatingDay, setCreatingDay] = useState(false);
  const [nutriAnalysisOpen, setNutriAnalysisOpen] = useState(false);
  const [groceryPlannerOpen, setGroceryPlannerOpen] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [copyingPrompt, setCopyingPrompt] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);

  // Initialize data
  usePatientData(uuid, date);

  const key = uuid ? `${uuid}-${date}` : "";
  const day = usePatientDayStore((s) => (key ? s.getDayByKey(key) : undefined));
  const loading = usePatientDayStore((s) => (key ? s.isLoading(key) : false));
  const error = usePatientDayStore((s) => (key ? s.getError(key) : undefined));

  const saveDayFeedback = usePatientDayStore((s) => s.saveDayFeedback);
  const deleteDayFeedback = usePatientDayStore((s) => s.deleteDayFeedback);
  const saveMealNote = usePatientDayStore((s) => s.saveMealNote);
  const deleteMealNote = usePatientDayStore((s) => s.deleteMealNote);
  const deleteMeal = usePatientDayStore((s) => s.deleteMeal);
  const createDay = usePatientDayStore((s) => s.createDay);
  const createMeal = usePatientDayStore((s) => s.createMeal);
  const updateMeal = usePatientDayStore((s) => s.updateMeal);
  const loadDay = usePatientDayStore((s) => s.loadDay);

  const adjustServing = usePatientFoodsStore((s) => s.adjustServing);
  const doctor = useAppStore((s) => s.user);

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
  };

  const handleReloadDay = () => {
    if (uuid) loadDay(uuid, date).catch(console.error);
  };

  const handleCreateDay = async () => {
    if (!uuid) return;
    setCreatingDay(true);
    try {
      await createDay(uuid, date, {
        meals: [],
      });
    } catch (err) {
      console.error("Error creating day:", err);
    } finally {
      setCreatingDay(false);
    }
  };

  const handleSaveMeal = async (data: MealFormData) => {
    if (!uuid || !day) return;
    if (editingMeal) {
      await updateMeal(uuid, date, day.day.id, editingMeal.id, {
        meal_name: data.meal_name,
        meal_time: data.meal_time || undefined,
        notes: data.notes || undefined,
      });
    } else {
      await createMeal(uuid, date, day.day.id, {
        meal_name: data.meal_name,
        meal_type: "extra",
        meal_time: data.meal_time || undefined,
        notes: data.notes || undefined,
      });
    }
  };

  const handleOpenEditMeal = (meal: SerializedMeal) => {
    setEditingMeal(meal);
    setMealFormOpen(true);
  };

  const handleCopyClaudePrompt = async () => {
    if (!day || !doctor || !customer) return;
    setCopyingPrompt(true);
    try {
      const payload = await buildNutritionPayload(
        day,
        doctor,
        {
          nombre: customer.customer_full_name,
          email: customer.customer_email,
          subscription_status: customer.subscription_status,
          avatar_url: null,
        },
        date,
      );
      const text = buildClaudePromptText(payload);
      await navigator.clipboard.writeText(text);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2500);
    } catch (err) {
      console.error("Error copiando prompt:", err);
    } finally {
      setCopyingPrompt(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!day || !doctor || !customer) return;
    setGeneratingReport(true);
    try {
      const blob = await requestNutritionReport(
        day,
        doctor,
        {
          nombre: customer.customer_full_name,
          email: customer.customer_email,
          subscription_status: customer.subscription_status,
          avatar_url: null,
        },
        date,
      );
      downloadBlob(blob, `reporte-${customer.customer_full_name}-${date}.pdf`);
    } catch (err) {
      console.error("Error generando reporte:", err);
    } finally {
      setGeneratingReport(false);
    }
  };

  if (!uuid) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 dark:text-gray-400">
        Paciente no encontrado.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
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
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
            {patientName}
          </p>
          {customer?.customer_email && (
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
              {customer.customer_email}
            </p>
          )}
        </div>
        {day && doctor && customer && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleCopyClaudePrompt}
              disabled={copyingPrompt}
              className="flex items-center gap-1.5 px-3 min-h-[36px] text-xs font-medium rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label="Copiar prompt para Claude"
              title="Copiar prompt para Claude AI"
            >
              {copyingPrompt ? (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
              ) : promptCopied ? (
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
              {promptCopied ? "¡Copiado!" : "Claude"}
            </button>
            <button
              type="button"
              onClick={handleGenerateReport}
              disabled={generatingReport}
              className="flex items-center gap-1.5 px-3 min-h-[36px] text-xs font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label="Generar reporte PDF"
            >
              {generatingReport ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                  Generando...
                </>
              ) : (
                <>
                  <svg
                    className="w-3.5 h-3.5"
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
                  Reporte PDF
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-10">
        {/* Date picker */}
        <DatePicker date={date} onChange={handleDateChange} />

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 dark:border-green-500" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl p-4 text-center space-y-3">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleReloadDay}
                className="text-sm font-medium text-red-600 dark:text-red-400 underline"
              >
                Reintentar
              </button>
              {error.includes("404") && (
                <button
                  type="button"
                  onClick={handleCreateDay}
                  disabled={creatingDay}
                  className="flex items-center gap-2 px-4 min-h-[44px] text-sm font-medium rounded-xl bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {creatingDay ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                      Creando...
                    </>
                  ) : (
                    <>
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Crear día
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* No data — empty day state */}
        {!loading && !error && !day && (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <svg
              className="w-12 h-12 text-gray-300 dark:text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                No hay registros para este día.
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Crea el día para registrar los platos del paciente.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCreateDay}
              disabled={creatingDay}
              className="flex items-center gap-2 px-4 min-h-[44px] text-sm font-medium rounded-xl bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {creatingDay ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                  Creando...
                </>
              ) : (
                <>
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Crear día
                </>
              )}
            </button>
          </div>
        )}

        {/* Day data */}
        {!loading && day && (
          <>
            {/* Grocery planner trigger */}
            <button
              type="button"
              onClick={() => setGroceryPlannerOpen(true)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 text-left active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🛒</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Planificar mercado
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Crear lista de compras con totales crudos
                  </p>
                </div>
              </div>
              <svg
                className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Nutrient analysis trigger */}
            <button
              type="button"
              onClick={() => setNutriAnalysisOpen(true)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 text-left active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🔬</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Análisis por nutriente
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Ver qué ingredientes aportaron a cada nutriente
                  </p>
                </div>
              </div>
              <svg
                className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Day overview */}
            <DayOverview day={day} />

            {/* Day feedback */}
            <DayFeedbackPanel
              dayIntakeId={day.day.id}
              feedback={day.day_feedback}
              onSave={(contenido, score) =>
                saveDayFeedback(uuid, date, day.day.id, contenido, score)
              }
              onDelete={() => deleteDayFeedback(uuid, date, day.day.id)}
            />

            {/* Meals */}
            {(day.day.meals?.length ?? 0) > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    Platos ({day.day.meals!.length})
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingMeal(null);
                      setMealFormOpen(true);
                    }}
                    className="flex items-center gap-1 px-3 min-h-[36px] text-xs font-medium rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Agregar plato
                  </button>
                </div>
                {day.day.meals!.map((meal) => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    patientUuid={uuid}
                    date={date}
                    dayId={day.day.id}
                    onEditMeal={handleOpenEditMeal}
                    onSaveMealNote={(mealId, note) =>
                      saveMealNote(uuid, date, mealId, note)
                    }
                    onDeleteMealNote={(mealId) =>
                      deleteMealNote(uuid, date, mealId)
                    }
                    onDeleteMeal={(dayId, mealId) =>
                      deleteMeal(uuid, date, dayId, mealId)
                    }
                    onAdjustServing={(foodId, size, unit) =>
                      adjustServing(uuid, foodId, size, unit)
                    }
                    onReloadDay={handleReloadDay}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  No hay platos registrados en este día.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingMeal(null);
                    setMealFormOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 min-h-[44px] text-sm font-medium rounded-xl bg-green-600 hover:bg-green-700 text-white transition-colors"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Agregar primer plato
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Global meal modal — always mounted, activated via useMedicoMealsModalStore */}
      <GlobalMealModal />

      {/* Nutrient analysis full-screen overlay */}
      {day && (
        <NutriAnalysisPage
          day={day}
          date={date}
          patientName={patientName}
          isOpen={nutriAnalysisOpen}
          onClose={() => setNutriAnalysisOpen(false)}
        />
      )}

      {/* Grocery planner full-screen overlay */}
      {groceryPlannerOpen && (
        <GroceryPlannerPage
          patientUuid={uuid}
          patientName={patientName}
          medicoId={doctor?.id ?? ""}
          patientPhone={customer?.customer_phone ?? null}
          onClose={() => setGroceryPlannerOpen(false)}
          requirementsPreset={
            day
              ? {
                  proteins_g: day.requirements.total.proteins_g ?? 0,
                  carbs_g: day.requirements.total.carbs_g ?? 0,
                  fats_g: day.requirements.total.fats_g ?? 0,
                  fiber_g: day.requirements.total.fiber_g ?? 0,
                  sugars_g: day.requirements.total.sugars_g ?? 0,
                }
              : undefined
          }
        />
      )}

      {/* Meal create/edit modal */}
      <MealFormModal
        isOpen={mealFormOpen}
        mode={editingMeal ? "edit" : "create"}
        initialData={
          editingMeal
            ? {
                meal_name: editingMeal.meal_name,
                meal_time: editingMeal.meal_time ?? "",
                notes: editingMeal.notes ?? "",
              }
            : undefined
        }
        onClose={() => {
          setMealFormOpen(false);
          setEditingMeal(null);
        }}
        onSave={handleSaveMeal}
      />
    </div>
  );
};

export default PatientDayPage;
