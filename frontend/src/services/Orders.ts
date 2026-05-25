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

export const createOrder = async (order: CreateOrderDTO): Promise<Order | null> => {
    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                customer_name: order.customer_name,
                total_price: order.total_price,
                recipe_orders: order.recipe_orders,
                status: "pending"
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
