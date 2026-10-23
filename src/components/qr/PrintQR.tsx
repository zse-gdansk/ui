"use client";

import type { ReactNode } from "react";

import { PrintFigure } from "../print/blocks";
import type { PrintRenderer } from "../print/spec";
import { QRCode } from "./QRCode";

export interface PrintQRProps {
    // Np. adres weryfikacji dokumentu albo nagrania posiedzenia.
    value: string;
    // Podpis pod kodem, np. „Zeskanuj, aby sprawdzić dokument”.
    caption?: ReactNode;
    // Bok w px (SVG, więc ostry w każdym rozmiarze).
    size?: number;
}

export function PrintQR({ value, caption, size = 96 }: PrintQRProps) {
    return (
        <PrintFigure title={caption}>
            <QRCode value={value} size={size} level="M" />
        </PrintFigure>
    );
}

// Dla PrintFromSpec: renderers={{ qr: printQRBlock }}.
export const printQRBlock: PrintRenderer = (block) => (
    <PrintQR {...(block as unknown as PrintQRProps)} />
);
