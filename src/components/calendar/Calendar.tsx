"use client";

import {
    ArrowDown01Icon,
    ArrowLeft01Icon,
    ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import {
    useEffect,
    useRef,
    useState,
    type KeyboardEvent,
    type ReactNode,
} from "react";

import { useMessages } from "../../i18n/context";
import { Icon } from "../icon/Icon";
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
    startOfWeek,
} from "./dates";

export interface DateRange {
    from: Date;
    // null w trakcie wybierania, po pierwszym kliknięciu.
    to: Date | null;
}

export type CalendarMark = "accent" | "success" | "warning" | "danger";

interface CalendarBaseProps {
    min?: Date;
    max?: Date;
    // Np. weekendy albo dni wolne.
    isDisabled?: (date: Date) => boolean;
    // Kropki pod dniem: sprawdzian, wydarzenie, termin oddania.
    marks?: (date: Date) => CalendarMark | CalendarMark[] | null | undefined;
    month?: Date;
    defaultMonth?: Date;
    onMonthChange?: (month: Date) => void;
    // Fokus na wybranym (albo dzisiejszym) dniu po zamontowaniu, np.
    // w popoverze date pickera.
    autoFocus?: boolean;
    footer?: ReactNode;
    className?: string;
}

interface SingleProps extends CalendarBaseProps {
    mode?: "single";
    value?: Date | null;
    defaultValue?: Date | null;
    onValueChange?: (value: Date | null) => void;
}

interface RangeProps extends CalendarBaseProps {
    mode: "range";
    value?: DateRange | null;
    defaultValue?: DateRange | null;
    onValueChange?: (value: DateRange | null) => void;
}

export type CalendarProps = SingleProps | RangeProps;

type View = "days" | "months" | "years";

const YEARS = 12;
const STEP: Record<View, number> = { days: 1, months: 12, years: 12 * YEARS };
const pageStart = (year: number) => Math.floor(year / YEARS) * YEARS;

interface Leaving {
    month: Date;
    view: View;
    id: number;
}

const dateKey = (date: Date) =>
    `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

export function Calendar(props: CalendarProps) {
    const {
        min,
        max,
        isDisabled,
        marks,
        onMonthChange,
        autoFocus = false,
        footer,
        className,
    } = props;
    const t = useMessages();
    const formats = dateFormats(t.locale);
    const range = props.mode === "range";

    const [internal, setInternal] = useState<Date | DateRange | null>(
        props.defaultValue ?? null,
    );
    const value = props.value === undefined ? internal : props.value;
    const single = range ? null : (value as Date | null);
    const span = range ? (value as DateRange | null) : null;
    const anchor = single ?? span?.from ?? null;

    const today = startOfDay(new Date());
    const [internalMonth, setInternalMonth] = useState(() =>
        startOfMonth(props.defaultMonth ?? anchor ?? today),
    );
    const month = props.month ? startOfMonth(props.month) : internalMonth;
    const [focused, setFocused] = useState<Date>(() =>
        anchor && sameMonth(anchor, month)
            ? anchor
            : sameMonth(today, month)
              ? today
              : month,
    );
    const [view, setView] = useState<View>("days");
    const [direction, setDirection] = useState(0);
    const [leaving, setLeaving] = useState<Leaving | null>(null);
    const leaveId = useRef(0);
    const [hovered, setHovered] = useState<Date | null>(null);
    const gridRef = useRef<HTMLTableElement>(null);
    const moveFocus = useRef(autoFocus);

    const outOfBounds = (date: Date) =>
        (min !== undefined && compareDays(date, min) < 0) ||
        (max !== undefined && compareDays(date, max) > 0);
    const disabled = (date: Date) =>
        outOfBounds(date) || (isDisabled?.(date) ?? false);

    const canPrev = !min || compareDays(startOfMonth(min), month) < 0;
    const canNext = !max || compareDays(startOfMonth(max), month) > 0;

    // slide: false przy zmianie widoku (wybór miesiąca albo roku z siatki).
    // Wtedy nie ma czego wysuwać: wyjeżdżająca siatka należałaby do widoku,
    // który zaraz znika, i czekałaby ukryta, aż do niego wrócisz.
    function showMonth(next: Date, slide = true) {
        const target = startOfMonth(next);
        if (sameMonth(target, month)) return;
        const dir = compareDays(target, month) > 0 ? 1 : -1;
        setDirection(dir);
        if (!slide) {
            setLeaving(null);
        } else {
            leaveId.current += 1;
            setLeaving({ month, view, id: leaveId.current });
        }
        if (!props.month) setInternalMonth(target);
        onMonthChange?.(target);
    }

    function select(date: Date) {
        if (disabled(date)) return;
        setFocused(date);
        if (!sameMonth(date, month)) showMonth(date);
        if (props.mode === "range") {
            const next: DateRange =
                // Drugi dzień może być wcześniej niż pierwszy: wtedy pierwszy
                // okazuje się końcem, a drugi początkiem.
                !span || span.to
                    ? { from: date, to: null }
                    : compareDays(date, span.from) < 0
                      ? { from: date, to: span.from }
                      : { from: span.from, to: date };
            if (props.value === undefined) setInternal(next);
            props.onValueChange?.(next);
        } else {
            if (props.value === undefined) setInternal(date);
            props.onValueChange?.(date);
        }
    }

    // Po ruchu klawiaturą fokus idzie za wybranym dniem, także do
    // nowego miesiąca.
    useEffect(() => {
        if (!moveFocus.current) return;
        moveFocus.current = false;
        gridRef.current
            ?.querySelector<HTMLElement>(`[data-date="${dateKey(focused)}"]`)
            ?.focus();
    });

    function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, date: Date) {
        const moves: Record<string, () => Date> = {
            ArrowLeft: () => addDays(date, -1),
            ArrowRight: () => addDays(date, 1),
            ArrowUp: () => addDays(date, -7),
            ArrowDown: () => addDays(date, 7),
            Home: () => startOfWeek(date),
            End: () => addDays(startOfWeek(date), 6),
            PageUp: () => addMonths(date, event.shiftKey ? -12 : -1),
            PageDown: () => addMonths(date, event.shiftKey ? 12 : 1),
        };
        const move = moves[event.key];
        if (!move) return;
        event.preventDefault();
        let next = move();
        if (min && compareDays(next, min) < 0) next = min;
        if (max && compareDays(next, max) > 0) next = max;
        moveFocus.current = true;
        setFocused(next);
        showMonth(next);
    }

    // Podgląd zakresu: od początku do dnia pod kursorem, zanim wybierzesz
    // koniec.
    const rangeEnd = span?.to ?? (span && hovered ? hovered : null);
    const [bandFrom, bandTo] =
        span && rangeEnd
            ? compareDays(rangeEnd, span.from) < 0
                ? [rangeEnd, span.from]
                : [span.from, rangeEnd]
            : [null, null];

    // Przewijanie miesięcy: poprzednia siatka zostaje na chwilę i wyjeżdża
    // w jedną stronę, nowa wjeżdża z drugiej. Bez tego stara znikała od
    // razu i przez moment było pusto.
    const leavingProps = (leave: Leaving | null) =>
        leave
            ? {
                  "data-leaving": "",
                  "aria-hidden": true,
                  inert: true,
                  onAnimationEnd: () =>
                      setLeaving((current) =>
                          current?.id === leave.id ? null : current,
                      ),
              }
            : {};

    function renderMonths(shown: Date, leave: Leaving | null) {
        return (
            <div
                key={
                    leave
                        ? `leaving-${leave.id}`
                        : `months-${shown.getFullYear()}`
                }
                className="zse-calendar-months"
                {...leavingProps(leave)}
                data-direction={direction}
            >
                {Array.from({ length: 12 }, (_, m) => {
                    const option = new Date(shown.getFullYear(), m, 1);
                    const blocked =
                        (min && compareDays(option, startOfMonth(min)) < 0) ||
                        (max && compareDays(option, startOfMonth(max)) > 0);
                    return (
                        <button
                            key={m}
                            type="button"
                            className="zse-calendar-month"
                            data-selected={m === shown.getMonth() || undefined}
                            data-current={sameMonth(option, today) || undefined}
                            disabled={Boolean(blocked)}
                            onClick={() => {
                                showMonth(option, false);
                                setFocused(option);
                                setView("days");
                                // Zmiana widoku przenika, nie przesuwa.
                                setDirection(0);
                            }}
                        >
                            {formats.month(option)}
                        </button>
                    );
                })}
            </div>
        );
    }

    function renderYears(shown: Date, leave: Leaving | null) {
        const start = pageStart(shown.getFullYear());
        return (
            <div
                key={leave ? `leaving-${leave.id}` : `years-${start}`}
                className="zse-calendar-months"
                data-kind="years"
                {...leavingProps(leave)}
                data-direction={direction}
            >
                {Array.from({ length: YEARS }, (_, i) => {
                    const year = start + i;
                    const blocked =
                        (min && year < min.getFullYear()) ||
                        (max && year > max.getFullYear());
                    return (
                        <button
                            key={year}
                            type="button"
                            className="zse-calendar-month"
                            data-selected={
                                year === shown.getFullYear() || undefined
                            }
                            data-current={
                                year === today.getFullYear() || undefined
                            }
                            disabled={Boolean(blocked)}
                            onClick={() => {
                                const target = new Date(
                                    year,
                                    shown.getMonth(),
                                    1,
                                );
                                showMonth(target, false);
                                setFocused(target);
                                setView("months");
                                setDirection(0);
                            }}
                        >
                            {year}
                        </button>
                    );
                })}
            </div>
        );
    }

    function renderDays(shown: Date, leave: Leaving | null) {
        const grid = monthGrid(shown);
        const weeks = Array.from({ length: 6 }, (_, w) =>
            grid.slice(w * 7, w * 7 + 7),
        );
        const focusTarget = grid.some((date) => sameDay(date, focused))
            ? focused
            : shown;
        return (
            <table
                key={leave ? `leaving-${leave.id}` : dateKey(shown)}
                ref={leave ? undefined : gridRef}
                {...leavingProps(leave)}
                // Wzorzec date pickera z WAI-ARIA APG: tabela z rolą
                // grid, dni jako komórki, zaznaczenie na komórce.
                // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
                role="grid"
                // Fokus trzymają dni (roving tabindex), nie tabela.
                tabIndex={-1}
                aria-label={formats.monthYear(shown)}
                className="zse-calendar-grid"
                data-direction={direction}
                onMouseLeave={() => setHovered(null)}
            >
                <thead>
                    <tr className="zse-calendar-weekdays">
                        {t.calendar.weekdaysShort.map((day, i) => (
                            <th
                                key={day}
                                scope="col"
                                abbr={t.calendar.weekdaysLong[i]}
                            >
                                {day}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {weeks.map((week) => (
                        <tr
                            key={dateKey(week[0] ?? shown)}
                            className="zse-calendar-week"
                        >
                            {week.map((date) => {
                                const off = disabled(date);
                                const selected =
                                    sameDay(date, single) ||
                                    sameDay(date, span?.from) ||
                                    sameDay(date, span?.to);
                                const inBand =
                                    bandFrom &&
                                    bandTo &&
                                    compareDays(date, bandFrom) >= 0 &&
                                    compareDays(date, bandTo) <= 0;
                                const found = marks?.(date);
                                const dots = found
                                    ? Array.isArray(found)
                                        ? found
                                        : [found]
                                    : [];
                                return (
                                    <td
                                        key={dateKey(date)}
                                        aria-selected={selected || undefined}
                                        className="zse-calendar-cell"
                                        data-band={inBand ? "" : undefined}
                                        data-band-start={
                                            inBand && sameDay(date, bandFrom)
                                                ? ""
                                                : undefined
                                        }
                                        data-band-end={
                                            inBand && sameDay(date, bandTo)
                                                ? ""
                                                : undefined
                                        }
                                    >
                                        <button
                                            type="button"
                                            className="zse-calendar-day"
                                            data-date={dateKey(date)}
                                            tabIndex={
                                                sameDay(date, focusTarget)
                                                    ? 0
                                                    : -1
                                            }
                                            aria-label={formats.dayLabel(date)}
                                            aria-current={
                                                sameDay(date, today)
                                                    ? "date"
                                                    : undefined
                                            }
                                            aria-disabled={off || undefined}
                                            data-selected={
                                                selected || undefined
                                            }
                                            data-preview={
                                                span &&
                                                !span.to &&
                                                !selected &&
                                                sameDay(date, hovered)
                                                    ? ""
                                                    : undefined
                                            }
                                            data-today={
                                                sameDay(date, today) ||
                                                undefined
                                            }
                                            data-outside={
                                                !sameMonth(date, shown) ||
                                                undefined
                                            }
                                            data-disabled={off || undefined}
                                            onClick={() => select(date)}
                                            onMouseEnter={() =>
                                                range && setHovered(date)
                                            }
                                            onFocus={() => {
                                                setFocused(date);
                                                // Podgląd zakresu także przy
                                                // chodzeniu strzałkami.
                                                if (range) setHovered(date);
                                            }}
                                            onKeyDown={(event) =>
                                                onKeyDown(event, date)
                                            }
                                        >
                                            {date.getDate()}
                                            {dots.length > 0 && (
                                                <span
                                                    className="zse-calendar-marks"
                                                    aria-hidden
                                                >
                                                    {dots
                                                        .slice(0, 3)
                                                        .map((tone, i) => (
                                                            <span
                                                                // Kolejność kropek jest stała.
                                                                // oxlint-disable-next-line react/no-array-index-key
                                                                key={i}
                                                                data-tone={tone}
                                                            />
                                                        ))}
                                                </span>
                                            )}
                                        </button>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }

    const RENDER: Record<
        View,
        (shown: Date, leave: Leaving | null) => ReactNode
    > = { days: renderDays, months: renderMonths, years: renderYears };

    return (
        <div
            className={["zse-calendar", className].filter(Boolean).join(" ")}
            data-view={view}
        >
            <div className="zse-calendar-header">
                <button
                    type="button"
                    className="zse-calendar-title"
                    aria-live="polite"
                    aria-expanded={view !== "days"}
                    onClick={() => {
                        setDirection(0);
                        setLeaving(null);
                        setView(
                            view === "days"
                                ? "months"
                                : view === "months"
                                  ? "years"
                                  : "days",
                        );
                    }}
                >
                    {view === "days"
                        ? formats.monthYear(month)
                        : view === "months"
                          ? month.getFullYear()
                          : `${pageStart(month.getFullYear())}–${pageStart(month.getFullYear()) + YEARS - 1}`}
                    <Icon
                        icon={ArrowDown01Icon}
                        size={14}
                        className="zse-calendar-title-icon"
                    />
                </button>
                <span className="zse-calendar-nav">
                    <button
                        type="button"
                        className="zse-calendar-button"
                        aria-label={
                            view === "days"
                                ? t.calendar.previousMonth
                                : view === "months"
                                  ? t.calendar.previousYear
                                  : t.calendar.previousYears
                        }
                        disabled={view === "days" && !canPrev}
                        onClick={() => showMonth(addMonths(month, -STEP[view]))}
                    >
                        <Icon icon={ArrowLeft01Icon} size={16} />
                    </button>
                    <button
                        type="button"
                        className="zse-calendar-button"
                        aria-label={
                            view === "days"
                                ? t.calendar.nextMonth
                                : view === "months"
                                  ? t.calendar.nextYear
                                  : t.calendar.nextYears
                        }
                        disabled={view === "days" && !canNext}
                        onClick={() => showMonth(addMonths(month, STEP[view]))}
                    >
                        <Icon icon={ArrowRight01Icon} size={16} />
                    </button>
                </span>
            </div>

            <div className="zse-calendar-stage">
                {leaving &&
                    leaving.view === view &&
                    RENDER[view](leaving.month, leaving)}
                {RENDER[view](month, null)}
            </div>

            {footer != null && (
                <div className="zse-calendar-footer">{footer}</div>
            )}
        </div>
    );
}
