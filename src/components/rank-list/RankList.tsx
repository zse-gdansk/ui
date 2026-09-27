"use client";

import { DragDropVerticalIcon } from "@hugeicons/core-free-icons";
import {
    Fragment,
    useId,
    useRef,
    useState,
    type KeyboardEvent,
    type PointerEvent,
    type ReactNode,
} from "react";

import { useMessages } from "../../i18n/context";
import { useDomEffect } from "../../utils/effects";
import { Avatar } from "../avatar/Avatar";
import { useFormValue } from "../form/context";
import { Icon, type IconGlyph } from "../icon/Icon";

export interface RankItem {
    value: string;
    label: string;
    description?: ReactNode;
    icon?: IconGlyph;
    avatar?: { name: string; src?: string };
}

export interface RankListProps {
    items: readonly RankItem[];
    // Kolejność wartości; brakujące pozycje dopisywane na końcu.
    value?: readonly string[];
    defaultValue?: readonly string[];
    onValueChange?: (value: string[]) => void;
    // Nazwa listy, np. „Rozszerzenia od najważniejszego”.
    label: ReactNode;
    hint?: ReactNode;
    // Liczy się tylko pierwsze max pozycji, np. trzy rozszerzenia z sześciu:
    // pod nimi linia „Poza wyborem”, niżej przygaszone.
    max?: number;
    // Pole formularza: wartości w kolejności (Form i ukryte inputy).
    name?: string;
    disabled?: boolean;
    className?: string;
}

const DURATION = 220;
const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

// Kolejność z value, bez nieznanych i z dopisanymi brakującymi.
function normalize(order: readonly string[], items: readonly RankItem[]) {
    const known = new Set(items.map((item) => item.value));
    const kept = order.filter((value) => known.has(value));
    const seen = new Set(kept);
    return [
        ...kept,
        ...items.map((item) => item.value).filter((value) => !seen.has(value)),
    ];
}

function move<T>(order: readonly T[], from: number, to: number) {
    const next = [...order];
    const [value] = next.splice(from, 1);
    if (value !== undefined) next.splice(to, 0, value);
    return next;
}

interface Drag {
    value: string;
    pointerId: number;
    startY: number;
    from: number;
    to: number;
    rows: HTMLElement[];
    tops: number[];
    heights: number[];
    // Odstęp za wierszem na danej pozycji (z linią „Poza wyborem” większy).
    gaps: number[];
}

// Pozycje wierszy po przestawieniu: te same odstępy między miejscami,
// wysokości z nowej kolejności. Działa dla wierszy różnej wysokości.
function layout(drag: Drag, to: number) {
    const order = move(
        drag.rows.map((_, index) => index),
        drag.from,
        to,
    );
    const tops: number[] = [];
    let top = drag.tops[0] ?? 0;
    order.forEach((row, slot) => {
        tops[row] = top;
        top += (drag.heights[row] ?? 0) + (drag.gaps[slot] ?? 0);
    });
    return tops;
}

// Lista do ułożenia według preferencji, np. wybór rozszerzeń albo głos w
// wyborach preferencyjnych. Przeciąganie myszą za cały wiersz, palcem za
// uchwyt; z klawiatury Spacja podnosi, strzałki przesuwają, Spacja upuszcza.
export function RankList({
    items,
    value,
    defaultValue,
    onValueChange,
    label,
    hint,
    max,
    name,
    disabled = false,
    className,
}: RankListProps) {
    const t = useMessages();
    const labelId = useId();
    const hintId = useId();
    const instructionsId = useId();
    const [inner, setInner] = useState<readonly string[]>(
        () => defaultValue ?? [],
    );
    const order = normalize(value ?? inner, items);
    const byValue = new Map(items.map((item) => [item.value, item]));
    const listRef = useRef<HTMLOListElement>(null);
    const drag = useRef<Drag | null>(null);
    // Pozycje przed zmianą kolejności, do animacji FLIP po renderze.
    const flip = useRef<Map<string, number> | null>(null);
    const [picked, setPicked] = useState<{
        value: string;
        original: string[];
    } | null>(null);
    const [announcement, setAnnouncement] = useState("");
    useFormValue(name, order);

    const rowsOf = () => [
        ...(listRef.current?.querySelectorAll<HTMLElement>(
            ":scope > .zse-rank-item",
        ) ?? []),
    ];
    const labelOf = (item: string) => byValue.get(item)?.label ?? item;

    function commit(next: string[]) {
        flip.current = new Map(
            rowsOf().map((row) => [
                row.dataset.value ?? "",
                row.getBoundingClientRect().top,
            ]),
        );
        if (value === undefined) setInner(next);
        onValueChange?.(next);
    }

    // Wiersze dojeżdżają z poprzednich miejsc do nowych.
    const orderKey = order.join("\u0000");
    useDomEffect(() => {
        const first = flip.current;
        flip.current = null;
        if (!first) return;
        const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
        for (const row of rowsOf()) {
            const before = first.get(row.dataset.value ?? "");
            if (before === undefined || reduced) continue;
            const delta = before - row.getBoundingClientRect().top;
            if (Math.abs(delta) < 1) continue;
            row.animate([{ translate: `0 ${delta}px` }, { translate: "0 0" }], {
                duration: DURATION,
                easing: EASE,
            });
        }
    }, [orderKey]);

    function paintRanks(tops: number[] | null, current: Drag) {
        // Numery pozycji od razu pod kursorem, zanim kolejność się zmieni.
        const slots = tops
            ? current.rows
                  .map((_, index) => index)
                  .toSorted((a, b) => (tops[a] ?? 0) - (tops[b] ?? 0))
            : current.rows.map((_, index) => index);
        // Razem z numerem przygaszenie „poza wyborem” dla nowego miejsca.
        slots.forEach((row, slot) => {
            const element = current.rows[row];
            const rank = element?.querySelector(".zse-rank-number");
            if (rank) rank.textContent = String(slot + 1);
            if (element && max !== undefined)
                element.toggleAttribute("data-beyond", slot >= max);
        });
    }

    function start(event: PointerEvent<HTMLLIElement>, item: string) {
        if (disabled || event.button !== 0 || picked) return;
        const onHandle = (event.target as Element).closest(".zse-rank-handle");
        // Palcem tylko za uchwyt, żeby dało się przewijać stronę.
        if (event.pointerType !== "mouse" && !onHandle) return;
        const rows = rowsOf();
        const from = order.indexOf(item);
        const rects = rows.map((row) => row.getBoundingClientRect());
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = {
            value: item,
            pointerId: event.pointerId,
            startY: event.clientY,
            from,
            to: from,
            rows,
            tops: rects.map((rect) => rect.top),
            heights: rects.map((rect) => rect.height),
            gaps: rects.map((rect, index) =>
                index + 1 < rects.length
                    ? (rects[index + 1]?.top ?? 0) - rect.bottom
                    : 0,
            ),
        };
        event.currentTarget.setAttribute("data-dragging", "");
        listRef.current?.setAttribute("data-dragging", "");
    }

    function track(event: PointerEvent<HTMLLIElement>) {
        const current = drag.current;
        if (!current || current.pointerId !== event.pointerId) return;
        const row = current.rows[current.from];
        if (!row) return;
        const first = current.tops[0] ?? 0;
        const lastIndex = current.rows.length - 1;
        const bottom =
            (current.tops[lastIndex] ?? 0) + (current.heights[lastIndex] ?? 0);
        const top = current.tops[current.from] ?? 0;
        const height = current.heights[current.from] ?? 0;
        // Nie dalej niż krańce listy.
        const dy = Math.min(
            Math.max(event.clientY - current.startY, first - top),
            bottom - top - height,
        );
        row.style.translate = `0 ${dy}px`;
        // Miejsce: w dół wiersz mija sąsiada, gdy jego dolna krawędź przejdzie
        // środek sąsiada, w górę, gdy przejdzie go górna krawędź. Przy krańcu
        // listy krawędź sięga krańca, więc skrajne miejsca są osiągalne.
        const upper = top + dy;
        const lower = upper + height;
        let to = current.from;
        current.rows.forEach((_, index) => {
            const middle =
                (current.tops[index] ?? 0) + (current.heights[index] ?? 0) / 2;
            if (index > current.from && lower > middle) to += 1;
            if (index < current.from && upper < middle) to -= 1;
        });
        if (to === current.to) return;
        current.to = to;
        const tops = layout(current, to);
        current.rows.forEach((other, index) => {
            if (index === current.from) return;
            const shift = (tops[index] ?? 0) - (current.tops[index] ?? 0);
            other.style.translate = shift ? `0 ${shift}px` : "";
        });
        paintRanks(tops, current);
    }

    function finish(event: PointerEvent<HTMLLIElement>, cancelled: boolean) {
        const current = drag.current;
        if (!current || current.pointerId !== event.pointerId) return;
        drag.current = null;
        const moved = !cancelled && current.to !== current.from;
        // Pozycje z przesunięciem jako punkt wyjścia animacji, potem wiersze
        // bez przesunięć i bez przejścia.
        const visual = new Map(
            current.rows.map((row) => [
                row.dataset.value ?? "",
                row.getBoundingClientRect().top,
            ]),
        );
        listRef.current?.removeAttribute("data-dragging");
        for (const row of current.rows) {
            row.removeAttribute("data-dragging");
            row.style.translate = "";
        }
        paintRanks(null, current);
        if (moved) {
            const next = move(order, current.from, current.to);
            if (value === undefined) setInner(next);
            onValueChange?.(next);
            flip.current = visual;
            setAnnouncement(
                t.rankList.dropped(
                    labelOf(current.value),
                    current.to + 1,
                    order.length,
                ),
            );
        } else {
            // Powrót na miejsce też płynnie.
            flip.current = null;
            const row = current.rows[current.from];
            const before = visual.get(current.value);
            if (row && before !== undefined) {
                const delta = before - row.getBoundingClientRect().top;
                if (Math.abs(delta) >= 1)
                    row.animate(
                        [{ translate: `0 ${delta}px` }, { translate: "0 0" }],
                        { duration: DURATION, easing: EASE },
                    );
            }
        }
    }

    function onHandleKey(
        event: KeyboardEvent<HTMLButtonElement>,
        item: string,
    ) {
        if (disabled) return;
        const index = order.indexOf(item);
        const total = order.length;
        if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            if (picked?.value === item) {
                setPicked(null);
                setAnnouncement(
                    t.rankList.dropped(labelOf(item), index + 1, total),
                );
            } else {
                setPicked({ value: item, original: [...order] });
                setAnnouncement(
                    t.rankList.picked(labelOf(item), index + 1, total),
                );
            }
            return;
        }
        if (picked?.value !== item) return;
        const targets: Record<string, number> = {
            ArrowUp: index - 1,
            ArrowDown: index + 1,
            Home: 0,
            End: total - 1,
        };
        const target = targets[event.key];
        if (target !== undefined) {
            event.preventDefault();
            const to = Math.min(Math.max(target, 0), total - 1);
            if (to === index) return;
            commit(move(order, index, to));
            setAnnouncement(t.rankList.moved(labelOf(item), to + 1, total));
            return;
        }
        if (event.key === "Escape") {
            event.preventDefault();
            commit(picked.original);
            setPicked(null);
            setAnnouncement(t.rankList.cancelled(labelOf(item)));
        }
    }

    return (
        <div
            className={["zse-rank", className].filter(Boolean).join(" ")}
            data-disabled={disabled || undefined}
        >
            <div className="zse-rank-label" id={labelId}>
                {label}
            </div>
            {hint != null && (
                <p className="zse-rank-hint" id={hintId}>
                    {hint}
                </p>
            )}
            <ol
                ref={listRef}
                className="zse-rank-list"
                aria-labelledby={labelId}
                {...(hint != null && { "aria-describedby": hintId })}
            >
                {order.map((item, index) => {
                    const entry = byValue.get(item);
                    if (!entry) return null;
                    const beyond = max !== undefined && index >= max;
                    return (
                        <Fragment key={item}>
                            {max !== undefined &&
                                index === max &&
                                index > 0 && (
                                    <li
                                        className="zse-rank-divider"
                                        aria-hidden
                                    >
                                        {t.rankList.beyond}
                                    </li>
                                )}
                            <li
                                className="zse-rank-item"
                                data-value={item}
                                data-beyond={beyond || undefined}
                                data-picked={
                                    picked?.value === item || undefined
                                }
                                onPointerDown={(event) => start(event, item)}
                                onPointerMove={track}
                                onPointerUp={(event) => finish(event, false)}
                                onPointerCancel={(event) => finish(event, true)}
                            >
                                <span className="zse-rank-number" aria-hidden>
                                    {index + 1}
                                </span>
                                {entry.avatar ? (
                                    <Avatar
                                        name={entry.avatar.name}
                                        size="sm"
                                        {...(entry.avatar.src !== undefined && {
                                            src: entry.avatar.src,
                                        })}
                                    />
                                ) : entry.icon ? (
                                    <span className="zse-rank-icon">
                                        <Icon icon={entry.icon} size={18} />
                                    </span>
                                ) : null}
                                <span className="zse-rank-text">
                                    <span className="zse-rank-title">
                                        {entry.label}
                                        {beyond && (
                                            <span className="zse-rank-sr">
                                                {` (${t.rankList.beyond.toLowerCase()})`}
                                            </span>
                                        )}
                                    </span>
                                    {entry.description != null && (
                                        <span className="zse-rank-description">
                                            {entry.description}
                                        </span>
                                    )}
                                </span>
                                <button
                                    type="button"
                                    className="zse-rank-handle"
                                    aria-label={t.rankList.handle(entry.label)}
                                    aria-describedby={instructionsId}
                                    aria-pressed={picked?.value === item}
                                    disabled={disabled}
                                    onKeyDown={(event) =>
                                        onHandleKey(event, item)
                                    }
                                    onBlur={() => {
                                        if (picked?.value === item)
                                            setPicked(null);
                                    }}
                                >
                                    <Icon
                                        icon={DragDropVerticalIcon}
                                        size={16}
                                    />
                                </button>
                            </li>
                        </Fragment>
                    );
                })}
            </ol>
            <span id={instructionsId} className="zse-rank-sr">
                {t.rankList.instructions}
            </span>
            <span className="zse-rank-sr" aria-live="assertive">
                {announcement}
            </span>
            {name !== undefined &&
                order.map((item) => (
                    <input key={item} type="hidden" name={name} value={item} />
                ))}
        </div>
    );
}
