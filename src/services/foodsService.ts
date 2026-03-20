import { authFetchJson, authFetch } from "./apiConfig";
import type { CustomerFood } from "../types/intakeCrudTypes";

const BASE =
  (import.meta.env.VITE_ALIMENTO_API_URL as string | undefined) ??
  "https://api.alimentos.equilibraco.com";

export const getPatientFoods = async (
  patientUuid: string,
): Promise<CustomerFood[]> => {
  const params = new URLSearchParams({
    customer_id: patientUuid,
    limit: "500",
  });
  const res = await authFetchJson<{ data: any[] } | any[]>(
    `${BASE}/api/v1/customer-foods?${params}`,
  );
  const rawData = Array.isArray(res) ? res : (res.data ?? []);

  return rawData.map((f: any) => ({
    food_id: f.food_id ?? f.id,
    food_name: f.food_name ?? f.name,
    serving_size: f.standard_serving_size ?? f.serving_size,
    serving_unit: f.serving_unit,
    custom_serving_size: f.custom_serving_size,
    custom_serving_unit: f.custom_serving_unit,
    proteins_g: f.proteins_g,
    carbs_g: f.carbs_g,
    fats_g: f.fats_g,
    fiber_g: f.fiber_g,
    sugars_g: f.sugars_g,
    kcal: f.calories ?? f.kcal,
  }));
};

export const adjustServing = async (
  patientUuid: string,
  foodId: number,
  servingSize: number,
  servingUnit: string,
): Promise<void> => {
  const res = await authFetch(`${BASE}/api/v1/customer-serving-sizes`, {
    method: "POST",
    body: JSON.stringify({
      customer_id: patientUuid,
      food_id: foodId,
      serving_size: servingSize,
      serving_unit: servingUnit,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Error ajustando porción: ${res.status} ${text}`);
  }
};
