"use client";

import { useId, useSyncExternalStore } from "react";

import { useExternalEffect } from "../../utils/effects";

// Otwarte okna w kolejności otwarcia; każde poza ostatnim leży pod innym.
let stack: string[] = [];
const listeners = new Set<() => void>();

const notify = () => {
    for (const listener of listeners) listener();
};

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

// Miejsce okna w stosie. behind: nad nim leży inne okno, więc cofa się
// i przygasa. stacked: pod nim jest inne, więc nie przyciemnia strony drugi
// raz. Członkostwo idzie za stanem open, nie za montowaniem: gdy górne okno
// zaczyna się zamykać, dolne od razu wraca na wierzch.
export function useModalStack(open: boolean) {
    const id = useId();
    useExternalEffect(() => {
        if (!open) return;
        stack = [...stack, id];
        notify();
        return () => {
            stack = stack.filter((entry) => entry !== id);
            notify();
        };
    }, [id, open]);
    const behind = useSyncExternalStore(
        subscribe,
        () => open && stack.length > 0 && stack.at(-1) !== id,
        () => false,
    );
    const stacked = useSyncExternalStore(
        subscribe,
        () => stack.indexOf(id) > 0,
        () => false,
    );
    return { behind, stacked };
}
