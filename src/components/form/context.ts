"use client";

import { createContext, useContext } from "react";

import { useExternalEffect, useLatest } from "../../utils/effects";

// Wartości, których Base UI Form nie zbiera sam: zbiera tylko natywne
// kontrolki pól (Field.Control) jako tekst, a daty i pliki to obiekty.
// Komponent rejestruje nazwę i funkcję zwracającą aktualną wartość, Form
// dokłada je do wartości przed schematem i onSubmit.
export interface FormState {
    submitting: boolean;
    register: (name: string, read: () => unknown) => () => void;
}

export const FormContext = createContext<FormState>({
    submitting: false,
    register: () => () => {},
});

export const useFormState = () => useContext(FormContext);

export function useFormValue(name: string | undefined, value: unknown) {
    const { register } = useContext(FormContext);
    const latest = useLatest(value);
    useExternalEffect(() => {
        if (!name) return;
        return register(name, () => latest.current);
    }, [name, register, latest]);
}
