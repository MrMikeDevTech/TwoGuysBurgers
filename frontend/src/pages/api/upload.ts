import type { APIRoute } from "astro";
import { uploadIngredient, uploadRecipe, uploadCombo } from "@/services/Cloudinary";

const uploaders: Record<string, (args: { id: string; file: File }) => Promise<{ url: string }>> = {
    ingredients: uploadIngredient,
    recipes: uploadRecipe,
    combos: uploadCombo
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const folder = (formData.get("folder") as string) || "ingredients";
        const name = (formData.get("name") as string) || `img_${Date.now()}`;

        if (!file) {
            return new Response(JSON.stringify({ error: "No se proporcionó un archivo" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const uploader = uploaders[folder];
        if (!uploader) {
            return new Response(JSON.stringify({ error: `Carpeta no válida: ${folder}` }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Use the name as public_id (sanitize it)
        const publicId = name
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, "_")
            .replace(/_+/g, "_")
            .substring(0, 50);

        const result = await uploader({ id: publicId, file });

        return new Response(JSON.stringify({ url: result.url }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        return new Response(JSON.stringify({ error: "Error al subir la imagen" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
