"use client";

import {
    createElement,
    useCallback,
    useRef,
    useState,
    type ReactNode,
} from "react";

import { useDomEffect, useLatest } from "../../utils/effects";

export interface VirtualRowsOptions {
    // Wiersze ponad widok z każdej strony, żeby szybkie przewijanie nie
    // pokazywało pustki.
    overscan?: number;
    // Wysokość wiersza przed pierwszym pomiarem (token --table-cell-height).
    estimate?: number;
}

export interface VirtualRows {
    // Zakres wierszy do narysowania: rows.slice(start, end).
    start: number;
    end: number;
    // Na <TableBody {...bodyProps}>: pomiar i nasłuch przewijania. Obiekt,
    // nie pole ref, bo kompilator Reacta brałby cały wynik za ref.
    bodyProps: {
        ref: (
            element: HTMLTableSectionElement | null,
        ) => (() => void) | undefined;
    };
    // Puste wiersze przed i po narysowanych, trzymają wysokość całej listy.
    before: ReactNode;
    after: ReactNode;
    // Na <Table>: liczba wszystkich wierszy dla czytnika i paski po indeksie.
    tableProps: { "aria-rowcount": number; "data-virtual": "" };
    // Na <TableRow> wiersza o danym indeksie w całej liście.
    rowProps: (index: number) => {
        "aria-rowindex": number;
        "data-stripe"?: "";
    };
}

// Najbliższy przodek, który naprawdę przewija się w pionie: tabela z
// maxHeight, main w AppShell albo okno.
function scrollParent(element: HTMLElement): HTMLElement | Window {
    for (let node = element.parentElement; node; node = node.parentElement) {
        const overflow = getComputedStyle(node).overflowY;
        if (
            (overflow === "auto" || overflow === "scroll") &&
            node.scrollHeight > node.clientHeight + 1
        )
            return node;
    }
    return window;
}

const spacer = (height: number) =>
    height > 0
        ? createElement(
              "tr",
              {
                  className: "zse-table-spacer",
                  "aria-hidden": true,
                  style: { height },
              },
              createElement("td", { colSpan: 1000 }),
          )
        : null;

// Długa lista w Table bez rysowania wszystkich wierszy: tylko te w widoku
// z zapasem, reszta jako dwa puste wiersze o właściwej wysokości, więc
// pasek przewijania i przyklejony nagłówek działają jak przy pełnej liście.
// Wiersze stałej wysokości, jak w Table.
export function useVirtualRows(
    count: number,
    { overscan = 10, estimate = 40 }: VirtualRowsOptions = {},
): VirtualRows {
    const [range, setRange] = useState({ start: 0, end: 30, size: estimate });
    const update = useRef<(() => void) | null>(null);
    const latestCount = useLatest(count);

    // Stały ref: nasłuch zakładany raz na tbody, nie przy każdym renderze.
    const measureRef = useCallback(
        (body: HTMLTableSectionElement | null) => {
            if (!body) return;
            let frame = 0;
            let scroller = scrollParent(body);
            const measure = () => {
                frame = 0;
                const row = body.querySelector<HTMLElement>(
                    ":scope > tr:not(.zse-table-spacer)",
                );
                const size = row?.getBoundingClientRect().height || estimate;
                const top = body.getBoundingClientRect().top;
                const viewTop =
                    scroller === window
                        ? 0
                        : (scroller as HTMLElement).getBoundingClientRect().top;
                const viewHeight =
                    scroller === window
                        ? window.innerHeight
                        : (scroller as HTMLElement).clientHeight;
                const total = latestCount.current;
                const visible = Math.ceil(viewHeight / size);
                // Po zawężeniu listy przewinięcie jest jeszcze stare
                // (przeglądarka przytnie je dopiero po układzie), więc zakres
                // nie wypada poza ostatni ekran wierszy.
                const first = Math.min(
                    Math.floor((viewTop - top) / size),
                    Math.max(0, total - visible),
                );
                const last = first + visible + 1;
                const start = Math.min(Math.max(first - overscan, 0), total);
                const end = Math.min(Math.max(last + overscan, 0), total);
                setRange((current) =>
                    current.start === start &&
                    current.end === end &&
                    current.size === size
                        ? current
                        : { start, end, size },
                );
            };
            const schedule = () => {
                if (!frame) frame = requestAnimationFrame(measure);
            };
            const listen = () => {
                scroller.addEventListener("scroll", schedule, {
                    passive: true,
                });
            };
            listen();
            window.addEventListener("resize", schedule);
            // Rodzic może zacząć się przewijać dopiero z danymi, np. po wczytaniu.
            update.current = () => {
                const next = scrollParent(body);
                if (next !== scroller) {
                    scroller.removeEventListener("scroll", schedule);
                    scroller = next;
                    listen();
                }
                // Nowy zakres od razu, przed malowaniem: inaczej przez klatkę po
                // wyszukaniu tabela miała stary zakres i pustą treść pod nagłówkiem.
                cancelAnimationFrame(frame);
                measure();
            };
            schedule();
            return () => {
                cancelAnimationFrame(frame);
                scroller.removeEventListener("scroll", schedule);
                window.removeEventListener("resize", schedule);
                update.current = null;
            };
        },
        [overscan, estimate, latestCount],
    );

    // Inna liczba wierszy (filtr, wyszukiwanie) to nowy zakres.
    useDomEffect(() => update.current?.(), [count]);

    const start = Math.min(range.start, count);
    const end = Math.min(Math.max(range.end, start), count);

    return {
        start,
        end,
        bodyProps: { ref: measureRef },
        before: spacer(start * range.size),
        after: spacer((count - end) * range.size),
        tableProps: { "aria-rowcount": count + 1, "data-virtual": "" },
        rowProps: (index) => ({
            // Nagłówek to wiersz 1.
            "aria-rowindex": index + 2,
            ...(index % 2 === 1 && { "data-stripe": "" as const }),
        }),
    };
}
