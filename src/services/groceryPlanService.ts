import { authFetchJson, authFetch } from "./apiConfig";
import type {
  GroceryPlanCreate,
  GroceryPlanResponse,
  GroceryPlanSummaryResponse,
  GroceryPlanItem,
  RegisterPurchaseItem,
} from "../types/groceryPlanTypes";

const BASE =
  ((import.meta.env.VITE_ALIMENTO_API_URL as string | undefined) ??
    "https://api.alimentos.equilibraco.com") + "/api/v1/grocery-plans";

export const createPlan = async (
  customerUuid: string,
  medicoId: string,
  data: GroceryPlanCreate,
): Promise<GroceryPlanResponse> => {
  return authFetchJson<GroceryPlanResponse>(
    `${BASE}?customer_id=${encodeURIComponent(customerUuid)}&medico_id=${encodeURIComponent(medicoId)}`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
};

export const listPlans = async (
  customerUuid: string,
): Promise<GroceryPlanSummaryResponse[]> => {
  return authFetchJson<GroceryPlanSummaryResponse[]>(
    `${BASE}?customer_id=${encodeURIComponent(customerUuid)}`,
  );
};

export const getPlan = async (
  planId: number,
  customerUuid: string,
): Promise<GroceryPlanResponse> => {
  return authFetchJson<GroceryPlanResponse>(
    `${BASE}/${planId}?customer_id=${encodeURIComponent(customerUuid)}`,
  );
};

export const deletePlan = async (
  planId: number,
  customerUuid: string,
): Promise<void> => {
  const res = await authFetch(
    `${BASE}/${planId}?customer_id=${encodeURIComponent(customerUuid)}`,
    { method: "DELETE" },
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Error eliminando plan: ${res.status} ${text}`);
  }
};

export const replaceItems = async (
  planId: number,
  customerUuid: string,
  items: GroceryPlanItem[],
): Promise<GroceryPlanResponse> => {
  return authFetchJson<GroceryPlanResponse>(
    `${BASE}/${planId}/items?customer_id=${encodeURIComponent(customerUuid)}`,
    {
      method: "PUT",
      body: JSON.stringify(items),
    },
  );
};

export const registerPurchase = async (
  customerUuid: string,
  items: RegisterPurchaseItem[],
): Promise<{ updated_prices: number }> => {
  return authFetchJson<{ updated_prices: number }>(
    `${BASE}/register-purchase?customer_id=${encodeURIComponent(customerUuid)}`,
    {
      method: "POST",
      body: JSON.stringify(items),
    },
  );
};
