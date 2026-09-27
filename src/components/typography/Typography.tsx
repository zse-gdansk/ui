"use client";

import { useRender } from "@base-ui/react/use-render";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import type { CSSProperties } from "react";

const cx = (...names: (string | undefined)[]) =>
    names.filter(Boolean).join(" ");

// Kolor zawsze coś znaczy (color-meaning): nie ma tu dowolnych kolorów.
export type TextTone =
    | "default"
    | "secondary"
    | "accent"
    | "success"
    | "warning"
    | "danger";

export interface TextProps extends useRender.ComponentProps<"p"> {
    // sm: podpisy, liczniki (12px); md: treść (14px); lg: wstęp (16px).
    size?: "sm" | "md" | "lg";
    tone?: TextTone;
    weight?: "regular" | "medium";
    // Ucina do jednej linii albo do tylu linii z wielokropkiem.
    truncate?: boolean | number;
    // Cyfry stałej szerokości dla liczb, które się zmieniają.
    tabular?: boolean;
}

// Tekst treści. Jako fragment zdania: render={<span />}.
export function Text({
    render,
    size = "md",
    tone = "default",
    weight = "regular",
    truncate = false,
    tabular = false,
    className,
    style,
    ...props
}: TextProps) {
    const lines = typeof truncate === "number" ? truncate : truncate ? 1 : 0;
    return useRender({
        render,
        defaultTagName: "p",
        props: {
            ...props,
            "data-size": size,
            "data-tone": tone,
            "data-weight": weight,
            "data-truncate":
                lines === 1 ? "line" : lines > 1 ? "lines" : undefined,
            "data-tabular": tabular || undefined,
            style:
                lines > 1
                    ? ({ ...style, "--text-lines": lines } as CSSProperties)
                    : style,
            className: cx("zse-text", className),
        },
    });
}

type Level = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingSize = "sm" | "md" | "lg" | "xl";

// Poziom ustala element, rozmiar wygląd. Bez rozmiaru: h1 jak nagłówek
// strony, h2 jak tytuł karty albo sekcji, niższe jak tytuł bloku.
const SIZE_BY_LEVEL: Record<Level, HeadingSize> = {
    1: "lg",
    2: "md",
    3: "sm",
    4: "sm",
    5: "sm",
    6: "sm",
};

export interface HeadingProps extends useRender.ComponentProps<"h2"> {
    level?: Level;
    // xl 24px (strona błędu, liczba na kafelku), lg 20px (strona),
    // md 16px (karta, modal), sm 14px (blok w karcie).
    size?: HeadingSize;
    tone?: "default" | "secondary";
    truncate?: boolean;
}

export function Heading({
    render,
    level = 2,
    size,
    tone = "default",
    truncate = false,
    className,
    ...props
}: HeadingProps) {
    return useRender({
        render,
        defaultTagName: `h${level}`,
        props: {
            ...props,
            "data-size": size ?? SIZE_BY_LEVEL[level],
            "data-tone": tone,
            "data-truncate": truncate ? "line" : undefined,
            className: cx("zse-heading", className),
        },
    });
}

export type StrongProps = useRender.ComponentProps<"strong">;

// Wyróżnienie w zdaniu: 500 i pełny kolor tekstu, więc widać je także
// w szarym tekście („Wypisano Annę Nowak z koła”).
export function Strong({ render, className, ...props }: StrongProps) {
    return useRender({
        render,
        defaultTagName: "strong",
        props: { ...props, className: cx("zse-strong", className) },
    });
}

export type CodeProps = useRender.ComponentProps<"code">;

// Kod, ścieżka albo nazwa zmiennej w zdaniu, o stopień mniejszy od tekstu
// (mono-in-text). Bloki kodu: CodeBlock.
export function Code({ render, className, ...props }: CodeProps) {
    return useRender({
        render,
        defaultTagName: "code",
        props: { ...props, className: cx("zse-inline-code", className) },
    });
}

// Znacznik z Checkbox (Tick02Icon, kreska 2) jako maska CSS dla
// checkboxów w surowym HTML-u, gdzie nie da się wstawić Icon.
const kebab = (name: string) =>
    name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

const TICK_MASK = (() => {
    const shapes = Tick02Icon.map(([tag, attributes]) => {
        const list = Object.entries(attributes)
            .filter(([name]) => name !== "key")
            .map(
                ([name, value]) =>
                    `${kebab(name)}="${name === "strokeWidth" ? 2 : value}"`,
            )
            .join(" ");
        return `<${tag} ${list}/>`;
    }).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">${shapes}</svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
})();

export interface ProseProps extends useRender.ComponentProps<"div"> {
    // sm: w wąskim miejscu, np. opis wydarzenia w popoverze.
    size?: "sm" | "md";
}

// Surowy HTML, którego aplikacja nie składa z komponentów: treść
// z edytora, markdown, opis z CMS-a. Elementy wyglądają jak Heading,
// Text, Strong, Code i Checkbox, bo dzielą z nimi reguły CSS. HTML od
// użytkowników aplikacja czyści (np. DOMPurify) przed
// dangerouslySetInnerHTML.
export function Prose({
    render,
    size = "md",
    className,
    style,
    ...props
}: ProseProps) {
    return useRender({
        render,
        defaultTagName: "div",
        props: {
            ...props,
            "data-size": size,
            style: { "--zse-prose-tick": TICK_MASK, ...style } as CSSProperties,
            className: cx("zse-prose", className),
        },
    });
}
