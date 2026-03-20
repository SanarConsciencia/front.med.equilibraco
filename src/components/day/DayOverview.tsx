import React from "react";
import type { DayAnalysisResponse } from "../../types/medicalApiTypes";

interface DayOverviewProps {
  day: DayAnalysisResponse;
}

const pct = (val: number) => `${Math.round(val)}%`;

const diiColor = (dii: number | null | undefined): string => {
  if (dii == null) return "text-gray-500 dark:text-gray-400";
  if (dii <= -1) return "text-green-600 dark:text-green-400";
  if (dii >= 1) return "text-red-600 dark:text-red-400";
  return "text-yellow-600 dark:text-yellow-400";
};

const complianceColor = (val: number): string => {
  if (val >= 80) return "bg-green-500";
  if (val >= 50) return "bg-yellow-500";
  return "bg-red-500";
};

const DayOverview: React.FC<DayOverviewProps> = ({ day }) => {
  const overall = day.compliance.overall;
  const dii = day.inflammatory_analysis.day_dii;
  const diiText = day.inflammatory_analysis.dii_interpretation;
  const hydration = day.tracking.total_hydration_ml;
  const steps = day.tracking.total_steps;
  const meals = day.day.meals ?? [];
  const macros = day.compliance.total;

  return (
    <div className="space-y-3">
      {/* Compliance bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Cumplimiento nutricional
          </span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {pct(overall)}
          </span>
        </div>
        <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${complianceColor(overall)}`}
            style={{ width: `${Math.min(100, overall)}%` }}
          />
        </div>

        {/* Macros row */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          {[
            { label: "Prot.", val: macros.proteins_g },
            { label: "Carbs", val: macros.carbs_g },
            { label: "Grasas", val: macros.fats_g },
            { label: "Fibra", val: macros.fiber_g },
          ].map(({ label, val }) => (
            <div key={label} className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {label}
              </p>
              <p
                className={`text-sm font-bold ${
                  val >= 80
                    ? "text-green-600 dark:text-green-400"
                    : val >= 50
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-red-600 dark:text-red-400"
                }`}
              >
                {pct(val)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {/* DII */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">DII</p>
          <p className={`text-xl font-bold ${diiColor(dii)}`}>
            {dii != null ? dii.toFixed(1) : "—"}
          </p>
          {diiText && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
              {diiText}
            </p>
          )}
        </div>

        {/* Hydration */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Hidrat.
          </p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {hydration >= 1000
              ? `${(hydration / 1000).toFixed(1)}L`
              : `${hydration}ml`}
          </p>
        </div>

        {/* Meals / Steps */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {steps > 0 ? "Pasos" : "Platos"}
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {steps > 0 ? steps.toLocaleString() : meals.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DayOverview;
