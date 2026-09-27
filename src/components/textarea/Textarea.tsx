"use client";

import { Field } from "@base-ui/react/field";
import {
    useRef,
    useState,
    type CSSProperties,
    type ReactNode,
    type TextareaHTMLAttributes,
} from "react";

import { useMessages } from "../../i18n/context";
import { useDomEffect, useResizeObserver } from "../../utils/effects";
import { FieldFooter } from "../field/FieldFooter";

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

function tooLong(
    length: number,
    maxLength: number | undefined,
    message: (extra: number) => string,
) {
    if (maxLength === undefined || length <= maxLength) return null;
    return message(length - maxLength);
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
    const t = useMessages();
    const ref = useRef<HTMLTextAreaElement>(null);
    const autosize = maxRows !== false;
    // Długość z wartości sterowanej wprost, bez kopii w stanie; pole bez
    // value liczy z wpisywania.
    const [typed, setLength] = useState(
        () => String(defaultValue ?? "").length,
    );
    const length = value !== undefined ? String(value).length : typed;

    // Zmiana wartości z zewnątrz (reset formularza, wstawienie szablonu).
    useDomEffect(() => {
        if (autosize && ref.current) fit(ref.current);
    }, [value, autosize]);

    // Węższe pole to więcej wierszy.
    const width = useRef(0);
    useResizeObserver(
        ref,
        () => {
            const textarea = ref.current;
            if (!textarea || textarea.offsetWidth === width.current) return;
            width.current = textarea.offsetWidth;
            fit(textarea);
        },
        { enabled: autosize },
    );

    const over = maxLength !== undefined && length > maxLength;
    const near = maxLength !== undefined && !over && length >= maxLength * 0.9;
    const overMessage = tooLong(length, maxLength, t.textarea.tooLong);
    const message = error ?? overMessage;
    const hasHint = hint != null && hint !== false;

    return (
        <Field.Root
            className="zse-input zse-textarea"
            disabled={disabled}
            {...(props.name !== undefined && { name: props.name })}
            {...(error && { invalid: true })}
            {...(maxLength !== undefined && {
                validationMode: "onChange" as const,
                validate: (text: unknown) =>
                    tooLong(
                        String(text ?? "").length,
                        maxLength,
                        t.textarea.tooLong,
                    ),
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

            {(message || hasHint || maxLength !== undefined || props.name) && (
                <div className="zse-textarea-meta">
                    <span className="zse-textarea-messages">
                        <FieldFooter error={message} hint={hint} />
                    </span>
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
