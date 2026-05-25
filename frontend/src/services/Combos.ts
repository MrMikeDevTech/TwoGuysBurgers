import type { Combo, CreateComboDTO, UpdateComboDTO } from "@/models/combo";

const API_URL = import.meta.env.PUBLIC_API_URL || "https://api.guysburger.shop";

export const getCombos = async (token: string): Promise<Combo[]> => {
    try {
        const response = await fetch(`${API_URL}/combos`, {
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
        console.error("Error fetching combos:", error);
        return [];
    }
};

export const getCombo = async (id: string, token: string): Promise<Combo | null> => {
    try {
        const response = await fetch(`${API_URL}/combos/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) return null;

        return await response.json();
    } catch (error) {
        console.error("Error fetching combo:", error);
        return null;
    }
};

export const createCombo = async (combo: CreateComboDTO, token: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/combos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(combo)
        });

        return response.ok;
    } catch (error) {
        console.error("Error creating combo:", error);
        return false;
    }
};

export const updateCombo = async (id: string, combo: UpdateComboDTO, token: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/combos/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(combo)
        });

        return response.ok;
    } catch (error) {
        console.error("Error updating combo:", error);
        return false;
    }
};

export const deleteCombo = async (id: string, token: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/combos/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        return response.ok;
    } catch (error) {
        console.error("Error deleting combo:", error);
        return false;
    }
};
