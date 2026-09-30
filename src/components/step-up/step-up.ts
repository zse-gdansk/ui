import type { ReactNode } from "react";

export type StepUpMethod = "passkey" | "code";

export interface StepUpHandlers {
    // Pobiera wyzwanie z serwera, woła navigator.credentials.get()
    // i weryfikuje odpowiedź. Odrzucenie to brak potwierdzenia.
    passkey?: () => Promise<void>;
    // Sprawdza kod z aplikacji uwierzytelniającej; odrzucenie to zły kod.
    code?: (code: string) => Promise<void>;
    // Komunikat dla błędu z passkey albo code, np. z kodu błędu API.
    errorMessage?: (error: unknown) => ReactNode;
    // Przez tyle ms po udanej weryfikacji nie pyta ponownie.
    verifiedFor?: number;
}

export interface StepUpOptions {
    // Metody tej osoby, w kolejności; np. ["code"], gdy nie ma klucza.
    methods?: readonly StepUpMethod[];
}

export interface StepUpRequest extends StepUpOptions {
    // Element, przy którym pojawi się pasek kodu, gdy nie ma StepUpArea.
    anchor?: Element | null;
}

type Host = (request: StepUpRequest) => Promise<boolean>;

let host: Host | null = null;
let verifiedUntil = 0;

export function registerStepUpHost(next: Host) {
    host = next;
    return () => {
        if (host === next) host = null;
    };
}

export const isRecentlyVerified = () => Date.now() < verifiedUntil;

export function markVerified(duration: number) {
    verifiedUntil = Date.now() + duration;
}

export const passkeySupported = () =>
    typeof window !== "undefined" &&
    typeof window.PublicKeyCredential === "function";

// Anulowanie okna systemu i przekroczony czas dają ten sam błąd.
export const isPasskeyCancel = (error: unknown) =>
    error instanceof DOMException &&
    (error.name === "NotAllowedError" || error.name === "AbortError");

// Potwierdzenie tożsamości przed wrażliwą akcją, z dowolnego miejsca:
// if (!(await stepUp({ anchor: event.currentTarget }))) return;
// Wołaj synchronicznie w obsłudze kliknięcia: klucz dostępu wymaga gestu.
// Wymaga <StepUpProvider> w drzewie.
export function stepUp(request: StepUpRequest = {}): Promise<boolean> {
    if (!host) {
        console.warn("stepUp(): brak <StepUpProvider /> w drzewie.");
        return Promise.resolve(false);
    }
    return host(request);
}
