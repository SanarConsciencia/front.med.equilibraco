import React, { useMemo, useCallback } from "react";
import { useMedicoMealsModalStore } from "../../../stores/useMedicoMealsModalStore";
import { usePatientDayStore } from "../../../stores/patientDayStore";
import { MealModal } from "../../../features/patient/components/MealModal";

export const GlobalMealModal: React.FC = () => {
  const activeMealId = useMedicoMealsModalStore((s) => s.activeMealId);
  const patientUuid = useMedicoMealsModalStore((s) => s.patientUuid);
  const date = useMedicoMealsModalStore((s) => s.date);
  const closeMeal = useMedicoMealsModalStore((s) => s.closeMeal);

  const dayKey = useMemo(
    () => (patientUuid && date ? `${patientUuid}-${date}` : ""),
    [patientUuid, date],
  );

  const dayData = usePatientDayStore((s) =>
    dayKey ? s.getDayByKey(dayKey) : undefined,
  );

  const selectedMeal = useMemo(() => {
    if (activeMealId === null || !dayData) return null;
    return dayData.day.meals?.find((m) => m.id === activeMealId) ?? null;
  }, [activeMealId, dayData]);

  const handleSave = useCallback(async () => {
    if (!patientUuid || !date) return;
    await usePatientDayStore.getState().loadDay(patientUuid, date);
  }, [patientUuid, date]);

  if (!selectedMeal || !patientUuid || !date) return null;

  return (
    <MealModal
      isOpen={true}
      meal={selectedMeal}
      patientUuid={patientUuid}
      date={date}
      onClose={closeMeal}
      onSave={handleSave}
    />
  );
};
