"use client";

import { Toast } from "@base-ui/react/toast";
import {
    Alert02Icon,
    AlertCircleIcon,
    Cancel01Icon,
    CheckmarkCircle02Icon,
    InformationCircleIcon,
    LoaderCircleIcon,
    Undo02Icon,
} from "@hugeicons/core-free-icons";

import { Icon, type IconGlyph } from "../icon/Icon";
import { type ToastData, type ToastType, toastManager } from "./toast";

const ICONS: Record<ToastType, IconGlyph> = {
    success: CheckmarkCircle02Icon,
    error: AlertCircleIcon,
    warning: Alert02Icon,
    info: InformationCircleIcon,
    loading: LoaderCircleIcon,
};

export interface ToasterProps {
    timeout?: number;
    limit?: number;
    closeLabel?: string;
    undoLabel?: string;
}

export function Toaster({
    timeout = 4000,
    limit = 3,
    closeLabel = "Zamknij",
    undoLabel = "Cofnij",
}: ToasterProps) {
    return (
        <Toast.Provider
            toastManager={toastManager}
            timeout={timeout}
            limit={limit}
        >
            <Toast.Portal>
                <Toast.Viewport className="zse-toaster">
                    <Toasts closeLabel={closeLabel} undoLabel={undoLabel} />
                </Toast.Viewport>
            </Toast.Portal>
        </Toast.Provider>
    );
}

function Toasts({
    closeLabel,
    undoLabel,
}: {
    closeLabel: string;
    undoLabel: string;
}) {
    const { toasts, close } = Toast.useToastManager<ToastData>();

    return toasts.map((item) => {
        const type = item.type as ToastType | undefined;
        const count = item.data?.count ?? 1;
        const onUndo = item.data?.onUndo;
        return (
            <Toast.Root
                key={item.id}
                toast={item}
                swipeDirection={["down", "right"]}
                className="zse-toast"
            >
                <Toast.Content className="zse-toast-content">
                    {type && (
                        <span className="zse-toast-icon" data-type={type}>
                            {Object.entries(ICONS).map(([name, glyph]) => (
                                <span
                                    key={name}
                                    className="zse-toast-icon-layer"
                                    data-name={name}
                                    data-hidden={name !== type || undefined}
                                >
                                    <Icon icon={glyph} size={16} />
                                </span>
                            ))}
                        </span>
                    )}
                    <div className="zse-toast-text">
                        <Toast.Title className="zse-toast-title">
                            {item.title}
                            {count > 1 && (
                                <span key={count} className="zse-toast-count">
                                    x{count}
                                </span>
                            )}
                        </Toast.Title>
                        <Toast.Description className="zse-toast-description" />
                    </div>
                    {onUndo && (
                        <button
                            type="button"
                            className="zse-toast-button"
                            aria-label={undoLabel}
                            title={undoLabel}
                            onClick={() => {
                                onUndo();
                                close(item.id);
                            }}
                        >
                            <Icon icon={Undo02Icon} size={14} />
                        </button>
                    )}
                    <Toast.Close
                        className="zse-toast-button"
                        aria-label={closeLabel}
                    >
                        <Icon icon={Cancel01Icon} size={14} />
                    </Toast.Close>
                </Toast.Content>
            </Toast.Root>
        );
    });
}
