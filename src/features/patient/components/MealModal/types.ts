export interface IngredientInput {
  id?: number;
  food_id: number;
  food_name: string;
  quantity: number;
  unit: string;
  notes?: string | null;
  _isNew?: boolean;
  _deleted?: boolean;
}
