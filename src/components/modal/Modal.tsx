"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import type { ReactElement, ReactNode } from "react";

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
    closeLabel = "Zamknij",
}: ModalProps) {
    return (
        <Dialog.Root
            {...(open !== undefined && { open })}
            {...(onOpenChange && {
                onOpenChange: (next: boolean) => onOpenChange(next),
            })}
            {...(onOpenChangeComplete && { onOpenChangeComplete })}
        >
            {trigger && <Dialog.Trigger render={trigger} />}
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
                        <Dialog.Close
                            className="zse-modal-close"
                            aria-label={closeLabel}
                        >
                            <Icon icon={Cancel01Icon} size={14} />
                        </Dialog.Close>
                    </div>
                    {children}
                    {footer && <div className="zse-modal-footer">{footer}</div>}
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

export const ModalClose = Dialog.Close;
