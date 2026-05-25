import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getCombos, createCombo, updateCombo, deleteCombo } from "@/services/Combos";
import { getRecipes } from "@/services/Recipes";
import type { Combo, CreateComboDTO } from "@/models/combo";
import type { Recipe } from "@/models/recipe";
import { ImageDropzone, type ImageDropzoneResult } from "@/components/ImageDropzone";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, Trash2, Tag, DollarSign, X, Loader2, Pencil, Search, AlignLeft, Layers } from "lucide-react";

interface ComboManagerProps {
    token: string;
}

async function resolveImageUrl(image: ImageDropzoneResult, name: string): Promise<string | null> {
    if (!image) return null;

    if (image.type === "url") {
        return image.url;
    }

    const formData = new FormData();
    formData.append("file", image.file);
    formData.append("folder", "combos");
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

interface RecipeSelection {
    recipe: Recipe;
    amount: number;
}

interface ComboFormFieldsProps {
    formData: Omit<CreateComboDTO, "image_url" | "recipes">;
    // eslint-disable-next-line no-unused-vars
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    imageResult: ImageDropzoneResult;
    // eslint-disable-next-line no-unused-vars
    onImageChange: (result: ImageDropzoneResult) => void;
    availableRecipes: Recipe[];
    selectedRecipes: RecipeSelection[];
    // eslint-disable-next-line no-unused-vars
    onAddRecipe: (recipe: Recipe) => void;
    // eslint-disable-next-line no-unused-vars
    onUpdateRecipeAmount: (id: string, amount: number) => void;
    // eslint-disable-next-line no-unused-vars
    onRemoveRecipe: (id: string) => void;
    recipeSearchQuery: string;
    // eslint-disable-next-line no-unused-vars
    onRecipeSearchChange: (query: string) => void;
    isSubmitting: boolean;
    submitLabel: string;
    submittingLabel: string;
    onCancel: () => void;
}

const ComboFormFields = ({
    formData,
    onInputChange,
    imageResult,
    onImageChange,
    availableRecipes,
    selectedRecipes,
    onAddRecipe,
    onUpdateRecipeAmount,
    onRemoveRecipe,
    recipeSearchQuery,
    onRecipeSearchChange,
    isSubmitting,
    submitLabel,
    submittingLabel,
    onCancel
}: ComboFormFieldsProps) => {
    const filteredAvailableRecipes = useMemo(() => {
        const query = recipeSearchQuery.toLowerCase();
        return (availableRecipes || [])
            .filter((rec) => !(selectedRecipes || []).some((sel) => sel.recipe.id === rec.id))
            .filter((rec) => rec.name.toLowerCase().includes(query));
    }, [availableRecipes, selectedRecipes, recipeSearchQuery]);

    return (
        <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="font-bebas text-brand-cream text-2xl">NOMBRE DEL COMBO</label>
                        <div className="relative">
                            <Tag className="text-brand-yellow absolute top-1/2 left-4 h-6 w-6 -translate-y-1/2" />
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={onInputChange}
                                placeholder="Ej. Combo Familiar"
                                className="bg-brand-black border-brand-cream font-vt text-brand-yellow focus:border-brand-yellow w-full border-4 py-4 pr-4 pl-14 text-2xl outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-bebas text-brand-cream text-2xl">DESCRIPCIÓN</label>
                        <div className="relative">
                            <AlignLeft className="text-brand-yellow absolute top-4 left-4 h-6 w-6" />
                            <textarea
                                name="description"
                                required
                                rows={3}
                                value={formData.description}
                                onChange={onInputChange}
                                placeholder="Descripción del combo..."
                                className="bg-brand-black border-brand-cream font-vt text-brand-yellow focus:border-brand-yellow custom-scrollbar w-full resize-none border-4 py-4 pr-4 pl-14 text-2xl outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-bebas text-brand-cream text-2xl">PRECIO DE VENTA</label>
                        <div className="relative">
                            <DollarSign className="text-brand-yellow absolute top-1/2 left-4 h-6 w-6 -translate-y-1/2" />
                            <input
                                type="number"
                                name="price"
                                required
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={onInputChange}
                                placeholder="0.00"
                                className="bg-brand-black border-brand-cream font-vt text-brand-yellow focus:border-brand-yellow w-full border-4 py-4 pr-4 pl-14 text-2xl outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <label className="font-bebas text-brand-cream text-2xl">IMAGEN DEL COMBO</label>
                    <div className="flex-1">
                        <ImageDropzone onChange={onImageChange} value={imageResult} className="h-full" />
                    </div>
                </div>
            </div>

            <div className="border-brand-yellow border-t-4 pt-6">
                <label className="font-bebas text-brand-cream mb-4 block text-3xl">RECETAS DEL COMBO</label>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <div className="flex flex-col gap-4">
                        <div className="bg-brand-cream/10 border-brand-cream flex items-center justify-between border-4 p-3">
                            <h3 className="font-vt text-brand-yellow text-xl">RECETAS DISPONIBLES</h3>
                            <div className="relative w-1/2">
                                <Search className="text-brand-cream absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    value={recipeSearchQuery}
                                    onChange={(e) => onRecipeSearchChange(e.target.value)}
                                    className="bg-brand-black border-brand-cream font-vt text-brand-cream focus:border-brand-yellow w-full border-2 py-1 pr-2 pl-8 text-lg outline-none"
                                />
                            </div>
                        </div>

                        <div className="bg-brand-black border-brand-cream/50 custom-scrollbar flex h-[250px] flex-col gap-2 overflow-y-auto border-4 p-2">
                            {!filteredAvailableRecipes || filteredAvailableRecipes.length === 0 ? (
                                <div className="font-vt text-brand-cream/50 flex h-full items-center justify-center text-center text-xl">
                                    {!availableRecipes || availableRecipes.length === 0
                                        ? "CARGANDO RECETAS..."
                                        : "NO SE ENCONTRARON RECETAS"}
                                </div>
                            ) : (
                                filteredAvailableRecipes.map((rec) => (
                                    <div
                                        key={rec.id}
                                        onClick={() => onAddRecipe(rec)}
                                        className="border-brand-cream/30 hover:border-brand-yellow hover:bg-brand-yellow/10 flex cursor-pointer items-center gap-3 border-2 p-2 transition-colors"
                                    >
                                        <img
                                            src={rec.image_url}
                                            alt={rec.name}
                                            className="h-10 w-10 border border-black/20 bg-white object-contain"
                                        />
                                        <div className="flex flex-1 flex-col">
                                            <span className="font-bebas text-brand-cream text-xl leading-none">
                                                {rec.name}
                                            </span>
                                            <span className="font-vt text-brand-cream/60 text-sm">
                                                PRECIO: ${rec.price.toFixed(2)}
                                            </span>
                                        </div>
                                        <Plus className="text-brand-yellow h-5 w-5" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="bg-brand-cream/10 border-brand-cream flex items-center justify-between border-4 p-3">
                            <h3 className="font-vt text-brand-yellow text-xl">RECETAS SELECCIONADAS</h3>
                            <span className="font-bebas text-brand-yellow rounded-full bg-black/50 px-3 py-1 text-lg">
                                TOTAL: {selectedRecipes.length}
                            </span>
                        </div>

                        <div className="bg-brand-black border-brand-cream/50 custom-scrollbar flex h-[250px] flex-col gap-2 overflow-y-auto border-4 p-2">
                            {selectedRecipes.length === 0 ? (
                                <div className="font-vt text-brand-cream/50 flex h-full flex-col items-center justify-center text-center">
                                    <p className="text-xl">EL COMBO ESTÁ VACÍO</p>
                                    <p className="text-sm">Agrega al menos 1 receta</p>
                                </div>
                            ) : (
                                selectedRecipes.map((sel) => (
                                    <div
                                        key={sel.recipe.id}
                                        className="border-brand-teal bg-brand-teal/5 flex items-center gap-3 border-2 p-2"
                                    >
                                        <img
                                            src={sel.recipe.image_url}
                                            alt={sel.recipe.name}
                                            className="h-10 w-10 border border-black/20 object-cover"
                                        />
                                        <div className="flex flex-1 flex-col">
                                            <span className="font-bebas text-brand-cream text-xl leading-none">
                                                {sel.recipe.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="font-vt text-brand-cream text-sm uppercase">Cant.</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={sel.amount || ""}
                                                onChange={(e) =>
                                                    onUpdateRecipeAmount(
                                                        sel.recipe.id,
                                                        parseInt(e.target.value) || 0
                                                    )
                                                }
                                                className="bg-brand-black border-brand-cream font-vt text-brand-yellow focus:border-brand-yellow w-16 border-2 px-2 py-1 text-center text-lg outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => onRemoveRecipe(sel.recipe.id)}
                                                className="text-brand-cream hover:text-brand-red ml-2 p-1 transition-colors"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="font-bebas bg-brand-black text-brand-cream border-brand-cream hover:border-brand-yellow hover:text-brand-yellow flex flex-1 items-center justify-center gap-3 border-4 py-5 text-2xl transition-all"
                >
                    <X className="h-6 w-6" />
                    CANCELAR
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || selectedRecipes.length === 0}
                    className="font-bebas bg-brand-red text-brand-cream flex flex-2 items-center justify-center gap-3 py-5 text-2xl shadow-[6px_6px_0_#000] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
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
    );
};

export const ComboManager = ({ token }: ComboManagerProps) => {
    const [combos, setCombos] = useState<Combo[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState<Omit<CreateComboDTO, "image_url" | "recipes">>({
        name: "",
        description: "",
        price: 0
    });
    const [imageResult, setImageResult] = useState<ImageDropzoneResult>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

    const [selectedRecipes, setSelectedRecipes] = useState<RecipeSelection[]>([]);
    const [recipeSearchQuery, setRecipeSearchQuery] = useState("");

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [combosData, recipesData] = await Promise.all([getCombos(token), getRecipes(token)]);
            setCombos(combosData);
            setRecipes(recipesData);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Error al cargar los datos");
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const resetForm = () => {
        setFormData({ name: "", description: "", price: 0 });
        setImageResult(null);
        setExistingImageUrl(null);
        setSelectedRecipes([]);
        setRecipeSearchQuery("");
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "price" ? Number(value) : value
        }));
    };

    const handleAddRecipe = (recipe: Recipe) => {
        setSelectedRecipes((prev) => [...prev, { recipe, amount: 1 }]);
    };

    const handleUpdateRecipeAmount = (id: string, amount: number) => {
        setSelectedRecipes((prev) => prev.map((item) => (item.recipe.id === id ? { ...item, amount } : item)));
    };

    const handleRemoveRecipe = (id: string) => {
        setSelectedRecipes((prev) => prev.filter((item) => item.recipe.id !== id));
    };

    const handleOpenCreate = () => {
        setEditingId(null);
        resetForm();
        setShowForm(true);
    };

    const handleOpenEdit = (item: Combo) => {
        setShowForm(false);
        setEditingId(item.id);
        setFormData({
            name: item.name,
            description: item.description,
            price: item.price
        });

        const mappedSelected: RecipeSelection[] = (item.recipes || []).map((recAmount) => {
            const fullRecipe = recipes.find((r) => r.id === recAmount.recipe_id);
            if (!fullRecipe) {
                return {
                    recipe: {
                        id: recAmount.recipe_id,
                        name: "Desconocido",
                        description: "",
                        price: 0,
                        kind: "product",
                        ingredients: [],
                        image_url: ""
                    },
                    amount: recAmount.amount
                };
            }
            return { recipe: fullRecipe, amount: recAmount.amount };
        });
        setSelectedRecipes(mappedSelected);

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

        if (selectedRecipes.length === 0 || selectedRecipes.some((s) => s.amount <= 0)) {
            toast.error("El combo debe tener recetas con cantidades mayores a 0");
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

            const newCombo: CreateComboDTO = {
                ...formData,
                image_url: imageUrl,
                recipes: selectedRecipes.map((s) => ({
                    recipe_id: s.recipe.id,
                    amount: s.amount
                }))
            };

            const success = await createCombo(newCombo, token);

            if (success) {
                toast.success("Combo añadido correctamente");
                setShowForm(false);
                resetForm();
                fetchData();
            } else {
                toast.error("Error al guardar el combo");
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

        if (selectedRecipes.length === 0 || selectedRecipes.some((s) => s.amount <= 0)) {
            toast.error("El combo debe tener recetas con cantidades mayores a 0");
            return;
        }

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

            const updatedCombo: CreateComboDTO = {
                ...formData,
                image_url: imageUrl,
                recipes: selectedRecipes.map((s) => ({
                    recipe_id: s.recipe.id,
                    amount: s.amount
                }))
            };

            const success = await updateCombo(editingId, updatedCombo, token);

            if (success) {
                toast.success("Combo actualizado correctamente");
                setEditingId(null);
                resetForm();
                fetchData();
            } else {
                toast.error("Error al actualizar el combo");
            }
        } catch (error) {
            console.error(error);
            toast.error("Ocurrió un error inesperado");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de que quieres eliminar este combo?")) return;

        const success = await deleteCombo(id, token);
        if (success) {
            toast.success("Combo eliminado");
            if (editingId === id) {
                setEditingId(null);
                resetForm();
            }
            fetchData();
        } else {
            toast.error("Error al eliminar el combo");
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
                <h2 className="font-bebas text-brand-yellow text-5xl tracking-tight">INVENTARIO DE COMBOS</h2>
                <button
                    onClick={() => {
                        if (showForm) {
                            handleCancelCreate();
                        } else {
                            handleOpenCreate();
                        }
                    }}
                    className="font-bebas bg-brand-yellow text-brand-black hover:bg-brand-teal flex items-center gap-2 px-6 py-3 text-2xl shadow-[6px_6px_0_#e8192c] transition-all"
                >
                    {showForm ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                    {showForm ? "CANCELAR" : "CREAR COMBO"}
                </button>
            </div>

            {showForm && (
                <div className="bg-brand-black border-brand-yellow animate-in fade-in slide-in-from-top-4 border-4 p-8 shadow-[12px_12px_0_#e8192c] duration-300">
                    <div className="font-bebas text-brand-teal mb-6 flex items-center gap-3 text-3xl">
                        <Plus className="h-8 w-8" />
                        NUEVO COMBO
                    </div>
                    <form onSubmit={handleSubmitCreate}>
                        <ComboFormFields
                            formData={formData}
                            onInputChange={handleInputChange}
                            imageResult={imageResult}
                            onImageChange={setImageResult}
                            availableRecipes={recipes}
                            selectedRecipes={selectedRecipes}
                            onAddRecipe={handleAddRecipe}
                            onUpdateRecipeAmount={handleUpdateRecipeAmount}
                            onRemoveRecipe={handleRemoveRecipe}
                            recipeSearchQuery={recipeSearchQuery}
                            onRecipeSearchChange={setRecipeSearchQuery}
                            isSubmitting={isSubmitting}
                            submitLabel="CONFIRMAR COMBO"
                            submittingLabel="GUARDANDO..."
                            onCancel={handleCancelCreate}
                        />
                    </form>
                </div>
            )}

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="text-brand-yellow h-16 w-16 animate-spin" />
                    <p className="font-vt text-brand-yellow mt-4 text-2xl">CARGANDO COMBOS...</p>
                </div>
            ) : (combos || []).length === 0 ? (
                <div className="bg-brand-black border-brand-cream flex flex-col items-center justify-center border-4 p-20 text-center">
                    <Layers className="text-brand-cream/30 h-24 w-24" />
                    <p className="font-bebas text-brand-cream mt-6 text-4xl">NO HAY COMBOS REGISTRADOS</p>
                    <p className="font-vt text-brand-cream/60 mt-2 text-2xl">¡Crea tu primer combo para el menú!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {(combos || []).map((item) => (
                        <div
                            key={item.id}
                            className={
                                "bg-brand-black group border-brand-cream hover:border-brand-yellow relative flex flex-col border-4 transition-all hover:-translate-y-1"
                            }
                        >
                            <div
                                className={
                                    "bg-brand-cream/10 border-brand-cream group-hover:border-brand-yellow relative aspect-square overflow-hidden border-b-4"
                                }
                            >
                                <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="bg-brand-yellow text-brand-black font-bebas absolute top-4 left-4 px-3 py-1 text-xl uppercase shadow-[4px_4px_0_#000]">
                                    COMBO
                                </div>
                                <div className="bg-brand-black text-brand-yellow font-bebas absolute bottom-4 left-4 px-3 py-1 text-2xl shadow-[4px_4px_0_#ffd600]">
                                    ${item.price.toFixed(2)}
                                </div>
                            </div>
                            <div className="flex flex-1 flex-col p-4">
                                <h3 className="font-bebas text-brand-yellow line-clamp-1 text-2xl">{item.name}</h3>
                                <p className="font-vt text-brand-cream/70 mt-1 line-clamp-2 text-lg leading-tight">
                                    {item.description}
                                </p>
                                <div className="border-brand-cream/20 mt-4 flex items-center justify-between border-t pt-3">
                                    <p className="font-vt text-brand-cream text-lg">
                                        <span className="text-brand-yellow">
                                            {item.recipes ? item.recipes.length : 0}
                                        </span>{" "}
                                        RECETAS
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleOpenEdit(item)}
                                            className="text-brand-cream hover:text-brand-yellow p-2 transition-colors"
                                            title="Editar combo"
                                        >
                                            <Pencil className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-brand-cream hover:text-brand-red p-2 transition-colors"
                                            title="Eliminar combo"
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
                    <div className="bg-brand-black border-brand-teal max-h-[90vh] w-full max-w-5xl overflow-y-auto border-4 p-8 shadow-[12px_12px_0_#00bcd4]">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="font-bebas text-brand-teal flex items-center gap-3 text-4xl tracking-tight">
                                <Pencil className="h-8 w-8" />
                                EDITAR COMBO
                            </div>
                            <button
                                onClick={handleCancelEdit}
                                className="text-brand-cream hover:text-brand-teal transition-colors"
                                type="button"
                            >
                                <X className="h-8 w-8" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitEdit}>
                            <ComboFormFields
                                formData={formData}
                                onInputChange={handleInputChange}
                                imageResult={imageResult}
                                onImageChange={setImageResult}
                                availableRecipes={recipes}
                                selectedRecipes={selectedRecipes}
                                onAddRecipe={handleAddRecipe}
                                onUpdateRecipeAmount={handleUpdateRecipeAmount}
                                onRemoveRecipe={handleRemoveRecipe}
                                recipeSearchQuery={recipeSearchQuery}
                                onRecipeSearchChange={setRecipeSearchQuery}
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
