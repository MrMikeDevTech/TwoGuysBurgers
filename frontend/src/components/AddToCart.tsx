import { useState } from "react";
import { addCartItem } from "@/store/cart";
import { toast } from "react-toastify";
import { Check } from "lucide-react";

interface Props {
    id: string;
    name: string;
    price: number;
    img: string;
    type?: "recipe" | "combo";
    recipes?: { recipe_id: string; amount: number }[];
}

export const AddToCart = ({ id, name, price, img, type = "recipe", recipes }: Props) => {
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);

    const handleAdd = () => {
        addCartItem({ id, name, price, img, type, recipes }, quantity);

        toast.success(
            <div className="flex flex-col gap-1">
                <span className="font-bebas text-xl">¡AGREGADO CON ÉXITO!</span>
                <span className="font-vt text-lg">
                    {quantity}x {name}
                </span>
            </div>,
            {
                position: "bottom-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                className:
                    "bg-brand-black border-brand-yellow border-4 text-brand-yellow font-vt shadow-[4px_4px_0_#E8192C]",
                progressClassName: "bg-brand-red"
            }
        );

        setIsAdded(true);
        setTimeout(() => {
            setIsAdded(false);
        }, 2000);
    };

    return (
        <div className="mt-8 flex flex-col items-end gap-6 sm:flex-row">
            <div className="flex flex-col">
                <label htmlFor="quantity" className="font-bebas text-brand-black mb-2 text-2xl tracking-wider">
                    CANTIDAD
                </label>
                <div
                    className="border-brand-black flex h-16 items-center border-4 bg-white"
                    style={{ boxShadow: "4px 4px 0 #E8192C" }}
                >
                    <button
                        type="button"
                        className="text-brand-black hover:bg-brand-yellow font-bebas flex h-full items-center justify-center px-5 text-3xl transition-colors disabled:opacity-50"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={isAdded}
                    >
                        -
                    </button>
                    <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={quantity}
                        readOnly
                        className="font-vt text-brand-black m-0 h-full w-20 bg-transparent p-0 text-center text-4xl focus:outline-none"
                    />
                    <button
                        type="button"
                        className="text-brand-black hover:bg-brand-yellow font-bebas flex h-full items-center justify-center px-5 text-3xl transition-colors disabled:opacity-50"
                        onClick={() => setQuantity(Math.min(99, quantity + 1))}
                        disabled={isAdded}
                    >
                        +
                    </button>
                </div>
            </div>

            <button
                type="button"
                onClick={handleAdd}
                disabled={isAdded}
                className={`font-bebas border-brand-black flex h-16 w-full items-center justify-center border-4 px-8 text-4xl tracking-wider text-white transition-all sm:w-auto ${
                    isAdded
                        ? "scale-95 bg-green-500"
                        : "bg-brand-red hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0"
                }`}
                style={{ boxShadow: isAdded ? "0px 0px 0 #000" : "6px 6px 0 #0A0A0A" }}
            >
                {isAdded ? <Check size={40} strokeWidth={4} /> : "AGREGAR"}
            </button>
        </div>
    );
};
