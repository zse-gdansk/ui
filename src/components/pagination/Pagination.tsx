"use client";

import {
    ArrowLeft01Icon,
    ArrowLeftDoubleIcon,
    ArrowRight01Icon,
    ArrowRightDoubleIcon,
} from "@hugeicons/core-free-icons";
import {
    useLayoutEffect,
    useRef,
    useState,
    type KeyboardEvent,
    type MouseEvent,
    type ReactNode,
} from "react";

import { useMessages } from "../../i18n/context";
import { Icon, type IconGlyph } from "../icon/Icon";
import { Select } from "../select/Select";
import { pageRange } from "./range";

export interface PaginationProps {
    page?: number;
    defaultPage?: number;
    onPageChange?: (page: number) => void;
    // Liczba stron albo total + pageSize, wtedy liczy się sama.
    pageCount?: number;
    total?: number;
    pageSize?: number;
    // Wybór liczby wierszy na stronie, np. [10, 20, 50].
    pageSizeOptions?: readonly number[];
    onPageSizeChange?: (size: number) => void;
    // „21–40 z 312” po lewej. Wymaga total i pageSize.
    showInfo?: boolean;
    // Przyciski do pierwszej i ostatniej strony.
    showEdges?: boolean;
    siblings?: number;
    boundaries?: number;
    // auto: numery, a w wąskim miejscu „Strona 3 z 12”. Liczy się
    // szerokość kontenera, nie okna.
    variant?: "auto" | "full" | "compact";
    size?: "sm" | "md";
    // Z linkami zamiast przycisków, np. ?strona=3, żeby dało się otworzyć
    // stronę w nowej karcie i wrócić przyciskiem wstecz.
    getHref?: (page: number) => string;
    // Jedna strona: domyślnie nic się nie pokazuje.
    hideSinglePage?: boolean;
    className?: string;
}

// Suwak pod bieżącą stroną, jak w SegmentedControl.
function place(list: HTMLElement | null, page: number) {
    if (!list) return;
    const active = list.querySelector<HTMLElement>(`[data-page="${page}"]`);
    if (!active) {
        list.removeAttribute("data-ready");
        return;
    }
    list.style.setProperty("--thumb-left", `${active.offsetLeft}px`);
    list.style.setProperty("--thumb-width", `${active.offsetWidth}px`);
    if (!list.hasAttribute("data-ready"))
        requestAnimationFrame(() => list.setAttribute("data-ready", ""));
}

export function Pagination({
    page,
    defaultPage = 1,
    onPageChange,
    pageCount,
    total,
    pageSize,
    pageSizeOptions,
    onPageSizeChange,
    showInfo = false,
    showEdges = false,
    siblings = 1,
    boundaries = 1,
    variant = "auto",
    size = "md",
    getHref,
    hideSinglePage = true,
    className,
}: PaginationProps) {
    const t = useMessages();
    const NUMBER = new Intl.NumberFormat(t.locale);
    const count = Math.max(
        pageCount ??
            (total !== undefined && pageSize ? Math.ceil(total / pageSize) : 1),
        1,
    );
    const [internal, setInternal] = useState(defaultPage);
    const current = Math.min(Math.max(page ?? internal, 1), count);
    const listRef = useRef<HTMLDivElement>(null);
    const [jumping, setJumping] = useState<"start-gap" | "end-gap" | null>(
        null,
    );

    useLayoutEffect(() => {
        const list = listRef.current;
        place(list, current);
        if (!list) return;
        const observer = new ResizeObserver(() => place(list, current));
        observer.observe(list);
        return () => observer.disconnect();
    }, [current]);

    function go(next: number, event?: MouseEvent) {
        const target = Math.min(Math.max(next, 1), count);
        if (target === current) {
            event?.preventDefault();
            return;
        }
        if (page === undefined) setInternal(target);
        onPageChange?.(target);
    }

    if (count <= 1 && hideSinglePage && !showInfo && !pageSizeOptions)
        return null;

    const items = pageRange(current, count, siblings, boundaries);

    const control = (
        target: number,
        content: ReactNode,
        label: string,
        extra: { className: string; current?: boolean; disabled?: boolean },
    ) => {
        const common = {
            className: extra.className,
            ...(extra.current && { "data-page": target }),
            "aria-label": label,
            ...(extra.current && { "aria-current": "page" as const }),
        };
        if (extra.disabled)
            return (
                <span {...common} aria-disabled data-disabled="">
                    {content}
                </span>
            );
        return getHref ? (
            <a
                {...common}
                href={getHref(target)}
                onClick={(event) => go(target, event)}
            >
                {content}
            </a>
        ) : (
            <button type="button" {...common} onClick={() => go(target)}>
                {content}
            </button>
        );
    };

    const arrow = (target: number, glyph: IconGlyph, label: string) =>
        control(target, <Icon icon={glyph} />, label, {
            className: "zse-pagination-button zse-pagination-arrow",
            disabled: target < 1 || target > count || target === current,
        });

    const first = current - 1;
    const info =
        showInfo && total !== undefined && pageSize
            ? total === 0
                ? t.pagination.noResults
                : t.pagination.range(
                      NUMBER.format(first * pageSize + 1),
                      NUMBER.format(Math.min(current * pageSize, total)),
                      NUMBER.format(total),
                  )
            : null;

    return (
        <nav
            aria-label={t.pagination.label}
            className={["zse-pagination", className].filter(Boolean).join(" ")}
            data-size={size}
            data-variant={variant}
        >
            {(info || pageSizeOptions) && (
                <div className="zse-pagination-meta">
                    {info && (
                        <span
                            className="zse-pagination-info"
                            aria-live="polite"
                        >
                            {info}
                        </span>
                    )}
                    {pageSizeOptions && pageSize && (
                        <span className="zse-pagination-size">
                            <span aria-hidden>{t.pagination.perPage}</span>
                            <Select
                                size="sm"
                                aria-label={t.pagination.perPageLabel}
                                value={String(pageSize)}
                                options={pageSizeOptions.map((option) => ({
                                    value: String(option),
                                    label: String(option),
                                }))}
                                onValueChange={(next) => {
                                    if (next) onPageSizeChange?.(Number(next));
                                }}
                            />
                        </span>
                    )}
                </div>
            )}

            {count > 1 && (
                <div className="zse-pagination-controls">
                    {showEdges &&
                        arrow(1, ArrowLeftDoubleIcon, t.pagination.first)}
                    {arrow(current - 1, ArrowLeft01Icon, t.pagination.previous)}

                    <div ref={listRef} className="zse-pagination-pages">
                        <span className="zse-pagination-thumb" aria-hidden />
                        {items.map((item) =>
                            typeof item === "number" ? (
                                // Numer strony jest tożsamością przycisku: przy
                                // przewijaniu ten sam numer zachowuje stan DOM.
                                <span
                                    key={item}
                                    className="zse-pagination-slot"
                                >
                                    {control(
                                        item,
                                        NUMBER.format(item),
                                        t.pagination.page(NUMBER.format(item)),
                                        {
                                            className:
                                                "zse-pagination-button zse-pagination-page",
                                            current: item === current,
                                        },
                                    )}
                                </span>
                            ) : (
                                <Gap
                                    key={item}
                                    open={jumping === item}
                                    count={count}
                                    onOpen={() => setJumping(item)}
                                    onClose={() => setJumping(null)}
                                    onJump={(target) => {
                                        setJumping(null);
                                        go(target);
                                    }}
                                />
                            ),
                        )}
                    </div>

                    {/* Wąski kontener: sam tekst zamiast numerów. */}
                    <span className="zse-pagination-compact" aria-live="polite">
                        {t.pagination.pageOf(
                            NUMBER.format(current),
                            NUMBER.format(count),
                        )}
                    </span>

                    {arrow(current + 1, ArrowRight01Icon, t.pagination.next)}
                    {showEdges &&
                        arrow(count, ArrowRightDoubleIcon, t.pagination.last)}
                </div>
            )}
        </nav>
    );
}

function Gap({
    open,
    count,
    onOpen,
    onClose,
    onJump,
}: {
    open: boolean;
    count: number;
    onOpen: () => void;
    onClose: () => void;
    onJump: (page: number) => void;
}) {
    const t = useMessages();
    if (!open)
        return (
            <span className="zse-pagination-slot">
                <button
                    type="button"
                    className="zse-pagination-button zse-pagination-gap"
                    aria-label={t.pagination.jump}
                    onClick={onOpen}
                >
                    …
                </button>
            </span>
        );

    function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Escape") onClose();
        if (event.key !== "Enter") return;
        event.preventDefault();
        const value = Number.parseInt(event.currentTarget.value, 10);
        if (Number.isNaN(value)) onClose();
        else onJump(value);
    }

    return (
        <span className="zse-pagination-slot">
            <input
                // Fokus przy otwarciu skoku (montowanie po kliknięciu), bez autoFocus.
                ref={(node) => {
                    node?.focus();
                }}
                className="zse-pagination-jump"
                type="text"
                inputMode="numeric"
                enterKeyHint="go"
                aria-label={t.pagination.jumpInput(count)}
                placeholder="…"
                onKeyDown={onKeyDown}
                onBlur={onClose}
                onInput={(event) => {
                    const input = event.currentTarget;
                    input.value = input.value.replace(/\D/g, "");
                }}
            />
        </span>
    );
}
