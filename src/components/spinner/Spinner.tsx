"use client";

import type { CSSProperties } from "react";

import { useMessages } from "../../i18n/context";

export interface SpinnerProps {
    size?: "sm" | "md" | "lg";
    // Dla czytnika ekranu, np. „Wczytywanie ocen”.
    label?: string;
    // Pojawia się dopiero po tylu ms: szybkie ładowanie nie mignie.
    delay?: number;
    className?: string;
}

const SIZES = { sm: 16, md: 20, lg: 32 } as const;
const SPOKES = [0, 1, 2, 3, 4, 5, 6, 7] as const;

export interface SpokesProps {
    // Średnica w px; bez niej z --spokes-size (np. rozmiar ikony przycisku).
    size?: number;
    className?: string;
}

// Wskaźnik ładowania jak w iOS i macOS: osiem kresek, po których biegnie
// jasność. Sama opacity, więc tanio i ostro także przy 14px. Ozdoba bez
// znaczenia dla czytnika; nazwę daje Spinner albo kontrolka obok.
export function Spokes({ size, className }: SpokesProps) {
    return (
        <span
            className={["zse-spokes", className].filter(Boolean).join(" ")}
            style={
                size === undefined
                    ? undefined
                    : ({ "--spokes-size": `${size}px` } as CSSProperties)
            }
            aria-hidden
        >
            {SPOKES.map((index) => (
                <span key={index} style={{ "--i": index } as CSSProperties} />
            ))}
        </span>
    );
}

// Samodzielny wskaźnik ładowania z nazwą dla czytnika, w kolorze tekstu.
// Ten sam co w Button z loading i w pozostałych komponentach.
export function Spinner({
    size = "md",
    label,
    delay = 0,
    className,
}: SpinnerProps) {
    const t = useMessages();
    return (
        <output
            className={["zse-spinner", className].filter(Boolean).join(" ")}
            data-size={size}
            style={
                delay
                    ? ({ "--spinner-delay": `${delay}ms` } as CSSProperties)
                    : undefined
            }
        >
            <Spokes size={SIZES[size]} />
            <span className="zse-spinner-label">
                {label ?? t.common.loading}
            </span>
        </output>
    );
}
