import React from "react";

interface MacroTarget {
  proteins_g: number;
  carbs_g: number;
  fats_g: number;
  fiber_g: number;
  sugars_g: number;
}

interface MacroCurrent {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugars: number;
}

interface MacroRingsHeaderProps {
  pendingNutrition: MacroCurrent;
  dayBase: MacroCurrent;
  dayTargets: MacroTarget | null;
}

interface RingProps {
  value: number;
  max: number;
  color: string;
  label: string;
  unit?: string;
  size?: number;
  strokeWidth?: number;
}

const Ring: React.FC<RingProps> = ({
  value,
  max,
  color,
  label,
  unit = "g",
  size = 52,
  strokeWidth = 5,
}) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const dash = (pct / 100) * circ;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg]"
      >
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      {/* Text overlay */}
      <div
        className="absolute flex flex-col items-center pointer-events-none"
        style={{ width: size, marginTop: -(size + 2) }}
      >
        <span
          className="text-[10px] font-semibold text-gray-800 dark:text-gray-200 leading-none mt-3"
          style={{ fontSize: size < 50 ? 9 : 11 }}
        >
          {Math.round(value)}
          {unit}
        </span>
      </div>
      <span className="text-[9px] text-gray-500 dark:text-gray-400 leading-none">
        {label}
      </span>
    </div>
  );
};

export const MacroRingsHeader: React.FC<MacroRingsHeaderProps> = ({
  pendingNutrition,
  dayBase,
  dayTargets,
}) => {
  const total = {
    protein: dayBase.protein + pendingNutrition.protein,
    carbs: dayBase.carbs + pendingNutrition.carbs,
    fat: dayBase.fat + pendingNutrition.fat,
    fiber: dayBase.fiber + pendingNutrition.fiber,
    sugars: dayBase.sugars + pendingNutrition.sugars,
  };

  const rings = [
    {
      label: "Prot",
      value: total.protein,
      max: dayTargets?.proteins_g ?? 0,
      color: "#3b82f6",
    },
    {
      label: "Carbs",
      value: total.carbs,
      max: dayTargets?.carbs_g ?? 0,
      color: "#f59e0b",
    },
    {
      label: "Grasa",
      value: total.fat,
      max: dayTargets?.fats_g ?? 0,
      color: "#ef4444",
    },
    {
      label: "Fibra",
      value: total.fiber,
      max: dayTargets?.fiber_g ?? 0,
      color: "#10b981",
    },
    {
      label: "Azúcar",
      value: total.sugars,
      max: dayTargets?.sugars_g ?? 0,
      color: "#8b5cf6",
    },
  ];

  return (
    <div className="flex items-center justify-around py-3 px-2 border-b border-gray-100 dark:border-gray-800">
      {rings.map((ring) => (
        <div key={ring.label} className="relative flex flex-col items-center">
          <Ring
            value={ring.value}
            max={ring.max}
            color={ring.color}
            label={ring.label}
          />
        </div>
      ))}
    </div>
  );
};
