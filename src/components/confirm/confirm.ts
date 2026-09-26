import type { ReactNode } from "react";

export interface ConfirmOptions {
    title: ReactNode;
    description?: ReactNode;
    // Czasownik zamiast „Potwierdź”, np. „Usuń”.
    confirmLabel?: string;
    // Tekst przycisku w trakcie onConfirm, np. „Usuwanie…”.
    pendingLabel?: string;
    cancelLabel?: string;
    // Czerwony przycisk, a fokus startuje na „Anuluj”, żeby Enter nic nie
    // usunął przypadkiem.
    danger?: boolean;
    // Z funkcją okno czeka na jej koniec ze spinnerem na przycisku. Błąd
    // zostawia okno otwarte z komunikatem, można spróbować jeszcze raz.
    onConfirm?: () => unknown;
}

export interface ConfirmRequest {
    id: number;
    options: ConfirmOptions;
}

type Pending = ConfirmRequest & { resolve: (value: boolean) => void };

// Kolejka pytań, pierwsze jest na ekranie. Drugie pytanie w trakcie
// pierwszego czeka, zamiast je zasłonić.
let queue: readonly Pending[] = [];
let nextId = 0;
const listeners = new Set<() => void>();

const emit = () => {
    for (const listener of listeners) listener();
};

export function subscribeConfirm(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export const currentConfirm = (): ConfirmRequest | null => queue[0] ?? null;

export function settleConfirm(id: number, value: boolean) {
    const request = queue.find((item) => item.id === id);
    if (!request) return;
    queue = queue.filter((item) => item !== request);
    request.resolve(value);
    emit();
}

// Pytanie o potwierdzenie bez własnego stanu modala:
// if (await confirm({ title: "Usunąć ucznia?", danger: true })) …
// Wymaga <Confirmer /> w drzewie, raz na aplikację.
export function confirm(options: ConfirmOptions) {
    if (listeners.size === 0)
        console.warn(
            "confirm(): brak <Confirmer /> w drzewie, okno się nie pokaże.",
        );
    return new Promise<boolean>((resolve) => {
        queue = [...queue, { id: nextId++, options, resolve }];
        emit();
    });
}
