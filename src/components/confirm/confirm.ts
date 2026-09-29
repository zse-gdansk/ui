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
    // Komunikat dla błędu z onConfirm; zastępuje ten z <Confirmer>.
    errorMessage?: (error: unknown) => ReactNode;
    // Element, przy którym pytanie pokazuje się jako dymek zamiast okna,
    // zwykle event.currentTarget. Pozycja menu wskazuje przycisk menu.
    anchor?: Element | null;
}

export interface ConfirmRequest {
    id: number;
    options: ConfirmOptions;
    // Anchor to przycisk, który sam woła confirm(): ponowne kliknięcie
    // zamyka dymek jak zwykły wyzwalacz. Nie dla przycisku menu.
    toggle: boolean;
}

type Pending = ConfirmRequest & { resolve: (value: boolean) => void };

// Kolejka pytań, pierwsze jest na ekranie. Drugie pytanie w trakcie
// pierwszego czeka, zamiast je zasłonić.
let queue: readonly Pending[] = [];
let nextId = 0;
// Pytanie, którego onConfirm właśnie trwa; ponowne kliknięcie go nie zamyka.
let busyId: number | null = null;

export function markConfirmBusy(id: number | null) {
    busyId = id;
}
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

// Modal i Sheet pod oknem potwierdzenia nie zamykają się od kliknięcia
// w nie ani od Escape.
export const isConfirmOpen = () => queue.length > 0;

export function settleConfirm(id: number, value: boolean) {
    const request = queue.find((item) => item.id === id);
    if (!request) return;
    queue = queue.filter((item) => item !== request);
    request.resolve(value);
    emit();
}

// Pozycja menu znika razem z menu po kliknięciu, więc dymek wskazuje
// przycisk, który je otworzył (dla podmenu: przycisk menu głównego).
function resolveAnchor(element: Element): Element {
    let current = element;
    for (let depth = 0; depth < 8; depth += 1) {
        const id = current
            .closest('[role="menu"]')
            ?.getAttribute("aria-labelledby");
        const trigger = id ? document.getElementById(id) : null;
        if (!trigger) break;
        current = trigger;
    }
    return current;
}

// Pytanie o potwierdzenie bez własnego stanu modala:
// if (await confirm({ title: "Usunąć ucznia?", danger: true })) …
// Wymaga <Confirmer /> w drzewie, raz na aplikację.
export function confirm(options: ConfirmOptions) {
    if (listeners.size === 0)
        console.warn(
            "confirm(): brak <Confirmer /> w drzewie, okno się nie pokaże.",
        );
    const anchor = options.anchor ? resolveAnchor(options.anchor) : null;
    const open = queue[0];
    if (
        anchor &&
        anchor === options.anchor &&
        open?.options.anchor === anchor
    ) {
        if (busyId !== open.id) settleConfirm(open.id, false);
        return Promise.resolve(false);
    }
    return new Promise<boolean>((resolve) => {
        queue = [
            ...queue,
            {
                id: nextId++,
                options: { ...options, anchor },
                toggle: anchor !== null && anchor === options.anchor,
                resolve,
            },
        ];
        emit();
    });
}
