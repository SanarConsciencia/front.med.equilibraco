import React, { useState } from "react";
import type { DayAnalysisResponse } from "../../types/medicalApiTypes";

interface DayOverviewProps {
  day: DayAnalysisResponse;
}

// ─── helpers ────────────────────────────────────────────────

function fmtVal(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  if (v === 0) return "0";
  if (Math.abs(v) >= 1000) return Math.round(v).toLocaleString();
  if (Math.abs(v) >= 100) return Math.round(v).toString();
  if (Math.abs(v) >= 10) return v.toFixed(1);
  if (Math.abs(v) >= 1) return v.toFixed(2);
  return v.toFixed(3);
}

function barColor(compliance: number): string {
  if (compliance >= 90 && compliance <= 110) return "bg-green-500";
  if (compliance >= 110) return "bg-orange-400";
  if (compliance >= 70) return "bg-yellow-400";
  return "bg-red-500";
}

function badgeClasses(compliance: number): string {
  if (compliance >= 90 && compliance <= 110)
    return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
  if (compliance >= 110)
    return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300";
  if (compliance >= 70)
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";
  return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
}

const diiTextColor = (dii: number | null | undefined): string => {
  if (dii == null) return "text-gray-500 dark:text-gray-400";
  if (dii <= -1) return "text-green-600 dark:text-green-400";
  if (dii >= 1) return "text-red-600 dark:text-red-400";
  return "text-yellow-600 dark:text-yellow-400";
};

// ─── nutrient row ────────────────────────────────────────────

interface NutrientRowProps {
  label: string;
  consumed: number | null | undefined;
  required: number | null | undefined;
  compliance: number | null | undefined;
  unit: string;
}

const NutrientRow: React.FC<NutrientRowProps> = ({
  label,
  consumed,
  required,
  compliance,
  unit,
}) => {
  const hasReq =
    required !== null && required !== undefined && (required as number) > 0;
  const hasComp = compliance !== null && compliance !== undefined;
  const hasCompliance = hasComp && hasReq;
  const hasConsumed =
    consumed !== null && consumed !== undefined && (consumed as number) > 0;

  if (!hasCompliance && !hasConsumed) return null;

  const pct = hasCompliance ? Math.max(0, compliance as number) : null;
  // Bar fills proportionally up to 100 % (values over 100% are shown in badge only)
  const barW = pct !== null ? `${Math.min(pct, 100)}%` : "0%";

  // Explicit "falta" / "exceso" label
  const statusLabel = (() => {
    if (pct === null || !hasCompliance) return null;
    const req = required as number;
    const cons = consumed as number ?? 0;
    
    if (pct < 90) {
      const missing = req - cons;
      return {
        text: `↓ falta ${fmtVal(missing)}${unit}`,
        cls: "text-red-500 dark:text-red-400",
      };
    }
    if (pct > 110) {
      const excess = cons - req;
      return {
        text: `↑ exceso ${fmtVal(excess)}${unit}`,
        cls: "text-orange-500 dark:text-orange-400",
      };
    }
    return {
      text: "✓ balanceado",
      cls: "text-green-600 dark:text-green-400"
    };
  })();

  return (
    <div className="py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-0 truncate">
          {label}
        </span>
        {pct !== null && (
          <span
            className={`text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${badgeClasses(pct)}`}
          >
            {pct.toFixed(0)}%
          </span>
        )}
      </div>
      {hasCompliance ? (
        <>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${barColor(pct as number)}`}
                style={{ width: barW }}
              />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 tabular-nums">
              {fmtVal(consumed)}/{fmtVal(required)}
              {unit}
            </span>
          </div>
          {statusLabel && (
            <p className={`text-xs font-medium mt-0.5 ${statusLabel.cls}`}>
              {statusLabel.text}
            </p>
          )}
        </>
      ) : (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {fmtVal(consumed)} {unit}
        </div>
      )}
    </div>
  );
};

// ─── accordion ───────────────────────────────────────────────

interface NutrientItem {
  key: string;
  label: string;
  unit: string;
}

interface CategorySection {
  id: string;
  label: string;
  emoji: string;
  headerColor: string;
  hasCompliance: boolean;
  nutrients: NutrientItem[];
}

const CATEGORIES: CategorySection[] = [
  {
    id: "macros",
    label: "Macronutrientes",
    emoji: "🥩",
    headerColor:
      "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800",
    hasCompliance: true,
    nutrients: [
      { key: "proteins_g", label: "Proteínas", unit: "g" },
      { key: "carbs_g", label: "Carbohidratos", unit: "g" },
      { key: "sugars_g", label: "Azúcares", unit: "g" },
      { key: "starches_g", label: "Almidón", unit: "g" },
      { key: "fats_g", label: "Grasas totales", unit: "g" },
      { key: "fiber_g", label: "Fibra total", unit: "g" },
    ],
  },
  {
    id: "fats_detail",
    label: "Detalle de Grasas",
    emoji: "🧈",
    headerColor:
      "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
    hasCompliance: true,
    nutrients: [
      { key: "sfa_g", label: "Saturadas", unit: "g" },
      { key: "mufa_g", label: "MUFA", unit: "g" },
      { key: "pufa_g", label: "PUFA", unit: "g" },
      { key: "omega_3_epa_dha_mg", label: "Omega-3 EPA/DHA", unit: "mg" },
      { key: "omega_3_ala_g", label: "Omega-3 ALA", unit: "g" },
      { key: "omega_6_la_g", label: "Omega-6 LA", unit: "g" },
      {
        key: "trans_fats_g",
        label: "Grasas trans",
        unit: "g"
      },
      {
        key: "cholesterol_mg",
        label: "Colesterol",
        unit: "mg"
      },
    ],
  },
  {
    id: "fiber_detail",
    label: "Detalle de Fibra",
    emoji: "🌾",
    headerColor:
      "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    hasCompliance: true,
    nutrients: [
      { key: "fiber_soluble_g", label: "Fibra soluble", unit: "g" },
      { key: "fiber_insoluble_g", label: "Fibra insoluble", unit: "g" },
    ],
  },
  {
    id: "minerals",
    label: "Minerales",
    emoji: "💎",
    headerColor:
      "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800",
    hasCompliance: true,
    nutrients: [
      { key: "calcium", label: "Calcio", unit: "mg" },
      { key: "iron", label: "Hierro", unit: "mg" },
      { key: "magnesium", label: "Magnesio", unit: "mg" },
      { key: "zinc", label: "Zinc", unit: "mg" },
      { key: "potassium", label: "Potasio", unit: "mg" },
      { key: "sodium", label: "Sodio", unit: "mg" },
    ],
  },
  {
    id: "vitamins",
    label: "Vitaminas",
    emoji: "✨",
    headerColor:
      "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800",
    hasCompliance: true,
    nutrients: [
      { key: "vitamin_c", label: "Vitamina C", unit: "mg" },
      { key: "vitamin_d", label: "Vitamina D", unit: "μg" },
      { key: "vitamin_b1", label: "B1 (Tiamina)", unit: "mg" },
      { key: "vitamin_b2", label: "B2 (Riboflavina)", unit: "mg" },
      { key: "vitamin_b6", label: "Vitamina B6", unit: "mg" },
      { key: "vitamin_b12", label: "B12", unit: "μg" },
      { key: "folate", label: "Folato", unit: "μg" },
      { key: "vitamin_a", label: "Vitamina A", unit: "μg" },
      { key: "vitamin_e", label: "Vitamina E", unit: "mg" },
      { key: "niacina", label: "Niacina (B3)", unit: "mg" },
      { key: "selenium", label: "Selenio", unit: "μg" },
    ],
  },
  {
    id: "bioactives",
    label: "Bioactivos",
    emoji: "🌿",
    headerColor:
      "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
    hasCompliance: false,
    nutrients: [
      { key: "beta_carotene_mcg", label: "β-Caroteno", unit: "μg" },
      { key: "anthocyanidins_mg", label: "Antocianinas", unit: "mg" },
      { key: "flavan3ols_mg", label: "Flavan-3-oles", unit: "mg" },
      { key: "flavones_mg", label: "Flavonas", unit: "mg" },
      { key: "flavonols_mg", label: "Flavonoles", unit: "mg" },
      { key: "flavanones_mg", label: "Flavanonas", unit: "mg" },
      { key: "isoflavones_mg", label: "Isoflavonas", unit: "mg" },
      { key: "alcohol_g", label: "Alcohol", unit: "g" },
      { key: "caffeine_mg", label: "Cafeína", unit: "mg" },
    ],
  },
  {
    id: "functional",
    label: "Especias y Funcionales",
    emoji: "🍃",
    headerColor:
      "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    hasCompliance: false,
    nutrients: [
      { key: "garlic_g", label: "Ajo", unit: "g" },
      { key: "ginger_g", label: "Jengibre", unit: "g" },
      { key: "onion_g", label: "Cebolla", unit: "g" },
      { key: "turmeric_g", label: "Cúrcuma", unit: "g" },
      { key: "pepper_g", label: "Pimienta", unit: "g" },
      { key: "thyme_g", label: "Tomillo", unit: "g" },
      { key: "oregano_g", label: "Orégano", unit: "g" },
      { key: "rosemary_g", label: "Romero", unit: "g" },
      { key: "tea_g", label: "Té", unit: "g" },
    ],
  },
];

interface AccordionProps {
  category: CategorySection;
  compliance: Record<string, number>;
  contributions: Record<string, number>;
  requirements: Record<string, number>;
  isOpen: boolean;
  onToggle: () => void;
}

const CategoryAccordion: React.FC<AccordionProps> = ({
  category,
  compliance,
  contributions,
  requirements,
  isOpen,
  onToggle,
}) => {
  const filledNutrients = category.nutrients.filter((n) => {
    const consumed = contributions[n.key];
    const req = requirements[n.key];
    const comp = compliance[n.key];
    return (
      (consumed !== null && consumed !== undefined && consumed > 0) ||
      (comp !== null &&
        comp !== undefined &&
        req !== null &&
        req !== undefined &&
        req > 0)
    );
  });

  const deficitCount = category.hasCompliance
    ? filledNutrients.filter((n) => {
        const comp = compliance[n.key];
        const req = requirements[n.key];
        if (!comp || !req || req <= 0) return false;
        return comp < 90;
      }).length
    : 0;

  const excessCount = category.hasCompliance
    ? filledNutrients.filter((n) => {
        const comp = compliance[n.key];
        const req = requirements[n.key];
        if (!comp || !req || req <= 0) return false;
        return comp > 110;
      }).length
    : 0;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        type="button"
        className={`w-full px-4 py-2.5 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 transition-colors ${category.headerColor} ${isOpen ? "" : "border-b-0"}`}
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-base flex-shrink-0">{category.emoji}</span>
          <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
            {category.label}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
            {filledNutrients.length}
          </span>
          {deficitCount > 0 && (
            <span className="flex-shrink-0 bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300 text-xs px-1.5 py-0.5 rounded-full font-medium">
              {deficitCount} bajo
            </span>
          )}
          {excessCount > 0 && (
            <span className="flex-shrink-0 bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300 text-xs px-1.5 py-0.5 rounded-full font-medium">
              {excessCount} exceso
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 flex-shrink-0 ml-2 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="bg-white dark:bg-gray-900 px-4">
          {category.hasCompliance ? (
            <>
              {category.nutrients.map((n) => (
                <NutrientRow
                  key={n.key}
                  label={n.label}
                  consumed={contributions[n.key]}
                  required={requirements[n.key]}
                  compliance={compliance[n.key]}
                  unit={n.unit}
                />
              ))}
              {filledNutrients.length === 0 && (
                <p className="py-4 text-sm text-gray-400 dark:text-gray-500 text-center">
                  Sin datos para este grupo
                </p>
              )}
            </>
          ) : (
            <div className="py-3 grid grid-cols-2 gap-2">
              {category.nutrients.map((n) => {
                const val = contributions[n.key];
                if (!val || val <= 0) return null;
                return (
                  <div
                    key={n.key}
                    className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 truncate">
                      {n.label}
                    </div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {fmtVal(val)}{" "}
                      <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                        {n.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
              {filledNutrients.length === 0 && (
                <p className="col-span-full py-3 text-sm text-gray-400 dark:text-gray-500 text-center">
                  No se registraron estos nutrientes hoy
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── main ────────────────────────────────────────────────────

const MACRO_QUICK = [
  { key: "proteins_g", label: "Proteínas", unit: "g" },
  { key: "carbs_g", label: "Carbos", unit: "g" },
  { key: "fats_g", label: "Grasas", unit: "g" },
  { key: "fiber_g", label: "Fibra", unit: "g" },
] as const;

const DayOverview: React.FC<DayOverviewProps> = ({ day }) => {
  const overall = day.compliance.overall;
  const dii = day.inflammatory_analysis?.day_dii;
  const diiText = day.inflammatory_analysis?.dii_interpretation;
  const meals = day.day.meals ?? [];

  const compliance = (day.compliance?.total ?? {}) as unknown as Record<
    string,
    number
  >;
  const contributions = (day.contributions?.total ?? {}) as unknown as Record<
    string,
    number
  >;
  const requirements = (day.requirements?.total ?? {}) as unknown as Record<
    string,
    number
  >;

  // Controlled open state per section (all collapsed by default)
  const [openSections, setOpenSections] = useState<Set<string>>(
    () => new Set<string>(),
  );

  const expandAll = () => setOpenSections(new Set(CATEGORIES.map((c) => c.id)));
  const collapseAll = () => setOpenSections(new Set());
  const toggleSection = (id: string) =>
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const overallColor =
    overall >= 80
      ? "bg-green-500"
      : overall >= 50
        ? "bg-yellow-400"
        : "bg-red-500";

  return (
    <div className="space-y-3">
      {/* ── Score header ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Cumplimiento nutricional
          </span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {meals.length} plato{meals.length !== 1 ? "s" : ""}
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {Math.round(overall)}%
            </span>
          </div>
        </div>
        <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${overallColor}`}
            style={{ width: `${Math.min(100, overall)}%` }}
          />
        </div>

        {/* DII row */}
        {dii != null && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              DII:
            </span>
            <span className={`text-sm font-bold ${diiTextColor(dii)}`}>
              {dii.toFixed(2)}
            </span>
            {diiText && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                — {diiText}
              </span>
            )}
          </div>
        )}

        {/* Macro quick cards */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          {MACRO_QUICK.map(({ key, label, unit }) => {
            const pct = compliance[key] ?? 0;
            const consumed = contributions[key];
            const required = requirements[key];
            const color =
              pct >= 90 && pct <= 110
                ? "text-green-600 dark:text-green-400"
                : pct > 110
                  ? "text-orange-500 dark:text-orange-400"
                  : pct >= 70
                    ? "text-yellow-500 dark:text-yellow-400"
                    : "text-red-500 dark:text-red-400";

            const diff = (consumed ?? 0) - (required ?? 0);
            const statusLabel =
              required && required > 0
                ? pct < 90
                  ? { text: `↓ falta ${fmtVal(Math.abs(diff))}`, cls: "text-red-500 dark:text-red-400" }
                  : pct > 110
                    ? { text: `↑ exceso ${fmtVal(diff)}`, cls: "text-orange-500 dark:text-orange-400" }
                    : { text: "✓ balan.", cls: "text-green-600 dark:text-green-400 text-[8px]" }
                : null;

            return (
              <div key={key} className="text-center">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 truncate">
                  {label}
                </p>
                <p className={`text-base font-bold ${color} leading-none`}>
                  {Math.round(pct)}%
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-600 tabular-nums">
                  {fmtVal(consumed)}/{fmtVal(required)}
                  {unit}
                </p>
                {statusLabel && (
                  <p className={`text-[9px] font-bold mt-0.5 ${statusLabel.cls} leading-none whitespace-nowrap`}>
                    {statusLabel.text}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Expand/collapse all ── */}
      <div className="flex items-center justify-end gap-2 px-1">
        <button
          type="button"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          onClick={expandAll}
        >
          Expandir todo
        </button>
        <span className="text-gray-300 dark:text-gray-600">·</span>
        <button
          type="button"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          onClick={collapseAll}
        >
          Colapsar todo
        </button>
      </div>

      {/* ── Category accordions ── */}
      <div className="space-y-2">
        {CATEGORIES.map((cat) => (
          <CategoryAccordion
            key={cat.id}
            category={cat}
            compliance={compliance}
            contributions={contributions}
            requirements={requirements}
            isOpen={openSections.has(cat.id)}
            onToggle={() => toggleSection(cat.id)}
          />
        ))}
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 px-1 pb-1">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" />
          90–110% (Balanceado)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-400" />
          &gt;110% (Exceso)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />
          &lt;90% (Falta)
        </span>
      </div>
    </div>
  );
};

export default DayOverview;
