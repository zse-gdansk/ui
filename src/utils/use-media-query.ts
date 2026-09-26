"use client";

import { useSyncExternalStore } from "react";

interface Entry {
    list: MediaQueryList;
    // Stała referencja: useSyncExternalStore z nową funkcją co render
    // odpinałby i przypinał listener przy każdym renderze.
    subscribe: (onChange: () => void) => () => void;
    read: () => boolean;
}

// Jeden MediaQueryList na zapytanie dla całej aplikacji: odczyt przy
// renderze to samo .matches, a wszystkie komponenty dzielą jeden obiekt.
const entries = new Map<string, Entry>();

function entryFor(query: string) {
    let entry = entries.get(query);
    if (!entry) {
        const list = matchMedia(query);
        entry = {
            list,
            subscribe: (onChange) => {
                list.addEventListener("change", onChange);
                return () => list.removeEventListener("change", onChange);
            },
            read: () => list.matches,
        };
        entries.set(query, entry);
    }
    return entry;
}

// Na serwerze nie ma matchMedia, więc wpis powstaje dopiero w przeglądarce.
const noopSubscribe = () => () => {};

// Czy zapytanie media pasuje, z aktualizacją przy zmianie (obrót, podpięcie
// myszy). serverValue to wynik na serwerze i przy hydracji.
export function useMediaQuery(query: string, serverValue = false) {
    const entry = typeof window === "undefined" ? null : entryFor(query);
    return useSyncExternalStore(
        entry?.subscribe ?? noopSubscribe,
        entry?.read ?? (() => serverValue),
        () => serverValue,
    );
}
