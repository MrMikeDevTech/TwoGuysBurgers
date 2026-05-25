export interface Ingredient {
    id: string;
    name: string;
    stock: number;
    unit: string;
    unit_price: number;
    image_url: string;
}

export type CreateIngredientDTO = Omit<Ingredient, "id">;
