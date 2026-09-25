import { Toast } from "@base-ui/react/toast";
import type { ReactNode } from "react";

export const toastManager = Toast.createToastManager<ToastData>();

export type ToastType = "success" | "error" | "warning" | "info" | "loading";

export interface ToastData {
    count?: number;
    onUndo?: () => void;
}

export interface ToastOptions {
    id?: string;
    description?: ReactNode;
    // 0 = nie znika sam.
    timeout?: number;
    priority?: "low" | "high";
}

type Message<Value> = ReactNode | ((value: Value) => ReactNode);

// Otwarte toasty według treści: ten sam komunikat podbija licznik zamiast
// dokładać kartę. Wpis znika, gdy toast zaczyna się zamykać.
const open = new Map<string, { id: string; count: number }>();
// Kolejność otwartych toastów, ostatni jest z przodu stosu.
const order: string[] = [];
let nextId = 0;

const plain = (node: ReactNode) =>
    node == null || typeof node === "string" || typeof node === "number";

function groupKey(
    type: ToastType | undefined,
    title: ReactNode,
    description: ReactNode,
) {
    if (!plain(title) || !plain(description)) return null;
    return JSON.stringify([type ?? "", title, description ?? ""]);
}

function show(
    type: ToastType | undefined,
    title: ReactNode,
    options: ToastOptions = {},
    data: ToastData = {},
) {
    const key =
        options.id || type === "loading" || data.onUndo
            ? null
            : groupKey(type, title, options.description);
    const existing = key ? open.get(key) : undefined;

    if (key && existing && order.at(-1) === existing.id) {
        existing.count += 1;
        toastManager.update(existing.id, {
            timeout: options.timeout,
            data: { count: existing.count },
        });
        return existing.id;
    }

    const count = existing ? existing.count + 1 : 1;
    if (existing) toastManager.close(existing.id);

    const id = options.id ?? `zse-toast-${nextId++}`;
    toastManager.add({
        ...options,
        id,
        title,
        type,
        data: { ...data, count },
        onClose: () => {
            const index = order.indexOf(id);
            if (index !== -1) order.splice(index, 1);
            if (key && open.get(key)?.id === id) open.delete(key);
        },
    });
    order.push(id);
    if (key) open.set(key, { id, count });
    return id;
}

function resolve<Value>(message: Message<Value>, value: Value) {
    return typeof message === "function" ? message(value) : message;
}

export const toast = Object.assign(
    (title: ReactNode, options?: ToastOptions) =>
        show(undefined, title, options),
    {
        success: (title: ReactNode, options?: ToastOptions) =>
            show("success", title, options),
        error: (title: ReactNode, options?: ToastOptions) =>
            show("error", title, options),
        warning: (title: ReactNode, options?: ToastOptions) =>
            show("warning", title, options),
        info: (title: ReactNode, options?: ToastOptions) =>
            show("info", title, options),
        loading: (title: ReactNode, options?: ToastOptions) =>
            show("loading", title, { timeout: 0, ...options }),
        // Ikona cofania obok X; kliknięcie wywołuje onUndo i zamyka toast.
        undo: (
            title: ReactNode,
            { onUndo, ...options }: ToastOptions & { onUndo: () => void },
        ) => show(undefined, title, options, { onUndo }),
        promise: <Value>(
            promise: Promise<Value>,
            messages: {
                loading: ReactNode;
                success: Message<Value>;
                error: Message<unknown>;
            },
        ) =>
            toastManager.promise(promise, {
                loading: { title: messages.loading, type: "loading" },
                success: (value) => ({
                    title: resolve(messages.success, value),
                    type: "success",
                }),
                error: (error) => ({
                    title: resolve(messages.error, error),
                    type: "error",
                }),
            }),
        update: (
            id: string,
            options: ToastOptions & { title?: ReactNode; type?: ToastType },
        ) => toastManager.update(id, options),
        dismiss: (id?: string) => toastManager.close(id),
    },
);
