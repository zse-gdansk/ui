"use client";

import { Field } from "@base-ui/react/field";
import {
    type ChangeEvent,
    type ComponentProps,
    type ReactNode,
    useRef,
    useState,
} from "react";
import { flushSync } from "react-dom";

import { FieldFooter } from "../field/FieldFooter";
import type { Mask } from "./masks";

type InputSize = "sm" | "md" | "lg";

export interface MaskedInputProps extends Omit<
    ComponentProps<typeof Field.Control>,
    "size" | "value" | "defaultValue" | "onChange" | "onValueChange"
> {
    label?: ReactNode;
    hint?: ReactNode;
    error?: string | undefined;
    size?: InputSize;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    // createMask("99-999"), studentIdMask albo własny obiekt z format.
    mask: Mask;
}

const DEFAULT_SEPARATORS = "/-.: ";

// Pozycja po `count` znakach treści (nie separatorach). Z `past` kursor
// przechodzi też za separatory stojące zaraz dalej.
function caretAfter(
    text: string,
    count: number,
    separators: string,
    past: (index: number) => boolean,
) {
    let seen = 0;
    let index = 0;
    while (index < text.length && seen < count) {
        if (!separators.includes(text[index] ?? "")) seen++;
        index++;
    }
    if (past(index))
        while (index < text.length && separators.includes(text[index] ?? ""))
            index++;
    return index;
}

function onlySeparators(text: string, from: number, separators: string) {
    for (let index = from; index < text.length; index++)
        if (!separators.includes(text[index] ?? "")) return false;
    return true;
}

function contentBefore(text: string, index: number, separators: string) {
    let count = 0;
    for (const char of text.slice(0, index))
        if (!separators.includes(char)) count++;
    return count;
}

export function MaskedInput({
    label,
    hint,
    error,
    size = "md",
    value,
    defaultValue,
    onValueChange,
    mask,
    disabled = false,
    className,
    onBlur,
    onScroll,
    ...props
}: MaskedInputProps) {
    const { format, finalize, separators = DEFAULT_SEPARATORS } = mask;
    const [own, setOwn] = useState(() =>
        format(value ?? defaultValue ?? "", ""),
    );
    const current = value ?? own;
    const mirror = useRef<HTMLSpanElement>(null);

    function commit(next: string, input: HTMLInputElement, caret: number) {
        // Synchronicznie, żeby ustawić kursor w nowym tekście, zanim
        // przeglądarka narysuje klatkę.
        flushSync(() => {
            if (value === undefined) setOwn(next);
            onValueChange?.(next);
        });
        input.setSelectionRange(caret, caret);
        if (mirror.current) mirror.current.scrollLeft = input.scrollLeft;
    }

    function change(event: ChangeEvent<HTMLInputElement>) {
        const input = event.currentTarget;
        let raw = input.value;
        let caret = input.selectionStart ?? raw.length;
        const kind = (event.nativeEvent as InputEvent).inputType ?? "";

        // Skasowany separator, który format dopisałby z powrotem: kasujemy
        // też znak obok, inaczej cofanie stałoby w miejscu.
        const removed =
            current.length === raw.length + 1 &&
            separators.includes(current[caret] ?? "");
        if (removed && format(raw, current) === current) {
            if (kind === "deleteContentForward") {
                raw = raw.slice(0, caret) + raw.slice(caret + 1);
            } else if (caret > 0) {
                raw = raw.slice(0, caret - 1) + raw.slice(caret);
                caret -= 1;
            }
        }

        const next = format(raw, current);
        const count = contentBefore(raw, caret, separators);
        const typedSeparator = separators.includes(raw[caret - 1] ?? "");
        const inserting = kind.startsWith("insert");
        // Za separator, gdy właśnie wpisano go ręcznie (następna cyfra
        // idzie po „/”) albo gdy format dopisał go na końcu. Przy wpisywaniu
        // w środku kursor zostaje przed nim: numer może mieć jeszcze cyfrę.
        const past = (index: number) =>
            typedSeparator ||
            (inserting && onlySeparators(next, index, separators));
        commit(next, input, caretAfter(next, count, separators, past));
    }

    return (
        <Field.Root
            className="zse-input zse-mask"
            data-size={size}
            disabled={disabled}
            {...(error && { invalid: true })}
            {...(props.name !== undefined && { name: props.name })}
        >
            {label != null && label !== false && (
                <Field.Label className="zse-input-label">{label}</Field.Label>
            )}

            <div className="zse-input-control">
                <Field.Control
                    {...(mask.pattern !== undefined && {
                        pattern: mask.pattern,
                    })}
                    {...(mask.inputMode !== undefined && {
                        inputMode: mask.inputMode,
                    })}
                    {...props}
                    value={current}
                    disabled={disabled}
                    onChange={change}
                    onBlur={(event) => {
                        if (finalize) {
                            const next = finalize(current);
                            if (next !== current) {
                                if (value === undefined) setOwn(next);
                                onValueChange?.(next);
                            }
                        }
                        onBlur?.(event);
                    }}
                    onScroll={(event) => {
                        if (mirror.current)
                            mirror.current.scrollLeft =
                                event.currentTarget.scrollLeft;
                        onScroll?.(event);
                    }}
                    className={(state) =>
                        [
                            "zse-input-field zse-mask-field",
                            typeof className === "function"
                                ? className(state)
                                : className,
                        ]
                            .filter(Boolean)
                            .join(" ")
                    }
                />
                {/* Kopia tekstu nad polem: te same wymiary co input, więc
                    znaki stoją dokładnie na tekście pola, a separatory
                    mogą wejść z animacją. Tekst pola jest przezroczysty,
                    kursor i zaznaczenie zostają. */}
                <span ref={mirror} className="zse-mask-mirror" aria-hidden>
                    {[...current].map((char, index) =>
                        separators.includes(char) ? (
                            <span
                                // Separator na swojej pozycji: nowy wchodzi
                                // z animacją, istniejący stoi.
                                // oxlint-disable-next-line react/no-array-index-key
                                key={index}
                                className="zse-mask-separator"
                            >
                                {char}
                            </span>
                        ) : (
                            char
                        ),
                    )}
                </span>
            </div>

            <FieldFooter error={error} hint={hint} />
        </Field.Root>
    );
}
