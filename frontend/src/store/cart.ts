import { map } from "nanostores";

export interface CartItem {
    id: string; // This is the ID of the product added (Recipe or Combo)
    name: string;
    price: number;
    img: string;
    quantity: number;
    type: "recipe" | "combo";
    recipes?: { recipe_id: string; amount: number }[]; // For combos, store constituent recipes
}

export const cartItems = map<Record<string, CartItem>>({});

export function addCartItem(item: Omit<CartItem, "quantity">, quantity: number = 1) {
    const existingItem = cartItems.get()[item.id];
    if (existingItem) {
        cartItems.setKey(item.id, {
            ...existingItem,
            quantity: existingItem.quantity + quantity
        });
    } else {
        cartItems.setKey(item.id, { ...item, quantity });
    }
}

export function removeCartItem(id: string) {
    const newCart = { ...cartItems.get() };
    delete newCart[id];
    cartItems.set(newCart);
}

export function updateQuantity(id: string, quantity: number) {
    if (quantity <= 0) {
        removeCartItem(id);
        return;
    }
    cartItems.setKey(id, {
        ...cartItems.get()[id],
        quantity
    });
}

export function clearCart() {
    cartItems.set({});
}

if (typeof window !== "undefined") {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
        try {
            cartItems.set(JSON.parse(savedCart));
        } catch (e) {
            console.error("Failed to parse cart from localStorage", e);
        }
    }

    cartItems.listen((cart) => {
        localStorage.setItem("cart", JSON.stringify(cart));
    });
}
