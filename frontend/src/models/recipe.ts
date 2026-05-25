export type RecipeKind = "product" | "consumable";

export interface IngredientAmount {
    ingredient_id: string;
    amount: number;
}

export interface Recipe {
    id: string;
    name: string;
    description: string;
    price: number;
    ingredients: IngredientAmount[];
    image_url: string;
    kind: RecipeKind;
}

export type CreateRecipeDTO = Omit<Recipe, "id">;

export type UpdateRecipeDTO = Partial<Omit<Recipe, "id">>;
