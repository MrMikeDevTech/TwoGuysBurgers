export interface ComboRecipeAmount {
    recipe_id: string;
    amount: number;
}

export interface Combo {
    id: string;
    name: string;
    description: string;
    price: number;
    recipes: ComboRecipeAmount[];
    image_url: string;
}

export type CreateComboDTO = Omit<Combo, "id">;

export type UpdateComboDTO = Partial<Omit<Combo, "id">>;
