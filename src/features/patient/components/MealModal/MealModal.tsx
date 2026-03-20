import React from "react";
import type { SerializedMeal } from "../../../../types/medicalApiTypes";
import { useMealModal } from "./hooks/useMealModal";
import { MealSheetPanel } from "./components/MealSheetPanel";
import { FoodResultsModal } from "./components/FoodResultsModal";
import { IngredientModal } from "./components/IngredientModal";
import { MealTemplatesModal } from "./components/MealTemplatesModal";
import { UnsavedDialog } from "./components/UnsavedDialog";

interface MealModalProps {
  isOpen: boolean;
  meal: SerializedMeal;
  patientUuid: string;
  date: string;
  onClose: () => void;
  onSave?: () => Promise<void>;
}

export const MealModal: React.FC<MealModalProps> = ({
  isOpen,
  meal,
  patientUuid,
  date,
  onClose,
  onSave,
}) => {
  const {
    visibleIngredients,
    pendingNutrition,
    dayBase,
    dayTargets,
    searchResults,
    suggestions,
    searchQuery,
    setSearchQuery,
    showFoodSearch,
    setShowFoodSearch,
    ingredientModalFood,
    editingIngredient,
    showTemplatesModal,
    setShowTemplatesModal,
    showUnsavedDialog,
    hasChanges,
    saving,
    error,
    handleDeleteIngredient,
    handleEditClick,
    handleSelectFromSearch,
    handleSaveIngredient,
    handleCloseIngredientModal,
    handleLoadTemplate,
    handleSuggestionClick,
    handleSave,
    handleClose,
    handleConfirmClose,
    handleCancelClose,
  } = useMealModal(meal, patientUuid, date, isOpen, onClose, onSave);

  return (
    <>
      {/* Main bottom sheet */}
      <MealSheetPanel
        isOpen={isOpen}
        onClose={handleClose}
        meal={meal}
        ingredients={visibleIngredients}
        pendingNutrition={pendingNutrition}
        dayBase={dayBase}
        dayTargets={dayTargets}
        suggestions={suggestions}
        onSuggestionClick={handleSuggestionClick}
        onEditIngredient={handleEditClick}
        onDeleteIngredient={handleDeleteIngredient}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onOpenSearch={() => setShowFoodSearch(true)}
        hasChanges={hasChanges}
        saving={saving}
        error={error}
        onSave={handleSave}
        onLoadTemplate={() => setShowTemplatesModal(true)}
      />

      {/* Food search modal */}
      <FoodResultsModal
        isOpen={showFoodSearch}
        onClose={() => {
          setShowFoodSearch(false);
          setSearchQuery("");
        }}
        query={searchQuery}
        onQueryChange={setSearchQuery}
        results={searchResults}
        onSelect={handleSelectFromSearch}
      />

      {/* Ingredient quantity editor */}
      {ingredientModalFood && (
        <IngredientModal
          isOpen={true}
          onClose={handleCloseIngredientModal}
          food={ingredientModalFood}
          patientUuid={patientUuid}
          initialQuantity={editingIngredient?.quantity}
          onSave={handleSaveIngredient}
        />
      )}

      {/* Meal templates picker */}
      <MealTemplatesModal
        isOpen={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        patientUuid={patientUuid}
        onLoadTemplate={handleLoadTemplate}
      />

      {/* Unsaved changes confirmation */}
      <UnsavedDialog
        isOpen={showUnsavedDialog}
        onConfirm={handleConfirmClose}
        onCancel={handleCancelClose}
      />
    </>
  );
};
