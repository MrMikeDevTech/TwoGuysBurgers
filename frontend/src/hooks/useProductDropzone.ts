import { useDropzone } from "react-dropzone";
import { useCallback } from "react";
import { toast } from "react-toastify";

type FileSelectHandler = (file: File | null) => void;

export function useProductDropzone(onFileSelect: FileSelectHandler) {
    const onDrop = useCallback(
        (acceptedFiles: File[], fileRejections: unknown[]) => {
            if (fileRejections.length > 0) {
                toast.error("El archivo no es una imagen válida.");
                return;
            }

            const file = acceptedFiles[0];
            if (file) onFileSelect(file);
        },
        [onFileSelect]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { "image/*": [] },
        multiple: false,
        onDrop
    });

    return { getRootProps, getInputProps, isDragActive };
}
