import { useEffect } from "react";
import { useAppStore } from "../stores/appStore";
import { usePatientDayStore } from "../stores/patientDayStore";
import { usePatientFoodsStore } from "../stores/patientFoodsStore";

/**
 * Initializes all patient data in parallel when patientUuid + date change.
 * Call this at the top of PatientDayPage.
 */
export function usePatientData(
  patientUuid: string | undefined,
  date: string | undefined,
): void {
  const doctorId = useAppStore((s) => s.user?.id);
  const loadDay = usePatientDayStore((s) => s.loadDay);
  const loadFoods = usePatientFoodsStore((s) => s.loadFoods);

  useEffect(() => {
    if (!patientUuid || !date || !doctorId) return;

    Promise.all([
      loadDay(patientUuid, date).catch(console.error),
      loadFoods(patientUuid).catch(console.error),
    ]);
  }, [patientUuid, date, doctorId, loadDay, loadFoods]);
}
