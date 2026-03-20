import { authFetchJson, authFetch } from "./apiConfig";
import type { DayAnalysisResponse } from "../types/medicalApiTypes";

const BASE =
  (import.meta.env.VITE_INTAKE_API_URL as string | undefined) ??
  "https://api.intake.equilibraco.com";

// ── Día enriquecido (signed URLs + media + day_feedback) ──────────────────────

export const getPatientDay = (
  doctorUuid: string,
  customerId: string,
  targetDate: string,
): Promise<DayAnalysisResponse> => {
  const params = new URLSearchParams({
    doctor_uuid: doctorUuid,
    customer_id: customerId,
    target_date: targetDate,
  });
  return authFetchJson<DayAnalysisResponse>(
    `${BASE}/api/v1/medical/day?${params}`,
  );
};

// ── Nota clínica en un plato ──────────────────────────────────────────────────

export const saveMealNote = async (
  mealIntakeId: number,
  doctorNote: string,
  doctorId: string,
): Promise<void> => {
  const res = await authFetch(
    `${BASE}/api/v1/media/meals/${mealIntakeId}/doctor-note`,
    {
      method: "PATCH",
      body: JSON.stringify({ doctor_note: doctorNote, doctor_id: doctorId }),
    },
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Error guardando nota: ${res.status} ${text}`);
  }
};

// ── Retroalimentación del día completo (crear o actualizar) ───────────────────

export const saveDayFeedback = async (
  dayIntakeId: number,
  medicoId: string,
  contenido: string,
  scoreGeneral?: number,
): Promise<void> => {
  const res = await authFetch(
    `${BASE}/api/v1/media/days/${dayIntakeId}/feedback`,
    {
      method: "POST",
      body: JSON.stringify({
        medico_id: medicoId,
        contenido,
        score_general: scoreGeneral ?? null,
      }),
    },
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Error guardando feedback: ${res.status} ${text}`);
  }
};
