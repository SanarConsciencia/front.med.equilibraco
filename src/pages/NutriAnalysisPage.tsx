import React, { useState, useMemo, useEffect, useRef } from "react";
import type { DayAnalysisResponse } from "../types/medicalApiTypes";
import { ModalPortal } from "../components/ui/ModalPortal";

// ─── Public props ───────────────────────────────────────────────────────────

export interface NutriAnalysisPageProps {
  day: DayAnalysisResponse;
  date: string;
  patientName?: string;
  isOpen: boolean;
  onClose: () => void;
}

// ─── Internal types ─────────────────────────────────────────────────────────

interface NutrientDef {
  key: string;
  label: string;
  unit: string;
  hasCompliance: boolean;
}

interface CategoryDef {
  id: string;
  label: string;
  emoji: string;
  accentBg: string;
  nutrients: NutrientDef[];
}

interface Contributor {
  mealName: string;
  foodName: string;
  weightG: number;
  amount: number;
}

// ─── Nutrient catalogue ─────────────────────────────────────────────────────

const CATEGORIES: CategoryDef[] = [
  {
    id: "proteins",
    label: "Proteínas",
    emoji: "🥩",
    accentBg: "bg-red-50 dark:bg-red-900/20",
    nutrients: [
      { key: "proteins_g", label: "Proteínas", unit: "g", hasCompliance: true },
    ],
  },
  {
    id: "carbs",
    label: "Carbohidratos",
    emoji: "🍞",
    accentBg: "bg-amber-50 dark:bg-amber-900/20",
    nutrients: [
      {
        key: "carbs_g",
        label: "Carbohidratos",
        unit: "g",
        hasCompliance: true,
      },
      { key: "starches_g", label: "Almidones", unit: "g", hasCompliance: true },
      { key: "sugars_g", label: "Azúcares", unit: "g", hasCompliance: true },
      { key: "fiber_g", label: "Fibra total", unit: "g", hasCompliance: true },
      {
        key: "fiber_soluble_g",
        label: "Fibra soluble",
        unit: "g",
        hasCompliance: true,
      },
      {
        key: "fiber_insoluble_g",
        label: "Fibra insoluble",
        unit: "g",
        hasCompliance: true,
      },
    ],
  },
  {
    id: "fats",
    label: "Grasas",
    emoji: "🧈",
    accentBg: "bg-yellow-50 dark:bg-yellow-900/20",
    nutrients: [
      {
        key: "fats_g",
        label: "Grasas totales",
        unit: "g",
        hasCompliance: true,
      },
      {
        key: "sfa_g",
        label: "Saturadas (AGS)",
        unit: "g",
        hasCompliance: true,
      },
      {
        key: "mufa_g",
        label: "Monoinsaturadas (MUFA)",
        unit: "g",
        hasCompliance: true,
      },
      {
        key: "pufa_g",
        label: "Poliinsaturadas (PUFA)",
        unit: "g",
        hasCompliance: true,
      },
      {
        key: "omega_3_epa_dha_mg",
        label: "Omega-3 EPA/DHA",
        unit: "mg",
        hasCompliance: true,
      },
      {
        key: "omega_3_ala_g",
        label: "Omega-3 ALA",
        unit: "g",
        hasCompliance: true,
      },
      {
        key: "omega_6_la_g",
        label: "Omega-6 LA",
        unit: "g",
        hasCompliance: true,
      },
      {
        key: "trans_fats_g",
        label: "Grasas trans",
        unit: "g",
        hasCompliance: false,
      },
      {
        key: "cholesterol_mg",
        label: "Colesterol",
        unit: "mg",
        hasCompliance: false,
      },
    ],
  },
  {
    id: "minerals",
    label: "Minerales",
    emoji: "💎",
    accentBg: "bg-pink-50 dark:bg-pink-900/20",
    nutrients: [
      { key: "calcium", label: "Calcio", unit: "mg", hasCompliance: true },
      { key: "iron", label: "Hierro", unit: "mg", hasCompliance: true },
      { key: "magnesium", label: "Magnesio", unit: "mg", hasCompliance: true },
      { key: "zinc", label: "Zinc", unit: "mg", hasCompliance: true },
      { key: "potassium", label: "Potasio", unit: "mg", hasCompliance: true },
      { key: "sodium", label: "Sodio", unit: "mg", hasCompliance: true },
    ],
  },
  {
    id: "vitamins",
    label: "Vitaminas",
    emoji: "✨",
    accentBg: "bg-cyan-50 dark:bg-cyan-900/20",
    nutrients: [
      {
        key: "vitamin_c",
        label: "Vitamina C",
        unit: "mg",
        hasCompliance: true,
      },
      {
        key: "vitamin_d",
        label: "Vitamina D",
        unit: "μg",
        hasCompliance: true,
      },
      {
        key: "vitamin_a",
        label: "Vitamina A",
        unit: "μg",
        hasCompliance: false,
      },
      {
        key: "vitamin_e",
        label: "Vitamina E",
        unit: "mg",
        hasCompliance: false,
      },
      {
        key: "vitamin_b1",
        label: "B1 (Tiamina)",
        unit: "mg",
        hasCompliance: true,
      },
      {
        key: "vitamin_b2",
        label: "B2 (Riboflavina)",
        unit: "mg",
        hasCompliance: true,
      },
      {
        key: "vitamin_b6",
        label: "Vitamina B6",
        unit: "mg",
        hasCompliance: true,
      },
      {
        key: "vitamin_b12",
        label: "Vitamina B12",
        unit: "μg",
        hasCompliance: true,
      },
      { key: "folate", label: "Folato", unit: "μg", hasCompliance: true },
      {
        key: "niacina",
        label: "Niacina (B3)",
        unit: "mg",
        hasCompliance: false,
      },
      { key: "selenium", label: "Selenio", unit: "μg", hasCompliance: false },
    ],
  },
  {
    id: "bioactives",
    label: "Bioactivos",
    emoji: "🌿",
    accentBg: "bg-emerald-50 dark:bg-emerald-900/20",
    nutrients: [
      {
        key: "beta_carotene_mcg",
        label: "β-Caroteno",
        unit: "μg",
        hasCompliance: false,
      },
      {
        key: "anthocyanidins_mg",
        label: "Antocianinas",
        unit: "mg",
        hasCompliance: false,
      },
      {
        key: "flavan3ols_mg",
        label: "Flavan-3-oles",
        unit: "mg",
        hasCompliance: false,
      },
      {
        key: "flavones_mg",
        label: "Flavonas",
        unit: "mg",
        hasCompliance: false,
      },
      {
        key: "flavonols_mg",
        label: "Flavonoles",
        unit: "mg",
        hasCompliance: false,
      },
      {
        key: "flavanones_mg",
        label: "Flavanonas",
        unit: "mg",
        hasCompliance: false,
      },
      {
        key: "isoflavones_mg",
        label: "Isoflavonas",
        unit: "mg",
        hasCompliance: false,
      },
      { key: "alcohol_g", label: "Alcohol", unit: "g", hasCompliance: false },
      {
        key: "caffeine_mg",
        label: "Cafeína",
        unit: "mg",
        hasCompliance: false,
      },
    ],
  },
  {
    id: "functional",
    label: "Especias",
    emoji: "🍃",
    accentBg: "bg-yellow-50 dark:bg-yellow-900/20",
    nutrients: [
      { key: "garlic_g", label: "Ajo", unit: "g", hasCompliance: false },
      { key: "ginger_g", label: "Jengibre", unit: "g", hasCompliance: false },
      { key: "onion_g", label: "Cebolla", unit: "g", hasCompliance: false },
      { key: "turmeric_g", label: "Cúrcuma", unit: "g", hasCompliance: false },
      { key: "pepper_g", label: "Pimienta", unit: "g", hasCompliance: false },
      { key: "thyme_g", label: "Tomillo", unit: "g", hasCompliance: false },
      { key: "oregano_g", label: "Orégano", unit: "g", hasCompliance: false },
      { key: "rosemary_g", label: "Romero", unit: "g", hasCompliance: false },
      { key: "tea_g", label: "Té", unit: "g", hasCompliance: false },
    ],
  },
];

// Color palette for meal badges
const MEAL_PALETTE = [
  "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
  "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300",
];

// Solid dot colors for meal legend
const MEAL_DOT_COLORS = [
  "#8b5cf6", // violet
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f97316", // orange
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f59e0b", // amber
  "#6366f1", // indigo
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(v: number | null | undefined): string {
  if (v == null) return "—";
  if (v === 0) return "0";
  if (Math.abs(v) >= 10000) return Math.round(v).toLocaleString("es");
  if (Math.abs(v) >= 1000) return Math.round(v).toLocaleString("es");
  if (Math.abs(v) >= 100) return Math.round(v).toString();
  if (Math.abs(v) >= 10) return v.toFixed(1);
  if (Math.abs(v) >= 1) return v.toFixed(2);
  return v.toFixed(3);
}

function complianceBarColor(c: number): string {
  if (c >= 90 && c <= 110) return "bg-green-500";
  if (c > 110) return "bg-orange-400";
  if (c >= 70) return "bg-yellow-400";
  return "bg-red-400";
}

function complianceBadge(c: number): string {
  if (c >= 90 && c <= 110)
    return "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/50";
  if (c > 110)
    return "text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/50";
  if (c >= 70)
    return "text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/50";
  return "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/50";
}

function complianceRingColor(c: number): string {
  if (c >= 90 && c <= 110) return "#22c55e";
  if (c > 110) return "#fb923c";
  if (c >= 70) return "#facc15";
  return "#f87171";
}

function diiChipStyle(dii: number | null | undefined): string {
  if (dii == null)
    return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";
  if (dii < -2.36)
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
  if (dii < 0.23)
    return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
  if (dii < 1.9)
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";
  if (dii < 4.0)
    return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300";
  return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
}

function diiLabel(
  dii: number | null | undefined,
  interpretation?: string | null,
): string {
  if (interpretation) {
    // Convertir snake_case del API a texto legible si es necesario
    return interpretation
      .replace(/_/g, " ")
      .replace(/^\w/, (c) => c.toUpperCase());
  }
  if (dii == null) return "Sin datos";
  if (dii < -2.36) return "Fuerte anti-inflamatorio"; // < p25
  if (dii < 0.23) return "Moderada anti-inflamatoria"; // p25 – mediana
  if (dii < 1.9) return "Neutro"; // mediana – p75
  if (dii < 4.0) return "Moderada pro-inflamatoria"; // p75 – p90
  return "Fuerte pro-inflamatorio"; // > p90
}

function getContributors(day: DayAnalysisResponse, key: string): Contributor[] {
  const list: Contributor[] = [];
  const meals = day.day.meals ?? [];

  for (const contribution of day.contributions.by_meal) {
    // Intentar encontrar el nombre real del plato en day.day.meals usando el slot_id (que viene en contribution.meal_name)
    const mealInfo = meals.find((m) => m.slot_id === contribution.meal_name);
    const displayName = mealInfo?.meal_name || contribution.meal_name;

    for (const ing of contribution.ingredients) {
      const val = (
        ing.nutritional_contribution as unknown as Record<string, unknown>
      )[key];
      const amount = typeof val === "number" && val > 0 ? val : 0;
      if (amount > 0) {
        list.push({
          mealName: displayName,
          foodName: ing.food_name,
          weightG: ing.weight_g,
          amount,
        });
      }
    }
  }
  return list.sort((a, b) => b.amount - a.amount);
}

// ─── SVG compliance ring ─────────────────────────────────────────────────────

function ComplianceRing({
  value,
  size = 72,
}: {
  value: number;
  size?: number;
}) {
  const strokeWidth = size <= 56 ? 5 : 6;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = Math.min(value / 100, 1);
  const dashOffset = circumference * (1 - filled);
  const color = complianceRingColor(value);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: "rotate(-90deg)" }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-gray-200 dark:text-gray-700"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}

// ─── Nutrient tile (overview list item) ─────────────────────────────────────

interface NutrientTileProps {
  nutrient: NutrientDef;
  compliance: number | undefined;
  consumed: number | undefined;
  required: number | undefined;
  onClick: () => void;
}

function NutrientTile({
  nutrient,
  compliance,
  consumed,
  required,
  onClick,
}: NutrientTileProps) {
  const hasConsumed = consumed != null && consumed > 0;
  const hasComp =
    compliance != null && required != null && (required as number) > 0;

  if (!hasConsumed && !hasComp) return null;

  const pct = hasComp ? Math.max(0, compliance as number) : null;
  const barW = pct != null ? `${Math.min(pct, 100)}%` : "0%";

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-4 py-3.5 border-b border-gray-100 dark:border-gray-800 last:border-0 active:bg-gray-50 dark:active:bg-gray-800/60 transition-colors flex items-center gap-3"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
            {nutrient.label}
          </span>
          {pct != null && (
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${complianceBadge(pct)}`}
            >
              {pct.toFixed(0)}%
            </span>
          )}
        </div>

        {hasComp ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${complianceBarColor(pct as number)}`}
                style={{ width: barW }}
              />
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums flex-shrink-0">
              {fmt(consumed)}/{fmt(required)}
              {nutrient.unit}
            </span>
          </div>
        ) : (
          <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
            {fmt(consumed)} {nutrient.unit}
          </span>
        )}
      </div>

      <svg
        className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0"
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
  );
}

// (ContributorRow logic is inlined inside DetailView)

// ─── NOVA mini-bar ───────────────────────────────────────────────────────────

function NovaBar({ day }: { day: DayAnalysisResponse }) {
  const nova = day.inflammatory_analysis?.nova_count;
  if (!nova) return null;

  const total = nova.nova_1 + nova.nova_2 + nova.nova_3 + nova.nova_4;
  if (total === 0) return null;

  const segments = [
    {
      label: "NOVA 1",
      count: nova.nova_1,
      color: "bg-green-400",
      text: "text-green-600 dark:text-green-400",
    },
    {
      label: "NOVA 2",
      count: nova.nova_2,
      color: "bg-yellow-400",
      text: "text-yellow-600 dark:text-yellow-400",
    },
    {
      label: "NOVA 3",
      count: nova.nova_3,
      color: "bg-orange-400",
      text: "text-orange-500 dark:text-orange-400",
    },
    {
      label: "NOVA 4",
      count: nova.nova_4,
      color: "bg-red-500",
      text: "text-red-600 dark:text-red-400",
    },
  ];

  return (
    <div className="mx-4 mb-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">
        Clasificación NOVA · {total} ingredientes
      </p>
      <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 mb-3">
        {segments.map(
          ({ label, count, color }) =>
            count > 0 && (
              <div
                key={label}
                className={`${color} rounded-sm`}
                style={{ width: `${(count / total) * 100}%` }}
              />
            ),
        )}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1">
        {segments.map(({ label, count, text }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`text-sm font-bold ${text}`}>{count}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Top-level quick stats ───────────────────────────────────────────────────

function QuickStats({ day }: { day: DayAnalysisResponse }) {
  const overall = day.compliance.overall;
  const dii =
    day.inflammatory_analysis?.inflamitis_score ??
    day.inflammatory_analysis?.day_dii;
  const interpretation =
    day.inflammatory_analysis?.inflamitis_interpretation ??
    day.inflammatory_analysis?.dii_interpretation;
  const totalMeals = day.day.meals?.length ?? 0;
  const totalIngredients = day.inflammatory_analysis?.total_ingredients ?? 0;

  const overallLabel =
    overall >= 90
      ? "Excelente"
      : overall >= 70
        ? "Bueno"
        : overall >= 50
          ? "Regular"
          : "Bajo";

  return (
    <div className="px-4 pt-4 pb-3 grid grid-cols-2 gap-3">
      {/* Compliance */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <ComplianceRing value={overall} size={58} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-xs font-extrabold tabular-nums"
              style={{ color: complianceRingColor(overall) }}
            >
              {overall.toFixed(0)}%
            </span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-400 dark:text-gray-500 leading-none mb-0.5">
            Cumplimiento
          </p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            {overallLabel}
          </p>
        </div>
      </div>

      {/* DII */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col justify-between">
        <p className="text-xs text-gray-400 dark:text-gray-500 leading-none mb-1">
          Índice DII
        </p>
        <p
          className={`text-2xl font-black tabular-nums leading-none ${diiChipStyle(dii).split(" ")[1] ?? "text-gray-900"}`}
        >
          {dii != null
            ? dii > 0
              ? `+${dii.toFixed(2)}`
              : dii.toFixed(2)
            : "—"}
        </p>
        <span
          className={`mt-1.5 self-start text-xs font-semibold px-2 py-0.5 rounded-full ${diiChipStyle(dii)}`}
        >
          {diiLabel(dii, interpretation)}
        </span>
      </div>

      {/* Meals */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Platos</p>
        <p className="text-2xl font-black text-gray-900 dark:text-white">
          {totalMeals}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          registrados
        </p>
      </div>

      {/* Ingredients */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
          Ingredientes
        </p>
        <p className="text-2xl font-black text-gray-900 dark:text-white">
          {totalIngredients}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          únicos
        </p>
      </div>
    </div>
  );
}

// ─── Detail view ─────────────────────────────────────────────────────────────

interface DetailViewProps {
  day: DayAnalysisResponse;
  nutrient: NutrientDef;
  compliance: number | undefined;
  consumed: number | undefined;
  required: number | undefined;
  mealColorMap: Map<string, string>;
  mealDotMap: Map<string, string>;
}

function DetailView({
  day,
  nutrient,
  compliance,
  consumed,
  required,
  mealColorMap,
  mealDotMap,
}: DetailViewProps) {
  const contributors = useMemo(
    () => getContributors(day, nutrient.key),
    [day, nutrient.key],
  );

  const contributorTotal = useMemo(
    () => contributors.reduce((s, c) => s + c.amount, 0),
    [contributors],
  );

  // Grouped totals by meal, sorted descending
  const mealTotals = useMemo(() => {
    const map = new Map<string, number>();
    contributors.forEach((c) =>
      map.set(c.mealName, (map.get(c.mealName) ?? 0) + c.amount),
    );
    return Array.from(map.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [contributors]);

  const hasComp =
    compliance != null && required != null && (required as number) > 0;
  const pct = hasComp ? Math.max(0, compliance as number) : null;

  return (
    <div className="pb-8">
      {/* ── Summary card ─────────────────────────────────────── */}
      <div className="mx-4 mt-4 mb-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Main metrics */}
        <div className="p-4 flex items-center gap-4">
          {pct != null && (
            <div className="relative flex-shrink-0">
              <ComplianceRing value={pct} size={76} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="text-sm font-black tabular-nums"
                  style={{ color: complianceRingColor(pct) }}
                >
                  {pct.toFixed(0)}%
                </span>
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1.5 mb-0.5">
              <span className="text-3xl font-black text-gray-900 dark:text-white tabular-nums">
                {fmt(consumed ?? contributorTotal)}
              </span>
              <span className="text-sm font-medium text-gray-400">
                {nutrient.unit}
              </span>
            </div>

            {hasComp ? (
              <>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Meta: {fmt(required)} {nutrient.unit}
                </p>
                {pct != null && pct < 90 && (
                  <p className="text-xs font-semibold text-red-500 dark:text-red-400 mt-1">
                    ↓ Faltan {fmt((required as number) - (consumed ?? 0))}{" "}
                    {nutrient.unit} para la meta
                  </p>
                )}
                {pct != null && pct > 110 && (
                  <p className="text-xs font-semibold text-orange-500 dark:text-orange-400 mt-1">
                    ↑ Exceso de {fmt((consumed ?? 0) - (required as number))}{" "}
                    {nutrient.unit} sobre la meta
                  </p>
                )}
                {pct != null && pct >= 90 && pct <= 110 && (
                  <p className="text-xs font-semibold text-green-600 dark:text-green-400 mt-1">
                    ✓ Objetivo alcanzado
                  </p>
                )}
              </>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Solo consumo · sin meta configurada
              </p>
            )}
          </div>
        </div>

        {/* Meal distribution */}
        {mealTotals.length > 0 && (
          <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">
              Por plato
            </p>

            {/* Stacked bar */}
            <div className="flex h-2 rounded-full overflow-hidden gap-px mb-3">
              {mealTotals.map(({ name, total: mt }) => {
                const dotColor = mealDotMap.get(name) ?? MEAL_DOT_COLORS[0];
                const w =
                  contributorTotal > 0 ? (mt / contributorTotal) * 100 : 0;
                return (
                  <div
                    key={name}
                    style={{
                      width: `${w}%`,
                      backgroundColor: dotColor,
                    }}
                    className="rounded-sm"
                  />
                );
              })}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {mealTotals.map(({ name, total: mt }) => {
                // El nombre ya viene mapeado desde getContributors -> mealTotals
                const badgeClass = mealColorMap.get(name) ?? MEAL_PALETTE[0];
                const pctMeal =
                  contributorTotal > 0 ? (mt / contributorTotal) * 100 : 0;
                return (
                  <div key={name} className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeClass}`}
                    >
                      {name}
                    </span>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 tabular-nums">
                      {fmt(mt)}
                      {nutrient.unit}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({pctMeal.toFixed(0)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Ingredient breakdown ──────────────────────────────── */}
      <div className="mx-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Ingredientes que aportaron · ordenados de mayor a menor
          </p>
        </div>

        {contributors.length > 0 ? (
          contributors.map((c, i) => {
            const badgeClass = mealColorMap.get(c.mealName) ?? MEAL_PALETTE[0];
            const dotColor = mealDotMap.get(c.mealName) ?? MEAL_DOT_COLORS[0];
            // Build a dynamic bar color matching meal dot
            const barStyle = { backgroundColor: dotColor, opacity: 0.75 };

            return (
              <div
                key={`${c.mealName}-${c.foodName}-${i}`}
                className="px-4 py-3.5 border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <div className="flex items-start gap-3">
                  {/* Rank */}
                  <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                      {i + 1}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Food + amount */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug flex-1 min-w-0">
                        {c.foodName}
                      </p>
                      <span className="text-sm font-black text-gray-900 dark:text-white flex-shrink-0 tabular-nums">
                        {fmt(c.amount)}
                        <span className="text-xs font-normal text-gray-400 ml-0.5">
                          {nutrient.unit}
                        </span>
                      </span>
                    </div>

                    {/* Meal badge + grams */}
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeClass}`}
                      >
                        {c.mealName}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {fmt(c.weightG)} g
                      </span>
                    </div>

                    {/* Proportion bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            ...barStyle,
                            width: `${Math.min(
                              contributorTotal > 0
                                ? (c.amount / contributorTotal) * 100
                                : 0,
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-400 dark:text-gray-500 tabular-nums w-10 text-right flex-shrink-0">
                        {contributorTotal > 0
                          ? ((c.amount / contributorTotal) * 100).toFixed(1)
                          : "0.0"}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-4 py-10 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              No hay ingredientes registrados con aporte de este nutriente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

const NutriAnalysisPage: React.FC<NutriAnalysisPageProps> = ({
  day,
  date,
  patientName,
  isOpen,
  onClose,
}) => {
  const [activeCategoryId, setActiveCategoryId] = useState<string>("proteins");
  const [selectedNutrient, setSelectedNutrient] = useState<NutrientDef | null>(
    null,
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setSelectedNutrient(null);
      setActiveCategoryId("proteins");
      scrollRef.current?.scrollTo({ top: 0 });
    }
  }, [isOpen]);

  // Scroll content to top when switching views
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedNutrient, activeCategoryId]);

  const compliance = useMemo(
    () => (day.compliance?.total ?? {}) as unknown as Record<string, number>,
    [day],
  );
  const contributions = useMemo(
    () => (day.contributions?.total ?? {}) as unknown as Record<string, number>,
    [day],
  );
  const requirements = useMemo(
    () => (day.requirements?.total ?? {}) as unknown as Record<string, number>,
    [day],
  );

  const activeCategory =
    CATEGORIES.find((c) => c.id === activeCategoryId) ?? CATEGORIES[0];

  // Build stable meal colour maps
  const { mealColorMap, mealDotMap } = useMemo(() => {
    const colorMap = new Map<string, string>();
    const dotMap = new Map<string, string>();
    const mealsInfo = day.day.meals ?? [];

    day.contributions.by_meal.forEach((m, i) => {
      // Intentar encontrar el nombre real usando el slot_id (que viene en m.meal_name)
      const mealInfo = mealsInfo.find((mi) => mi.slot_id === m.meal_name);
      const displayName = mealInfo?.meal_name || m.meal_name;

      colorMap.set(displayName, MEAL_PALETTE[i % MEAL_PALETTE.length]);
      dotMap.set(displayName, MEAL_DOT_COLORS[i % MEAL_DOT_COLORS.length]);
    });
    return { mealColorMap: colorMap, mealDotMap: dotMap };
  }, [day]);

  // Handle hardware/browser back gesture on overlay
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedNutrient) setSelectedNutrient(null);
        else onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, selectedNutrient, onClose]);

  if (!isOpen) return null;

  return (
    <ModalPortal isOpen={isOpen}>
      <div
        className="fixed inset-0 z-50 flex flex-col bg-gray-50 dark:bg-gray-950"
        role="dialog"
        aria-modal="true"
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 px-3 py-3">
            <button
              type="button"
              onClick={
                selectedNutrient ? () => setSelectedNutrient(null) : onClose
              }
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors flex-shrink-0"
              aria-label={selectedNutrient ? "Volver" : "Cerrar"}
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
              {selectedNutrient ? (
                <>
                  <p className="text-base font-bold text-gray-900 dark:text-white truncate">
                    {selectedNutrient.label}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Desglose por ingrediente
                  </p>
                </>
              ) : (
                <>
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    Análisis Nutricional
                  </p>
                  {(patientName || date) && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {[patientName, date].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Close always visible */}
            {selectedNutrient && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
                aria-label="Cerrar"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ── Scrollable content ──────────────────────────────────── */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overscroll-contain"
        >
          {selectedNutrient ? (
            /* ── Detail view ─────────────────────────────────────── */
            <DetailView
              day={day}
              nutrient={selectedNutrient}
              compliance={compliance[selectedNutrient.key]}
              consumed={contributions[selectedNutrient.key]}
              required={requirements[selectedNutrient.key]}
              mealColorMap={mealColorMap}
              mealDotMap={mealDotMap}
            />
          ) : (
            /* ── Overview ───────────────────────────────────────── */
            <>
              {/* Quick stats */}
              <QuickStats day={day} />

              {/* NOVA bar */}
              <NovaBar day={day} />

              {/* Hint */}
              <div className="px-4 mb-2">
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                  Selecciona un nutriente para ver qué lo aportó
                </p>
              </div>

              {/* Category tabs */}
              <div
                ref={tabsRef}
                className="flex gap-2 overflow-x-auto px-4 pb-2 mb-1 scrollbar-none"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-sm font-semibold transition-all duration-150 ${
                      activeCategoryId === cat.id
                        ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm"
                        : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Nutrient list */}
              <div className="mx-4 mb-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
                {/* Category header */}
                <div
                  className={`px-4 py-3 border-b border-gray-100 dark:border-gray-800 ${activeCategory.accentBg}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{activeCategory.emoji}</span>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {activeCategory.label}
                    </p>
                  </div>
                </div>

                {/* Nutrient rows */}
                {(() => {
                  const visibleNutrients = activeCategory.nutrients.filter(
                    (n) => {
                      const consumed = contributions[n.key];
                      const req = requirements[n.key];
                      const comp = compliance[n.key];
                      return (
                        (consumed != null && consumed > 0) ||
                        (comp != null && req != null && (req as number) > 0)
                      );
                    },
                  );

                  if (visibleNutrients.length === 0) {
                    return (
                      <div className="px-4 py-10 text-center">
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                          Sin datos para esta categoría en este día.
                        </p>
                      </div>
                    );
                  }

                  return activeCategory.nutrients.map((n) => (
                    <NutrientTile
                      key={n.key}
                      nutrient={n}
                      compliance={compliance[n.key]}
                      consumed={contributions[n.key]}
                      required={requirements[n.key]}
                      onClick={() => setSelectedNutrient(n)}
                    />
                  ));
                })()}
              </div>
            </>
          )}
        </div>
      </div>
    </ModalPortal>
  );
};

export default NutriAnalysisPage;
