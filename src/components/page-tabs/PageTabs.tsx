"use client";

import { useRender } from "@base-ui/react/use-render";
import {
    useLayoutEffect,
    useRef,
    type ReactElement,
    type ReactNode,
} from "react";

import { ScrollArea } from "../scroll-area/ScrollArea";

export interface PageTabsProps {
    // Nazwa nawigacji dla czytników, np. „Widoki ucznia”.
    label: string;
    // PageTab.
    children: ReactNode;
}

// Kreska pod aktywną zakładką: położenie i szerokość z DOM do zmiennych
// CSS. Pierwsze ustawienie bez przejścia, żeby kreska nie wjeżdżała przy
// wczytaniu. Aktywna zakładka wjeżdża w widok, gdy lista się przewija.
function place(list: HTMLElement, first: boolean) {
    const active = list.querySelector<HTMLElement>('[aria-current="page"]');
    if (!active) {
        list.style.removeProperty("--tab-width");
        return;
    }
    list.style.setProperty("--tab-left", `${active.offsetLeft}px`);
    list.style.setProperty("--tab-width", `${active.offsetWidth}px`);
    if (first) requestAnimationFrame(() => list.setAttribute("data-ready", ""));

    const viewport = list.closest<HTMLElement>(".zse-scroll-viewport");
    if (!viewport) return;
    const left = active.offsetLeft;
    const right = left + active.offsetWidth;
    const fade = 28;
    if (left < viewport.scrollLeft + fade)
        viewport.scrollLeft = Math.max(0, left - fade);
    else if (right > viewport.scrollLeft + viewport.clientWidth - fade)
        viewport.scrollLeft = right - viewport.clientWidth + fade;
}

export function PageTabs({ label, children }: PageTabsProps) {
    const listRef = useRef<HTMLUListElement>(null);

    useLayoutEffect(() => {
        const list = listRef.current;
        if (!list) return;
        place(list, !list.hasAttribute("data-ready"));
    });
    useLayoutEffect(() => {
        const list = listRef.current;
        if (!list) return;
        const observer = new ResizeObserver(() => place(list, false));
        observer.observe(list);
        return () => observer.disconnect();
    }, []);

    return (
        <nav className="zse-page-tabs" aria-label={label}>
            <ScrollArea axis="horizontal" className="zse-page-tabs-scroll">
                <ul ref={listRef} className="zse-page-tabs-list">
                    {children}
                    <li className="zse-page-tabs-indicator" aria-hidden />
                </ul>
            </ScrollArea>
        </nav>
    );
}

export interface PageTabProps {
    children: ReactNode;
    // Bieżąca podstrona, np. isActivePath(pathname, "/uczniowie/12/punkty").
    active?: boolean;
    href?: string;
    // Link z routera zamiast <a>, np. <Link href="…" />.
    render?: ReactElement<Record<string, unknown>>;
    // Liczba obok etykiety, np. nowe uwagi.
    badge?: ReactNode;
}

export function PageTab({
    children,
    active = false,
    href,
    render,
    badge,
}: PageTabProps) {
    const element = useRender({
        render,
        defaultTagName: "a",
        props: {
            className: "zse-page-tab",
            "aria-current": active ? ("page" as const) : undefined,
            ...(href !== undefined && { href }),
            children: (
                <>
                    {children}
                    {badge != null && (
                        <span className="zse-page-tab-badge">{badge}</span>
                    )}
                </>
            ),
        },
    });

    return <li className="zse-page-tabs-item">{element}</li>;
}
