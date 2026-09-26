"use client";

import { Field } from "@base-ui/react/field";
import {
    AlertCircleIcon,
    Cancel01Icon,
    CheckmarkCircle02Icon,
    FileUploadIcon,
    RefreshIcon,
} from "@hugeicons/core-free-icons";
import {
    useEffect,
    useId,
    useRef,
    useState,
    type ClipboardEvent,
    type CSSProperties,
    type DragEvent,
    type ReactNode,
} from "react";

import { useMessages } from "../../i18n/context";
import { FieldFooter } from "../field/FieldFooter";
import { useFormValue } from "../form/context";
import { Icon } from "../icon/Icon";
import {
    accepts,
    describeAccept,
    fileIcon,
    formatSize,
    splitName,
} from "./files";

type Status = "ready" | "uploading" | "done" | "error" | "rejected";

interface Item {
    id: string;
    file: File;
    status: Status;
    progress: number;
    message?: string;
    preview?: string;
    leaving?: boolean;
}

export interface UploadContext {
    // 0–1, pasek postępu w wierszu pliku.
    onProgress: (progress: number) => void;
    // Przerwane, gdy użytkownik usunie plik w trakcie wysyłania.
    signal: AbortSignal;
}

export interface FileUploadProps {
    label?: ReactNode;
    // Bez hint opis powstaje z accept i maxSize, np. „PDF, ZIP · do 10 MB”.
    hint?: ReactNode;
    error?: string | undefined;
    // Jak atrybut accept: ".pdf,.zip,image/*".
    accept?: string;
    multiple?: boolean;
    // W bajtach.
    maxSize?: number;
    maxFiles?: number;
    // Aktualne poprawne pliki po każdej zmianie.
    onFilesChange?: (files: File[]) => void;
    // Wysyłka od razu po dodaniu. Rzucony błąd pokazuje się w wierszu
    // z przyciskiem ponowienia.
    onUpload?: (file: File, context: UploadContext) => Promise<unknown>;
    // Z name pliki trafiają do zwykłego wysłania formularza.
    name?: string;
    disabled?: boolean;
}

const reducedMotion = () =>
    matchMedia("(prefers-reduced-motion: reduce)").matches;

const THUMB = 72 * 2;

async function thumbnail(file: File) {
    try {
        const full = await createImageBitmap(file);
        const scale = THUMB / Math.min(full.width, full.height);
        const width = Math.max(1, Math.round(full.width * Math.min(scale, 1)));
        const height = Math.max(
            1,
            Math.round(full.height * Math.min(scale, 1)),
        );
        const small = await createImageBitmap(full, {
            resizeWidth: width,
            resizeHeight: height,
            resizeQuality: "medium",
        });
        full.close();
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")?.drawImage(small, 0, 0);
        small.close();
        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, "image/webp", 0.85),
        );
        return blob ? URL.createObjectURL(blob) : undefined;
    } catch {
        // Format, którego przeglądarka nie zdekoduje (np. HEIC): zostaje ikona.
        return undefined;
    }
}

const sameFile = (a: File, b: File) =>
    a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

export function FileUpload({
    label,
    hint,
    error,
    accept,
    multiple = true,
    maxSize,
    maxFiles,
    onFilesChange,
    onUpload,
    name,
    disabled = false,
}: FileUploadProps) {
    const t = useMessages();
    const id = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const controllers = useRef(new Map<string, AbortController>());
    const nextId = useRef(0);
    const [items, setItems] = useState<Item[]>([]);
    const [over, setOver] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [announcement, setAnnouncement] = useState("");

    const update = (itemId: string, patch: Partial<Item>) =>
        setItems((prev) =>
            prev.map((item) =>
                item.id === itemId ? { ...item, ...patch } : item,
            ),
        );

    function upload(item: Item) {
        if (!onUpload) return;
        const controller = new AbortController();
        controllers.current.set(item.id, controller);
        update(item.id, { status: "uploading", progress: 0 });
        onUpload(item.file, {
            signal: controller.signal,
            onProgress: (progress) =>
                update(item.id, {
                    progress: Math.min(Math.max(progress, 0), 1),
                }),
        }).then(
            () => {
                controllers.current.delete(item.id);
                update(item.id, { status: "done", progress: 1 });
            },
            (reason: unknown) => {
                controllers.current.delete(item.id);
                if (controller.signal.aborted) return;
                update(item.id, {
                    status: "error",
                    message:
                        reason instanceof Error && reason.message
                            ? reason.message
                            : t.fileUpload.uploadFailed,
                });
            },
        );
    }

    function add(list: File[]) {
        if (disabled || list.length === 0) return;
        const kept = multiple ? items.filter((item) => !item.leaving) : [];
        let count = kept.filter((item) => item.status !== "rejected").length;
        const added: Item[] = [];

        for (const file of multiple ? list : list.slice(0, 1)) {
            if (
                kept.some(
                    (item) =>
                        item.status !== "rejected" && sameFile(item.file, file),
                )
            )
                continue;
            let message: string | undefined;
            if (!accepts(file, accept)) message = t.fileUpload.unsupported;
            else if (maxSize !== undefined && file.size > maxSize)
                message = t.fileUpload.tooLarge(formatSize(maxSize, t.locale));
            else if (maxFiles !== undefined && count >= maxFiles)
                message = t.fileUpload.tooMany(maxFiles);
            if (!message) count += 1;

            added.push({
                id: `${id}-file-${(nextId.current += 1)}`,
                file,
                status: message ? "rejected" : "ready",
                progress: 0,
                ...(message && { message }),
            });
        }

        const replaced: Item[] = [];
        if (!multiple)
            for (const item of items) {
                if (item.leaving) continue;
                controllers.current.get(item.id)?.abort();
                replaced.push({ ...item, leaving: true });
            }
        setItems([...kept, ...replaced, ...added]);
        for (const item of added)
            if (
                item.status !== "rejected" &&
                item.file.type.startsWith("image/")
            )
                void thumbnail(item.file).then((url) => {
                    if (!url) return;
                    setItems((prev) => {
                        if (!prev.some((entry) => entry.id === item.id)) {
                            URL.revokeObjectURL(url);
                            return prev;
                        }
                        return prev.map((entry) =>
                            entry.id === item.id
                                ? { ...entry, preview: url }
                                : entry,
                        );
                    });
                });

        const good = added.filter((item) => item.status !== "rejected");
        const bad = added.length - good.length;
        setAnnouncement(
            [
                good.length > 0 && t.fileUpload.added(good.length),
                bad > 0 && t.fileUpload.rejected(bad),
            ]
                .filter(Boolean)
                .join(". "),
        );
        for (const item of good) upload(item);
    }

    function drop(itemId: string) {
        setItems((prev) => {
            const item = prev.find((entry) => entry.id === itemId);
            if (item?.preview) URL.revokeObjectURL(item.preview);
            return prev.filter((entry) => entry.id !== itemId);
        });
    }

    function remove(item: Item) {
        controllers.current.get(item.id)?.abort();
        setAnnouncement(t.fileUpload.removed(item.file.name));
        if (reducedMotion()) drop(item.id);
        else {
            update(item.id, { leaving: true });
            // Zapas, gdy transitionend nie przyjdzie (np. wiersz
            // przerenderował się w trakcie wysyłania). drop jest idempotentny.
            setTimeout(() => drop(item.id), 400);
        }
    }

    const valid = items.filter(
        (item) => item.status !== "rejected" && !item.leaving,
    );
    // W Form wartością pola są poprawne pliki (File[]), bez odrzuconych.
    useFormValue(
        name,
        valid.map((item) => item.file),
    );
    const validKey = valid.map((item) => item.id).join();
    const reported = useRef("");
    useEffect(() => {
        if (validKey === reported.current) return;
        reported.current = validKey;
        const files = valid.map((item) => item.file);
        onFilesChange?.(files);
        if (name && inputRef.current) {
            const transfer = new DataTransfer();
            for (const file of files) transfer.items.add(file);
            inputRef.current.files = transfer.files;
        }
    });

    useEffect(() => {
        if (disabled) return;
        let depth = 0;
        const hasFiles = (event: globalThis.DragEvent) =>
            event.dataTransfer?.types.includes("Files") ?? false;
        const enter = (event: globalThis.DragEvent) => {
            if (!hasFiles(event)) return;
            depth += 1;
            setDragging(true);
        };
        const leave = (event: globalThis.DragEvent) => {
            if (!hasFiles(event)) return;
            depth = Math.max(depth - 1, 0);
            if (depth === 0) setDragging(false);
        };
        const stop = (event: globalThis.DragEvent) => {
            if (!hasFiles(event)) return;
            event.preventDefault();
            if (event.type === "drop") {
                depth = 0;
                setDragging(false);
            }
        };
        window.addEventListener("dragenter", enter);
        window.addEventListener("dragleave", leave);
        window.addEventListener("dragover", stop);
        window.addEventListener("drop", stop);
        return () => {
            window.removeEventListener("dragenter", enter);
            window.removeEventListener("dragleave", leave);
            window.removeEventListener("dragover", stop);
            window.removeEventListener("drop", stop);
        };
    }, [disabled]);

    const itemsRef = useRef(items);
    useEffect(() => {
        itemsRef.current = items;
    });
    useEffect(
        () => () => {
            for (const controller of controllers.current.values())
                controller.abort();
            for (const item of itemsRef.current)
                if (item.preview) URL.revokeObjectURL(item.preview);
        },
        [controllers, itemsRef],
    );

    const description =
        hint ??
        ([
            accept && describeAccept(accept, t.fileUpload.types),
            maxSize !== undefined &&
                t.fileUpload.upTo(formatSize(maxSize, t.locale)),
        ]
            .filter(Boolean)
            .join(" · ") ||
            null);

    return (
        // Field.Root, żeby błąd z Form (schemat, serwer) trafił pod pole.
        <Field.Root
            className="zse-upload"
            disabled={disabled}
            {...(name !== undefined && { name })}
            {...(error && { invalid: true })}
        >
            {label != null && label !== false && (
                <span id={`${id}-label`} className="zse-input-label">
                    {label}
                </span>
            )}

            <button
                type="button"
                className="zse-upload-zone"
                disabled={disabled}
                data-dragging={dragging || undefined}
                data-over={over || undefined}
                aria-labelledby={label ? `${id}-label ${id}-cta` : `${id}-cta`}
                aria-describedby={description ? `${id}-hint` : undefined}
                onClick={() => inputRef.current?.click()}
                onDragEnter={(event: DragEvent) => {
                    event.preventDefault();
                    setOver(true);
                }}
                onDragOver={(event: DragEvent) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "copy";
                }}
                onDragLeave={(event: DragEvent) => {
                    if (
                        !event.currentTarget.contains(
                            event.relatedTarget as Node | null,
                        )
                    )
                        setOver(false);
                }}
                onDrop={(event: DragEvent) => {
                    event.preventDefault();
                    setOver(false);
                    setDragging(false);
                    add([...event.dataTransfer.files]);
                }}
                // Zrzut ekranu wklejony Ctrl+V, gdy pole ma fokus.
                onPaste={(event: ClipboardEvent) => {
                    const pasted = [...event.clipboardData.files];
                    if (pasted.length === 0) return;
                    event.preventDefault();
                    add(pasted);
                }}
            >
                <span className="zse-upload-icon">
                    <span className="zse-upload-tile">
                        <Icon icon={FileUploadIcon} size={20} />
                    </span>
                </span>
                <span id={`${id}-cta`} className="zse-upload-cta">
                    <span className="zse-upload-fine">
                        {t.fileUpload.drag(multiple)}{" "}
                    </span>
                    <span className="zse-upload-action">
                        <span className="zse-upload-fine">
                            {t.fileUpload.browse}
                        </span>
                        <span className="zse-upload-coarse">
                            {t.fileUpload.choose(multiple)}
                        </span>
                    </span>
                </span>
                {description && (
                    <span id={`${id}-hint`} className="zse-upload-hint">
                        {description}
                    </span>
                )}
            </button>

            <input
                ref={inputRef}
                type="file"
                className="zse-upload-input"
                tabIndex={-1}
                aria-hidden
                multiple={multiple}
                disabled={disabled}
                {...(accept && { accept })}
                {...(name && { name })}
                onChange={(event) => {
                    add([...(event.target.files ?? [])]);
                    if (!name) event.target.value = "";
                }}
            />

            <ul className="zse-upload-list">
                {items.map((item) => (
                    <FileRow
                        key={item.id}
                        item={item}
                        onRemove={() => remove(item)}
                        onRetry={() => upload(item)}
                        onLeft={() => drop(item.id)}
                    />
                ))}
            </ul>

            <FieldFooter error={error} />

            <span className="zse-upload-live" aria-live="polite">
                {announcement}
            </span>
        </Field.Root>
    );
}

function FileRow({
    item,
    onRemove,
    onRetry,
    onLeft,
}: {
    item: Item;
    onRemove: () => void;
    onRetry: () => void;
    onLeft: () => void;
}) {
    const t = useMessages();
    const { file, status, progress, message, preview } = item;
    const [base, ext] = splitName(file.name);
    const failed = status === "error" || status === "rejected";
    const meta =
        status === "uploading"
            ? `${Math.round(progress * 100)}%`
            : status === "done"
              ? t.fileUpload.uploaded
              : failed
                ? message
                : null;

    return (
        <li
            className="zse-upload-item"
            data-status={status}
            data-leaving={item.leaving || undefined}
            onTransitionEnd={(event) => {
                if (
                    item.leaving &&
                    event.target === event.currentTarget &&
                    event.propertyName === "grid-template-rows"
                )
                    onLeft();
            }}
        >
            <div className="zse-upload-clip">
                <div className="zse-upload-row">
                    <span className="zse-upload-thumb">
                        <Icon icon={fileIcon(file)} size={18} />
                        {preview && <img src={preview} alt="" />}
                    </span>
                    <span className="zse-upload-info">
                        <span className="zse-upload-name" title={file.name}>
                            <span className="zse-upload-base">{base}</span>
                            <span className="zse-upload-ext">{ext}</span>
                        </span>
                        <span className="zse-upload-meta">
                            <span>{formatSize(file.size, t.locale)}</span>
                            {meta && (
                                <span className="zse-upload-status">
                                    {meta}
                                </span>
                            )}
                        </span>
                        <span
                            className="zse-upload-progress"
                            data-visible={status === "uploading" || undefined}
                            style={{ "--progress": progress } as CSSProperties}
                            aria-hidden
                        />
                    </span>
                    <span className="zse-upload-state" aria-hidden>
                        <span
                            className="zse-upload-state-icon"
                            data-hidden={status !== "done" || undefined}
                        >
                            <Icon icon={CheckmarkCircle02Icon} size={16} />
                        </span>
                        <span
                            className="zse-upload-state-icon"
                            data-tone="danger"
                            data-hidden={!failed || undefined}
                        >
                            <Icon icon={AlertCircleIcon} size={16} />
                        </span>
                    </span>
                    {status === "error" && (
                        <button
                            type="button"
                            className="zse-upload-button"
                            aria-label={t.fileUpload.retry(file.name)}
                            onClick={onRetry}
                        >
                            <Icon icon={RefreshIcon} size={14} />
                        </button>
                    )}
                    <button
                        type="button"
                        className="zse-upload-button"
                        aria-label={t.common.remove(file.name)}
                        onClick={onRemove}
                    >
                        <Icon icon={Cancel01Icon} size={14} />
                    </button>
                </div>
            </div>
        </li>
    );
}
