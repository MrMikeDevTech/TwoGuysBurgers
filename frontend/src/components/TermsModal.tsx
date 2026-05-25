import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";

export const TermsModal = () => {
    const [accepted, setAccepted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener("open-terms-modal", handleOpen);
        return () => window.removeEventListener("open-terms-modal", handleOpen);
    }, []);

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleAccept = () => {
        window.location.href = "/api/auth/signin";
    };

    return (
        <div
            id="terms-modal"
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            style={{ display: isOpen ? "flex" : "none" }}
        >
            <div className="bg-brand-black border-brand-yellow w-full max-w-lg border-4 p-8 shadow-[12px_12px_0_#000]">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="font-bebas text-brand-yellow text-3xl tracking-widest">TÉRMINOS Y CONDICIONES</h2>
                    <button onClick={handleClose} className="text-brand-cream hover:text-brand-red transition-colors">
                        <X size={32} />
                    </button>
                </div>

                <p className="font-vt text-brand-cream mb-6 text-xl leading-relaxed">
                    Para continuar con el inicio de sesión, debes leer y aceptar nuestros{" "}
                    <a href="/tyc" className="text-brand-red hover:text-brand-yellow underline">
                        términos y condiciones
                    </a>{" "}
                    de servicio.
                </p>

                <label className="mb-8 flex cursor-pointer items-center gap-3">
                    <div
                        className={`border-brand-yellow flex h-8 w-8 items-center justify-center border-4 ${accepted ? "bg-brand-yellow" : "bg-transparent"}`}
                        onClick={() => setAccepted(!accepted)}
                    >
                        {accepted && <Check className="text-brand-black" />}
                    </div>
                    <span className="font-bebas text-brand-cream text-2xl">ACEPTO LOS TÉRMINOS</span>
                </label>

                <button
                    onClick={handleAccept}
                    disabled={!accepted}
                    className="font-bebas bg-brand-yellow text-brand-black border-brand-black hover:bg-brand-teal w-full border-4 py-4 text-3xl transition-all disabled:cursor-not-allowed disabled:opacity-50"
                >
                    CONTINUAR
                </button>
            </div>
        </div>
    );
};
