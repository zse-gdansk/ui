"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Dialog } from "@base-ui/react/dialog";
import { useRef, useState, type ReactElement, type ReactNode } from "react";

import { useMessages } from "../../i18n/context";
import { Button } from "../button/Button";
import { CloseButton } from "../close-button/CloseButton";
import { isConfirmOpen } from "../confirm/confirm";
import { Form, FormMessage, type FormProps } from "../form/Form";
import type { StandardSchemaV1 } from "../form/standard-schema";
import { ScrollArea } from "../scroll-area/ScrollArea";
import { Skeleton } from "../skeleton/Skeleton";
import { Swap } from "../swap/Swap";
import { useModalStack } from "./stack";

export type ModalSize = "sm" | "md" | "lg" | "xl";

export type ModalForm<Schema extends StandardSchemaV1 | undefined> = Omit<
    FormProps<Schema>,
    "children" | "showMessage"
>;

export interface ModalProps<
    Schema extends StandardSchemaV1 | undefined = undefined,
> {
    // Bez open i onOpenChange modal sam trzyma stan, otwiera go trigger.
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    // Po zakończeniu animacji otwarcia albo zamknięcia.
    onOpenChangeComplete?: (open: boolean) => void;
    trigger?: ReactElement<Record<string, unknown>>;
    title: ReactNode;
    // Pod tytułem w ramce. Bez children trafia do karty jako treść okna.
    description?: ReactNode;
    children?: ReactNode;
    footer?: ReactNode;
    closeLabel?: string;
    // Wymaga decyzji: bez X, bez zamykania kliknięciem w tło i Escape.
    // Zamykają tylko przyciski w stopce (ModalClose).
    alert?: boolean;
    // sm 400 px (potwierdzenia, domyślny dla alert), md 520 px (formularze,
    // domyślny), lg 720 px (szczegóły), xl 896 px (szerokie tabele).
    size?: ModalSize;
    // top przypina okno u góry: treść, która rośnie (np. rozwijane sekcje),
    // przesuwa tylko dolną krawędź, zamiast całego okna pod kursorem.
    placement?: "center" | "top";
    // Treść i stopka w <Form>: FormSubmit w stopce wysyła bez form="id",
    // w trakcie wysyłania okna nie da się zamknąć, a po zmianach w polach
    // zamknięcie pyta o ich porzucenie.
    form?: ModalForm<Schema>;
    // Niezapisane zmiany poza formularzem albo zamiast jego wykrywania.
    // Escape, tło i X pytają wtedy przed zamknięciem. onOpenChange(false)
    // wywołane wprost (np. po zapisie) zamyka bez pytania.
    dirty?: boolean;
    // Trwa zapis: Escape, tło, X i ModalClose nie zamykają.
    pending?: boolean;
    // Dane do okna jeszcze się ładują: szkielet zamiast treści.
    loading?: boolean;
}

export function Modal<Schema extends StandardSchemaV1 | undefined = undefined>({
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
    size = alert ? "sm" : "md",
    placement = "center",
    form,
    dirty: dirtyProp,
    pending: pendingProp = false,
    loading = false,
}: ModalProps<Schema>) {
    const t = useMessages();
    const [innerOpen, setInnerOpen] = useState(false);
    const isOpen = open ?? innerOpen;
    const [formDirty, setFormDirty] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    // Zostaje do końca animacji zamknięcia, więc porzucone okno odchodzi
    // jako pytanie, a nie miga formularzem.
    const [discarding, setDiscarding] = useState(false);
    const discardRef = useRef<HTMLButtonElement>(null);
    const returnFocus = useRef<HTMLElement | null>(null);
    const { behind, stacked } = useModalStack(isOpen);

    const dirty = dirtyProp ?? formDirty;
    const pending = pendingProp || submitting;

    const setOpen = (next: boolean) => {
        if (open === undefined) setInnerOpen(next);
        onOpenChange?.(next);
    };

    // Warstwa przestaje być inert dopiero po renderze, więc fokus klatkę
    // później.
    const ask = () => {
        returnFocus.current =
            document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
        setDiscarding(true);
        requestAnimationFrame(() => discardRef.current?.focus());
    };

    const keep = () => {
        setDiscarding(false);
        requestAnimationFrame(() => returnFocus.current?.focus());
    };

    const change = (
        next: boolean,
        details: { reason: string; cancel: () => void },
    ) => {
        if (!next) {
            if (
                isConfirmOpen() ||
                pending ||
                (alert && details.reason === "escape-key")
            ) {
                details.cancel();
                return;
            }
            if (dirty) {
                details.cancel();
                // Escape przy pytaniu znaczy „wróć do edycji”.
                if (discarding && details.reason === "escape-key") keep();
                else if (!discarding) ask();
                return;
            }
        }
        setOpen(next);
    };

    const rootProps = {
        open: isOpen,
        onOpenChange: change,
        onOpenChangeComplete: (next: boolean) => {
            if (!next) {
                setDiscarding(false);
                setFormDirty(false);
            }
            onOpenChangeComplete?.(next);
        },
    };

    const describedInCard = children == null && !loading;
    const descriptionNode = description != null && (
        <Dialog.Description className="zse-modal-description">
            {description}
        </Dialog.Description>
    );

    const header = (
        <div className="zse-modal-header">
            <div className="zse-modal-heading">
                <Dialog.Title className="zse-modal-title">{title}</Dialog.Title>
                {!describedInCard && descriptionNode}
            </div>
            {!alert && (
                <Dialog.Close
                    disabled={pending}
                    render={<CloseButton label={closeLabel} />}
                />
            )}
        </div>
    );

    const content = loading ? (
        <div className="zse-modal-loading" aria-busy>
            <Skeleton width="33%" height={14} />
            <Skeleton height={36} />
            <Skeleton width="25%" height={14} />
            <Skeleton height={36} />
        </div>
    ) : describedInCard ? (
        descriptionNode
    ) : (
        children
    );

    const body = (form || content) && (
        <ScrollArea className="zse-modal-body" arrows={false}>
            <div className="zse-modal-content">
                {form && <FormMessage />}
                {content}
            </div>
        </ScrollArea>
    );
    const foot = footer != null && (
        <div className="zse-modal-footer">{footer}</div>
    );

    const card = (
        <div className="zse-modal-card">
            {form ? (
                <Form
                    {...form}
                    className={["zse-modal-form", form.className]
                        .filter(Boolean)
                        .join(" ")}
                    showMessage={false}
                    onDirtyChange={(next) => {
                        setFormDirty(next);
                        form.onDirtyChange?.(next);
                    }}
                    onSubmit={async (values) => {
                        setSubmitting(true);
                        try {
                            return await form.onSubmit(values);
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    {body}
                    {foot}
                </Form>
            ) : (
                <>
                    {body}
                    {foot}
                </>
            )}
        </div>
    );

    // Bez Dialog.Title: nazwą okna zostaje tytuł formularza pod spodem.
    const discard = (
        <div className="zse-modal-view" data-size="sm">
            <div className="zse-modal-header">
                <div className="zse-modal-heading">
                    <h2 className="zse-modal-title">{t.modal.discardTitle}</h2>
                </div>
            </div>
            <div className="zse-modal-card">
                <div className="zse-modal-content">
                    <p className="zse-modal-description">
                        {t.modal.discardDescription}
                    </p>
                </div>
                <div className="zse-modal-footer">
                    <Button variant="ghost" onClick={keep}>
                        {t.modal.keepEditing}
                    </Button>
                    <Button
                        ref={discardRef}
                        variant="danger"
                        onClick={() => setOpen(false)}
                    >
                        {t.modal.discard}
                    </Button>
                </div>
            </div>
        </div>
    );

    const portal = (
        <Dialog.Portal>
            <Dialog.Backdrop
                className="zse-modal-backdrop"
                data-stacked={stacked || undefined}
            />
            <Dialog.Popup
                className="zse-modal"
                data-size={size}
                data-discarding={discarding || undefined}
                data-placement={placement}
                data-behind={behind || undefined}
                aria-busy={pending || undefined}
            >
                {/* Formularz zostaje pod pytaniem, więc „Wróć do edycji”
                    oddaje dokładnie to, co było wpisane. */}
                <Swap
                    showAlt={discarding}
                    main={
                        <div className="zse-modal-view" data-size={size}>
                            {header}
                            {card}
                        </div>
                    }
                    alt={discard}
                />
            </Dialog.Popup>
        </Dialog.Portal>
    );

    if (alert) {
        return (
            <AlertDialog.Root {...rootProps}>
                {trigger && <AlertDialog.Trigger render={trigger} />}
                {portal}
            </AlertDialog.Root>
        );
    }

    return (
        <Dialog.Root {...rootProps}>
            {trigger && <Dialog.Trigger render={trigger} />}
            {portal}
        </Dialog.Root>
    );
}

export const ModalClose = Dialog.Close;
