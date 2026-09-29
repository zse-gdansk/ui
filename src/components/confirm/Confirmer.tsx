"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Popover } from "@base-ui/react/popover";
import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";

import { useMessages } from "../../i18n/context";
import { Button } from "../button/Button";
import {
    currentConfirm,
    markConfirmBusy,
    settleConfirm,
    subscribeConfirm,
    type ConfirmRequest,
} from "./confirm";

export interface ConfirmerProps {
    // Komunikat dla błędu z onConfirm, np. z kodu błędu API. Bez niego
    // ogólne „Nie udało się”.
    errorMessage?: (error: unknown) => ReactNode;
}

// Okno dla confirm(). Montowane raz, np. obok <Toaster />.
export function Confirmer({ errorMessage }: ConfirmerProps) {
    const t = useMessages();
    const current = useSyncExternalStore(
        subscribeConfirm,
        currentConfirm,
        () => null,
    );
    const [last, setLast] = useState<ConfirmRequest | null>(current);
    if (current && current !== last) setLast(current);
    const shown = current ?? last;

    const [pending, setPending] = useState<number | null>(null);
    const [failed, setFailed] = useState<{
        id: number;
        message: ReactNode;
    } | null>(null);
    const cancelRef = useRef<HTMLButtonElement>(null);
    const confirmRef = useRef<HTMLButtonElement>(null);

    const options = shown?.options;
    const anchor = options?.anchor ?? null;
    const busy = shown !== null && pending === shown.id;

    async function accept() {
        if (!shown || busy) return;
        const { id, options: request } = shown;
        if (!request.onConfirm) {
            settleConfirm(id, true);
            return;
        }
        setPending(id);
        markConfirmBusy(id);
        setFailed(null);
        try {
            await request.onConfirm();
            settleConfirm(id, true);
        } catch (error) {
            const format = request.errorMessage ?? errorMessage;
            setFailed({ id, message: format?.(error) ?? t.confirm.failed });
        } finally {
            setPending(null);
            markConfirmBusy(null);
        }
    }

    function close(open: boolean, details: { cancel: () => void }) {
        if (open || !shown) return;
        if (busy) {
            details.cancel();
            return;
        }
        settleConfirm(shown.id, false);
    }

    const error = shown !== null && failed?.id === shown.id && (
        <p className="zse-confirm-error" role="alert">
            {failed.message}
        </p>
    );

    const buttons = (size: "sm" | "md") => (
        <>
            <Button
                ref={cancelRef}
                variant="outline"
                size={size}
                disabled={busy}
                onClick={() => shown && settleConfirm(shown.id, false)}
            >
                {options?.cancelLabel ?? t.common.cancel}
            </Button>
            <Button
                ref={confirmRef}
                variant={options?.danger ? "danger" : "primary"}
                size={size}
                loading={busy}
                onClick={accept}
            >
                {(busy && options?.pendingLabel) ||
                    options?.confirmLabel ||
                    t.confirm.confirm}
            </Button>
        </>
    );

    return (
        <>
            <AlertDialog.Root
                open={current !== null && anchor === null}
                onOpenChange={close}
            >
                <AlertDialog.Portal>
                    <AlertDialog.Backdrop className="zse-modal-backdrop" />
                    <AlertDialog.Popup
                        className="zse-modal zse-confirm"
                        initialFocus={options?.danger ? cancelRef : confirmRef}
                        aria-busy={busy || undefined}
                    >
                        <div className="zse-modal-heading">
                            <AlertDialog.Title className="zse-modal-title">
                                {options?.title}
                            </AlertDialog.Title>
                            {options?.description != null && (
                                <AlertDialog.Description className="zse-modal-description">
                                    {options.description}
                                </AlertDialog.Description>
                            )}
                        </div>
                        {error}
                        <div className="zse-modal-footer">{buttons("md")}</div>
                    </AlertDialog.Popup>
                </AlertDialog.Portal>
            </AlertDialog.Root>
            <Popover.Root
                open={current !== null && anchor !== null}
                onOpenChange={(open, details) => {
                    // Klik w sam przycisk obsłuży confirm() jako zamknięcie;
                    // zamknięte tu, otworzyłoby się od nowa z animacją.
                    if (
                        !open &&
                        details.reason === "outside-press" &&
                        shown?.toggle &&
                        details.event.target instanceof Node &&
                        anchor?.contains(details.event.target)
                    ) {
                        details.cancel();
                        return;
                    }
                    close(open, details);
                }}
                modal="trap-focus"
            >
                <Popover.Portal>
                    <Popover.Positioner
                        className="zse-popover-positioner"
                        anchor={shown?.position ?? null}
                        side="bottom"
                        align="end"
                        sideOffset={6}
                        collisionPadding={8}
                    >
                        <Popover.Popup
                            className="zse-popover zse-confirm-popover"
                            role="alertdialog"
                            initialFocus={
                                options?.danger ? cancelRef : confirmRef
                            }
                            finalFocus={() =>
                                anchor instanceof HTMLElement &&
                                anchor.isConnected
                                    ? anchor
                                    : true
                            }
                            aria-busy={busy || undefined}
                        >
                            <Popover.Title className="zse-popover-title">
                                {options?.title}
                            </Popover.Title>
                            {options?.description != null && (
                                <Popover.Description className="zse-popover-description">
                                    {options.description}
                                </Popover.Description>
                            )}
                            {error}
                            <div className="zse-confirm-actions">
                                {buttons("sm")}
                            </div>
                        </Popover.Popup>
                    </Popover.Positioner>
                </Popover.Portal>
            </Popover.Root>
        </>
    );
}
