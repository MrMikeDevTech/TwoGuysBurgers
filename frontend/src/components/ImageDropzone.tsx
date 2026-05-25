import React, { useState, useCallback, useEffect } from "react";
import { useProductDropzone } from "@/hooks/useProductDropzone";
import { Image as ImageIcon, Link as LinkIcon, Upload, X } from "lucide-react";

export type ImageDropzoneResult =
    | { type: "file"; file: File; previewUrl: string }
    | { type: "url"; url: string }
    | null;

interface ImageDropzoneProps {
    // eslint-disable-next-line no-unused-vars
    onChange: (result: ImageDropzoneResult) => void;
    value?: ImageDropzoneResult;
    className?: string;
}

type Mode = "dropzone" | "url";

export const ImageDropzone = ({ onChange, value, className }: ImageDropzoneProps) => {
    const [mode, setMode] = useState<Mode>("dropzone");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [urlInput, setUrlInput] = useState("");
    const [urlError, setUrlError] = useState(false);

    useEffect(() => {
        if (value === null) {
            setPreviewUrl(null);
            setUrlInput("");
            setUrlError(false);
        }
    }, [value]);

    const handleFileSelect = useCallback(
        (file: File | null) => {
            if (file) {
                const preview = URL.createObjectURL(file);
                setPreviewUrl(preview);
                setUrlInput("");
                setUrlError(false);
                onChange({ type: "file", file, previewUrl: preview });
            }
        },
        [onChange]
    );

    const { getRootProps, getInputProps, isDragActive } = useProductDropzone(handleFileSelect);

    const handleUrlConfirm = () => {
        const trimmed = urlInput.trim();
        if (!trimmed) return;

        try {
            new URL(trimmed);
        } catch {
            setUrlError(true);
            return;
        }

        setUrlError(false);
        setPreviewUrl(trimmed);
        onChange({ type: "url", url: trimmed });
    };

    const handleUrlKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleUrlConfirm();
        }
    };

    const handleClear = () => {
        if (previewUrl && !previewUrl.startsWith("http")) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setUrlInput("");
        setUrlError(false);
        onChange(null);
    };

    const switchMode = (newMode: Mode) => {
        setMode(newMode);
    };

    if (previewUrl) {
        return (
            <div className={`relative flex flex-col gap-2 ${className || ""}`}>
                <div className="border-brand-cream hover:border-brand-yellow relative flex min-h-[250px] items-center justify-center overflow-hidden border-4 transition-colors">
                    <img src={previewUrl} alt="Preview" className="h-full max-h-[300px] w-full object-contain" />
                    <button
                        type="button"
                        onClick={handleClear}
                        className="bg-brand-red text-brand-cream font-bebas absolute top-2 right-2 flex items-center gap-1 px-3 py-1 text-lg shadow-[3px_3px_0_#000] transition-all hover:brightness-125"
                    >
                        <X className="h-4 w-4" />
                        QUITAR
                    </button>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                        <p className="font-bebas text-brand-yellow text-2xl">CLIC PARA CAMBIAR</p>
                    </div>
                    <div {...getRootProps()} className="absolute inset-0 cursor-pointer">
                        <input {...getInputProps()} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col gap-3 ${className || ""}`}>
            <div className="flex gap-0">
                <button
                    type="button"
                    onClick={() => switchMode("dropzone")}
                    className={`font-bebas flex items-center gap-2 border-4 px-5 py-2 text-lg transition-all ${
                        mode === "dropzone"
                            ? "bg-brand-yellow text-brand-black border-brand-yellow"
                            : "bg-brand-black text-brand-cream border-brand-cream hover:border-brand-yellow hover:text-brand-yellow cursor-pointer"
                    }`}
                >
                    <Upload className="h-4 w-4" />
                    SUBIR ARCHIVO
                </button>
                <button
                    type="button"
                    onClick={() => switchMode("url")}
                    className={`font-bebas flex items-center gap-2 border-4 border-l-0 px-5 py-2 text-lg transition-all ${
                        mode === "url"
                            ? "bg-brand-yellow text-brand-black border-brand-yellow"
                            : "bg-brand-black text-brand-cream border-brand-cream hover:border-brand-yellow hover:text-brand-yellow cursor-pointer"
                    }`}
                >
                    <LinkIcon className="h-4 w-4" />
                    PEGAR URL
                </button>
            </div>

            {mode === "dropzone" && (
                <div
                    {...getRootProps()}
                    className={`border-brand-cream hover:border-brand-yellow relative flex min-h-[250px] cursor-pointer flex-col items-center justify-center border-4 border-dashed p-4 transition-colors ${
                        isDragActive ? "bg-brand-yellow/10 border-brand-yellow" : ""
                    }`}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div
                            className={`rounded-full p-4 transition-colors ${isDragActive ? "bg-brand-yellow/20" : "bg-brand-cream/5"}`}
                        >
                            <ImageIcon
                                className={`h-16 w-16 transition-colors ${isDragActive ? "text-brand-yellow" : "text-brand-cream"}`}
                            />
                        </div>
                        <div>
                            <p className="font-vt text-brand-cream text-xl">
                                {isDragActive ? "¡SUELTA LA IMAGEN AQUÍ!" : "ARRASTRA UNA IMAGEN O HAZ CLIC AQUÍ"}
                            </p>
                            <p className="font-vt text-brand-cream/40 mt-1 text-sm">PNG, JPG, WEBP — MÁXIMO 10MB</p>
                        </div>
                    </div>
                </div>
            )}

            {mode === "url" && (
                <div className="flex flex-col gap-3">
                    <div className="flex gap-0">
                        <div className="relative flex-1">
                            <LinkIcon className="text-brand-yellow absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
                            <input
                                type="url"
                                value={urlInput}
                                onChange={(e) => {
                                    setUrlInput(e.target.value);
                                    setUrlError(false);
                                }}
                                onKeyDown={handleUrlKeyDown}
                                placeholder="https://ejemplo.com/imagen.png"
                                className={`bg-brand-black font-vt text-brand-yellow focus:border-brand-yellow w-full border-4 py-4 pr-4 pl-12 text-xl outline-none ${
                                    urlError ? "border-brand-red" : "border-brand-cream"
                                }`}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleUrlConfirm}
                            disabled={!urlInput.trim()}
                            className="font-bebas bg-brand-yellow text-brand-black hover:bg-brand-teal border-brand-yellow border-4 border-l-0 px-6 text-xl transition-all disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            PREVISUALIZAR
                        </button>
                    </div>
                    {urlError && (
                        <p className="font-vt text-brand-red text-sm">
                            ⚠ LA URL NO ES VÁLIDA. INGRESA UNA URL COMPLETA (HTTPS://...)
                        </p>
                    )}
                    <div className="border-brand-cream/30 flex min-h-[200px] flex-col items-center justify-center border-4 border-dashed p-8">
                        <LinkIcon className="text-brand-cream/20 h-12 w-12" />
                        <p className="font-vt text-brand-cream/30 mt-3 text-lg">
                            PEGA UNA URL Y PREVISUALIZA LA IMAGEN
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
