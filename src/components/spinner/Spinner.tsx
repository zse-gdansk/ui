import { LoaderCircleIcon } from "@hugeicons/core-free-icons";
import type { CSSProperties } from "react";

import { Icon } from "../icon/Icon";

export interface SpinnerProps {
    size?: "sm" | "md" | "lg";
    // Dla czytnika ekranu, np. „Wczytywanie ocen”.
    label?: string;
    // Pojawia się dopiero po tylu ms: szybkie ładowanie nie mignie.
    delay?: number;
    className?: string;
}

const SIZES = { sm: 16, md: 20, lg: 32 } as const;

// Ten sam kręcący się okrąg co w Button z loading, w kolorze tekstu.
export function Spinner({
    size = "md",
    label = "Ładowanie",
    delay = 0,
    className,
}: SpinnerProps) {
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
            <Icon
                icon={LoaderCircleIcon}
                size={SIZES[size]}
                className="zse-spinner-icon"
                aria-hidden
            />
            <span className="zse-spinner-label">{label}</span>
        </output>
    );
}
