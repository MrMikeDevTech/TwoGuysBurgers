import type { Recipe, CreateRecipeDTO, UpdateRecipeDTO } from "@/models/recipe";

const API_URL = import.meta.env.PUBLIC_API_URL || "https://api.guysburger.shop";

export const getRecipes = async (token: string): Promise<Recipe[]> => {
    try {
        const response = await fetch(`${API_URL}/recipes`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) return [];

        const data = await response.json();
        return data || [];
    } catch (error) {
        console.error("Error fetching recipes:", error);
        return [];
    }
};

export const getRecipe = async (id: string, token: string): Promise<Recipe | null> => {
    try {
        const response = await fetch(`${API_URL}/recipes/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) return null;

        return await response.json();
    } catch (error) {
        console.error("Error fetching recipe:", error);
        return null;
    }
};

export const createRecipe = async (recipe: CreateRecipeDTO, token: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/recipes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(recipe)
        });

        return response.ok;
    } catch (error) {
        console.error("Error creating recipe:", error);
        return false;
    }
};

export const updateRecipe = async (id: string, recipe: UpdateRecipeDTO, token: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/recipes/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(recipe)
        });

        return response.ok;
    } catch (error) {
        console.error("Error updating recipe:", error);
        return false;
    }
};

export const deleteRecipe = async (id: string, token: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/recipes/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        return response.ok;
    } catch (error) {
        console.error("Error deleting recipe:", error);
        return false;
    }
};
