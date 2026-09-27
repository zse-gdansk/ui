"use client";

import { useMemo } from "react";
import { encode } from "uqr";

import { useMessages } from "../../i18n/context";

export interface QRCodeProps {
    // Treść kodu, np. adres biletu albo token logowania.
    value: string;
    // Bok w px; SVG, więc ostry także w druku.
    size?: number;
    // Odporność na uszkodzenia: L 7%, M 15%, Q 25%, H 30%. Wyżej to gęstszy
    // kod; H przy wydruku, który się wytrze (wejściówka w kieszeni).
    level?: "L" | "M" | "Q" | "H";
    // Nazwa dla czytnika, np. „Wejściówka na studniówkę, Jan Kowalski”.
    label?: string;
    className?: string;
}

// Ścieżka z modułów: ciągłe odcinki w wierszu jako jeden prostokąt, mniej
// węzłów niż kwadrat na moduł.
function toPath(data: boolean[][]) {
    let path = "";
    data.forEach((row, y) => {
        let x = 0;
        while (x < row.length) {
            if (!row[x]) {
                x += 1;
                continue;
            }
            let run = 1;
            while (row[x + run]) run += 1;
            path += `M${x} ${y}h${run}v1h-${run}z`;
            x += run;
        }
    });
    return path;
}

// Kod QR jako SVG. Zawsze ciemne moduły na jasnym tle, także w ciemnym
// motywie: odwrócony kod część czytników gubi. Margines (quiet zone) w
// samym rysunku.
export function QRCode({
    value,
    size = 160,
    level = "M",
    label,
    className,
}: QRCodeProps) {
    const t = useMessages();
    const { path, modules } = useMemo(() => {
        const result = encode(value, { ecc: level, border: 2 });
        return { path: toPath(result.data), modules: result.size };
    }, [value, level]);

    return (
        // Rysunek z nazwą: dla SVG w treści role="img" to wzorzec, nie <img>.
        <svg
            className={["zse-qr", className].filter(Boolean).join(" ")}
            viewBox={`0 0 ${modules} ${modules}`}
            width={size}
            height={size}
            // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
            role="img"
            aria-label={label ?? t.qr.label}
            shapeRendering="crispEdges"
        >
            <rect width={modules} height={modules} className="zse-qr-bg" />
            <path d={path} className="zse-qr-modules" />
        </svg>
    );
}
