"use client";

import {
    AlertCircleIcon,
    Copy01Icon,
    Tick02Icon,
} from "@hugeicons/core-free-icons";
import type { ReactNode } from "react";

import { useMessages } from "../../i18n/context";
import { useCopy } from "../../utils/use-copy";
import { Icon } from "../icon/Icon";

export interface CopyButtonProps {
    // Tekst do skopiowania albo funkcja, np. link budowany dopiero przy
    // kliknięciu.
    value: string | (() => string | Promise<string>);
    // Napis obok ikony. Bez niego sama ikona z aria-label.
    label?: ReactNode;
    copiedLabel?: ReactNode;
    "aria-label"?: string;
    size?: "sm" | "md";
    variant?: "ghost" | "outline";
    onCopy?: () => void;
}

// Ikony i napisy w jednej komórce siatki: przycisk ma szerokość dłuższego
// napisu, więc nic nie skacze, gdy „Kopiuj” zmienia się w „Skopiowano”.
export function CopyButton({
    value,
    label,
    copiedLabel: copiedProp,
    "aria-label": ariaProp,
    size = "md",
    variant = "ghost",
    onCopy,
}: CopyButtonProps) {
    const t = useMessages();
    const copiedLabel = copiedProp ?? t.copy.copied;
    const ariaLabel = ariaProp ?? t.copy.copy;
    const [state, copy] = useCopy();
    const hasLabel = label != null && label !== false;

    return (
        <button
            type="button"
            className="zse-copy"
            data-size={size}
            data-variant={variant}
            data-state={state}
            data-icon-only={!hasLabel || undefined}
            aria-label={
                state === "copied"
                    ? String(copiedLabel)
                    : state === "failed"
                      ? t.copy.failed
                      : hasLabel
                        ? undefined
                        : ariaLabel
            }
            onClick={async () => {
                try {
                    await copy(value);
                    onCopy?.();
                } catch {}
            }}
        >
            <span className="zse-copy-icons" aria-hidden>
                <span data-hidden={state !== "idle" || undefined}>
                    <Icon icon={Copy01Icon} />
                </span>
                <span
                    data-tone="success"
                    data-hidden={state !== "copied" || undefined}
                >
                    <Icon icon={Tick02Icon} />
                </span>
                <span
                    data-tone="danger"
                    data-hidden={state !== "failed" || undefined}
                >
                    <Icon icon={AlertCircleIcon} />
                </span>
            </span>
            {hasLabel && (
                <span className="zse-copy-labels">
                    <span data-hidden={state === "copied" || undefined}>
                        {label}
                    </span>
                    <span
                        aria-hidden
                        data-hidden={state !== "copied" || undefined}
                    >
                        {copiedLabel}
                    </span>
                </span>
            )}
        </button>
    );
}
