"use client";

import { Field } from "@base-ui/react/field";
import {
    useLayoutEffect,
    useRef,
    useState,
    type CSSProperties,
    type ReactNode,
    type TextareaHTMLAttributes,
} from "react";

export interface TextareaProps extends Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    "rows"
> {
    label?: ReactNode;
    hint?: ReactNode;
    error?: string | undefined;
    // Wysokość startowa w wierszach.
    rows?: number;
    // Miękki limit: da się go przekroczyć, ale wtedy pole jest błędne
    // i formularz się nie wyśle.
    maxLength?: number;
    // Rośnie z treścią do tylu wierszy, potem przewija. false: stała
    // wysokość z ręcznym rozciąganiem.
    maxRows?: number | false;
}

const PLURAL = new Intl.PluralRules("pl-PL");
const CHAR_WORDS: Partial<Record<Intl.LDMLPluralRule, string>> = {
    one: "znak",
    few: "znaki",
};
const charWord = (count: number) =>
    CHAR_WORDS[PLURAL.select(count)] ?? "znaków";

function tooLong(length: number, maxLength: number | undefined) {
    if (maxLength === undefined || length <= maxLength) return null;
    const extra = length - maxLength;
    return `Za długie o ${extra} ${charWord(extra)}`;
}

function fit(textarea: HTMLTextAreaElement) {
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight + textarea.offsetHeight - textarea.clientHeight}px`;
}

export function Textarea({
    label,
    hint,
    error,
    rows = 3,
    maxRows = 10,
    maxLength,
    value,
    defaultValue,
    onChange,
    disabled = false,
    className,
    style,
    ...props
}: TextareaProps) {
    const ref = useRef<HTMLTextAreaElement>(null);
    const autosize = maxRows !== false;
    const [length, setLength] = useState(
        () => String(value ?? defaultValue ?? "").length,
    );

    // Zmiana wartości z zewnątrz (reset formularza, wstawienie szablonu).
    useLayoutEffect(() => {
        const textarea = ref.current;
        if (!textarea) return;
        setLength(String(value ?? textarea.value).length);
        if (autosize) fit(textarea);
    }, [value, autosize]);

    // Węższe pole to więcej wierszy.
    useLayoutEffect(() => {
        const textarea = ref.current;
        if (!textarea || !autosize) return;
        let width = textarea.offsetWidth;
        const observer = new ResizeObserver(() => {
            if (textarea.offsetWidth === width) return;
            width = textarea.offsetWidth;
            fit(textarea);
        });
        observer.observe(textarea);
        return () => observer.disconnect();
    }, [autosize]);

    const over = maxLength !== undefined && length > maxLength;
    const near = maxLength !== undefined && !over && length >= maxLength * 0.9;
    const overMessage = tooLong(length, maxLength);
    const message = error ?? overMessage;
    const hasHint = hint != null && hint !== false;

    return (
        <Field.Root
            className="zse-input zse-textarea"
            disabled={disabled}
            {...(error && { invalid: true })}
            {...(maxLength !== undefined && {
                validationMode: "onChange" as const,
                validate: (text: unknown) =>
                    tooLong(String(text ?? "").length, maxLength),
            })}
        >
            {label != null && label !== false && (
                <Field.Label className="zse-input-label">{label}</Field.Label>
            )}

            <Field.Control
                disabled={disabled}
                render={
                    <textarea
                        {...props}
                        ref={ref}
                        rows={rows}
                        {...(value !== undefined && { value })}
                        {...(defaultValue !== undefined && { defaultValue })}
                        data-autosize={autosize || undefined}
                        style={
                            {
                                ...style,
                                "--textarea-rows": rows,
                                ...(autosize && {
                                    "--textarea-max-rows": maxRows,
                                }),
                            } as CSSProperties
                        }
                        onChange={(event) => {
                            setLength(event.target.value.length);
                            if (autosize) fit(event.target);
                            onChange?.(event);
                        }}
                    />
                }
                className={["zse-input-field", "zse-textarea-field", className]
                    .filter(Boolean)
                    .join(" ")}
            />

            {(message || hasHint || maxLength !== undefined) && (
                <div className="zse-textarea-meta">
                    {message ? (
                        <Field.Error className="zse-input-hint" match>
                            {message}
                        </Field.Error>
                    ) : (
                        hasHint && (
                            <Field.Description className="zse-input-hint">
                                {hint}
                            </Field.Description>
                        )
                    )}
                    {maxLength !== undefined && (
                        <span
                            className="zse-textarea-count"
                            data-near={near || undefined}
                            data-over={over || undefined}
                            aria-hidden
                        >
                            {length} / {maxLength}
                        </span>
                    )}
                </div>
            )}
        </Field.Root>
    );
}
