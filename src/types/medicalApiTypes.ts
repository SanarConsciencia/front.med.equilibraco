// Types para Medical Access API
// Equivalentes TypeScript de los schemas Pydantic de Python

import type { MealAnalysisBySlot } from "./mealAnalysisBySlotTypes";

// ═══════════════════════════════════════════════════════════
// NUTRITIONAL PROPERTIES
// ═══════════════════════════════════════════════════════════

export interface NutritionalProperties {
  // Common nutritional properties that might be included
  calories_per_100g?: number;
  protein_per_100g?: number;
  carbs_per_100g?: number;
  fat_per_100g?: number;
  fiber_per_100g?: number;
  // Additional dynamic properties
  [key: string]: any;
}

export interface PatternMetadata {
  id?: string;
  name?: string;
  description?: string;
  // Additional pattern fields that may vary
  [key: string]: any;
}

export interface SerializedDayIntake {
  id: number;
  customer_id: string;
  date: string; // YYYY-MM-DD
  profile_version?: number | null;
  pattern_id?: string | null;
  training_day?: boolean | null;
  notes?: string | null;
  // Meals for the day (if provided by the source)
  meals?: SerializedMeal[];
  created_at: string; // ISO datetime string
  updated_at?: string | null; // ISO datetime string
  // Additional fields that might be included in serialized response
  [key: string]: any; // For flexibility with additional dynamic fields
}

// Serialized meal & ingredient types (from example payload)
export interface SerializedMeal {
  id: number;
  meal_name: string;
  meal_type?: string | null; // e.g. "main", "snack"
  slot_id?: string | null; // e.g. "main_1"
  slot_order?: number | null;
  meal_time?: string | null; // HH:MM
  is_favorite?: boolean | null;
  notes?: string | null;
  ingredients?: SerializedMealIngredient[];
  // allow extra fields for forward compatibility
  [key: string]: any;
}

export interface SerializedMealIngredient {
  id: number;
  food_id: number;
  food_name: string;
  quantity?: number | null; // units are in `unit` field
  unit?: string | null; // e.g. "g", "ml", "porción"
  [key: string]: any;
}

export interface CustomerInfo {
  customer_uuid: string;
  customer_email: string;
  customer_full_name: string;
  customer_phone?: string | null;
  service_requested?: string | null;
  custom_message?: string | null;
  granted_at: string;
  subscription_status?: string | null;
  customer_status?: string | null;
  has_active_subscription: boolean;
  department_id?: string | null;
  city_id?: string | null;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════
// PERIOD INFO
// ═══════════════════════════════════════════════════════════

export interface PeriodInfo {
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  total_days: number; // >= 0
}

// ═══════════════════════════════════════════════════════════
// ERROR INFO
// ═══════════════════════════════════════════════════════════

export interface DayError {
  day_id: string;
  error: string;
}

// ═══════════════════════════════════════════════════════════
// INFLAMMATORY ANALYSIS
// ═══════════════════════════════════════════════════════════

export interface InflammatoryFood {
  food_id: number;
  food_name: string;
  dii_score: number;
  usage_count: number;
}

export interface DiiSummary {
  contribuciones_positivas?: number | null;
  contribuciones_negativas?: number | null;
  balance_neto?: number | null;
  factores_analizados?: number | null;
}

// ═══════════════════════════════════════════════════════════
// TRACKING DATA
// ═══════════════════════════════════════════════════════════

// Basic response interfaces for tracking entities
export interface SleepResponse {
  id: number;
  sleep_time: string;
  wake_time: string;
  date: string;
  type: "main" | "nap";
  quality_score?: number | null;
  energy_on_wakeup: number;
  notes?: string | null;
  duration_minutes?: number;
}

export interface HydrationResponse {
  id: number;
  amount_ml: number;
  timestamp: string;
  notes?: string | null;
}

export interface WalkingResponse {
  id: number;
  steps?: number | null;
  distance_km?: number | null;
  duration?: number | null; // minutes
  timestamp: string;
  notes?: string | null;
}

export interface SymptomResponse {
  id: number;
  symptom_type: string;
  severity: number;
  notes?: string | null;
  timestamp: string;
}

export interface BowelMovementResponse {
  id: number;
  bristol_scale: number;
  notes?: string | null;
  timestamp: string;
}

export interface PhysicalActivityResponse {
  id: number;
  activity_type: string;
  duration_minutes: number;
  intensity: "low" | "moderate" | "high";
  timestamp: string;
  notes?: string | null;
}

export interface MealConfirmationResponse {
  id: number;
  meal_id: number;
  confirmed: boolean;
  timestamp: string;
  notes?: string | null;
}

export interface CustomHabitTrackingResponse {
  id: number;
  habit_name: string;
  completed: boolean;
  timestamp: string;
  notes?: string | null;
}

// Complete tracking data with aggregations
export interface TrackingData {
  // Raw tracking records
  sleep?: SleepResponse | null;
  symptoms: SymptomResponse[];
  bowel_movements: BowelMovementResponse[];
  meal_confirmations: MealConfirmationResponse[];
  physical_activities: PhysicalActivityResponse[];
  hydration_entries: HydrationResponse[];
  walking_entries: WalkingResponse[];
  custom_habits: CustomHabitTrackingResponse[];

  // Calculated aggregations
  total_hydration_ml: number;
  hydration_entries_count: number;
  total_steps: number;
  total_walking_distance_km: number;
  walking_entries_count: number;
  total_walk_minutes: number;
  total_sleep_minutes?: number | null;
  main_sleep_minutes?: number | null;
  naps_count: number;
  naps_total_minutes: number;

  // Simple counts
  number_of_symptoms: number;
  number_of_bowel_movements: number;

  // Phase 3 aggregations
  total_activity_minutes: number;
  physical_activities_count: number;
  custom_habits_count: number;
}

// ═══════════════════════════════════════════════════════════
// DAY ANALYSIS RESPONSE - DETAILED TYPES
// ═══════════════════════════════════════════════════════════

// Requirements interfaces
export interface MacrosRequirements {
  proteins_g: number;
  carbs_g: number;
  fats_g: number;
  fiber_g: number;
}

export interface MineralsRequirements {
  calcium: number;
  iron: number;
  magnesium: number;
  zinc: number;
  potassium: number;
  sodium: number;
}

export interface VitaminsRequirements {
  folate: number;
  vitamin_b1: number;
  vitamin_b12: number;
  vitamin_b2: number;
  vitamin_b6: number;
  vitamin_c: number;
  vitamin_d: number;
}

export interface MacrosDetail {
  proteins_g: number;
  carbs_g: number;
  fats_g: number;
  fiber_g: number;
  starches_g?: number | null;
  sugars_g?: number | null;
  saturated_fats_g?: number | null;
  monounsaturated_fats_g?: number | null;
  polyunsaturated_fats_g?: number | null;
  omega_3_ala_g?: number | null;
  omega_3_epa_dha_mg?: number | null;
  omega_6_g?: number | null;
  soluble_fiber_g?: number | null;
  insoluble_fiber_g?: number | null;
}

export interface TotalRequirements {
  proteins_g: number;
  carbs_g: number;
  fats_g: number;
  fiber_g: number;
  starches_g?: number | null;
  sugars_g?: number | null;
  mufa_g?: number | null;
  pufa_g?: number | null;
  sfa_g?: number | null;
  omega_3_epa_dha_mg?: number | null;
  omega_3_ala_g?: number | null;
  omega_6_la_g?: number | null;
  fiber_soluble_g?: number | null;
  fiber_insoluble_g?: number | null;
  calcium?: number | null;
  iron?: number | null;
  magnesium?: number | null;
  zinc?: number | null;
  potassium?: number | null;
  sodium?: number | null;
  folate?: number | null;
  vitamin_b1?: number | null;
  vitamin_b12?: number | null;
  vitamin_b2?: number | null;
  vitamin_b6?: number | null;
  vitamin_c?: number | null;
  vitamin_d?: number | null;
}

export interface SlotRequirements {
  id: string;
  name: string;
  macros_g: MacrosRequirements;
  minerals_mg?: MineralsRequirements | null;
  vitamins_ug?: VitaminsRequirements | null;
  macros_detail?: MacrosDetail | null;
  order: number;
  notes: string[];
}

export interface RequirementsData {
  total: TotalRequirements;
  slots: SlotRequirements[];
  pattern?: PatternMetadata; // Optional pattern metadata from API 2
}

// Contributions interfaces
export interface MealTotals {
  proteins_g: number;
  carbs_g: number;
  fats_g: number;
  fiber_g: number;
  starches_g?: number | null;
  sugars_g?: number | null;
  mufa_g?: number | null;
  pufa_g?: number | null;
  sfa_g?: number | null;
  omega_3_epa_dha_mg?: number | null;
  omega_3_ala_g?: number | null;
  omega_6_la_g?: number | null;
  fiber_soluble_g?: number | null;
  fiber_insoluble_g?: number | null;
  calcium?: number | null;
  iron?: number | null;
  magnesium?: number | null;
  zinc?: number | null;
  potassium?: number | null;
  sodium?: number | null;
  folate?: number | null;
  vitamin_b1?: number | null;
  vitamin_b12?: number | null;
  vitamin_b2?: number | null;
  vitamin_b6?: number | null;
  vitamin_c?: number | null;
  vitamin_d?: number | null;
  // DII v4.0 fields
  alcohol_g?: number | null;
  caffeine_mg?: number | null;
  vitamin_a?: number | null;
  vitamin_e?: number | null;
  niacina?: number | null;
  selenium?: number | null;
  cholesterol_mg?: number | null;
  trans_fats_g?: number | null;
  anthocyanidins_mg?: number | null;
  flavan3ols_mg?: number | null;
  flavones_mg?: number | null;
  flavonols_mg?: number | null;
  flavanones_mg?: number | null;
  isoflavones_mg?: number | null;
  beta_carotene_mcg?: number | null;
  garlic_g?: number | null;
  ginger_g?: number | null;
  onion_g?: number | null;
  turmeric_g?: number | null;
  pepper_g?: number | null;
  thyme_g?: number | null;
  oregano_g?: number | null;
  rosemary_g?: number | null;
  tea_g?: number | null;
}

export interface IngredientContribution {
  food_id: number;
  food_name: string;
  weight_g: number;
  nutritional_contribution: MealTotals;
  properties: NutritionalProperties;
  category_id?: number | null;
  standard_serving_size: number;
}

export interface MealContribution {
  meal_name: string;
  totals: MealTotals;
  ingredients: IngredientContribution[];
  aggregated_properties?: InflammatoryAnalysis | null;
}

export interface ContributionsData {
  total: MealTotals;
  by_meal: MealContribution[];
  aggregated_properties?: InflammatoryAnalysis | null;
}

// Compliance interfaces
export interface MacroCompliance {
  proteins_g: number;
  carbs_g: number;
  fats_g: number;
  fiber_g: number;
}

export interface MineralCompliance {
  calcium: number;
  iron: number;
  magnesium: number;
  zinc: number;
  potassium: number;
  sodium: number;
}

export interface VitaminCompliance {
  folate: number;
  vitamin_b1: number;
  vitamin_b12: number;
  vitamin_b2: number;
  vitamin_b6: number;
  vitamin_c: number;
  vitamin_d: number;
}

export interface CarbsDetailCompliance {
  starches_g: number;
  sugars_g: number;
}

export interface FatsDetailCompliance {
  mufa_g: number;
  pufa_g: number;
  sfa_g: number;
  omega_3_epa_dha_mg: number;
  omega_3_ala_g: number;
  omega_6_la_g: number;
}

export interface FiberDetailCompliance {
  fiber_soluble_g: number;
  fiber_insoluble_g: number;
}

export interface TotalCompliance {
  proteins_g: number;
  carbs_g: number;
  fats_g: number;
  fiber_g: number;
  starches_g?: number | null;
  sugars_g?: number | null;
  mufa_g?: number | null;
  pufa_g?: number | null;
  sfa_g?: number | null;
  omega_3_epa_dha_mg?: number | null;
  omega_3_ala_g?: number | null;
  omega_6_la_g?: number | null;
  fiber_soluble_g?: number | null;
  fiber_insoluble_g?: number | null;
  calcium: number;
  iron: number;
  magnesium: number;
  zinc: number;
  potassium: number;
  sodium: number;
  folate: number;
  vitamin_b1: number;
  vitamin_b12: number;
  vitamin_b2: number;
  vitamin_b6: number;
  vitamin_c: number;
  vitamin_d: number;
}

export interface SlotCompliance {
  slot_id: string;
  slot_name: string;
  proteins_g: number;
  carbs_g: number;
  fats_g: number;
  fiber_g: number;
  starches_g?: number | null;
  sugars_g?: number | null;
  mufa_g?: number | null;
  pufa_g?: number | null;
  sfa_g?: number | null;
  omega_3_epa_dha_mg?: number | null;
  omega_3_ala_g?: number | null;
  omega_6_la_g?: number | null;
  fiber_soluble_g?: number | null;
  fiber_insoluble_g?: number | null;
  calcium: number;
  iron: number;
  magnesium: number;
  zinc: number;
  potassium: number;
  sodium: number;
  folate: number;
  vitamin_b1: number;
  vitamin_b12: number;
  vitamin_b2: number;
  vitamin_b6: number;
  vitamin_c: number;
  vitamin_d: number;
  overall: number;
}

export interface ComplianceData {
  total: TotalCompliance;
  by_slot: SlotCompliance[];
  overall: number;
}

// Pending interfaces
export interface MacroPending {
  proteins_g: number;
  carbs_g: number;
  fats_g: number;
  fiber_g: number;
}

export interface CarbsDetailPending {
  starches_g: number;
  sugars_g: number;
}

export interface FatsDetailPending {
  mufa_g: number;
  pufa_g: number;
  sfa_g: number;
  omega_3_epa_dha_mg: number;
  omega_3_ala_g: number;
  omega_6_la_g: number;
}

export interface FiberDetailPending {
  fiber_soluble_g: number;
  fiber_insoluble_g: number;
}

export interface MineralPending {
  calcium: number;
  iron: number;
  magnesium: number;
  zinc: number;
  potassium: number;
  sodium: number;
}

export interface VitaminPending {
  folate: number;
  vitamin_b1: number;
  vitamin_b12: number;
  vitamin_b2: number;
  vitamin_b6: number;
  vitamin_c: number;
  vitamin_d: number;
}

export interface PendingData {
  proteins_g: number;
  carbs_g: number;
  fats_g: number;
  fiber_g: number;
  starches_g?: number | null;
  sugars_g?: number | null;
  mufa_g?: number | null;
  pufa_g?: number | null;
  sfa_g?: number | null;
  omega_3_epa_dha_mg?: number | null;
  omega_3_ala_g?: number | null;
  omega_6_la_g?: number | null;
  fiber_soluble_g?: number | null;
  fiber_insoluble_g?: number | null;
  calcium: number;
  iron: number;
  magnesium: number;
  zinc: number;
  potassium: number;
  sodium: number;
  folate: number;
  vitamin_b1: number;
  vitamin_b12: number;
  vitamin_b2: number;
  vitamin_b6: number;
  vitamin_c: number;
  vitamin_d: number;
}

// Excess interfaces
export interface MacroExcess {
  proteins_g: number;
  carbs_g: number;
  fats_g: number;
  fiber_g: number;
}

export interface CarbsDetailExcess {
  starches_g: number;
  sugars_g: number;
}

export interface FatsDetailExcess {
  mufa_g: number;
  pufa_g: number;
  sfa_g: number;
  omega_3_epa_dha_mg: number;
  omega_3_ala_g: number;
  omega_6_la_g: number;
}

export interface FiberDetailExcess {
  fiber_soluble_g: number;
  fiber_insoluble_g: number;
}

export interface MineralExcess {
  calcium: number;
  iron: number;
  magnesium: number;
  zinc: number;
  potassium: number;
  sodium: number;
}

export interface VitaminExcess {
  folate: number;
  vitamin_b1: number;
  vitamin_b12: number;
  vitamin_b2: number;
  vitamin_b6: number;
  vitamin_c: number;
  vitamin_d: number;
}

export interface ExcessData {
  proteins_g: number;
  carbs_g: number;
  fats_g: number;
  fiber_g: number;
  starches_g?: number | null;
  sugars_g?: number | null;
  mufa_g?: number | null;
  pufa_g?: number | null;
  sfa_g?: number | null;
  omega_3_epa_dha_mg?: number | null;
  omega_3_ala_g?: number | null;
  omega_6_la_g?: number | null;
  fiber_soluble_g?: number | null;
  fiber_insoluble_g?: number | null;
  calcium: number;
  iron: number;
  magnesium: number;
  zinc: number;
  potassium: number;
  sodium: number;
  folate: number;
  vitamin_b1: number;
  vitamin_b12: number;
  vitamin_b2: number;
  vitamin_b6: number;
  vitamin_c: number;
  vitamin_d: number;
}

// Inflammatory Analysis
export interface NovaCount {
  nova_1: number;
  nova_2: number;
  nova_3: number;
  nova_4: number;
  nova_null: number;
}

export interface InflammatoryAnalysis {
  net_inflammatory_index: number;
  day_dii?: number | null;
  dii_interpretation?: string | null;
  dii_parameters_used?: number | null;
  dii_coverage_percentage?: number | null;
  dii_explanation?: string | null;
  dii_recommendations?: string[] | null;
  dii_summary?: DiiSummary | null;
  projection_explanation?: string | null;
  projected_dii_score?: number | null;
  projected_interpretation?: string | null;
  projection_warning?: string | null;
  nova_count: NovaCount;
  probiotic_count: number;
  prebiotic_count: number;
  recommended_count: number;
  vegan_count: number;
  vegetarian_count: number;
  gluten_free_count: number;
  lactose_free_count: number;
  total_ingredients: number;
  omega_6_3_ratio?: string | null;
}

export interface DayAnalysisResponse {
  day: SerializedDayIntake;
  requirements: RequirementsData;
  contributions: ContributionsData;
  compliance: ComplianceData;
  pending: PendingData;
  excess: ExcessData;
  inflammatory_analysis: InflammatoryAnalysis;
  fasting_hours?: number | null;
  tracking: TrackingData;
}

// ═══════════════════════════════════════════════════════════
// PERIOD ANALYSIS DATA
// ═══════════════════════════════════════════════════════════

// Tracking Summary interfaces
export interface SleepSummary {
  average_minutes?: number | null;
  average_hours?: number | null;
  min_minutes?: number | null;
  max_minutes?: number | null;
  days_tracked: number;
  consistency_percentage: number;
  main_sleep_avg_hours?: number | null;
  naps_avg_count?: number | null;
  naps_avg_minutes?: number | null;
  recommendation: string;
  message?: string | null;
}

export interface HydrationSummary {
  average_ml?: number | null;
  average_liters?: number | null;
  min_ml?: number | null;
  max_ml?: number | null;
  days_tracked: number;
  consistency_percentage: number;
  entries_per_day?: number | null;
  meets_goal?: boolean | null;
  recommendation: string;
  message?: string | null;
}

export interface PhysicalActivitySummary {
  average_minutes?: number | null;
  total_minutes?: number | null;
  days_with_activity?: number | null;
  consistency_percentage?: number | null;
  activities_per_day?: number | null;
  weekly_projection?: number | null;
  meets_who_recommendation?: boolean | null;
  recommendation: string;
  message?: string | null;
}

export interface WalkingSummary {
  average_steps?: number | null;
  total_steps?: number | null;
  average_distance_km?: number | null;
  average_minutes?: number | null;
  days_tracked: number;
  consistency_percentage: number;
  meets_goal?: boolean | null;
  recommendation: string;
  message?: string | null;
}

export interface OverallConsistency {
  sleep_tracked: number;
  hydration_tracked: number;
  activity_tracked: number;
  walking_tracked: number;
  average_consistency: number;
}

export interface TrackingSummary {
  sleep: SleepSummary;
  hydration: HydrationSummary;
  physical_activity: PhysicalActivitySummary;
  walking: WalkingSummary;
  overall_consistency: OverallConsistency;
}

// Nutrient Variety interfaces
export interface FoodFrequency {
  food: string;
  count: number;
}

export interface NutrientVariety {
  unique_foods_count: number;
  unique_foods: string[];
  prebiotic_foods_count: number;
  prebiotic_foods: string[];
  category_distribution: Record<string, number>;
  weekly_goal: number;
  meets_weekly_goal: boolean;
  variety_score: number;
  top_10_most_consumed: FoodFrequency[];
  recommendation: string;
  message?: string | null;
}

// Inflammatory Summary interfaces
export interface DiiChartDataPoint {
  date: string;
  dii: number;
  is_projected: boolean;
  classification: string;
}

export interface InflammatorySummary {
  average_dii: number;
  min_dii: number;
  max_dii: number;
  days_analyzed: number;
  days_with_complete_data: number;
  days_with_projected_data: number;
  classification: string;
  anti_inflammatory_days: number;
  pro_inflammatory_days: number;
  neutral_days: number;
  trend: string;
  trend_description: string;
  chart_data: DiiChartDataPoint[];
  recommendation: string;
}

// Nutrient Trends interfaces
export interface BoxplotData {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  nutrient: string;
  nutrient_key: string;
  average: number;
  status: string;
}

export interface FoodSource {
  food_name: string;
  contribution: number;
}

export interface NutrientTrendData {
  average_compliance: number;
  min_compliance: number;
  max_compliance: number;
  std_deviation: number;
  q1: number;
  median: number;
  q3: number;
  days_below_70: number;
  days_above_120: number;
  status: string;
  top_food_sources: FoodSource[];
  recommendation: string;
}

export interface NutrientTrends {
  by_nutrient: Record<string, NutrientTrendData>;
  boxplot_data: BoxplotData[];
  low_nutrients: string[];
  high_nutrients: string[];
  summary: string;
  low_compliance_count: number;
  high_compliance_count: number;
}

// Meal Analysis interfaces
export interface MealBalanceScore {
  score: number;
  rating: string;
}

// Health Monitoring interfaces
export interface SymptomFrequency {
  symptom_name: string;
  count: number;
}

export interface SymptomsSummary {
  total_count: number;
  days_with_symptoms?: number | null;
  avg_per_day?: number | null;
  consistency_percentage?: number | null;
  most_common?: Array<{name: string; count: number}> | null;
  tracking_status: string;
  recommendation: string;
  message?: string | null;
}

export interface BristolDistribution {
  type_1: number;
  type_2: number;
  type_3: number;
  type_4: number;
  type_5: number;
  type_6: number;
  type_7: number;
}

export interface BowelMovementsSummary {
  total_count: number;
  days_tracked?: number | null;
  avg_per_day?: number | null;
  consistency_percentage?: number | null;
  bristol_distribution?: Record<number, number> | null;
  avg_bristol_scale?: number | null;
  predominant_type?: number | null;
  tracking_status: string;
  recommendation: string;
  message?: string | null;
}

export interface HealthMonitoring {
  symptoms: SymptomsSummary;
  bowel_movements: BowelMovementsSummary;
}

// Ingredient Consumption interfaces
export interface IngredientDetail {
  food_name: string;
  total_weight_g: number;
  total_weight_kg: number;
  frequency: number;
  days_used: number;
  meals_used: number;
  avg_portion_g: number;
  total_calories: number;
  total_proteins_g: number;
  has_bioactives: boolean;
  category: string;
  category_id?: number | null;
  usage_intensity: string;
}

export interface CategoryTotal {
  count: number;
  total_weight_g: number;
  total_weight_kg: number;
  percentage: number;
}

export interface UsageIntensityGroup {
  intensity: string;
  ingredients: string[];
  count: number;
}

export interface IngredientConsumption {
  total_ingredients: number;
  total_weight_g: number;
  total_weight_kg: number;
  category_breakdown: CategoryTotal[];
  usage_intensity_groups: UsageIntensityGroup[];
  top_ingredients: IngredientDetail[];
  top_50_ingredients: IngredientDetail[];
  by_category: Record<string, IngredientDetail[]>;
  category_totals: Record<string, CategoryTotal>;
  healthy_ingredients: IngredientDetail[];
  processed_ingredients: IngredientDetail[];
  usage_intensity: Record<string, any>;
  shopping_recommendations: string[];
  recommendation: string;
  message?: string | null;
}

export interface PeriodAnalysisData {
  // Estadísticas básicas
  average_compliance: number;
  days_analyzed: number;
  days_with_data: number;
  days_without_data: number;

  // Análisis detallados
  tracking_summary: TrackingSummary;
  nutrient_variety: NutrientVariety;
  inflammatory_summary: InflammatorySummary;
  nutrient_trends: NutrientTrends;
  meal_analysis: MealAnalysisBySlot;
  health_monitoring: HealthMonitoring;
  ingredient_consumption: IngredientConsumption;
}

// ═══════════════════════════════════════════════════════════
// PERIOD SUMMARY
// ═══════════════════════════════════════════════════════════

export interface PeriodSummary {
  analysis: PeriodAnalysisData;
}

// ═══════════════════════════════════════════════════════════
// BULK COMPLIANCE RESPONSE (MAIN INTERFACE)
// ═══════════════════════════════════════════════════════════

export interface BulkComplianceResponse {
  /**
   * Información del customer desde Medical API
   */
  customer_info: CustomerInfo;

  /**
   * Información del periodo consultado
   */
  period: PeriodInfo;

  /**
   * Resultados del orquestador por día (análisis completo)
   */
  days: DayAnalysisResponse[];

  /**
   * Resumen nutricional del periodo
   */
  period_summary: PeriodSummary;

  /**
   * Días procesados exitosamente
   */
  successful_days: number;

  /**
   * Días con errores
   */
  failed_days: number;

  /**
   * Errores por día
   */
  errors: DayError[];
}