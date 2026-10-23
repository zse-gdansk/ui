"use client";

import { useSyncExternalStore } from "react";

import { useTimeout } from "../../utils/effects";

const SECOND = 1000;

// Wspólny zegar sekundowy dla wszystkich odliczań: jeden timer na aplikację,
// wyrównany do pełnych sekund, więc kilka liczników zmienia się naraz.
const listeners = new Set<() => void>();
let now = Date.now();
let timer: ReturnType<typeof setTimeout> | undefined;

function schedule() {
    timer = setTimeout(
        () => {
            now = Date.now();
            for (const listener of listeners) listener();
            schedule();
        },
        SECOND - (Date.now() % SECOND),
    );
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    if (!timer) {
        now = Date.now();
        schedule();
    }
    return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
            clearTimeout(timer);
            timer = undefined;
        }
    };
}

// null na serwerze i przy hydratacji: sekunda serwera nie zgadza się
// z przeglądarką.
const useSecond = () =>
    useSyncExternalStore(
        subscribe,
        () => now,
        () => null,
    );

// „1:59”, a od godziny „1:04:09”. Zaokrąglenie w górę: 0:00 dopiero na końcu.
export function formatCountdown(ms: number) {
    const total = Math.max(0, Math.ceil(ms / SECOND));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = String(total % 60).padStart(2, "0");
    return hours > 0
        ? `${hours}:${String(minutes).padStart(2, "0")}:${seconds}`
        : `${minutes}:${seconds}`;
}

// Czas trwania dla atrybutu datetime, np. PT1M59S.
const isoDuration = (ms: number) => {
    const total = Math.max(0, Math.ceil(ms / SECOND));
    return `PT${Math.floor(total / 3600)}H${Math.floor((total % 3600) / 60)}M${total % 60}S`;
};

export interface CountdownProps {
    until: Date | string | number;
    // Raz, gdy czas minie (także gdy minął przed zamontowaniem).
    onEnd?: () => void;
    // Nazwa dla czytnika, np. „Do końca głosowania”.
    label?: string;
    className?: string;
}

// Odliczanie do terminu, np. czas na głosowanie w turze. role="timer" nie
// ogłasza każdej sekundy; czytnik poda czas, gdy użytkownik do niego dojdzie.
export function Countdown({ until, onEnd, label, className }: CountdownProps) {
    const end = new Date(until).getTime();
    const second = useSecond();
    const left = second === null ? null : end - second;
    // Klucz end: nowy termin to nowe odliczanie do końca.
    useTimeout(
        () => onEnd?.(),
        onEnd && left !== null ? Math.max(0, left) : null,
        end,
    );

    return (
        <time
            role="timer"
            aria-label={label}
            dateTime={left === null ? undefined : isoDuration(left)}
            className={["zse-countdown", className].filter(Boolean).join(" ")}
            data-ended={(left !== null && left <= 0) || undefined}
        >
            {left === null ? "–:––" : formatCountdown(left)}
        </time>
    );
}
