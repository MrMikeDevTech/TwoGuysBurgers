const API_URL = import.meta.env.PUBLIC_API_URL || "https://api.guysburger.shop/";

export const isAdmin = async (token: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/auth/is-admin`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) return false;

        const data = await response.json();

        return typeof data.is_admin === "boolean" ? data.is_admin : false;
    } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
    }
};

export const addAdmin = async (email: string, token: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/auth/admins/${email}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        return response.ok;
    } catch (error) {
        console.error("Error adding admin:", error);
        return false;
    }
};

export const removeAdmin = async (email: string, token: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/auth/admins/${email}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        return response.ok;
    } catch (error) {
        console.error("Error removing admin:", error);
        return false;
    }
};

export const getAdmins = async (token: string): Promise<{ id: string; email: string }[]> => {
    try {
        const response = await fetch(`${API_URL}/auth/admins`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) return [];

        return await response.json();
    } catch (error) {
        console.error("Error fetching admins:", error);
        return [];
    }
};
