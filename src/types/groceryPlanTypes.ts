export interface GroceryPlanItem {
  food_id: number;
  food_name: string;
  daily_grams: number;
  raw_equivalent_factor: number;
  proteins_g: number;
  carbs_g: number;
  fats_g: number;
  fiber_g: number;
  sugars_g: number;
}

export interface GroceryPlanItemWithCalc extends GroceryPlanItem {
  /** How many days this specific food is consumed (may differ from plan days_count) */
  item_days: number;
  /** daily_grams × raw_equivalent_factor × item_days */
  raw_grams_total: number;
  /** (daily_grams/100) × proteins_g × item_days */
  protein_contribution: number;
  carbs_contribution: number;
  fat_contribution: number;
  fiber_contribution: number;
  sugar_contribution: number;
}

export interface GroceryPlanCreate {
  name: string;
  days_count: number;
  notes?: string;
  items: GroceryPlanItem[];
}

export interface GroceryPlanResponse {
  id: number;
  customer_id: string;
  medico_id?: string;
  name: string;
  days_count: number;
  notes?: string;
  items: GroceryPlanItem[];
  created_at: string;
}

export interface GroceryPlanSummaryResponse {
  id: number;
  name: string;
  days_count: number;
  customer_id: string;
  medico_id?: string;
  created_at: string;
  items_count: number;
}

export interface RegisterPurchaseItem {
  food_id: number;
  food_name: string;
  quantity_raw_g: number;
  price_paid: number;
  price_unit_weight: number;
}

export interface MacroTargets {
  proteins_g: number;
  carbs_g: number;
  fats_g: number;
  fiber_g: number;
  sugars_g: number;
}
