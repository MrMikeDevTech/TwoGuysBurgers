export type OrderStatus = "pending" | "in_progress" | "done";

export interface RecipeOrder {
    recipe_id: string;
    amount: number;
}

export interface Order {
    id: string;
    customer_name: string;
    status: OrderStatus;
    total_price: number;
    recipe_orders: RecipeOrder[];
    date: string;
}

export type CreateOrderDTO = Omit<Order, "id" | "date" | "status">;
