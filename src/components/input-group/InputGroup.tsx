"use client";

import { Field } from "@base-ui/react/field";
import {
    AlertCircleIcon,
    CheckmarkCircle02Icon,
    LoaderCircleIcon,
} from "@hugeicons/core-free-icons";
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type ComponentProps,
    type ReactNode,
} from "react";

import { useMessages } from "../../i18n/context";
import { FieldFooter } from "../field/FieldFooter";
import { Icon, type IconGlyph } from "../icon/Icon";

type Status = "idle" | "loading" | "success" | "error";

export interface InputGroupProps extends Omit<
    ComponentProps<typeof Field.Control>,
    "size" | "prefix"
> {
    label?: ReactNode;
    hint?: ReactNode;
    error?: string | undefined;
    size?: "sm" | "md" | "lg";
    // Stały tekst przed i za wartością, np. "https://" i ".zse.edu.gdansk.pl".
    // Nie da się go edytować ani nie trafia do wartości.
    prefix?: ReactNode;
    suffix?: ReactNode;
    icon?: IconGlyph;
    // Status po prawej, gdy sprawdzasz sam. Z check liczy się sam.
    status?: Status;
    // Sprawdzenie wartości po chwili bez pisania, np. czy nazwa jest wolna.
    // true: znacznik, tekst: błąd pod polem. Poprzednie zapytanie dostaje
    // abort, gdy wpiszesz coś dalej.
    check?: (value: string, signal: AbortSignal) => Promise<true | string>;
    checkDelay?: number;
    // Tekst pod polem po udanym sprawdzeniu, np. „Adres jest wolny”.
    successHint?: ReactNode;
}

// Klik w przedrostek, przyrostek albo margines ustawia kursor w polu.
function focusOnPress(group: HTMLDivElement | null) {
    if (!group) return;
    const press = (event: PointerEvent) => {
        if ((event.target as Element).closest("input, button")) return;
        event.preventDefault();
        group.querySelector("input")?.focus();
    };
    group.addEventListener("pointerdown", press);
    return () => group.removeEventListener("pointerdown", press);
}

export function InputGroup({
    label,
    hint,
    error,
    size = "md",
    prefix,
    suffix,
    icon,
    status: statusProp,
    check,
    checkDelay = 400,
    successHint,
    disabled = false,
    onChange,
    className,
    ...props
}: InputGroupProps) {
    const t = useMessages();
    const failedText = t.inputGroup.checkFailed;
    const [value, setValue] = useState(
        String(props.defaultValue ?? props.value ?? ""),
    );
    const [checked, setChecked] = useState<{
        status: Status;
        message?: string;
    }>({ status: "idle" });
    const latest = useRef(0);
    const shown = props.value !== undefined ? String(props.value) : value;
    const placeholder =
        typeof props.placeholder === "string" ? props.placeholder : "";
    const mirrorRef = useRef<HTMLSpanElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const fit = useCallback(() => {
        const mirror = mirrorRef.current;
        const input = inputRef.current;
        if (!mirror || !input) return;
        input.style.width = `${mirror.getBoundingClientRect().width + 1}px`;
    }, []);

    useLayoutEffect(() => {
        if (suffix == null) return;
        fit();
        const observer = new ResizeObserver(fit);
        if (mirrorRef.current) observer.observe(mirrorRef.current);
        return () => observer.disconnect();
    });

    useEffect(() => {
        if (!check) return;
        const text = value.trim();
        if (!text) return;
        const controller = new AbortController();
        const id = (latest.current += 1);
        const timer = setTimeout(() => {
            check(text, controller.signal).then(
                (result) => {
                    if (controller.signal.aborted || id !== latest.current)
                        return;
                    setChecked(
                        result === true
                            ? { status: "success" }
                            : { status: "error", message: result },
                    );
                },
                () => {
                    if (controller.signal.aborted) return;
                    setChecked({
                        status: "error",
                        message: failedText,
                    });
                },
            );
        }, checkDelay);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [value, check, checkDelay, failedText]);

    const status = statusProp ?? checked.status;
    const message =
        error ?? (checked.status === "error" ? checked.message : undefined);

    return (
        <Field.Root
            className="zse-input zse-input-group"
            data-size={size}
            data-status={status}
            disabled={disabled}
            {...(props.name !== undefined && { name: props.name })}
            {...(message && { invalid: true })}
        >
            {label != null && label !== false && (
                <Field.Label className="zse-input-label">{label}</Field.Label>
            )}
            <div
                ref={focusOnPress}
                className="zse-input-control zse-input-group-box"
            >
                {icon && (
                    <span className="zse-input-group-icon">
                        <Icon icon={icon} />
                    </span>
                )}
                {prefix != null && (
                    <span className="zse-input-group-affix" data-side="start">
                        {prefix}
                    </span>
                )}
                {suffix != null && (
                    <span
                        ref={mirrorRef}
                        className="zse-input-group-mirror"
                        aria-hidden
                    >
                        {shown || placeholder || " "}
                    </span>
                )}
                <Field.Control
                    {...props}
                    disabled={disabled}
                    ref={inputRef}
                    data-hugging={suffix != null || undefined}
                    className={[
                        "zse-input-group-input",
                        typeof className === "string" ? className : undefined,
                    ]
                        .filter(Boolean)
                        .join(" ")}
                    onChange={(event) => {
                        const next = event.target.value;
                        setValue(next);
                        // Od razu spinner, a nie dopiero po opóźnieniu.
                        if (check)
                            setChecked(
                                next.trim()
                                    ? { status: "loading" }
                                    : { status: "idle" },
                            );
                        onChange?.(event);
                    }}
                />
                {suffix != null && (
                    <span className="zse-input-group-affix" data-side="end">
                        {suffix}
                    </span>
                )}
                {suffix != null && <span className="zse-input-group-spacer" />}
                {(check || statusProp) && (
                    <span className="zse-input-group-status" aria-hidden>
                        <span
                            data-layer="loading"
                            data-hidden={status !== "loading" || undefined}
                        >
                            <Icon
                                icon={LoaderCircleIcon}
                                className="zse-input-group-spinner"
                            />
                        </span>
                        <span
                            data-layer="success"
                            data-hidden={status !== "success" || undefined}
                        >
                            <Icon icon={CheckmarkCircle02Icon} />
                        </span>
                        <span
                            data-layer="error"
                            data-hidden={status !== "error" || undefined}
                        >
                            <Icon icon={AlertCircleIcon} />
                        </span>
                    </span>
                )}
            </div>
            <FieldFooter
                error={message}
                hint={
                    status === "success" && successHint != null
                        ? successHint
                        : hint
                }
            />
            <span className="zse-input-group-live" aria-live="polite">
                {status === "loading" ? t.inputGroup.checking : ""}
            </span>
        </Field.Root>
    );
}
