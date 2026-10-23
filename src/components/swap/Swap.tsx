"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";

import { useDomEffect } from "../../utils/effects";

// Zapas na brak transitionend (karta w tle, przerwana animacja).
const FALLBACK = 400;

export interface SwapProps {
    // Widoczny drugi widok zamiast pierwszego.
    showAlt: boolean;
    // Pierwszy widok, np. formularz albo podgląd. Zostaje zamontowany pod
    // drugim, więc po powrocie ma ten sam stan (wpisany tekst, fokus).
    main: ReactNode;
    // Drugi widok, np. edycja, wynik po akcji, kolejny krok. Montowany przy
    // pierwszym pokazaniu i potem trzymany.
    alt: ReactNode;
    className?: string;
}

// Dwa widoki w jednym miejscu: widoczny wyznacza wysokość, ukryty leży nad
// nim. Jawna wysokość tylko na czas zamiany, potem auto: treść, która rośnie
// sama (zagnieżdżony Swap, komunikat błędu), nie goni zmierzonej wartości
// klatka po klatce.
export function Swap({ showAlt, main, alt, className }: SwapProps) {
    const [altMounted, setAltMounted] = useState(showAlt);
    if (showAlt && !altMounted) setAltMounted(true);
    const rootRef = useRef<HTMLDivElement>(null);
    // Wysokość sprzed zamiany, od niej rusza animacja.
    const settled = useRef<number | null>(null);
    const shown = useRef(showAlt);

    const sync = useCallback(() => {
        const root = rootRef.current;
        if (!root) return;
        if (!root.hasAttribute("data-animating")) {
            settled.current = root.offsetHeight;
            return;
        }
        // Treść zmienia się w trakcie: animacja zmierza do nowej wysokości.
        const layer = root.querySelector<HTMLElement>(
            ":scope > .zse-swap-layer:not([data-hidden])",
        );
        if (layer) root.style.height = `${layer.offsetHeight}px`;
    }, []);

    const watch = useCallback(
        (layer: HTMLDivElement | null) => {
            if (!layer) return;
            const observer = new ResizeObserver(sync);
            observer.observe(layer);
            return () => observer.disconnect();
        },
        [sync],
    );

    useDomEffect(() => {
        const root = rootRef.current;
        if (!root || shown.current === showAlt) return;
        shown.current = showAlt;
        // Warstwy już zamienione, więc auto dałoby nową wysokość. Przy
        // zamianie w trakcie poprzedniej rusza z bieżącej.
        const from = root.hasAttribute("data-animating")
            ? root.offsetHeight
            : settled.current;
        const layer = root.querySelector<HTMLElement>(
            ":scope > .zse-swap-layer:not([data-hidden])",
        );
        if (from === null || !layer) return;
        const to = layer.offsetHeight;
        if (
            from === to ||
            parseFloat(getComputedStyle(root).transitionDuration) === 0
        ) {
            root.removeAttribute("data-animating");
            root.style.height = "";
            return;
        }

        root.setAttribute("data-animating", "");
        root.style.height = `${from}px`;
        void root.offsetHeight;
        root.style.height = `${to}px`;

        const finish = () => {
            root.removeAttribute("data-animating");
            root.style.height = "";
            settled.current = root.offsetHeight;
        };
        const end = (event: TransitionEvent) => {
            if (event.target === root && event.propertyName === "height")
                finish();
        };
        root.addEventListener("transitionend", end);
        const timer = setTimeout(finish, FALLBACK);
        return () => {
            root.removeEventListener("transitionend", end);
            clearTimeout(timer);
        };
    }, [showAlt]);

    return (
        <div
            ref={rootRef}
            className={["zse-swap", className].filter(Boolean).join(" ")}
        >
            <div
                ref={watch}
                className="zse-swap-layer"
                data-hidden={showAlt || undefined}
                aria-hidden={showAlt || undefined}
                inert={showAlt}
            >
                {main}
            </div>
            {altMounted && (
                <div
                    ref={watch}
                    className="zse-swap-layer"
                    data-hidden={!showAlt || undefined}
                    aria-hidden={!showAlt || undefined}
                    inert={!showAlt}
                >
                    {alt}
                </div>
            )}
        </div>
    );
}
