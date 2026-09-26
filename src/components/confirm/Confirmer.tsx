"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { useRef, useState, useSyncExternalStore } from "react";

import { useMessages } from "../../i18n/context";
import { Button } from "../button/Button";
import {
    currentConfirm,
    settleConfirm,
    subscribeConfirm,
    type ConfirmRequest,
} from "./confirm";

// Okno dla confirm(). Montowane raz, np. obok <Toaster />.
export function Confirmer() {
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
    const [failed, setFailed] = useState<number | null>(null);
    const cancelRef = useRef<HTMLButtonElement>(null);
    const confirmRef = useRef<HTMLButtonElement>(null);

    const options = shown?.options;
    const busy = shown !== null && pending === shown.id;

    async function accept() {
        if (!shown || busy) return;
        const { id, options: request } = shown;
        if (!request.onConfirm) {
            settleConfirm(id, true);
            return;
        }
        setPending(id);
        setFailed(null);
        try {
            await request.onConfirm();
            settleConfirm(id, true);
        } catch {
            setFailed(id);
        } finally {
            setPending(null);
        }
    }

    return (
        <AlertDialog.Root
            open={current !== null}
            onOpenChange={(open, details) => {
                if (open || !shown) return;
                if (busy) {
                    details.cancel();
                    return;
                }
                settleConfirm(shown.id, false);
            }}
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
                    {shown !== null && failed === shown.id && (
                        <p className="zse-confirm-error" role="alert">
                            {t.confirm.failed}
                        </p>
                    )}
                    <div className="zse-modal-footer">
                        <Button
                            ref={cancelRef}
                            variant="outline"
                            disabled={busy}
                            onClick={() =>
                                shown && settleConfirm(shown.id, false)
                            }
                        >
                            {options?.cancelLabel ?? t.common.cancel}
                        </Button>
                        <Button
                            ref={confirmRef}
                            variant={options?.danger ? "danger" : "primary"}
                            loading={busy}
                            onClick={accept}
                        >
                            {(busy && options?.pendingLabel) ||
                                options?.confirmLabel ||
                                t.confirm.confirm}
                        </Button>
                    </div>
                </AlertDialog.Popup>
            </AlertDialog.Portal>
        </AlertDialog.Root>
    );
}
