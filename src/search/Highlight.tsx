import type { ReactNode } from "react";

import type { Range } from "./search";

export interface HighlightProps {
    text: string;
    ranges?: readonly Range[] | undefined;
    className?: string;
}

// Tekst z dopasowanymi fragmentami w <mark>.
export function Highlight({
    text,
    ranges,
    className = "zse-highlight",
}: HighlightProps) {
    if (!ranges?.length) return text;
    const parts: ReactNode[] = [];
    let cursor = 0;
    for (const [start, end] of ranges) {
        if (start > cursor) parts.push(text.slice(cursor, start));
        parts.push(
            <mark key={start} className={className}>
                {text.slice(start, end)}
            </mark>,
        );
        cursor = end;
    }
    if (cursor < text.length) parts.push(text.slice(cursor));
    return <>{parts}</>;
}
