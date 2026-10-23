"use client";

import { createContext, useContext, useRef } from "react";

import { useExternalEffect, useLatest } from "../../utils/effects";

// Wartości, których Base UI Form nie zbiera sam: zbiera tylko natywne
// kontrolki pól (Field.Control) jako tekst, a daty i pliki to obiekty.
// Komponent rejestruje nazwę i funkcję zwracającą aktualną wartość, Form
// dokłada je do wartości przed schematem i onSubmit.
export interface FormState {
    submitting: boolean;
    register: (name: string, read: () => unknown) => () => void;
    markDirty: () => void;
}

export const FormContext = createContext<FormState>({
    submitting: false,
    register: () => () => {},
    markDirty: () => {},
});

export const useFormState = () => useContext(FormContext);

// Ta sama wartość, choć nowy obiekt: tablice plików, kolejność, daty
// i odpowiedzi ankiety bywają tworzone od nowa w każdym renderze.
export function sameValue(a: unknown, b: unknown): boolean {
    if (Object.is(a, b)) return true;
    if (a instanceof Date && b instanceof Date)
        return a.getTime() === b.getTime();
    if (Array.isArray(a) && Array.isArray(b))
        return (
            a.length === b.length &&
            a.every((item, index) => sameValue(item, b[index]))
        );
    if (
        a !== null &&
        b !== null &&
        typeof a === "object" &&
        typeof b === "object" &&
        Object.getPrototypeOf(a) === Object.prototype &&
        Object.getPrototypeOf(b) === Object.prototype
    ) {
        const keys = Object.keys(a);
        return (
            keys.length === Object.keys(b).length &&
            keys.every((key) =>
                sameValue(
                    (a as Record<string, unknown>)[key],
                    (b as Record<string, unknown>)[key],
                ),
            )
        );
    }
    return false;
}

export function useFormValue(name: string | undefined, value: unknown) {
    const { register, markDirty } = useContext(FormContext);
    const latest = useLatest(value);
    const initial = useRef(value);
    useExternalEffect(() => {
        if (!name) return;
        return register(name, () => latest.current);
    }, [name, register, latest]);
    useExternalEffect(() => {
        if (!sameValue(value, initial.current)) markDirty();
    }, [value, markDirty]);
}
