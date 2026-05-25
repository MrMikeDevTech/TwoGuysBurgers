import { useState } from "react";
import { useStore } from "@nanostores/react";
import { cartItems, removeCartItem, updateQuantity, clearCart } from "@/store/cart";
import { ShoppingCart, X, Plus, Minus, Trash2, Check } from "lucide-react";
import { toast } from "react-toastify";

import { createOrder } from "@/services/Orders";
import type { RecipeOrder } from "@/models/order";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export const Cart = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [checkoutProgress, setCheckoutProgress] = useState(0);
    const [isCheckoutDone, setIsCheckoutDone] = useState(false);

    const $cartItems = useStore(cartItems);
    const items = Object.values($cartItems);

    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const handleCheckout = async () => {
        if (items.length === 0) return;

        setIsCheckingOut(true);
        setCheckoutProgress(0);

        const supabase = createBrowserSupabaseClient();
        const {
            data: { session }
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        const customerName = session?.user?.user_metadata?.full_name || session?.user?.email || "Cliente Web";

        const recipeOrders: RecipeOrder[] = [];

        items.forEach((item) => {
            if (item.type === "recipe") {
                recipeOrders.push({
                    recipe_id: item.id,
                    amount: item.quantity
                });
            } else if (item.type === "combo" && item.recipes) {
                item.recipes.forEach((r) => {
                    const existing = recipeOrders.find((ro) => ro.recipe_id === r.recipe_id);
                    if (existing) {
                        existing.amount += r.amount * item.quantity;
                    } else {
                        recipeOrders.push({
                            recipe_id: r.recipe_id,
                            amount: r.amount * item.quantity
                        });
                    }
                });
            }
        });

        const orderData = {
            customer_name: customerName,
            total_price: totalPrice,
            recipe_orders: recipeOrders
        };

        const interval = setInterval(() => {
            setCheckoutProgress((prev) => (prev >= 90 ? 90 : prev + 10));
        }, 100);

        try {
            const order = await createOrder(orderData, token);
            clearInterval(interval);
            setCheckoutProgress(100);

            if (order) {
                setIsCheckoutDone(true);
                toast.success("¡Pedido realizado con éxito!");

                sessionStorage.setItem(
                    "last_order",
                    JSON.stringify({
                        ...order,
                        items: items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price }))
                    })
                );

                setTimeout(() => {
                    clearCart();
                    window.location.href = "/checkout";
                }, 1000);
            } else {
                setIsCheckingOut(false);
                toast.error("Error al procesar el pedido");
            }
        } catch (error) {
            console.error("Error creating order:", error);
            clearInterval(interval);
            setIsCheckingOut(false);
            toast.error("Error al conectar con el servidor");
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(true)}
                className="text-brand-yellow relative p-2 transition-colors hover:text-white"
            >
                <ShoppingCart size={28} />
                {totalItems > 0 && (
                    <span className="bg-brand-red border-brand-black absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 text-[10px] font-bold text-white">
                        {totalItems}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
            )}

            <div
                className={`bg-brand-cream fixed top-0 right-0 z-60 h-full w-full max-w-md transform shadow-2xl transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"} border-brand-black flex flex-col border-l-4`}
            >
                <div className="border-brand-black bg-brand-yellow flex items-center justify-between border-b-4 p-6">
                    <h2 className="font-bebas text-brand-black text-3xl tracking-wider">Tu Carrito</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-brand-black transition-transform hover:rotate-90"
                    >
                        <X size={32} />
                    </button>
                </div>

                <div className="grow space-y-6 overflow-y-auto p-6">
                    {items.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-center">
                            <ShoppingCart size={64} className="text-brand-black/20 mb-4" />
                            <p className="font-vt text-brand-black/60 text-2xl">Tu carrito está vacío</p>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="font-bebas bg-brand-red border-brand-black mt-6 border-4 px-6 py-2 text-xl text-white shadow-[4px_4px_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                            >
                                Seguir comprando
                            </button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div
                                key={item.id}
                                className="border-brand-black flex gap-4 border-4 bg-white p-3 shadow-[6px_6px_0_#000]"
                            >
                                <img
                                    src={item.img}
                                    alt={item.name}
                                    className="border-brand-black h-20 w-20 border-2 object-cover"
                                />
                                <div className="grow">
                                    <div className="flex items-start justify-between">
                                        <h3 className="font-bebas text-brand-black mb-1 text-xl leading-none">
                                            {item.name}
                                        </h3>
                                        {!isCheckingOut && (
                                            <button
                                                onClick={() => removeCartItem(item.id)}
                                                className="text-brand-red transition-transform hover:scale-110"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                    <p className="font-vt text-brand-black/70 mb-2 text-lg">${item.price}</p>
                                    <div className="flex items-center gap-3">
                                        <div className="border-brand-black bg-brand-cream flex items-center border-2">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                disabled={isCheckingOut}
                                                className="hover:bg-brand-yellow border-brand-black border-r-2 px-2 py-1 transition-colors disabled:opacity-50"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="font-vt px-4 text-lg">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                disabled={isCheckingOut}
                                                className="hover:bg-brand-yellow border-brand-black border-l-2 px-2 py-1 transition-colors disabled:opacity-50"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <span className="font-vt ml-auto text-xl font-bold">
                                            ${item.price * item.quantity}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="border-brand-black border-t-4 bg-white p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <span className="font-bebas text-brand-black text-2xl">Total</span>
                            <span
                                className="font-bebas text-brand-red text-4xl"
                                style={{ textShadow: "2px 2px 0 #000" }}
                            >
                                ${totalPrice}
                            </span>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isCheckingOut}
                            className={`font-bebas border-brand-black relative w-full overflow-hidden border-4 py-4 text-3xl tracking-widest transition-all ${
                                isCheckoutDone ? "bg-green-500 text-white" : "bg-brand-yellow text-brand-black"
                            } ${!isCheckingOut ? "shadow-[8px_8px_0_#E8192C] hover:translate-x-1 hover:translate-y-1 hover:shadow-none" : ""}`}
                        >
                            {isCheckingOut ? (
                                <>
                                    {!isCheckoutDone && (
                                        <div
                                            className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-100 ease-linear"
                                            style={{ width: `${checkoutProgress}%` }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {isCheckoutDone ? (
                                            <Check
                                                size={40}
                                                strokeWidth={4}
                                                className="animate-in zoom-in duration-300"
                                            />
                                        ) : (
                                            <span className={checkoutProgress > 50 ? "text-white" : "text-brand-black"}>
                                                PROCESANDO...
                                            </span>
                                        )}
                                    </span>
                                </>
                            ) : (
                                "FINALIZAR PEDIDO"
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
