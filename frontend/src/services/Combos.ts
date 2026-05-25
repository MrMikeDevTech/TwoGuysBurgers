import type { Combo, CreateComboDTO, UpdateComboDTO } from "../models/combo";

const API_URL = import.meta.env.PUBLIC_API_URL;

export const getCombos = async (token?: string): Promise<Combo[]> => {
    const headers: HeadersInit = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_URL}/combos`, { headers });
        if (!response.ok) throw new Error("Error fetching combos");
        return await response.json();
    } catch (error) {
        console.error("Error fetching combos:", error);
        return [];
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
                Authorization: `Bearer ${token}`
            }
        });
        return response.ok;
    } catch (error) {
        console.error("Error deleting combo:", error);
        return false;
    }
};
