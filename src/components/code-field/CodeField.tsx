"use client";

import { Field } from "@base-ui/react/field";
import { OTPField } from "@base-ui/react/otp-field";
import { LoaderCircleIcon } from "@hugeicons/core-free-icons";
import {
    Fragment,
    useRef,
    useState,
    type CSSProperties,
    type ReactNode,
} from "react";

import { useMessages } from "../../i18n/context";
import { FieldFooter } from "../field/FieldFooter";
import { Icon } from "../icon/Icon";

type Status = "idle" | "verifying" | "success" | "error";

export interface CodeFieldProps {
    label?: ReactNode;
    hint?: ReactNode;
    error?: string | undefined;
    length?: number;
    // Podział na grupy z kreską, np. [3, 3] daje „123–456”.
    groups?: number[];
    type?: "numeric" | "alphanumeric" | "alpha";
    // Kropki zamiast znaków, np. PIN na wspólnym ekranie.
    mask?: boolean;
    size?: "sm" | "md" | "lg";
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    // Po wpisaniu ostatniego znaku. Promise pokazuje sprawdzanie, odrzucony
    // trzęsie polem, pokazuje błąd i czyści kod do ponownego wpisania.
    onComplete?: (code: string) => unknown;
    disabled?: boolean;
    name?: string;
    id?: string;
    autoFocus?: boolean;
}

const SHAKE_MS = 420;

export function CodeField({
    label,
    hint,
    error,
    length = 6,
    groups,
    type = "numeric",
    mask = false,
    size = "md",
    value,
    defaultValue = "",
    onValueChange,
    onComplete,
    disabled = false,
    name,
    id,
    autoFocus = false,
}: CodeFieldProps) {
    const t = useMessages();
    const rootRef = useRef<HTMLDivElement>(null);
    const [internal, setInternal] = useState(defaultValue);
    const [status, setStatus] = useState<Status>("idle");
    const [message, setMessage] = useState<string | null>(null);
    const code = value ?? internal;

    function set(next: string) {
        if (value === undefined) setInternal(next);
        onValueChange?.(next);
    }

    async function complete(next: string) {
        if (!onComplete) return;
        const result = onComplete(next);
        if (!(result instanceof Promise)) return;
        setStatus("verifying");
        try {
            await result;
            setStatus("success");
        } catch (reason) {
            setStatus("error");
            setMessage(
                reason instanceof Error && reason.message
                    ? reason.message
                    : t.codeField.invalid,
            );
            setTimeout(() => {
                set("");
                rootRef.current?.querySelector("input")?.focus();
            }, SHAKE_MS);
        }
    }

    const breaks = new Set<number>();
    let sum = 0;
    for (const group of (groups ?? []).slice(0, -1)) {
        sum += group;
        breaks.add(sum);
    }

    const shownError = error ?? (status === "error" ? message : null);

    return (
        <Field.Root
            className="zse-input zse-code"
            data-size={size}
            disabled={disabled || status === "verifying"}
            {...(shownError && { invalid: true })}
            {...(name !== undefined && { name: name })}
        >
            {label != null && label !== false && (
                <Field.Label className="zse-input-label">{label}</Field.Label>
            )}

            <div className="zse-code-row">
                <OTPField.Root
                    ref={rootRef}
                    className="zse-code-slots"
                    length={length}
                    value={code}
                    validationType={type}
                    mask={mask}
                    disabled={disabled || status === "verifying"}
                    data-status={status}
                    {...(type !== "numeric" && {
                        normalizeValue: (text: string) =>
                            text.toLocaleUpperCase(t.locale),
                    })}
                    {...(name !== undefined && { name })}
                    {...(id !== undefined && { id })}
                    onValueChange={(next) => {
                        if (status !== "idle" && status !== "verifying") {
                            setStatus("idle");
                            setMessage(null);
                        }
                        set(next);
                    }}
                    onValueComplete={(next) => void complete(next)}
                >
                    {Array.from({ length }, (_, index) => {
                        const char = code.charAt(index);
                        return (
                            // Pozycje są stałe, nie zmieniają kolejności.
                            // oxlint-disable-next-line react/no-array-index-key
                            <Fragment key={index}>
                                {breaks.has(index) && (
                                    <span
                                        className="zse-code-dash"
                                        aria-hidden
                                    />
                                )}
                                <span
                                    className="zse-code-slot"
                                    data-filled={char ? "" : undefined}
                                    style={
                                        { "--index": index } as CSSProperties
                                    }
                                >
                                    <OTPField.Input
                                        className="zse-code-input"
                                        // Tylko na życzenie, na ekranie, który służy wyłącznie do
                                        // wpisania kodu.
                                        // oxlint-disable-next-line jsx-a11y/no-autofocus
                                        autoFocus={autoFocus && index === 0}
                                        aria-label={
                                            index === 0
                                                ? undefined
                                                : t.codeField.character(
                                                      index + 1,
                                                      length,
                                                  )
                                        }
                                    />
                                    {char && (
                                        <span
                                            key={char}
                                            className="zse-code-char"
                                            data-mask={mask || undefined}
                                            aria-hidden
                                        >
                                            {mask ? null : char}
                                        </span>
                                    )}
                                    <span
                                        className="zse-code-caret"
                                        aria-hidden
                                    />
                                </span>
                            </Fragment>
                        );
                    })}
                </OTPField.Root>
                {status === "verifying" && (
                    <Icon
                        icon={LoaderCircleIcon}
                        size={18}
                        className="zse-code-spinner"
                        aria-label={t.codeField.verifying}
                    />
                )}
            </div>

            <FieldFooter error={shownError} hint={hint} />
        </Field.Root>
    );
}
