"use client";

import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Children, useState, type ReactNode } from "react";

import { useMessages } from "../../i18n/context";
import { markEnter } from "../../utils/enter";
import {
    formatDay,
    formatFull,
    formatRelative,
    useNow,
} from "../../utils/relative-time";
import { Avatar } from "../avatar/Avatar";
import { Icon, type IconGlyph } from "../icon/Icon";
import { Skeleton } from "../skeleton/Skeleton";

type Tone = "neutral" | "accent" | "success" | "warning" | "danger";

export interface TimelineProps {
    // TimelineItem albo TimelineGroup.
    children?: ReactNode;
    // Po tylu wpisach przycisk „Pokaż jeszcze N”.
    collapsedAfter?: number;
    size?: "sm" | "md";
    // Szkielety wpisów, np. zanim przyjdzie historia z serwera.
    loading?: boolean;
    // Ile szkieletów przy loading.
    rows?: number;
    // Nazwa listy dla czytników, np. „Historia zmian punktów”.
    label?: string;
}

// Lista wpisów z przyciskiem rozwinięcia; wspólna dla Timeline i grup.
function Entries({
    children,
    collapsedAfter,
    label,
}: {
    children: ReactNode;
    collapsedAfter: number | undefined;
    label?: string | undefined;
}) {
    const t = useMessages();
    const [expanded, setExpanded] = useState(false);
    const entries = Children.toArray(children);
    const limit = collapsedAfter ?? entries.length;
    const hidden = expanded ? 0 : Math.max(0, entries.length - limit);

    return (
        <>
            <ol className="zse-tl-list" aria-label={label}>
                {hidden > 0 ? entries.slice(0, limit) : entries}
            </ol>
            {hidden > 0 && (
                <button
                    type="button"
                    className="zse-tl-more"
                    onClick={() => setExpanded(true)}
                >
                    {t.timeline.showMore(
                        hidden,
                        new Intl.NumberFormat(t.locale).format(hidden),
                    )}
                </button>
            )}
        </>
    );
}

// Historia zdarzeń, np. zmiany punktów, oddane głosy, logi administracji.
// Składana z części: TimelineGroup na dni, TimelineItem na wpisy,
// TimelineChange na „przed → po”.
export function Timeline({
    children,
    collapsedAfter,
    size = "md",
    loading = false,
    rows = 3,
    label,
}: TimelineProps) {
    return (
        <div
            className="zse-tl"
            data-size={size}
            aria-busy={loading || undefined}
        >
            {loading ? (
                <ol className="zse-tl-list">
                    {Array.from({ length: rows }, (_, index) => (
                        // Szkielety bez danych, kolejność się nie zmienia.
                        // oxlint-disable-next-line react/no-array-index-key
                        <li key={index} className="zse-tl-item" aria-hidden>
                            <span className="zse-tl-marker">
                                <span className="zse-tl-dot" />
                            </span>
                            <div className="zse-tl-body">
                                <Skeleton shape="line" width="60%" />
                                <Skeleton shape="line" width="35%" />
                            </div>
                        </li>
                    ))}
                </ol>
            ) : (
                <Entries collapsedAfter={collapsedAfter} label={label}>
                    {children}
                </Entries>
            )}
        </div>
    );
}

export interface TimelineGroupProps {
    // Dzień grupy: nagłówek „Dziś”, „Wczoraj”, „12 września”.
    date?: Date | string | number;
    // Własny nagłówek zamiast daty, np. „Semestr zimowy”.
    label?: ReactNode;
    children: ReactNode;
    collapsedAfter?: number;
}

const toDate = (value: Date | string | number) =>
    value instanceof Date ? value : new Date(value);

// Wpisy jednego dnia (albo innego okresu) pod przyklejonym nagłówkiem.
export function TimelineGroup({
    date,
    label,
    children,
    collapsedAfter,
}: TimelineGroupProps) {
    const t = useMessages();
    const now = useNow();
    const heading =
        label ?? (date !== undefined ? formatDay(t, toDate(date), now) : null);

    return (
        <li className="zse-tl-group">
            {heading != null && (
                <div className="zse-tl-group-label">
                    {date !== undefined && label == null ? (
                        <time
                            dateTime={toDate(date).toISOString()}
                            suppressHydrationWarning
                        >
                            {heading}
                        </time>
                    ) : (
                        heading
                    )}
                </div>
            )}
            <Entries collapsedAfter={collapsedAfter}>{children}</Entries>
        </li>
    );
}

export interface TimelineItemProps {
    // Tytuł zdarzenia, np. „Anna Kowalska zmieniła punkty”.
    title: ReactNode;
    description?: ReactNode;
    // Kiedy: względnie („5 min temu”) albo bezwzględnie, pełna data
    // w podpowiedzi.
    time?: Date | string | number;
    timeFormat?: "relative" | "absolute";
    // Znacznik na osi: ikona w kółku albo awatar osoby; bez nich kropka.
    icon?: IconGlyph;
    avatar?: { name: string; src?: string };
    tone?: Tone;
    // Szczegóły pod tytułem, np. TimelineChange.
    children?: ReactNode;
}

export function TimelineItem({
    title,
    description,
    time,
    timeFormat = "relative",
    icon,
    avatar,
    tone = "neutral",
    children,
}: TimelineItemProps) {
    const t = useMessages();
    const now = useNow();
    const date = time === undefined ? null : toDate(time);

    return (
        // Wchodzi z animacją tylko wpis dodany po wczytaniu strony.
        <li ref={markEnter} className="zse-tl-item" data-tone={tone}>
            <span
                className="zse-tl-marker"
                data-kind={avatar ? "avatar" : icon ? "icon" : "dot"}
            >
                {avatar ? (
                    <Avatar
                        name={avatar.name}
                        size="sm"
                        {...(avatar.src !== undefined && { src: avatar.src })}
                    />
                ) : icon ? (
                    <Icon icon={icon} size={14} />
                ) : (
                    <span className="zse-tl-dot" />
                )}
            </span>
            <div className="zse-tl-body">
                <div className="zse-tl-head">
                    <div className="zse-tl-title">{title}</div>
                    {date && (
                        <time
                            className="zse-tl-time"
                            dateTime={date.toISOString()}
                            title={formatFull(t.locale, date)}
                            suppressHydrationWarning
                        >
                            {timeFormat === "relative"
                                ? formatRelative(t, date, now)
                                : formatFull(t.locale, date)}
                        </time>
                    )}
                </div>
                {description != null && (
                    <p className="zse-tl-description">{description}</p>
                )}
                {children != null && (
                    <div className="zse-tl-content">{children}</div>
                )}
            </div>
        </li>
    );
}

export interface TimelineChangeProps {
    // Co się zmieniło, np. „Punkty”, „Klasa”.
    label: ReactNode;
    // Bez from: dodano; bez to: usunięto.
    from?: ReactNode;
    to?: ReactNode;
    // Przy liczbach: różnica obok („+5”). up: wzrost jest dobry (zielony),
    // down: spadek jest dobry, np. nieobecności.
    better?: "up" | "down";
}

// Tekst dla czytnika z wartości, gdy jest napisem albo liczbą.
const text = (value: ReactNode) =>
    typeof value === "string" || typeof value === "number" ? String(value) : "";

const numeric = (value: ReactNode) =>
    typeof value === "number" ? value : null;

// Zmiana wartości „przed → po”: stara przekreślona, nowa wyróżniona, przy
// liczbach różnica w kolorze. Czytnik słyszy „Punkty: z 12 na 17”.
export function TimelineChange({
    label,
    from,
    to,
    better = "up",
}: TimelineChangeProps) {
    const t = useMessages();
    const before = numeric(from);
    const after = numeric(to);
    const delta = before !== null && after !== null ? after - before : null;
    const number = new Intl.NumberFormat(t.locale, {
        signDisplay: "exceptZero",
    });
    const good =
        delta === null || delta === 0 ? null : delta > 0 === (better === "up");
    const spoken =
        from == null
            ? t.timeline.added(text(label), text(to))
            : to == null
              ? t.timeline.removed(text(label), text(from))
              : t.timeline.change(text(label), text(from), text(to));

    return (
        <div className="zse-tl-change">
            <span className="zse-tl-sr">{spoken}</span>
            <span className="zse-tl-change-visual" aria-hidden>
                <span className="zse-tl-change-label">{label}</span>
                {from != null && <del className="zse-tl-from">{from}</del>}
                {from != null && to != null && (
                    <Icon
                        icon={ArrowRight01Icon}
                        size={12}
                        className="zse-tl-arrow"
                    />
                )}
                {to != null && <ins className="zse-tl-to">{to}</ins>}
                {delta !== null && delta !== 0 && (
                    <span
                        className="zse-tl-delta"
                        data-good={good === true || undefined}
                        data-bad={good === false || undefined}
                    >
                        {number.format(delta)}
                    </span>
                )}
            </span>
        </div>
    );
}
