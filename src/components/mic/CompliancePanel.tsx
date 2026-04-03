import { useState, useEffect } from "react";
import type { DaySnapshot } from "../../types/micTypes";
import { getCustomerSnapshots } from "../../services/micService";

type NutrientGroup = "Scores" | "Macros" | "Minerales" | "Vitaminas";

interface NutrientMeta {
  key: keyof DaySnapshot;
  label: string;
  group: NutrientGroup;
  isPct: boolean;
}

const NUTRIENT_LIST: NutrientMeta[] = [
  { key: "overall_score", label: "Kiwímetro", group: "Scores", isPct: false },
  { key: "inflamitis_score", label: "E-DII", group: "Scores", isPct: false },
  { key: "day_dii", label: "DII clásico", group: "Scores", isPct: false },
  { key: "proteins_pct", label: "Proteínas", group: "Macros", isPct: true },
  { key: "carbs_pct", label: "Carbohidratos", group: "Macros", isPct: true },
  { key: "starches_pct", label: "Almidones", group: "Macros", isPct: true },
  { key: "sugars_pct", label: "Azúcares", group: "Macros", isPct: true },
  { key: "fats_pct", label: "Grasas", group: "Macros", isPct: true },
  {
    key: "saturated_fats_pct",
    label: "Saturadas",
    group: "Macros",
    isPct: true,
  },
  {
    key: "monounsaturated_fats_pct",
    label: "Monoinsat.",
    group: "Macros",
    isPct: true,
  },
  {
    key: "polyunsaturated_fats_pct",
    label: "Poliinsat.",
    group: "Macros",
    isPct: true,
  },
  { key: "fiber_pct", label: "Fibra", group: "Macros", isPct: true },
  { key: "calcium_pct", label: "Calcio", group: "Minerales", isPct: true },
  { key: "iron_pct", label: "Hierro", group: "Minerales", isPct: true },
  { key: "magnesium_pct", label: "Magnesio", group: "Minerales", isPct: true },
  { key: "zinc_pct", label: "Zinc", group: "Minerales", isPct: true },
  { key: "potassium_pct", label: "Potasio", group: "Minerales", isPct: true },
  { key: "vitamin_c_pct", label: "Vit. C", group: "Vitaminas", isPct: true },
  { key: "vitamin_d_pct", label: "Vit. D", group: "Vitaminas", isPct: true },
  { key: "vitamin_a_pct", label: "Vit. A", group: "Vitaminas", isPct: true },
  { key: "vitamin_e_pct", label: "Vit. E", group: "Vitaminas", isPct: true },
  {
    key: "vitamin_b12_pct",
    label: "Vit. B12",
    group: "Vitaminas",
    isPct: true,
  },
  { key: "vitamin_b6_pct", label: "Vit. B6", group: "Vitaminas", isPct: true },
  { key: "folate_pct", label: "Folato", group: "Vitaminas", isPct: true },
  { key: "thiamine_pct", label: "Tiamina", group: "Vitaminas", isPct: true },
  {
    key: "riboflavin_pct",
    label: "Riboflavina",
    group: "Vitaminas",
    isPct: true,
  },
  { key: "niacin_pct", label: "Niacina", group: "Vitaminas", isPct: true },
];

const NUTRIENT_GROUPS: NutrientGroup[] = [
  "Scores",
  "Macros",
  "Minerales",
  "Vitaminas",
];

function pctColor(v: number | null): string {
  if (v === null) return "text-gray-400 dark:text-gray-500";
  if (v >= 90) return "text-green-600 dark:text-green-400";
  if (v >= 60) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-500 dark:text-red-400";
}

function pctBg(v: number | null): string {
  if (v === null) return "bg-gray-200 dark:bg-gray-600";
  if (v >= 90) return "bg-green-500";
  if (v >= 60) return "bg-yellow-400";
  return "bg-red-400";
}

function NutrientBar({
  label,
  value,
  isPct,
}: {
  label: string;
  value: number | null;
  isPct: boolean;
}) {
  const barPct = isPct && value !== null ? Math.min(value, 100) : 0;
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-gray-500 dark:text-gray-400 w-14 flex-shrink-0 truncate">
        {label}
      </span>
      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${pctBg(isPct ? value : null)}`}
          style={{ width: `${barPct}%` }}
        />
      </div>
      <span
        className={`text-[10px] font-semibold tabular-nums w-8 text-right flex-shrink-0 ${
          isPct ? pctColor(value) : "text-gray-600 dark:text-gray-400"
        }`}
      >
        {value !== null
          ? isPct
            ? `${Math.round(value)}%`
            : value % 1 === 0
              ? String(value)
              : value.toFixed(1)
          : "—"}
      </span>
    </div>
  );
}

function ByDateView({ snapshots }: { snapshots: DaySnapshot[] }) {
  const [idx, setIdx] = useState(0);
  const snap = snapshots[Math.min(idx, snapshots.length - 1)];
  if (!snap) return null;

  const macros = NUTRIENT_LIST.filter((n) => n.group === "Macros");
  const minerals = NUTRIENT_LIST.filter((n) => n.group === "Minerales");
  const vitamins = NUTRIENT_LIST.filter((n) => n.group === "Vitaminas");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex gap-1.5 px-3 py-2 overflow-x-auto flex-shrink-0 border-b border-gray-100 dark:border-gray-800">
        {snapshots.map((s, i) => {
          const dt = new Date(s.date + "T00:00:00");
          return (
            <button
              key={s.day_id}
              onClick={() => setIdx(i)}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-10 h-10 rounded-xl transition-all ${
                i === idx
                  ? "bg-green-600 text-white shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <span className="text-[8px] uppercase font-medium leading-none">
                {dt.toLocaleDateString("es-CO", { weekday: "short" })}
              </span>
              <span className="text-sm font-bold leading-tight mt-0.5">
                {dt.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {snap.overall_score !== null && (
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg px-2.5 py-1">
              <span className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Kiwí
              </span>
              <span
                className={`text-xs font-bold tabular-nums ${pctColor(snap.overall_score)}`}
              >
                {Math.round(snap.overall_score)}
              </span>
            </div>
          )}
          {snap.inflamitis_score !== null && (
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg px-2.5 py-1">
              <span className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                E-DII
              </span>
              <span className="text-xs font-bold tabular-nums text-gray-700 dark:text-gray-300">
                {snap.inflamitis_score.toFixed(1)}
              </span>
            </div>
          )}
          {snap.day_dii !== null && (
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg px-2.5 py-1">
              <span className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                DII
              </span>
              <span className="text-xs font-bold tabular-nums text-gray-700 dark:text-gray-300">
                {snap.day_dii.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
            Macros
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {macros.map(({ key, label, isPct }) => (
              <NutrientBar
                key={key}
                label={label}
                value={snap[key] as number | null}
                isPct={isPct}
              />
            ))}
          </div>
        </div>

        {minerals.some((n) => snap[n.key] !== null) && (
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
              Minerales
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {minerals
                .filter((n) => snap[n.key] !== null)
                .map(({ key, label, isPct }) => (
                  <NutrientBar
                    key={key}
                    label={label}
                    value={snap[key] as number | null}
                    isPct={isPct}
                  />
                ))}
            </div>
          </div>
        )}

        {vitamins.some((n) => snap[n.key] !== null) && (
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
              Vitaminas
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {vitamins
                .filter((n) => snap[n.key] !== null)
                .map(({ key, label, isPct }) => (
                  <NutrientBar
                    key={key}
                    label={label}
                    value={snap[key] as number | null}
                    isPct={isPct}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ByNutrientView({ snapshots }: { snapshots: DaySnapshot[] }) {
  const [selectedKey, setSelectedKey] =
    useState<keyof DaySnapshot>("proteins_pct");
  const meta =
    NUTRIENT_LIST.find((n) => n.key === selectedKey) ?? NUTRIENT_LIST[3];

  const trend = [...snapshots].reverse();

  const fmtDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
    });

  const rawValues = trend
    .map((s) => s[selectedKey] as number | null)
    .filter((v): v is number => v !== null);
  const maxBarRef = meta.isPct ? 100 : Math.max(...rawValues.map(Math.abs), 1);

  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-36 flex-shrink-0 border-r border-gray-100 dark:border-gray-800 overflow-y-auto">
        {NUTRIENT_GROUPS.map((group) => {
          const items = NUTRIENT_LIST.filter((n) => n.group === group);
          return (
            <div key={group}>
              <p className="px-3 pt-2 pb-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {group}
              </p>
              {items.map((n) => (
                <button
                  key={n.key}
                  onClick={() => setSelectedKey(n.key)}
                  className={`w-full text-left px-3 py-1.5 text-[11px] leading-tight transition-colors ${
                    selectedKey === n.key
                      ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-semibold border-r-2 border-green-500"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {n.label}
                </button>
              ))}
            </div>
          );
        })}
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
        {trend.map((s) => {
          const v = s[selectedKey] as number | null;
          const barPct =
            v !== null
              ? meta.isPct
                ? Math.min(v, 100)
                : Math.min((Math.abs(v) / maxBarRef) * 100, 100)
              : 0;
          return (
            <div key={s.day_id} className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 dark:text-gray-400 w-14 flex-shrink-0">
                {fmtDate(s.date)}
              </span>
              <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                <div
                  className={`h-full rounded transition-all ${pctBg(meta.isPct ? v : null)}`}
                  style={{ width: `${barPct}%` }}
                />
              </div>
              <span
                className={`text-[10px] font-bold tabular-nums w-10 text-right flex-shrink-0 ${
                  meta.isPct ? pctColor(v) : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {v !== null
                  ? meta.isPct
                    ? `${Math.round(v)}%`
                    : v % 1 === 0
                      ? String(v)
                      : v.toFixed(1)
                  : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CompliancePanelContent({
  customerId,
  token,
}: {
  customerId: string;
  token: string;
}) {
  const [snapshots, setSnapshots] = useState<DaySnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"fecha" | "nutriente">("fecha");
  const [loadKey, setLoadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getCustomerSnapshots(customerId, token)
      .then((res) => {
        if (!cancelled) setSnapshots(res.snapshots);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Error al cargar");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [customerId, token, loadKey]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600" />
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 px-4">
        <p className="text-xs text-red-500 dark:text-red-400 text-center">
          {error}
        </p>
        <button
          onClick={() => setLoadKey((k) => k + 1)}
          className="text-xs text-green-600 hover:text-green-700 font-medium"
        >
          Reintentar
        </button>
      </div>
    );

  if (!snapshots.length)
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Sin datos registrados.
        </p>
      </div>
    );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        {(["fecha", "nutriente"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              view === v
                ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {v === "fecha" ? "Por fecha" : "Por nutriente"}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-gray-400 dark:text-gray-500 pr-1">
          {snapshots.length} días
        </span>
      </div>
      <div className="flex-1 overflow-hidden">
        {view === "fecha" ? (
          <ByDateView snapshots={snapshots} />
        ) : (
          <ByNutrientView snapshots={snapshots} />
        )}
      </div>
    </div>
  );
}
