import "@/lib/cloudinary";
import { Readable } from "stream";
import { v2 as cldn, type UploadApiResponse, type UploadApiErrorResponse } from "cloudinary";

function fileToStream(file: File): Readable {
    const reader = file.stream().getReader();
    return new Readable({
        async read() {
            const { done, value } = await reader.read();
            if (done) this.push(null);
            else this.push(value);
        }
    });
}

export async function getIngredientImageUrl(id: string): Promise<string> {
    const result = await cldn.api.resource(`ingredients/${id}`, {
        resource_type: "image"
    });
    return result.secure_url;
}

export async function getRecipeImageUrl(id: string): Promise<string> {
    const result = await cldn.api.resource(`recipes/${id}`, {
        resource_type: "image"
    });
    return result.secure_url;
}

export async function getComboImageUrl(id: string): Promise<string> {
    const result = await cldn.api.resource(`combos/${id}`, {
        resource_type: "image"
    });
    return result.secure_url;
}

export async function uploadIngredient({ id, file }: { id: string; file: File }): Promise<{ url: string }> {
    return new Promise<{ url: string }>((resolve, reject) => {
        const uploadStream = cldn.uploader.upload_stream(
            {
                folder: "ingredients",
                public_id: id,
                overwrite: true,
                resource_type: "image",
                format: "webp",
                transformation: [
                    {
                        width: 800,
                        height: 800,
                        crop: "limit",
                        fetch_format: "auto",
                        quality: "auto"
                    }
                ]
            },
            (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                if (error || !result) reject(error || new Error("Falló la subida de la imagen del ingrediente"));
                else resolve({ url: result.secure_url });
            }
        );

        fileToStream(file).pipe(uploadStream);
    });
}

export async function uploadRecipe({ id, file }: { id: string; file: File }): Promise<{ url: string }> {
    return new Promise<{ url: string }>((resolve, reject) => {
        const uploadStream = cldn.uploader.upload_stream(
            {
                folder: "recipes",
                public_id: id,
                overwrite: true,
                resource_type: "image",
                format: "webp",
                transformation: [
                    {
                        width: 800,
                        height: 800,
                        crop: "limit",
                        fetch_format: "auto",
                        quality: "auto"
                    }
                ]
            },
            (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                if (error || !result) reject(error || new Error("Falló la subida de la imagen de la receta"));
                else resolve({ url: result.secure_url });
            }
        );

        fileToStream(file).pipe(uploadStream);
    });
}

export async function uploadCombo({ id, file }: { id: string; file: File }): Promise<{ url: string }> {
    return new Promise<{ url: string }>((resolve, reject) => {
        const uploadStream = cldn.uploader.upload_stream(
            {
                folder: "combos",
                public_id: id,
                overwrite: true,
                resource_type: "image",
                format: "webp",
                transformation: [
                    {
                        width: 800,
                        height: 800,
                        crop: "limit",
                        fetch_format: "auto",
                        quality: "auto"
                    }
                ]
            },
            (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                if (error || !result) reject(error || new Error("Falló la subida de la imagen del combo"));
                else resolve({ url: result.secure_url });
            }
        );

        fileToStream(file).pipe(uploadStream);
    });
}
