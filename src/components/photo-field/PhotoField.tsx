"use client";

import { Field } from "@base-ui/react/field";
import {
    Camera01Icon,
    Delete02Icon,
    RotateClockwiseIcon,
} from "@hugeicons/core-free-icons";
import { useId, useRef, useState, type DragEvent, type ReactNode } from "react";

import { useMessages } from "../../i18n/context";
import {
    useExternalEffect,
    useLatest,
    useMountEffect,
} from "../../utils/effects";
import { Button } from "../button/Button";
import { FieldFooter } from "../field/FieldFooter";
import { useFormValue } from "../form/context";
import { Icon } from "../icon/Icon";
import { Modal } from "../modal/Modal";
import { Slider } from "../slider/Slider";
import { ImageCropper, type CropHandle } from "./ImageCropper";

export interface PhotoFieldProps {
    label?: ReactNode;
    hint?: ReactNode;
    error?: string | undefined;
    name?: string;
    // Szerokość do wysokości, np. 1 do awatara, 35 / 45 do legitymacji.
    aspect?: number;
    shape?: "rect" | "circle";
    // Rozmiar pliku wynikowego w px; domyślnie 600 px szerokości.
    size?: { width: number; height: number };
    // Bieżące zdjęcie z serwera (adres), zanim ktoś wybierze nowe.
    defaultSrc?: string;
    // Przycięty plik JPEG albo null po usunięciu.
    onChange?: (file: File | null) => void;
    disabled?: boolean;
}

// Obraz obrócony o 90° w prawo jako nowy adres blob.
async function rotate(src: string) {
    const image = new Image();
    image.src = src;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalHeight;
    canvas.height = image.naturalWidth;
    const context = canvas.getContext("2d");
    if (!context) return src;
    context.translate(canvas.width, 0);
    context.rotate(Math.PI / 2);
    context.drawImage(image, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.95),
    );
    return blob ? URL.createObjectURL(blob) : src;
}

// Zdjęcie z kadrowaniem, np. do legitymacji albo kandydata w wyborach:
// podgląd, wybór albo upuszczenie pliku, okno z kadrem o stałych
// proporcjach (przesuwanie, powiększanie, obrót). Wynik to przycięty JPEG
// w zadanym rozmiarze, dla Form i zwykłego formularza.
export function PhotoField({
    label,
    hint,
    error,
    name,
    aspect = 1,
    shape = "rect",
    size,
    defaultSrc,
    onChange,
    disabled = false,
}: PhotoFieldProps) {
    const t = useMessages();
    const inputId = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const hiddenRef = useRef<HTMLInputElement>(null);
    const cropRef = useRef<CropHandle>(null);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(defaultSrc ?? null);
    const [editing, setEditing] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [saving, setSaving] = useState(false);
    const [invalid, setInvalid] = useState(false);
    const [dropping, setDropping] = useState(false);
    const output = size ?? { width: 600, height: Math.round(600 / aspect) };
    useFormValue(name, file);

    // Ukryty input dostaje przycięty plik, więc zwykły formularz też go wyśle.
    useExternalEffect(() => {
        const input = hiddenRef.current;
        if (!input || typeof DataTransfer === "undefined") return;
        const transfer = new DataTransfer();
        if (file) transfer.items.add(file);
        input.files = transfer.files;
    }, [file]);

    // Adresy blob zwalniane przy odmontowaniu.
    const urls = useLatest([preview, editing]);
    useMountEffect(() => () => {
        for (const url of urls.current)
            if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
    });

    function pick(chosen: File | undefined) {
        if (!chosen) return;
        if (!chosen.type.startsWith("image/")) {
            setInvalid(true);
            return;
        }
        setInvalid(false);
        setZoom(1);
        setEditing(URL.createObjectURL(chosen));
        setOpen(true);
    }

    async function save() {
        setSaving(true);
        const blob = await cropRef.current?.toBlob(output);
        setSaving(false);
        if (!blob) return;
        const next = new File([blob], "zdjecie.jpg", { type: "image/jpeg" });
        if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
        setPreview(URL.createObjectURL(blob));
        setFile(next);
        onChange?.(next);
        setOpen(false);
    }

    function remove() {
        if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
        setPreview(null);
        setFile(null);
        onChange?.(null);
    }

    const onDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDropping(false);
        if (!disabled) pick(event.dataTransfer.files[0]);
    };

    const message = error ?? (invalid ? t.photo.notImage : undefined);

    return (
        <Field.Root
            className="zse-input zse-photo"
            disabled={disabled}
            {...(message && { invalid: true })}
        >
            {label != null && (
                <label className="zse-input-label" htmlFor={inputId}>
                    {label}
                </label>
            )}
            <div
                className="zse-photo-row"
                data-dropping={dropping || undefined}
                onDragOver={(event) => {
                    event.preventDefault();
                    if (!disabled) setDropping(true);
                }}
                onDragLeave={() => setDropping(false)}
                onDrop={onDrop}
            >
                <button
                    type="button"
                    className="zse-photo-preview"
                    data-shape={shape}
                    style={{ aspectRatio: String(aspect) }}
                    onClick={() => inputRef.current?.click()}
                    disabled={disabled}
                    aria-label={preview ? t.photo.change : t.photo.choose}
                >
                    {preview ? (
                        <img src={preview} alt="" />
                    ) : (
                        <Icon icon={Camera01Icon} size={22} />
                    )}
                    {dropping && (
                        <span className="zse-photo-drop">{t.photo.drop}</span>
                    )}
                </button>
                <div className="zse-photo-actions">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => inputRef.current?.click()}
                        disabled={disabled}
                    >
                        {preview ? t.photo.change : t.photo.choose}
                    </Button>
                    {preview && (
                        <Button
                            size="sm"
                            variant="ghost"
                            icon={Delete02Icon}
                            onClick={remove}
                            disabled={disabled}
                        >
                            {t.photo.remove}
                        </Button>
                    )}
                </div>
            </div>
            <input
                ref={inputRef}
                id={inputId}
                type="file"
                accept="image/*"
                className="zse-photo-input"
                disabled={disabled}
                onChange={(event) => {
                    pick(event.target.files?.[0]);
                    event.target.value = "";
                }}
            />
            {name !== undefined && (
                <input
                    ref={hiddenRef}
                    type="file"
                    name={name}
                    className="zse-photo-input"
                    tabIndex={-1}
                    aria-hidden
                />
            )}
            <FieldFooter error={message} hint={hint} />

            <Modal
                open={open}
                onOpenChange={setOpen}
                onOpenChangeComplete={(next) => {
                    if (next || !editing) return;
                    URL.revokeObjectURL(editing);
                    setEditing(null);
                }}
                title={t.photo.crop}
                description={t.photo.hint}
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            {t.common.cancel}
                        </Button>
                        <Button onClick={() => void save()} loading={saving}>
                            {t.photo.save}
                        </Button>
                    </>
                }
            >
                {editing && (
                    <div className="zse-photo-editor">
                        <ImageCropper
                            key={editing}
                            src={editing}
                            aspect={aspect}
                            shape={shape}
                            zoom={zoom}
                            onZoomChange={setZoom}
                            handleRef={cropRef}
                        />
                        <div className="zse-photo-tools">
                            <Slider
                                label={t.photo.zoom}
                                min={1}
                                max={4}
                                step={0.01}
                                bubble={false}
                                format={{
                                    style: "percent",
                                    maximumFractionDigits: 0,
                                }}
                                value={zoom}
                                onValueChange={(value) =>
                                    setZoom(
                                        Array.isArray(value)
                                            ? (value[0] ?? 1)
                                            : value,
                                    )
                                }
                            />
                            <Button
                                size="sm"
                                variant="outline"
                                icon={RotateClockwiseIcon}
                                onClick={async () => {
                                    const next = await rotate(editing);
                                    URL.revokeObjectURL(editing);
                                    setZoom(1);
                                    setEditing(next);
                                }}
                            >
                                {t.photo.rotate}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </Field.Root>
    );
}
