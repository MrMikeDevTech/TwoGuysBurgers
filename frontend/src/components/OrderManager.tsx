import { useEffect, useState, useCallback } from "react";
import { getOrders, updateOrderStatus } from "@/services/Orders";
import { getRecipes } from "@/services/Recipes";
import type { Order, OrderStatus } from "@/models/order";
import type { Recipe } from "@/models/recipe";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Calendar, User, Package, Loader2, RefreshCw, Search, Filter } from "lucide-react";

interface OrderManagerProps {
    token: string;
}

export const OrderManager = ({ token }: OrderManagerProps) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [ordersData, recipesData] = await Promise.all([getOrders(token), getRecipes(token)]);
            const sortedOrders = ordersData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setOrders(sortedOrders);
            setRecipes(recipesData);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Error al cargar las órdenes");
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
        try {
            const success = await updateOrderStatus(orderId, newStatus, token);
            if (success) {
                toast.success(`Estado de orden actualizado a ${newStatus}`);
                fetchData();
            } else {
                toast.error("Error al actualizar el estado");
            }
        } catch {
            toast.error("Error en el servidor");
        }
    };

    const getRecipeName = (id: string) => {
        return recipes.find((r) => r.id === id)?.name || "Producto Desconocido";
    };

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case "pending":
                return "text-brand-red border-brand-red bg-brand-red/10";
            case "in_progress":
                return "text-brand-teal border-brand-teal bg-brand-teal/10";
            case "done":
                return "text-green-500 border-green-500 bg-green-500/10";
            default:
                return "text-brand-cream border-brand-cream";
        }
    };

    const filteredOrders = orders.filter((order) => {
        const matchesStatus = filterStatus === "all" || order.status === filterStatus;
        const matchesSearch =
            order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="flex flex-col gap-8">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={true}
                theme="dark"
                toastStyle={{
                    backgroundColor: "#0a0a0a",
                    border: "4px solid #ffd600",
                    borderRadius: "0px",
                    fontFamily: "'VT323', monospace",
                    fontSize: "1.25rem",
                    color: "#fff5dc",
                    boxShadow: "6px 6px 0 #e8192c"
                }}
            />

            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <h2 className="font-bebas text-brand-yellow text-5xl tracking-tight">GESTIÓN DE ÓRDENES</h2>
                <button
                    onClick={fetchData}
                    className="font-bebas bg-brand-teal text-brand-black hover:bg-brand-yellow flex items-center gap-2 px-6 py-3 text-2xl shadow-[6px_6px_0_#e8192c] transition-all"
                >
                    <RefreshCw className={`h-6 w-6 ${isLoading ? "animate-spin" : ""}`} />
                    ACTUALIZAR
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="bg-brand-black border-brand-cream relative border-4">
                    <Search className="text-brand-yellow absolute top-1/2 left-4 h-6 w-6 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente o ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="font-vt text-brand-yellow w-full bg-transparent py-4 pr-4 pl-14 text-2xl outline-none"
                    />
                </div>

                <div className="bg-brand-black border-brand-cream relative border-4">
                    <Filter className="text-brand-yellow absolute top-1/2 left-4 h-6 w-6 -translate-y-1/2" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="font-vt text-brand-yellow w-full cursor-pointer appearance-none bg-transparent py-4 pr-4 pl-14 text-2xl outline-none"
                    >
                        <option value="all">TODOS LOS ESTADOS</option>
                        <option value="pending">PENDIENTES</option>
                        <option value="in_progress">EN PREPARACIÓN</option>
                        <option value="done">COMPLETADOS</option>
                    </select>
                </div>

                <div className="bg-brand-black border-brand-teal flex items-center justify-center border-4 px-6 py-2">
                    <div className="flex flex-col items-center">
                        <span className="font-bebas text-brand-teal text-xl">TOTAL HOY</span>
                        <span className="font-bebas text-brand-yellow text-4xl">
                            ${orders.reduce((acc, o) => acc + o.total_price, 0).toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            {isLoading && orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="text-brand-yellow h-16 w-16 animate-spin" />
                    <p className="font-vt text-brand-yellow mt-4 text-2xl">CARGANDO ÓRDENES...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="bg-brand-black border-brand-cream flex flex-col items-center justify-center border-4 p-20 text-center">
                    <Package className="text-brand-cream/30 h-24 w-24" />
                    <p className="font-bebas text-brand-cream mt-6 text-4xl">NO SE ENCONTRARON ÓRDENES</p>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {filteredOrders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-brand-black border-brand-cream hover:border-brand-yellow relative border-4 p-6 shadow-[8px_8px_0_#000] transition-all"
                        >
                            <div className="mb-6 flex flex-col justify-between gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-center">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bebas text-brand-yellow text-3xl">
                                            ORDEN #{order.id.substring(order.id.length - 6).toUpperCase()}
                                        </span>
                                        <span
                                            className={`font-bebas border-2 px-3 py-0.5 text-lg uppercase ${getStatusColor(order.status)}`}
                                        >
                                            {/* eslint-disable indent */}
                                            {order.status === "pending"
                                                ? "PENDIENTE"
                                                : order.status === "in_progress"
                                                  ? "PREPARANDO"
                                                  : "COMPLETADA"}
                                            {/* eslint-enable indent */}
                                        </span>
                                    </div>
                                    <div className="font-vt text-brand-cream flex items-center gap-6 text-xl">
                                        <span className="flex items-center gap-2">
                                            <Calendar size={18} /> {new Date(order.date).toLocaleString()}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <User size={18} /> {order.customer_name}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={() => handleStatusUpdate(order.id, "pending")}
                                        className={`font-bebas border-2 px-4 py-2 text-xl transition-all ${order.status === "pending" ? "bg-brand-red border-brand-red text-white" : "text-brand-cream border-brand-cream hover:border-brand-red"}`}
                                    >
                                        PENDIENTE
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(order.id, "in_progress")}
                                        className={`font-bebas border-2 px-4 py-2 text-xl transition-all ${order.status === "in_progress" ? "bg-brand-teal text-brand-black border-brand-teal" : "text-brand-cream border-brand-cream hover:border-brand-teal"}`}
                                    >
                                        PREPARANDO
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(order.id, "done")}
                                        className={`font-bebas border-2 px-4 py-2 text-xl transition-all ${order.status === "done" ? "border-green-500 bg-green-500 text-white" : "text-brand-cream border-brand-cream hover:border-green-500"}`}
                                    >
                                        COMPLETAR
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                                <div>
                                    <h4 className="font-bebas text-brand-cream mb-4 text-2xl tracking-wider">
                                        PRODUCTOS
                                    </h4>
                                    <div className="flex flex-col gap-2">
                                        {order.recipe_orders.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between bg-white/5 p-3">
                                                <span className="font-vt text-brand-yellow text-2xl">
                                                    {item.amount}x {getRecipeName(item.recipe_id)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end justify-end">
                                    <div className="flex flex-col items-end">
                                        <span className="font-bebas text-brand-cream text-2xl">TOTAL DE LA ORDEN</span>
                                        <span
                                            className="font-bebas text-brand-yellow text-6xl"
                                            style={{ textShadow: "3px 3px 0 #E8192C" }}
                                        >
                                            ${order.total_price.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
