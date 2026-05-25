import { useState } from "react";
import { addAdmin, removeAdmin } from "@/services/Auth";
import { toast } from "sonner";
import { UserPlus, UserMinus, Mail } from "lucide-react";

interface AdminActionsProps {
    token: string;
}

export const AdminActions = ({ token }: AdminActionsProps) => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleAdd = async () => {
        if (!email || !email.includes("@")) {
            toast.error("Por favor, ingresa un correo válido");
            return;
        }

        setIsLoading(true);
        const success = await addAdmin(email, token);
        setIsLoading(false);

        if (success) {
            toast.success(`Usuario ${email} añadido como administrador`);
            setEmail("");
        } else {
            toast.error("Error al añadir administrador. ¿Ya existe?");
        }
    };

    const handleRemove = async () => {
        if (!email || !email.includes("@")) {
            toast.error("Por favor, ingresa un correo válido");
            return;
        }

        setIsLoading(true);
        const success = await removeAdmin(email, token);
        setIsLoading(false);

        if (success) {
            toast.success(`Usuario ${email} removido de administradores`);
            setEmail("");
        } else {
            toast.error("Error al remover administrador. ¿Existe?");
        }
    };

    return (
        <div className="bg-brand-black border-brand-yellow max-w-3xl border-4 p-8 shadow-[12px_12px_0_#e8192c]">
            <h2 className="font-bebas text-brand-yellow mb-6 flex items-center gap-3 text-4xl">
                <Mail className="text-brand-red h-8 w-8" />
                GESTIÓN DE ACCESOS
            </h2>

            <p className="font-vt text-brand-cream/80 mb-8 text-xl leading-tight">
                Ingresa el correo electrónico del usuario de Google para otorgar o revocar permisos de administración en
                el sistema.
            </p>

            <div className="flex flex-col gap-6">
                <div className="relative">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ejemplo@alumnos.udg.mx"
                        className="bg-brand-black border-brand-cream font-vt text-brand-yellow placeholder:text-brand-cream/30 focus:border-brand-yellow w-full border-4 p-4 text-2xl transition-colors focus:outline-none"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <button
                        onClick={handleAdd}
                        disabled={isLoading}
                        className="font-bebas bg-brand-yellow text-brand-black hover:bg-brand-teal group flex items-center justify-center gap-3 px-6 py-4 text-2xl shadow-[6px_6px_0_#000] transition-all disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <UserPlus className="h-6 w-6 transition-transform group-hover:scale-110" />
                        AÑADIR ADMIN
                    </button>

                    <button
                        onClick={handleRemove}
                        disabled={isLoading}
                        className="font-bebas bg-brand-red text-brand-cream group flex items-center justify-center gap-3 px-6 py-4 text-2xl shadow-[6px_6px_0_#000] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <UserMinus className="h-6 w-6 transition-transform group-hover:scale-110" />
                        REMOVER ADMIN
                    </button>
                </div>
            </div>

            {isLoading && (
                <div className="font-vt text-brand-yellow mt-6 animate-pulse text-center text-xl">
                    PROCESANDO SOLICITUD...
                </div>
            )}
        </div>
    );
};
