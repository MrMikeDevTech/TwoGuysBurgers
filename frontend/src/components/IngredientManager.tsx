import React, { useState, useEffect, useCallback } from "react";
import { getIngredients, createIngredient, updateIngredient, deleteIngredient } from "@/services/Ingredients";
import type { Ingredient, CreateIngredientDTO } from "@/models/ingredient";
import { ImageDropzone, type ImageDropzoneResult } from "@/components/ImageDropzone";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, Trash2, Package, Ruler, DollarSign, X, Loader2, Pencil } from "lucide-react";

interface IngredientManagerProps {
    token: string;
}

async function resolveImageUrl(image: ImageDropzoneResult, name: string): Promise<string | null> {
    if (!image) return null;

    if (image.type === "url") {
        return image.url;
    }

    const formData = new FormData();
    formData.append("file", image.file);
    formData.append("folder", "ingredients");
    formData.append("name", name);

    const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Error al subir la imagen");
    }

    const data = await response.json();
    return data.url;
}

interface IngredientFormFieldsProps {
    formData: Omit<CreateIngredientDTO, "image_url">;
    // eslint-disable-next-line no-unused-vars
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    imageResult: ImageDropzoneResult;
    // eslint-disable-next-line no-unused-vars
    onImageChange: (result: ImageDropzoneResult) => void;
    isSubmitting: boolean;
    submitLabel: string;
    submittingLabel: string;
    onCancel: () => void;
}

const IngredientFormFields = ({
    formData,
    onInputChange,
    imageResult,
    onImageChange,
    isSubmitting,
    submitLabel,
    submittingLabel,
    onCancel
}: IngredientFormFieldsProps) => (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <label className="font-bebas text-brand-cream text-2xl">NOMBRE DEL INGREDIENTE</label>
                <div className="relative">
                    <Package className="text-brand-yellow absolute top-1/2 left-4 h-6 w-6 -translate-y-1/2" />
                    <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={onInputChange}
                        placeholder="Ej. Carne de Res"
                        className="bg-brand-black border-brand-cream font-vt text-brand-yellow focus:border-brand-yellow w-full border-4 py-4 pr-4 pl-14 text-2xl outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="font-bebas text-brand-cream text-2xl">STOCK</label>
                    <input
                        type="number"
                        name="stock"
                        required
                        min="0"
                        value={formData.stock}
                        onChange={onInputChange}
                        className="bg-brand-black border-brand-cream font-vt text-brand-yellow focus:border-brand-yellow w-full border-4 p-4 text-2xl outline-none"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="font-bebas text-brand-cream text-2xl">UNIDAD</label>
                    <div className="relative">
                        <Ruler className="text-brand-yellow absolute top-1/2 left-4 h-6 w-6 -translate-y-1/2" />
                        <select
                            name="unit"
                            required
                            value={formData.unit}
                            onChange={onInputChange}
                            className="bg-brand-black border-brand-cream font-vt text-brand-yellow focus:border-brand-yellow w-full cursor-pointer appearance-none border-4 py-4 pr-4 pl-14 text-2xl outline-none"
                        >
                            <option value="kg">KILOGRAMOS (KG)</option>
                            <option value="g">GRAMOS (G)</option>
                            <option value="pz">PIEZAS (PZ)</option>
                            <option value="lt">LITROS (LT)</option>
                            <option value="ml">MILILITROS (ML)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="font-bebas text-brand-cream text-2xl">PRECIO POR UNIDAD</label>
                <div className="relative">
                    <DollarSign className="text-brand-yellow absolute top-1/2 left-4 h-6 w-6 -translate-y-1/2" />
                    <input
                        type="number"
                        name="unit_price"
                        required
                        step="0.01"
                        min="0"
                        value={formData.unit_price}
                        onChange={onInputChange}
                        placeholder="0.00"
                        className="bg-brand-black border-brand-cream font-vt text-brand-yellow focus:border-brand-yellow w-full border-4 py-4 pr-4 pl-14 text-2xl outline-none"
                    />
                </div>
            </div>
        </div>

        <div className="flex flex-col gap-6">
            <label className="font-bebas text-brand-cream text-2xl">IMAGEN DEL PRODUCTO</label>
            <ImageDropzone onChange={onImageChange} value={imageResult} />

            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="font-bebas bg-brand-black text-brand-cream border-brand-cream hover:border-brand-yellow hover:text-brand-yellow flex flex-1 cursor-pointer items-center justify-center gap-3 border-4 py-5 text-2xl transition-all"
                >
                    <X className="h-6 w-6" />
                    CANCELAR
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="font-bebas bg-brand-red text-brand-cream flex flex-2 cursor-pointer items-center justify-center gap-3 py-5 text-2xl shadow-[6px_6px_0_#000] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-7 w-7 animate-spin" />
                            {submittingLabel}
                        </>
                    ) : (
                        submitLabel
                    )}
                </button>
            </div>
        </div>
    </div>
);

export const IngredientManager = ({ token }: IngredientManagerProps) => {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState<Omit<CreateIngredientDTO, "image_url">>({
        name: "",
        stock: 0,
        unit: "kg",
        unit_price: 0
    });
    const [imageResult, setImageResult] = useState<ImageDropzoneResult>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

    const fetchIngredients = useCallback(async () => {
        setIsLoading(true);
        const data = await getIngredients(token);
        setIngredients(data);
        setIsLoading(false);
    }, [token]);

    useEffect(() => {
        fetchIngredients();
    }, [fetchIngredients]);

    const resetForm = () => {
        setFormData({ name: "", stock: 0, unit: "kg", unit_price: 0 });
        setImageResult(null);
        setExistingImageUrl(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "stock" || name === "unit_price" ? Number(value) : value
        }));
    };

    const handleOpenCreate = () => {
        setEditingId(null);
        resetForm();
        setShowForm(true);
    };

    const handleOpenEdit = (item: Ingredient) => {
        setShowForm(false);
        setEditingId(item.id);
        setFormData({
            name: item.name,
            stock: item.stock,
            unit: item.unit,
            unit_price: item.unit_price
        });
        setImageResult({ type: "url", url: item.image_url });
        setExistingImageUrl(item.image_url);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        resetForm();
    };

    const handleCancelCreate = () => {
        setShowForm(false);
        resetForm();
    };

    const handleSubmitCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!imageResult) {
            toast.error("Por favor, selecciona una imagen o pega una URL");
            return;
        }

        setIsSubmitting(true);

        try {
            const imageUrl = await resolveImageUrl(imageResult, formData.name);

            if (!imageUrl) {
                toast.error("Error al subir la imagen");
                setIsSubmitting(false);
                return;
            }

            const newIngredient: CreateIngredientDTO = {
                ...formData,
                image_url: imageUrl
            };

            const success = await createIngredient(newIngredient, token);

            if (success) {
                toast.success("Ingrediente añadido correctamente");
                setShowForm(false);
                resetForm();
                fetchIngredients();
            } else {
                toast.error("Error al guardar el ingrediente");
            }
        } catch (error) {
            console.error(error);
            toast.error("Ocurrió un error inesperado");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId) return;

        setIsSubmitting(true);

        try {
            let imageUrl: string | null;

            if (imageResult && imageResult.type === "url" && imageResult.url === existingImageUrl) {
                imageUrl = existingImageUrl;
            } else if (imageResult) {
                imageUrl = await resolveImageUrl(imageResult, formData.name);
            } else {
                imageUrl = existingImageUrl;
            }

            if (!imageUrl) {
                toast.error("Error al resolver la imagen");
                setIsSubmitting(false);
                return;
            }

            const updatedIngredient: CreateIngredientDTO = {
                ...formData,
                image_url: imageUrl
            };

            const success = await updateIngredient(editingId, updatedIngredient, token);

            if (success) {
                toast.success("Ingrediente actualizado correctamente");
                setEditingId(null);
                resetForm();
                fetchIngredients();
            } else {
                toast.error("Error al actualizar el ingrediente");
            }
        } catch (error) {
            console.error(error);
            toast.error("Ocurrió un error inesperado");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de que quieres eliminar este ingrediente?")) return;

        const success = await deleteIngredient(id, token);
        if (success) {
            toast.success("Ingrediente eliminado");
            if (editingId === id) {
                setEditingId(null);
                resetForm();
            }
            fetchIngredients();
        } else {
            toast.error("Error al eliminar el ingrediente");
        }
    };

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

            <div className="flex items-center justify-between">
                <h2 className="font-bebas text-brand-yellow text-5xl tracking-tight">INVENTARIO DE INGREDIENTES</h2>
                <button
                    onClick={() => {
                        if (showForm) {
                            handleCancelCreate();
                        } else {
                            handleOpenCreate();
                        }
                    }}
                    className="font-bebas bg-brand-yellow text-brand-black hover:bg-brand-teal flex cursor-pointer items-center gap-2 px-6 py-3 text-2xl shadow-[6px_6px_0_#e8192c] transition-all"
                >
                    {showForm ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                    {showForm ? "CANCELAR" : "AÑADIR INGREDIENTE"}
                </button>
            </div>

            {showForm && (
                <div className="bg-brand-black border-brand-yellow animate-in fade-in slide-in-from-top-4 border-4 p-8 shadow-[12px_12px_0_#e8192c] duration-300">
                    <div className="font-bebas text-brand-teal mb-6 flex items-center gap-3 text-3xl">
                        <Plus className="h-8 w-8" />
                        NUEVO INGREDIENTE
                    </div>
                    <form onSubmit={handleSubmitCreate}>
                        <IngredientFormFields
                            formData={formData}
                            onInputChange={handleInputChange}
                            imageResult={imageResult}
                            onImageChange={setImageResult}
                            isSubmitting={isSubmitting}
                            submitLabel="CONFIRMAR INGREDIENTE"
                            submittingLabel="SUBIENDO..."
                            onCancel={handleCancelCreate}
                        />
                    </form>
                </div>
            )}

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="text-brand-yellow h-16 w-16 animate-spin" />
                    <p className="font-vt text-brand-yellow mt-4 text-2xl">CARGANDO INVENTARIO...</p>
                </div>
            ) : ingredients.length === 0 ? (
                <div className="bg-brand-black border-brand-cream flex flex-col items-center justify-center border-4 p-20 text-center">
                    <Package className="text-brand-cream h-24 w-24" />
                    <p className="font-bebas text-brand-cream mt-6 text-4xl">NO HAY INGREDIENTES REGISTRADOS</p>
                    <p className="font-vt text-brand-cream/60 mt-2 text-2xl">
                        ¡Empieza añadiendo tu primer ingrediente!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {ingredients.map((item) => (
                        <div
                            key={item.id}
                            className="bg-brand-black group border-brand-cream hover:border-brand-yellow relative flex flex-col border-4 transition-all hover:-translate-y-1"
                        >
                            <div className="bg-brand-cream/10 border-brand-cream group-hover:border-brand-yellow relative aspect-square overflow-hidden border-b-4">
                                <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="bg-brand-yellow text-brand-black font-bebas absolute top-4 left-4 px-3 py-1 text-xl shadow-[4px_4px_0_#000]">
                                    {item.stock} {item.unit}
                                </div>
                            </div>
                            <div className="flex flex-1 flex-col p-4">
                                <h3 className="font-bebas text-brand-yellow line-clamp-1 text-2xl">{item.name}</h3>
                                <div className="mt-2 flex items-center justify-between">
                                    <p className="font-vt text-brand-cream text-xl">
                                        PRECIO: <span className="text-brand-yellow">${item.unit_price}</span>
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleOpenEdit(item)}
                                            className="text-brand-cream hover:text-brand-yellow cursor-pointer p-2 transition-colors"
                                            title="Editar ingrediente"
                                        >
                                            <Pencil className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-brand-cream hover:text-brand-red cursor-pointer p-2 transition-colors"
                                            title="Eliminar ingrediente"
                                        >
                                            <Trash2 className="h-6 w-6" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editingId && (
                <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm duration-200">
                    <div className="bg-brand-black border-brand-teal max-h-[90vh] w-full max-w-4xl overflow-y-auto border-4 p-8 shadow-[12px_12px_0_#00bcd4]">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="font-bebas text-brand-teal flex items-center gap-3 text-4xl tracking-tight">
                                <Pencil className="h-8 w-8" />
                                EDITAR INGREDIENTE
                            </div>
                            <button
                                onClick={handleCancelEdit}
                                className="text-brand-cream hover:text-brand-teal cursor-pointer transition-colors"
                                type="button"
                            >
                                <X className="h-8 w-8" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitEdit}>
                            <IngredientFormFields
                                formData={formData}
                                onInputChange={handleInputChange}
                                imageResult={imageResult}
                                onImageChange={setImageResult}
                                isSubmitting={isSubmitting}
                                submitLabel="GUARDAR CAMBIOS"
                                submittingLabel="GUARDANDO..."
                                onCancel={handleCancelEdit}
                            />
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
