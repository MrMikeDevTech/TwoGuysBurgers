import type { Ingredient, CreateIngredientDTO } from "@/models/ingredient";

const API_URL = import.meta.env.PUBLIC_API_URL || "https://api.guysburger.shop";

export const getIngredients = async (token: string): Promise<Ingredient[]> => {
    try {
        const response = await fetch(`${API_URL}/ingredients`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) return [];

        return await response.json();
    } catch (error) {
        console.error("Error fetching ingredients:", error);
        return [];
    }
};

export const getIngredient = async (id: string, token: string): Promise<Ingredient | null> => {
    try {
        const response = await fetch(`${API_URL}/ingredients/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) return null;

        return await response.json();
    } catch (error) {
        console.error("Error fetching ingredient:", error);
        return null;
    }
};

export const createIngredient = async (ingredient: CreateIngredientDTO, token: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/ingredients`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                name: ingredient.name,
                stock: ingredient.stock,
                unit: ingredient.unit,
                unit_price: ingredient.unit_price,
                image_url: ingredient.image_url
            })
        });

        return response.ok;
    } catch (error) {
        console.error("Error creating ingredient:", error);
        return false;
    }
};

export const updateIngredient = async (
    id: string,
    ingredient: CreateIngredientDTO,
    token: string
): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/ingredients/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                name: ingredient.name,
                stock: ingredient.stock,
                unit: ingredient.unit,
                unit_price: ingredient.unit_price,
                image_url: ingredient.image_url
            })
        });

        return response.ok;
    } catch (error) {
        console.error("Error updating ingredient:", error);
        return false;
    }
};

export const deleteIngredient = async (id: string, token: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/ingredients/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        return response.ok;
    } catch (error) {
        console.error("Error deleting ingredient:", error);
        return false;
    }
};
