"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Dialog } from "@base-ui/react/dialog";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import type { ReactElement, ReactNode } from "react";

import { useMessages } from "../../i18n/context";
import { Icon } from "../icon/Icon";

export interface ModalProps {
    // Bez open i onOpenChange modal sam trzyma stan, otwiera go trigger.
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    // Po zakończeniu animacji otwarcia albo zamknięcia.
    onOpenChangeComplete?: (open: boolean) => void;
    trigger?: ReactElement<Record<string, unknown>>;
    title: ReactNode;
    description?: ReactNode;
    children?: ReactNode;
    footer?: ReactNode;
    closeLabel?: string;
    // Wymaga decyzji: bez X, bez zamykania kliknięciem w tło i Escape.
    // Zamykają tylko przyciski w stopce (ModalClose).
    alert?: boolean;
}

export function Modal({
    open,
    onOpenChange,
    onOpenChangeComplete,
    trigger,
    title,
    description,
    children,
    footer,
    closeLabel,
    alert = false,
}: ModalProps) {
    const t = useMessages();
    const rootProps = {
        ...(open !== undefined && { open }),
        ...(onOpenChange && {
            onOpenChange: (next: boolean) => onOpenChange(next),
        }),
        ...(onOpenChangeComplete && { onOpenChangeComplete }),
    };

    const content = (
        <Dialog.Portal>
            <Dialog.Backdrop className="zse-modal-backdrop" />
            <Dialog.Popup className="zse-modal">
                <div className="zse-modal-header">
                    <div className="zse-modal-heading">
                        <Dialog.Title className="zse-modal-title">
                            {title}
                        </Dialog.Title>
                        {description && (
                            <Dialog.Description className="zse-modal-description">
                                {description}
                            </Dialog.Description>
                        )}
                    </div>
                    {!alert && (
                        <Dialog.Close
                            className="zse-modal-close"
                            aria-label={closeLabel ?? t.common.close}
                        >
                            <Icon icon={Cancel01Icon} size={14} />
                        </Dialog.Close>
                    )}
                </div>
                {children}
                {footer && <div className="zse-modal-footer">{footer}</div>}
            </Dialog.Popup>
        </Dialog.Portal>
    );

    if (alert) {
        return (
            <AlertDialog.Root
                {...rootProps}
                onOpenChange={(next, details) => {
                    if (details.reason === "escape-key") {
                        details.cancel();
                        return;
                    }
                    onOpenChange?.(next);
                }}
            >
                {trigger && <AlertDialog.Trigger render={trigger} />}
                {content}
            </AlertDialog.Root>
        );
    }

    return (
        <Dialog.Root {...rootProps}>
            {trigger && <Dialog.Trigger render={trigger} />}
            {content}
        </Dialog.Root>
    );
}

export const ModalClose = Dialog.Close;
