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
    // Napis obok ikony, stały: po skopiowaniu zmienia się tylko ikona. Bez
    // niego sama ikona z aria-label.
    label?: ReactNode;
    // Ogłoszenie dla czytnika po skopiowaniu. Domyślnie „Skopiowano”.
    copiedLabel?: string;
    "aria-label"?: string;
    size?: "sm" | "md";
    variant?: "ghost" | "outline";
    onCopy?: () => void;
}

// Napis zostaje ten sam, a skopiowanie pokazuje ikona: kopiuj przechodzi
// w ptaszek i z powrotem. Szerokość się nie zmienia, a czytnik dostaje
// „Skopiowano” przez <output>, nie przez podmianę nazwy przycisku.
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
        <>
            <button
                type="button"
                className="zse-copy"
                data-size={size}
                data-variant={variant}
                data-state={state}
                data-icon-only={!hasLabel || undefined}
                aria-label={hasLabel ? undefined : ariaLabel}
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
                {hasLabel && <span className="zse-copy-label">{label}</span>}
            </button>
            {/* Poza przyciskiem: regionów na żywo wewnątrz przycisku część
                czytników nie ogłasza. */}
            <output className="zse-copy-sr">
                {state === "copied"
                    ? copiedLabel
                    : state === "failed"
                      ? t.copy.failed
                      : ""}
            </output>
        </>
    );
}
