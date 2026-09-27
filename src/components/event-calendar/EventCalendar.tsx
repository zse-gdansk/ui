"use client";

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { useState, type CSSProperties, type ReactNode } from "react";

import { useMessages } from "../../i18n/context";
import { useNow } from "../../utils/relative-time";
import { Button } from "../button/Button";
import {
    addDays,
    addMonths,
    compareDays,
    dateFormats,
    monthGrid,
    sameDay,
    sameMonth,
    startOfDay,
    startOfMonth,
} from "../calendar/dates";
import { Icon } from "../icon/Icon";
import { Popover } from "../popover/Popover";
import { SegmentedControl } from "../segmented/SegmentedControl";
import { formatTime } from "../time-picker/time";

export interface CalendarEventType {
    id: string;
    // Np. „Wywiadówka”, w legendzie i szczegółach.
    label: string;
    // CSS albo token, np. "var(--chart-2)".
    color: string;
}

export interface CalendarEvent {
    id: string;
    title: string;
    // Dzień ("2026-10-14") to wydarzenie całodniowe, z godziną
    // ("2026-10-14T17:00") o tej godzinie. Date: całodniowe, gdy północ.
    start: Date | string;
    // Ostatni dzień (włącznie) albo godzina końca, np. ferie 2–15 lutego.
    end?: Date | string;
    type?: string;
    location?: string;
    description?: ReactNode;
    href?: string;
}

export interface EventCalendarProps {
    events: readonly CalendarEvent[];
    types?: readonly CalendarEventType[];
    // Nazwa dla czytnika, np. „Kalendarz szkolny”.
    label: string;
    month?: Date;
    defaultMonth?: Date;
    onMonthChange?: (month: Date) => void;
    view?: "month" | "list";
    defaultView?: "month" | "list";
    onViewChange?: (view: "month" | "list") => void;
    // Własna obsługa zamiast okienka ze szczegółami.
    onEventClick?: (event: CalendarEvent) => void;
    className?: string;
}

interface Normalized {
    source: CalendarEvent;
    start: Date;
    end: Date;
    allDay: boolean;
    // Pierwszy i ostatni dzień, bez godzin.
    first: Date;
    last: Date;
}

// Tyle torów w komórce miesiąca; przy nadmiarze ostatni to „+N więcej”.
const LANES = 3;

function parse(value: Date | string) {
    if (value instanceof Date) return { date: value, time: false };
    const [day, time] = value.split("T");
    const [year = 0, month = 1, date = 1] = (day ?? "").split("-").map(Number);
    if (!time) return { date: new Date(year, month - 1, date), time: false };
    const [hours = 0, minutes = 0] = time.split(":").map(Number);
    return {
        date: new Date(year, month - 1, date, hours, minutes),
        time: true,
    };
}

const midnight = (date: Date) =>
    date.getHours() === 0 && date.getMinutes() === 0;

const spanOf = (event: Normalized) => compareDays(event.last, event.first);

const NO_TYPES: readonly CalendarEventType[] = [];

function normalize(event: CalendarEvent): Normalized {
    const start = parse(event.start);
    const end = event.end === undefined ? start : parse(event.end);
    const allDay =
        !start.time && !end.time && midnight(start.date) && midnight(end.date);
    const first = startOfDay(start.date);
    const last = startOfDay(end.date);
    return {
        source: event,
        start: start.date,
        end: end.date,
        allDay,
        first,
        last: compareDays(last, first) < 0 ? first : last,
    };
}

// Tory w tygodniu: kilkudniowe najpierw i najdłuższe wyżej, więc pasek
// ferii biegnie przez tydzień w jednej linii.
function placeWeek(events: readonly Normalized[], days: readonly Date[]) {
    const first = days[0] as Date;
    const last = days[6] as Date;
    const inWeek = events
        .filter(
            (event) =>
                compareDays(event.last, first) >= 0 &&
                compareDays(event.first, last) <= 0,
        )
        .toSorted((a, b) => {
            return (
                spanOf(b) - spanOf(a) ||
                Number(b.allDay) - Number(a.allDay) ||
                a.start.getTime() - b.start.getTime()
            );
        });
    const lanes: boolean[][] = [];
    const placed: {
        event: Normalized;
        lane: number;
        from: number;
        to: number;
    }[] = [];
    for (const event of inWeek) {
        const from = Math.max(0, compareDays(event.first, first) / 86_400_000);
        const to = Math.min(6, compareDays(event.last, first) / 86_400_000);
        let lane = 0;
        while (
            lanes[lane]
                ?.slice(Math.round(from), Math.round(to) + 1)
                .some(Boolean)
        )
            lane += 1;
        lanes[lane] ??= Array.from({ length: 7 }, () => false);
        for (let column = from; column <= to; column += 1)
            (lanes[lane] as boolean[])[Math.round(column)] = true;
        placed.push({
            event,
            lane,
            from: Math.round(from),
            to: Math.round(to),
        });
    }
    return placed;
}

const cx = (...names: (string | false | undefined)[]) =>
    names.filter(Boolean).join(" ");

// Wydarzenia szkolne: miesiąc z paskami kilkudniowych wydarzeń albo lista
// dni. Na wąskim kontenerze zawsze lista (agenda). Rodzaj wydarzenia to
// kolor, legenda chowa i pokazuje rodzaje.
export function EventCalendar({
    events,
    types = NO_TYPES,
    label,
    month,
    defaultMonth,
    onMonthChange,
    view,
    defaultView = "month",
    onViewChange,
    onEventClick,
    className,
}: EventCalendarProps) {
    const t = useMessages();
    const formats = dateFormats(t.locale);
    const now = useNow();
    const today = startOfDay(new Date(now));
    const [innerMonth, setInnerMonth] = useState(() =>
        startOfMonth(defaultMonth ?? new Date()),
    );
    const shownMonth = startOfMonth(month ?? innerMonth);
    const [innerView, setInnerView] = useState(defaultView);
    const shownView = view ?? innerView;
    const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());
    const typeOf = new Map(types.map((type) => [type.id, type]));

    const visible = events
        .map(normalize)
        .filter(
            (event) => !event.source.type || !hidden.has(event.source.type),
        );

    function goTo(next: Date) {
        const value = startOfMonth(next);
        if (month === undefined) setInnerMonth(value);
        onMonthChange?.(value);
    }

    function setView(next: "month" | "list") {
        if (view === undefined) setInnerView(next);
        onViewChange?.(next);
    }

    const time = (date: Date) =>
        formatTime(t.locale, date.getHours() * 60 + date.getMinutes());
    const when = (event: Normalized) => {
        const days = formats.range(event.first, event.last);
        if (event.allDay) return days;
        const hours = sameDay(event.start, event.end)
            ? event.start.getTime() === event.end.getTime()
                ? time(event.start)
                : `${time(event.start)}–${time(event.end)}`
            : "";
        return hours ? `${days}, ${hours}` : days;
    };
    const colorOf = (event: Normalized) =>
        (event.source.type && typeOf.get(event.source.type)?.color) ||
        "var(--color-text-secondary)";

    // Szczegóły wydarzenia w okienku albo własna obsługa aplikacji.
    const withDetails = (
        event: Normalized,
        trigger: ReactNode,
        buttonClass: string,
        extra: Record<string, unknown> = {},
    ) => {
        const style = { "--event-color": colorOf(event) } as CSSProperties;
        if (onEventClick)
            return (
                <button
                    type="button"
                    {...extra}
                    className={buttonClass}
                    style={style}
                    onClick={() => onEventClick(event.source)}
                >
                    {trigger}
                </button>
            );
        const type = event.source.type ? typeOf.get(event.source.type) : null;
        return (
            <Popover
                trigger={
                    <button
                        type="button"
                        {...extra}
                        className={buttonClass}
                        style={style}
                    >
                        {trigger}
                    </button>
                }
                title={event.source.title}
                description={when(event)}
                closable
                width={280}
            >
                <div className="zse-event-details" style={style}>
                    {type && (
                        <span className="zse-event-type">
                            <span className="zse-event-dot" />
                            {type.label}
                        </span>
                    )}
                    {event.source.location && (
                        <span>{event.source.location}</span>
                    )}
                    {event.source.description != null && (
                        <div className="zse-event-description">
                            {event.source.description}
                        </div>
                    )}
                    {event.source.href && (
                        <a className="zse-event-link" href={event.source.href}>
                            {event.source.title}
                        </a>
                    )}
                </div>
            </Popover>
        );
    };

    const grid = monthGrid(shownMonth);
    const weeks = Array.from({ length: 6 }, (_, week) =>
        grid.slice(week * 7, week * 7 + 7),
    );

    // Lista: dni miesiąca z wydarzeniami; kilkudniowe raz, w dniu początku
    // (albo 1. dnia miesiąca, gdy zaczęły się wcześniej).
    const monthEnd = addDays(addMonths(shownMonth, 1), -1);
    const agenda = new Map<number, Normalized[]>();
    for (const event of visible) {
        if (
            compareDays(event.last, shownMonth) < 0 ||
            compareDays(event.first, monthEnd) > 0
        )
            continue;
        const day =
            compareDays(event.first, shownMonth) < 0 ? shownMonth : event.first;
        const list = agenda.get(day.getTime()) ?? [];
        list.push(event);
        agenda.set(day.getTime(), list);
    }
    const agendaDays = [...agenda.keys()].toSorted((a, b) => a - b);
    const weekday = new Intl.DateTimeFormat(t.locale, { weekday: "short" });
    // „1–28 września”, „28 września – 3 października”, bez roku.
    const shortRange = (from: Date, to: Date) =>
        sameMonth(from, to)
            ? `${from.getDate()}–${dayMonth.format(to)}`
            : `${dayMonth.format(from)} – ${dayMonth.format(to)}`;
    const dayMonth = new Intl.DateTimeFormat(t.locale, {
        day: "numeric",
        month: "long",
    });

    return (
        <section
            className={cx("zse-events", className)}
            aria-label={label}
            data-view={shownView}
        >
            <header className="zse-events-header">
                <h2 className="zse-events-title" aria-live="polite">
                    {formats.monthYear(shownMonth)}
                </h2>
                <div className="zse-events-nav">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => goTo(today)}
                        disabled={sameMonth(today, shownMonth)}
                    >
                        {t.eventCalendar.today}
                    </Button>
                    <button
                        type="button"
                        className="zse-events-arrow"
                        aria-label={t.calendar.previousMonth}
                        onClick={() => goTo(addMonths(shownMonth, -1))}
                    >
                        <Icon icon={ArrowLeft01Icon} size={16} />
                    </button>
                    <button
                        type="button"
                        className="zse-events-arrow"
                        aria-label={t.calendar.nextMonth}
                        onClick={() => goTo(addMonths(shownMonth, 1))}
                    >
                        <Icon icon={ArrowRight01Icon} size={16} />
                    </button>
                </div>
                <SegmentedControl
                    className="zse-events-view"
                    aria-label={t.eventCalendar.view}
                    size="sm"
                    value={shownView}
                    onValueChange={(next) => setView(next as "month" | "list")}
                    options={[
                        { value: "month", label: t.eventCalendar.month },
                        { value: "list", label: t.eventCalendar.list },
                    ]}
                />
            </header>

            {types.length > 0 && (
                <ul
                    className="zse-events-legend"
                    aria-label={t.eventCalendar.types}
                >
                    {types.map((type) => (
                        <li key={type.id}>
                            <button
                                type="button"
                                className="zse-events-legend-item"
                                aria-pressed={!hidden.has(type.id)}
                                style={
                                    {
                                        "--event-color": type.color,
                                    } as CSSProperties
                                }
                                onClick={() =>
                                    setHidden((current) => {
                                        const next = new Set(current);
                                        if (next.has(type.id))
                                            next.delete(type.id);
                                        else next.add(type.id);
                                        return next;
                                    })
                                }
                            >
                                <span className="zse-event-dot" />
                                {type.label}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <table className="zse-events-month">
                <thead>
                    <tr>
                        {t.calendar.weekdaysShort.map((day, index) => (
                            <th
                                key={day}
                                scope="col"
                                abbr={t.calendar.weekdaysLong[index]}
                                data-weekend={index >= 5 || undefined}
                            >
                                {day}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {weeks.map((days) => {
                        const placed = placeWeek(visible, days);
                        return (
                            <tr key={days[0]?.getTime()}>
                                {days.map((day, column) => {
                                    const here = placed.filter(
                                        (item) =>
                                            item.from <= column &&
                                            item.to >= column,
                                    );
                                    const overflow = here.length > LANES;
                                    const shown = overflow ? LANES - 1 : LANES;
                                    const extra = here.filter(
                                        (item) => item.lane >= shown,
                                    );
                                    const lanes = Math.min(
                                        Math.max(
                                            0,
                                            ...here.map(
                                                (item) => item.lane + 1,
                                            ),
                                        ),
                                        shown,
                                    );
                                    return (
                                        <td
                                            key={day.getTime()}
                                            className="zse-events-day"
                                            data-outside={
                                                !sameMonth(day, shownMonth) ||
                                                undefined
                                            }
                                            data-weekend={
                                                column >= 5 || undefined
                                            }
                                            data-today={
                                                sameDay(day, today) || undefined
                                            }
                                        >
                                            <span
                                                className="zse-events-date"
                                                aria-label={`${formats.dayLabel(day)}${
                                                    here.length
                                                        ? `, ${t.eventCalendar.events(here.length)}`
                                                        : ""
                                                }`}
                                            >
                                                {day.getDate()}
                                            </span>
                                            <div className="zse-events-lanes">
                                                {Array.from(
                                                    { length: lanes },
                                                    (_, lane) => {
                                                        const item = here.find(
                                                            (entry) =>
                                                                entry.lane ===
                                                                lane,
                                                        );
                                                        if (!item)
                                                            return (
                                                                <span
                                                                    key={lane}
                                                                    className="zse-event-gap"
                                                                />
                                                            );
                                                        const { event } = item;
                                                        const head =
                                                            column ===
                                                            item.from;
                                                        const bar =
                                                            event.allDay ||
                                                            item.from !==
                                                                item.to;
                                                        // Pasek rysuje pierwszy dzień na całą
                                                        // długość w tygodniu; dalsze dni trzymają
                                                        // tylko miejsce w torze.
                                                        if (!head)
                                                            return (
                                                                <span
                                                                    key={lane}
                                                                    className="zse-event-gap"
                                                                />
                                                            );
                                                        return (
                                                            <span
                                                                key={lane}
                                                                className="zse-event-slot"
                                                                style={
                                                                    {
                                                                        "--event-span":
                                                                            item.to -
                                                                            column +
                                                                            1,
                                                                    } as CSSProperties
                                                                }
                                                            >
                                                                {withDetails(
                                                                    event,
                                                                    bar ? (
                                                                        <span className="zse-event-title">
                                                                            {
                                                                                event
                                                                                    .source
                                                                                    .title
                                                                            }
                                                                        </span>
                                                                    ) : (
                                                                        <>
                                                                            <span className="zse-event-dot" />
                                                                            <span className="zse-event-time">
                                                                                {time(
                                                                                    event.start,
                                                                                )}
                                                                            </span>
                                                                            <span className="zse-event-title">
                                                                                {
                                                                                    event
                                                                                        .source
                                                                                        .title
                                                                                }
                                                                            </span>
                                                                        </>
                                                                    ),
                                                                    bar
                                                                        ? "zse-event-bar"
                                                                        : "zse-event-chip",
                                                                    bar
                                                                        ? {
                                                                              "data-cut-start":
                                                                                  compareDays(
                                                                                      event.first,
                                                                                      days[0] as Date,
                                                                                  ) <
                                                                                      0 ||
                                                                                  undefined,
                                                                              "data-cut-end":
                                                                                  compareDays(
                                                                                      event.last,
                                                                                      days[6] as Date,
                                                                                  ) >
                                                                                      0 ||
                                                                                  undefined,
                                                                          }
                                                                        : {},
                                                                )}
                                                            </span>
                                                        );
                                                    },
                                                )}
                                                {overflow && (
                                                    <Popover
                                                        trigger={
                                                            <button
                                                                type="button"
                                                                className="zse-events-more"
                                                            >
                                                                {t.eventCalendar.more(
                                                                    extra.length,
                                                                )}
                                                            </button>
                                                        }
                                                        title={formats.dayLabel(
                                                            day,
                                                        )}
                                                        closable
                                                        width={260}
                                                    >
                                                        <ul className="zse-events-daylist">
                                                            {here.map(
                                                                ({ event }) => (
                                                                    <li
                                                                        key={
                                                                            event
                                                                                .source
                                                                                .id
                                                                        }
                                                                    >
                                                                        {withDetails(
                                                                            event,
                                                                            <>
                                                                                <span className="zse-event-dot" />
                                                                                <span className="zse-event-title">
                                                                                    {
                                                                                        event
                                                                                            .source
                                                                                            .title
                                                                                    }
                                                                                </span>
                                                                            </>,
                                                                            "zse-event-chip",
                                                                        )}
                                                                    </li>
                                                                ),
                                                            )}
                                                        </ul>
                                                    </Popover>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="zse-events-agenda">
                {agendaDays.length === 0 ? (
                    <p className="zse-events-empty">{t.eventCalendar.empty}</p>
                ) : (
                    <ol className="zse-events-agenda-list">
                        {agendaDays.map((key) => {
                            const day = new Date(key);
                            return (
                                <li
                                    key={key}
                                    className="zse-events-agenda-day"
                                    data-today={
                                        sameDay(day, today) || undefined
                                    }
                                >
                                    <span className="zse-events-agenda-date">
                                        <span className="zse-events-agenda-weekday">
                                            {weekday.format(day)}
                                        </span>
                                        <span className="zse-events-agenda-number">
                                            {day.getDate()}
                                        </span>
                                    </span>
                                    <ul className="zse-events-agenda-items">
                                        {(agenda.get(key) ?? [])
                                            .toSorted(
                                                (a, b) =>
                                                    Number(b.allDay) -
                                                        Number(a.allDay) ||
                                                    a.start.getTime() -
                                                        b.start.getTime(),
                                            )
                                            .map((event) => (
                                                <li key={event.source.id}>
                                                    {withDetails(
                                                        event,
                                                        <>
                                                            <span className="zse-event-dot" />
                                                            <span className="zse-events-agenda-text">
                                                                <span className="zse-event-title">
                                                                    {
                                                                        event
                                                                            .source
                                                                            .title
                                                                    }
                                                                </span>
                                                                <span className="zse-events-agenda-meta">
                                                                    {event.allDay
                                                                        ? sameDay(
                                                                              event.first,
                                                                              event.last,
                                                                          )
                                                                            ? t
                                                                                  .eventCalendar
                                                                                  .allDay
                                                                            : shortRange(
                                                                                  event.first,
                                                                                  event.last,
                                                                              )
                                                                        : when(
                                                                              event,
                                                                          )
                                                                              .split(
                                                                                  ", ",
                                                                              )
                                                                              .at(
                                                                                  -1,
                                                                              )}
                                                                    {event
                                                                        .source
                                                                        .location &&
                                                                        ` · ${event.source.location}`}
                                                                </span>
                                                            </span>
                                                        </>,
                                                        "zse-events-agenda-item",
                                                    )}
                                                </li>
                                            ))}
                                    </ul>
                                </li>
                            );
                        })}
                    </ol>
                )}
            </div>
        </section>
    );
}
