"use client";

import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { Icon, type IconGlyph } from "../icon/Icon";

export interface SegmentedOption {
    value: string;
    label?: ReactNode;
    icon?: IconGlyph;
    // Etykieta dla czytnika, gdy segment ma samą ikonę.
    "aria-label"?: string;
    disabled?: boolean;
}

export interface SegmentedControlProps {
    options: readonly SegmentedOption[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    // Opis całej grupy dla czytnika, np. „Widok kalendarza”.
    "aria-label": string;
    size?: "sm" | "md" | "lg";
    // Segmenty równej szerokości na całą szerokość rodzica.
    fullWidth?: boolean;
    disabled?: boolean;
    name?: string;
    className?: string;
}

// Suwak pod wybranym segmentem: pozycja i szerokość mierzone z DOM, więc
// segmenty mogą mieć różną długość tekstu.
function place(root: HTMLElement, value: string | undefined) {
    const active =
        value === undefined
            ? null
            : root.querySelector<HTMLElement>(
                  `.zse-segmented-item[data-value="${CSS.escape(value)}"]`,
              );
    if (!active) {
        root.removeAttribute("data-ready");
        return;
    }
    root.style.setProperty("--thumb-left", `${active.offsetLeft}px`);
    root.style.setProperty("--thumb-width", `${active.offsetWidth}px`);
    // Pierwsze ustawienie bez animacji, suwak nie wjeżdża z lewej krawędzi.
    if (!root.hasAttribute("data-ready"))
        requestAnimationFrame(() => root.setAttribute("data-ready", ""));
}

export function SegmentedControl({
    options,
    value,
    defaultValue,
    onValueChange,
    "aria-label": label,
    size = "md",
    fullWidth = false,
    disabled = false,
    name,
    className,
}: SegmentedControlProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const [internal, setInternal] = useState(
        defaultValue ?? options.find((option) => !option.disabled)?.value,
    );
    const current = value ?? internal;

    useLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        place(root, current);
        // Zmiana szerokości (font, zawijanie rodzica) przestawia suwak.
        const observer = new ResizeObserver(() => place(root, current));
        observer.observe(root);
        for (const item of root.children) observer.observe(item);
        return () => observer.disconnect();
    }, [current]);

    return (
        <RadioGroup
            ref={rootRef}
            aria-label={label}
            value={current ?? null}
            disabled={disabled}
            onValueChange={(next) => {
                if (typeof next !== "string") return;
                if (value === undefined) setInternal(next);
                onValueChange?.(next);
            }}
            className={["zse-segmented", className].filter(Boolean).join(" ")}
            data-size={size}
            data-full={fullWidth || undefined}
            {...(name !== undefined && { name })}
        >
            <span className="zse-segmented-thumb" aria-hidden />
            {options.map((option) => (
                <Radio.Root
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className="zse-segmented-item"
                    data-value={option.value}
                    {...(option["aria-label"] && {
                        "aria-label": option["aria-label"],
                    })}
                >
                    {option.icon && <Icon icon={option.icon} />}
                    {option.label != null && (
                        <span className="zse-segmented-label">
                            {option.label}
                        </span>
                    )}
                </Radio.Root>
            ))}
        </RadioGroup>
    );
}
