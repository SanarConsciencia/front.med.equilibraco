// src/services/nutrition-report.service.ts
// ─────────────────────────────────────────────────────────────────────────────
// Orquesta las llamadas a APIs, transforma los datos y envía
// el payload a kiwi-pdf para generar el reporte nutricional.
//
// USO:
//   const blob = await requestNutritionReport(patientUuid, date)
//   downloadBlob(blob, `reporte-${date}.pdf`)
// ─────────────────────────────────────────────────────────────────────────────

import { authFetchJson } from "./apiConfig";
import type { DayAnalysisResponse } from "../types/medicalApiTypes";
import type { MedicoResponse } from "./api";
import type {
  NutritionReportPayload,
  NutrientGroupKey,
  ReportNutrientGroup,
  ReportSubNutrient,
  ReportTopFood,
  ReportMealBreakdown,
  ReportInsightItem,
  WeeklyScorePoint,
} from "../types/nutrition-report.types";
import {
  NUTRIENT_GROUPS,
  INSIGHT_KEY_TO_GROUP,
} from "../types/nutrition-report.types";

// ============================================================================
// TIPOS DE LAS APIS EXTERNAS
// ============================================================================

interface ScorePoint {
  date: string;
  score: number | null;
}

interface CustomerScoresResponse {
  customer_id: string;
  period: string;
  start_date: string;
  end_date: string;
  overall_scores: ScorePoint[];
  inflamitis_scores: ScorePoint[];
}

interface InsightItem {
  priority: number;
  insight_type: string;
  nutrient: string | null;
  nutrient_label: string | null;
  days_count: number;
  avg_compliance: number | null;
  severity: "critical" | "high" | "medium" | "low" | "borderline";
  headline: string;
  body: string;
  symptom_connection: string;
  has_user_signal: boolean;
}

interface NutritionInsightResponse {
  insights: InsightItem[];
  cta_message: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const KIWI_PDF_URL =
  (import.meta.env.VITE_KIWI_PDF_URL as string | undefined) ??
  "https://kiwi-pdf-equilibaco.up.railway.app";

const INTAKE_BASE =
  (import.meta.env.VITE_INTAKE_API_URL as string | undefined) ??
  "https://api.intake.equilibraco.com";

const TOP_FOODS_LIMIT = 5;

// ============================================================================
// LLAMADAS A APIS
// ============================================================================

async function fetchWeeklyScores(
  customerId: string,
): Promise<CustomerScoresResponse> {
  return authFetchJson<CustomerScoresResponse>(
    `${INTAKE_BASE}/api/v1/scores/${customerId}?period=7d`,
  );
}

async function fetchInsights(
  customerId: string,
): Promise<NutritionInsightResponse> {
  return authFetchJson<NutritionInsightResponse>(
    `${INTAKE_BASE}/api/v1/insights/nutrition/${customerId}?period=7`,
  );
}

// ============================================================================
// HELPERS DE TRANSFORMACIÓN
// ============================================================================

/**
 * Calcula el promedio de un array de números,
 * ignorando los valores null.
 */
function avg(values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => v !== null);
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

/**
 * Construye el índice de insights por grupo de nutriente.
 * Cada InsightItem se asigna al grupo correspondiente
 * usando INSIGHT_KEY_TO_GROUP.
 */
function buildInsightIndex(
  insights: InsightItem[],
): Map<NutrientGroupKey, InsightItem[]> {
  const index = new Map<NutrientGroupKey, InsightItem[]>();

  for (const item of insights) {
    if (!item.nutrient) continue;
    const group = INSIGHT_KEY_TO_GROUP[item.nutrient];
    if (!group) continue;

    const existing = index.get(group) ?? [];
    existing.push(item);
    index.set(group, existing);
  }

  return index;
}

/**
 * Selecciona el insight semanal (prioridad 3-6) y la alerta
 * (prioridad 1-2) para un grupo dado desde el índice.
 */
function pickInsightsForGroup(
  index: Map<NutrientGroupKey, InsightItem[]>,
  group: NutrientGroupKey,
): {
  weekly_insight: ReportInsightItem | null;
  alert: ReportInsightItem | null;
} {
  const items = index.get(group) ?? [];
  const sorted = [...items].sort((a, b) => a.priority - b.priority);

  const alertItem = sorted.find((i) => i.priority <= 2) ?? null;
  const insightItem = sorted.find((i) => i.priority >= 3) ?? null;

  const toReport = (i: InsightItem | null): ReportInsightItem | null =>
    i
      ? {
          priority: i.priority,
          insight_type: i.insight_type,
          nutrient: i.nutrient,
          nutrient_label: i.nutrient_label,
          days_count: i.days_count,
          avg_compliance: i.avg_compliance,
          severity: i.severity,
          headline: i.headline,
          body: i.body,
          symptom_connection: i.symptom_connection,
          has_user_signal: i.has_user_signal,
        }
      : null;

  return {
    weekly_insight: toReport(insightItem),
    alert: toReport(alertItem),
  };
}

/**
 * Calcula los top N alimentos por contribución
 * a los nutrientes principales del grupo.
 * Acumula por food_id a través de todos los platos.
 */
function buildTopFoods(
  day: DayAnalysisResponse,
  nutrientKeys: string[],
  unit: string,
): ReportTopFood[] {
  // Usar solo el primer nutriente del grupo como referencia
  // (ej: proteins_g para el grupo proteins)
  const primaryKey = nutrientKeys[0];

  const accumulator = new Map<
    number,
    { food_name: string; contribution: number }
  >();

  for (const meal of day.contributions.by_meal) {
    for (const ingredient of meal.ingredients) {
      const value =
        (
          ingredient.nutritional_contribution as unknown as Record<
            string,
            number
          >
        )[primaryKey] ?? 0;

      if (value <= 0) continue;

      const existing = accumulator.get(ingredient.food_id);
      if (existing) {
        existing.contribution += value;
      } else {
        accumulator.set(ingredient.food_id, {
          food_name: ingredient.food_name,
          contribution: value,
        });
      }
    }
  }

  const total =
    (day.contributions.total as unknown as Record<string, number>)[
      primaryKey
    ] ?? 0;

  return Array.from(accumulator.values())
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, TOP_FOODS_LIMIT)
    .map((f) => ({
      food_name: f.food_name,
      contribution: Math.round(f.contribution * 10) / 10,
      unit,
      percentage_of_total:
        total > 0 ? Math.round((f.contribution / total) * 100) : 0,
    }));
}

/**
 * Calcula el aporte de cada plato al nutriente principal
 * del grupo.
 */
function buildMealBreakdown(
  day: DayAnalysisResponse,
  primaryKey: string,
  unit: string,
): ReportMealBreakdown[] {
  const total =
    (day.contributions.total as unknown as Record<string, number>)[
      primaryKey
    ] ?? 0;

  // Build slot_id → meal_name lookup from the actual meals list
  const slotToName = new Map<string, string>();
  for (const m of day.day.meals ?? []) {
    if (m.slot_id) slotToName.set(m.slot_id, m.meal_name);
  }

  return day.contributions.by_meal
    .map((meal) => {
      const contribution =
        (meal.totals as unknown as Record<string, number>)[primaryKey] ?? 0;
      const resolvedName = slotToName.get(meal.meal_name) ?? meal.meal_name;
      return {
        meal_name: resolvedName,
        meal_time: null, // meal_time no viene en contributions
        contribution: Math.round(contribution * 10) / 10,
        unit,
        percentage_of_total:
          total > 0 ? Math.round((contribution / total) * 100) : 0,
      };
    })
    .filter((m) => m.contribution > 0);
}

/**
 * Construye un ReportNutrientGroup completo para un grupo dado.
 */
function buildNutrientGroup(
  groupKey: NutrientGroupKey,
  day: DayAnalysisResponse,
  insightIndex: Map<NutrientGroupKey, InsightItem[]>,
): ReportNutrientGroup {
  const config = NUTRIENT_GROUPS[groupKey];
  const isBioactive = groupKey === "bioactives";

  const requirements = day.requirements.total as unknown as Record<
    string,
    number | null
  >;
  const contributions = day.contributions.total as unknown as Record<
    string,
    number
  >;
  const compliance = day.compliance.total as unknown as Record<
    string,
    number | null
  >;

  // Construir sub-nutrientes filtrando los que tienen datos
  const sub_nutrients: ReportSubNutrient[] = config.nutrients
    .map((n) => {
      const consumed = contributions[n.key] ?? 0;
      // Solo incluir si hay dato consumido o si tiene requerimiento
      const required = isBioactive ? null : (requirements[n.key] ?? null);
      const compliance_pct = isBioactive ? null : (compliance[n.key] ?? null);

      return {
        key: n.key,
        label: n.label,
        required: required !== null ? Math.round(required * 10) / 10 : null,
        consumed: Math.round(consumed * 10) / 10,
        compliance_pct:
          compliance_pct !== null ? Math.round(compliance_pct) : null,
        unit: n.unit,
      };
    })
    .filter((n) => n.consumed > 0 || (n.required !== null && n.required > 0));

  // Group score: promedio de cumplimientos de sub-nutrientes
  const complianceValues = sub_nutrients
    .map((n) => n.compliance_pct)
    .filter((v): v is number => v !== null);

  const group_score =
    complianceValues.length > 0
      ? Math.round(
          complianceValues.reduce((a, b) => a + b, 0) / complianceValues.length,
        )
      : null;

  // Top foods y meal breakdown usan el primer nutriente del grupo
  const primaryKey = config.nutrients[0].key;
  const primaryUnit = config.nutrients[0].unit;

  const top_foods = buildTopFoods(day, [primaryKey], primaryUnit);

  const meal_breakdown = buildMealBreakdown(day, primaryKey, primaryUnit);

  const { weekly_insight, alert } = pickInsightsForGroup(
    insightIndex,
    groupKey,
  );

  return {
    group: groupKey,
    group_label: config.label,
    group_score,
    sub_nutrients,
    top_foods,
    meal_breakdown,
    weekly_insight,
    alert,
  };
}

// ============================================================================
// TRANSFORMADOR PRINCIPAL
// ============================================================================

function buildReportPayload(
  day: DayAnalysisResponse,
  scores: CustomerScoresResponse,
  insights: NutritionInsightResponse,
  doctor: MedicoResponse,
  patient: {
    nombre: string;
    email: string;
    subscription_status: string;
    avatar_url: string | null;
  },
  date: string,
): NutritionReportPayload {
  // ── Contexto semanal ──────────────────────────────────────────────────
  const weeklyScores: WeeklyScorePoint[] = scores.overall_scores.map((p) => {
    const inflamitis =
      scores.inflamitis_scores.find((s) => s.date === p.date)?.score ?? null;
    return {
      date: p.date,
      // Map 0 to null — 0 means no data (future dates), not a real score
      overall_score: p.score === 0 ? null : p.score,
      inflamitis_score: inflamitis === 0 ? null : inflamitis,
    };
  });

  const weeklyOverallAvg = avg(scores.overall_scores.map((s) => s.score));
  const weeklyInflamitisAvg = avg(scores.inflamitis_scores.map((s) => s.score));
  const overallScore = Math.round(day.compliance.overall);
  const deltaVsWeekly =
    weeklyOverallAvg !== null
      ? Math.round(overallScore - weeklyOverallAvg)
      : null;

  // ── Summary ───────────────────────────────────────────────────────────
  const infla = day.inflammatory_analysis;
  const totalIngredients =
    day.day.meals?.reduce((acc, m) => acc + (m.ingredients?.length ?? 0), 0) ??
    0;

  const summary = {
    overall_score: overallScore,
    inflamitis_score: infla.inflamitis_score ?? null,
    inflamitis_interpretation: infla.inflamitis_interpretation ?? null,
    meals_count: day.day.meals?.length ?? 0,
    ingredients_count: totalIngredients,
    weekly_overall_avg:
      weeklyOverallAvg !== null ? Math.round(weeklyOverallAvg) : null,
    weekly_inflamitis_avg:
      weeklyInflamitisAvg !== null
        ? Math.round(weeklyInflamitisAvg * 10) / 10
        : null,
    delta_vs_weekly_avg: deltaVsWeekly,
    weekly_scores: weeklyScores,
  };

  // ── Insights indexados por grupo ──────────────────────────────────────
  const insightIndex = buildInsightIndex(insights.insights);

  // ── Grupos de nutrientes ──────────────────────────────────────────────
  const groupKeys: NutrientGroupKey[] = [
    "proteins",
    "carbs",
    "fats",
    "minerals",
    "vitamins",
    "bioactives",
  ];

  const nutrients = groupKeys.map((key) =>
    buildNutrientGroup(key, day, insightIndex),
  );

  // ── Estado inflamatorio ───────────────────────────────────────────────
  const inflammatory = {
    inflamitis_score: infla.inflamitis_score ?? null,
    inflamitis_interpretation: infla.inflamitis_interpretation ?? null,
    nova_count: {
      nova_1: infla.nova_count.nova_1,
      nova_2: infla.nova_count.nova_2,
      nova_3: infla.nova_count.nova_3,
      nova_4: infla.nova_count.nova_4,
    },
    drivers_increase: infla.inflamitis_drivers_increase ?? [],
    drivers_decrease: infla.inflamitis_drivers_decrease ?? [],
    recommendations: infla.dii_recommendations ?? [],
    probiotic_count: infla.probiotic_count,
    prebiotic_count: infla.prebiotic_count,
    omega_6_3_ratio: infla.omega_6_3_ratio ?? null,
  };

  // ── Platos del día ────────────────────────────────────────────────────
  const meals = (day.day.meals ?? []).map((meal) => {
    const photos: string[] = [
      meal.media?.photo_url_1,
      meal.media?.photo_url_2,
      meal.media?.photo_url_3,
    ].filter((url): url is string => Boolean(url));

    return {
      meal_name: meal.meal_name,
      meal_time: meal.meal_time ?? null,
      meal_type: (meal.meal_type ?? "extra") as
        | "main"
        | "periworkout"
        | "extra",
      ingredients: (meal.ingredients ?? []).map((ing) => ({
        food_name: ing.food_name,
        quantity: ing.quantity ?? 0,
        unit: ing.unit ?? "g",
      })),
      photos,
      user_note: meal.media?.customer_note ?? null,
      doctor_note: meal.media?.doctor_note ?? null,
    };
  });

  // ── Retroalimentación médica ──────────────────────────────────────────
  const medical_feedback = day.day_feedback
    ? {
        contenido: day.day_feedback.contenido,
        score_general: day.day_feedback.score_general ?? null,
        created_at: day.day_feedback.created_at,
      }
    : null;

  return {
    doctor: {
      nombre_completo: doctor.nombre_completo,
      especialidad: doctor.especialidad ?? null,
      tarjeta_profesional: doctor.tarjeta_profesional,
      email: doctor.email,
    },
    patient,
    report_date: date,
    summary,
    nutrients,
    inflammatory,
    meals,
    medical_feedback,
  };
}

// ============================================================================
// FUNCIÓN PRINCIPAL — punto de entrada desde la UI
// ============================================================================

/**
 * Orquesta todo el proceso:
 * 1. Llama en paralelo a scores e insights
 * 2. Construye el payload
 * 3. Hace POST a kiwi-pdf
 * 4. Retorna el PDF como Blob
 *
 * @param day       - DayAnalysisResponse del patientDayStore
 * @param doctor    - MedicoResponse del appStore
 * @param patient   - Datos del paciente
 * @param date      - Fecha del reporte (YYYY-MM-DD)
 */
export async function requestNutritionReport(
  day: DayAnalysisResponse,
  doctor: MedicoResponse,
  patient: {
    nombre: string;
    email: string;
    subscription_status: string;
    avatar_url: string | null;
  },
  date: string,
): Promise<Blob> {
  const customerId = day.day.customer_id;

  // Llamadas en paralelo — el día ya está en el store
  const [scores, insights] = await Promise.all([
    fetchWeeklyScores(customerId),
    fetchInsights(customerId),
  ]);

  const payload = buildReportPayload(
    day,
    scores,
    insights,
    doctor,
    patient,
    date,
  );

  // 90s timeout — PDF generation (WeasyPrint + charts + photo fetching) can take 30-60s.
  // Railway's default proxy timeout is 30s; if it's been raised to 120s this gives enough headroom.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90_000);

  let response: Response;
  try {
    response = await fetch(`${KIWI_PDF_URL}/reports/nutrition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(
        "La generación del reporte tardó demasiado (>90s). Revisa los logs del servidor o intenta nuevamente.",
      );
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const rawBody = await response.text().catch(() => "");
    let detail: string;
    try {
      const json = JSON.parse(rawBody) as { detail?: unknown };
      detail = JSON.stringify(json.detail ?? json);
    } catch {
      detail = rawBody;
    }
    console.error("[kiwi-pdf] error detail:", detail);
    console.error("[kiwi-pdf] full payload:", JSON.stringify(payload, null, 2));
    throw new Error(`Error generando reporte (${response.status}): ${detail}`);
  }

  return response.blob();
}

// ============================================================================
// UTILIDAD DE DESCARGA
// ============================================================================

/**
 * Descarga un Blob como archivo en el browser.
 *
 * @param blob     - PDF como Blob
 * @param filename - Nombre del archivo con extensión
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
