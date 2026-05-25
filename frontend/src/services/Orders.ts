import type { Order, CreateOrderDTO } from "@/models/order";

const API_URL = import.meta.env.PUBLIC_API_URL || "https://api.guysburger.shop";

export const getOrders = async (token: string): Promise<Order[]> => {
    try {
        const response = await fetch(`${API_URL}/orders`, {
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
        console.error("Error fetching orders:", error);
        return [];
    }
};

export const createOrder = async (order: CreateOrderDTO, token?: string): Promise<Order | null> => {
    try {
        const headers: Record<string, string> = {
            "Content-Type": "application/json"
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/orders`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                customer_name: order.customer_name,
                recipes: order.recipe_orders
            })
        });

        if (!response.ok) return null;

        return await response.json();
    } catch (error) {
        console.error("Error creating order:", error);
        return null;
    }
};

export const updateOrderStatus = async (id: string, status: string, token: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/orders/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });

        return response.ok;
    } catch (error) {
        console.error("Error updating order status:", error);
        return false;
    }
};
