"use client";

import { useState, useSyncExternalStore, type CSSProperties } from "react";

import { useMessages } from "../../i18n/context";
import { useNow } from "../../utils/relative-time";
import { Badge } from "../badge/Badge";
import { SegmentedControl } from "../segmented/SegmentedControl";
import { formatTime, parseTime } from "../time-picker/time";
import type { TimeSlot } from "../time-picker/TimePicker";

export interface TimetableLesson {
    // Klucz, gdy w jednej komórce jest kilka lekcji (grupy).
    id?: string;
    // Dzień tygodnia: 1 poniedziałek … 7 niedziela.
    day: number;
    // Indeks przedziału w slots (od 0).
    slot: number;
    // Podwójna lekcja: ile przedziałów zajmuje.
    span?: number;
    subject: string;
    teacher?: string;
    room?: string;
    // Np. „gr. 1”, gdy klasa jest dzielona.
    group?: string;
    // Kolor przedmiotu: CSS albo token, np. "var(--chart-3)".
    color?: string;
    status?: "cancelled" | "substitute";
    // Przy zastępstwie: co jest inaczej niż w planie. Stara wartość zostaje
    // w podpowiedzi i dla czytnika.
    substitute?: { subject?: string; teacher?: string; room?: string };
    note?: string;
    href?: string;
}

export interface TimetableProps {
    // Przedziały lekcji, te same co w TimePicker.
    slots: readonly TimeSlot[];
    lessons: readonly TimetableLesson[];
    // Nazwa planu dla czytnika, np. „Plan lekcji klasy 3C”.
    label: string;
    // Dni w kolumnach; domyślnie poniedziałek–piątek.
    days?: readonly number[];
    // Poniedziałek pokazywanego tygodnia: daty pod dniami, „dziś” tylko w
    // tym tygodniu. Bez niego plan stały, dziś to bieżący dzień tygodnia.
    week?: Date;
    // Zaznaczenie bieżącego dnia i trwającej lekcji.
    showNow?: boolean;
    onLessonClick?: (lesson: TimetableLesson) => void;
    // Dzień otwarty na wąskim ekranie; domyślnie dziś albo pierwszy.
    defaultDay?: number;
    className?: string;
}

const WEEKDAYS = [1, 2, 3, 4, 5] as const;
const DAY = 86_400_000;

const capitalize = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);

// ISO: poniedziałek 1, niedziela 7.
const isoDay = (date: Date) => date.getDay() || 7;

const noop = () => () => {};
// Po hydratacji: bieżąca lekcja zależy od zegara, którego serwer nie zna.
const useHydrated = () =>
    useSyncExternalStore(
        noop,
        () => true,
        () => false,
    );

interface Cell {
    lessons: TimetableLesson[];
    span: number;
}

// Siatka dzień × przedział: lekcje jednej komórki razem (grupy), komórki
// zasłonięte podwójną lekcją oznaczone jako zajęte.
function buildGrid(
    lessons: readonly TimetableLesson[],
    days: readonly number[],
    slotCount: number,
) {
    const cells = new Map<string, Cell>();
    const covered = new Set<string>();
    for (const lesson of lessons) {
        if (!days.includes(lesson.day)) continue;
        if (lesson.slot < 0 || lesson.slot >= slotCount) continue;
        const key = `${lesson.day}:${lesson.slot}`;
        const span = Math.min(
            Math.max(lesson.span ?? 1, 1),
            slotCount - lesson.slot,
        );
        const cell = cells.get(key) ?? { lessons: [], span: 1 };
        cell.lessons.push(lesson);
        cell.span = Math.max(cell.span, span);
        cells.set(key, cell);
    }
    for (const [key, cell] of cells) {
        const [day, slot] = key.split(":").map(Number);
        for (let offset = 1; offset < cell.span; offset += 1)
            covered.add(`${day}:${(slot ?? 0) + offset}`);
    }
    return { cells, covered };
}

// Plan lekcji: na szerokim kontenerze tabela dni × lekcje (podwójne lekcje
// przez dwa wiersze, grupy w jednej komórce), na wąskim jeden dzień z
// wyborem dnia. Zastępstwa i odwołane lekcje jako stan karty, bieżący dzień
// i trwająca lekcja zaznaczone.
export function Timetable({
    slots,
    lessons,
    label,
    days = WEEKDAYS,
    week,
    showNow = true,
    onLessonClick,
    defaultDay,
    className,
}: TimetableProps) {
    const t = useMessages();
    const now = useNow();
    const hydrated = useHydrated();
    const { cells, covered } = buildGrid(lessons, days, slots.length);

    // Bieżący dzień i minuta; przy week tylko w tym tygodniu.
    const date = new Date(now);
    const inWeek =
        week === undefined ||
        (now >= startOfDay(week).getTime() &&
            now < startOfDay(week).getTime() + 7 * DAY);
    const live = showNow && hydrated && inWeek;
    const today = live ? isoDay(date) : null;
    const minutes = date.getHours() * 60 + date.getMinutes();
    const currentSlot = live
        ? slots.findIndex((slot) => {
              const start = parseTime(slot.start);
              const end = parseTime(slot.end);
              return (
                  start !== null &&
                  end !== null &&
                  minutes >= start &&
                  minutes < end
              );
          })
        : -1;
    const isCurrent = (day: number, slot: number, span: number) =>
        day === today &&
        currentSlot >= slot &&
        currentSlot < slot + span &&
        currentSlot !== -1;

    const dayName = (day: number, long: boolean) =>
        capitalize(
            (long ? t.calendar.weekdaysLong : t.calendar.weekdaysShort)[
                day - 1
            ] ?? String(day),
        );
    const dayDate = (day: number) =>
        week
            ? new Intl.DateTimeFormat(t.locale, {
                  day: "numeric",
                  month: "short",
              }).format(new Date(startOfDay(week).getTime() + (day - 1) * DAY))
            : null;
    const timeText = (slot: TimeSlot) => {
        const start = parseTime(slot.start);
        const end = parseTime(slot.end);
        return [start, end]
            .filter((value): value is number => value !== null)
            .map((value) => formatTime(t.locale, value))
            .join("–");
    };

    const [chosenDay, setChosenDay] = useState<number | null>(
        defaultDay ?? null,
    );
    const shownDay =
        chosenDay ??
        (today !== null && days.includes(today) ? today : days[0]) ??
        1;

    const card = (lesson: TimetableLesson, current: boolean) => (
        <LessonCard
            key={lesson.id ?? `${lesson.subject}-${lesson.group ?? ""}`}
            lesson={lesson}
            current={current}
            {...(onLessonClick && { onClick: onLessonClick })}
        />
    );

    // Widok dnia: od pierwszej do ostatniej lekcji, luki jako okienka.
    const daySlots = slots
        .map((slot, index) => ({ slot, index }))
        .filter(({ index }) => cells.has(`${shownDay}:${index}`));
    const first = daySlots[0]?.index ?? 0;
    const last = daySlots.at(-1)?.index ?? -1;

    return (
        <div className={["zse-timetable", className].filter(Boolean).join(" ")}>
            <table className="zse-timetable-table" aria-label={label}>
                <thead>
                    <tr>
                        <th scope="col" className="zse-timetable-corner">
                            <span className="zse-timetable-sr">
                                {t.timetable.lesson}
                            </span>
                        </th>
                        {days.map((day) => (
                            <th
                                key={day}
                                scope="col"
                                className="zse-timetable-day"
                                data-today={day === today || undefined}
                                aria-current={
                                    day === today ? "date" : undefined
                                }
                            >
                                <span className="zse-timetable-day-name">
                                    {dayName(day, true)}
                                </span>
                                {dayDate(day) && (
                                    <span className="zse-timetable-day-date">
                                        {dayDate(day)}
                                    </span>
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {slots.map((slot, index) => (
                        <tr key={slot.start}>
                            <th
                                scope="row"
                                className="zse-timetable-slot"
                                data-current={
                                    (today !== null &&
                                        days.includes(today) &&
                                        index === currentSlot) ||
                                    undefined
                                }
                            >
                                <span className="zse-timetable-slot-label">
                                    {slot.label}
                                </span>
                                <span className="zse-timetable-slot-time">
                                    {timeText(slot)}
                                </span>
                            </th>
                            {days.map((day) => {
                                const key = `${day}:${index}`;
                                if (covered.has(key)) return null;
                                const cell = cells.get(key);
                                return (
                                    <td
                                        key={day}
                                        className="zse-timetable-cell"
                                        rowSpan={
                                            cell && cell.span > 1
                                                ? cell.span
                                                : undefined
                                        }
                                    >
                                        {cell && (
                                            <div className="zse-timetable-stack">
                                                {cell.lessons.map((lesson) =>
                                                    card(
                                                        lesson,
                                                        isCurrent(
                                                            day,
                                                            index,
                                                            cell.span,
                                                        ),
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>

            <section className="zse-timetable-dayview" aria-label={label}>
                <SegmentedControl
                    aria-label={t.timetable.day}
                    fullWidth
                    size="sm"
                    value={String(shownDay)}
                    onValueChange={(value) => setChosenDay(Number(value))}
                    options={days.map((day) => ({
                        value: String(day),
                        label: dayName(day, false),
                    }))}
                />
                <h3 className="zse-timetable-dayview-title">
                    {dayName(shownDay, true)}
                    {dayDate(shownDay) && (
                        <span className="zse-timetable-day-date">
                            {dayDate(shownDay)}
                        </span>
                    )}
                </h3>
                {last === -1 ? (
                    <p className="zse-timetable-empty">{t.timetable.empty}</p>
                ) : (
                    <ol className="zse-timetable-list">
                        {slots.map((slot, index) => {
                            if (index < first || index > last) return null;
                            const key = `${shownDay}:${index}`;
                            if (covered.has(key)) return null;
                            const cell = cells.get(key);
                            const end = slots[index + (cell?.span ?? 1) - 1];
                            return (
                                <li
                                    key={slot.start}
                                    className="zse-timetable-row"
                                    data-free={!cell || undefined}
                                >
                                    <span className="zse-timetable-slot">
                                        <span className="zse-timetable-slot-label">
                                            {slot.label}
                                        </span>
                                        <span className="zse-timetable-slot-time">
                                            {timeText(
                                                end?.end &&
                                                    cell &&
                                                    cell.span > 1
                                                    ? { ...slot, end: end.end }
                                                    : slot,
                                            )}
                                        </span>
                                    </span>
                                    {cell ? (
                                        <div className="zse-timetable-stack">
                                            {cell.lessons.map((lesson) =>
                                                card(
                                                    lesson,
                                                    isCurrent(
                                                        shownDay,
                                                        index,
                                                        cell.span,
                                                    ),
                                                ),
                                            )}
                                        </div>
                                    ) : (
                                        <span className="zse-timetable-free">
                                            {t.timetable.free}
                                        </span>
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                )}
            </section>
        </div>
    );
}

function startOfDay(date: Date) {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
}

function LessonCard({
    lesson,
    current,
    onClick,
}: {
    lesson: TimetableLesson;
    current: boolean;
    onClick?: (lesson: TimetableLesson) => void;
}) {
    const t = useMessages();
    const change = lesson.status === "substitute" ? lesson.substitute : null;
    const subject = change?.subject ?? lesson.subject;
    const teacher = change?.teacher ?? lesson.teacher;
    const room = change?.room ?? lesson.room;
    // Co było w planie, gdy zastępstwo coś zmienia.
    const replaced = [
        change?.subject && lesson.subject,
        change?.teacher && lesson.teacher,
        change?.room && lesson.room,
    ].filter((value): value is string => Boolean(value));

    const content = (
        <>
            <span className="zse-lesson-head">
                <span className="zse-lesson-subject">{subject}</span>
                {lesson.group && (
                    <span className="zse-lesson-group">{lesson.group}</span>
                )}
            </span>
            {(room || teacher) && (
                <span className="zse-lesson-meta">
                    {room && (
                        <span data-changed={change?.room ? "" : undefined}>
                            {room}
                        </span>
                    )}
                    {teacher && (
                        <span data-changed={change?.teacher ? "" : undefined}>
                            {teacher}
                        </span>
                    )}
                </span>
            )}
            {replaced.length > 0 && (
                <span className="zse-timetable-sr">
                    {t.timetable.instead(replaced.join(", "))}
                </span>
            )}
            {(lesson.status || current || lesson.note) && (
                <span className="zse-lesson-tags">
                    {current && (
                        <Badge size="sm" tone="accent" dot="pulse">
                            {t.timetable.now}
                        </Badge>
                    )}
                    {lesson.status === "cancelled" && (
                        <Badge size="sm" tone="danger">
                            {t.timetable.cancelled}
                        </Badge>
                    )}
                    {lesson.status === "substitute" && (
                        <Badge size="sm" tone="warning">
                            {t.timetable.substitute}
                        </Badge>
                    )}
                    {lesson.note && (
                        <span className="zse-lesson-note">{lesson.note}</span>
                    )}
                </span>
            )}
        </>
    );

    const props = {
        className: "zse-lesson",
        "data-status": lesson.status,
        "data-current": current || undefined,
        style: lesson.color
            ? ({ "--lesson-color": lesson.color } as CSSProperties)
            : undefined,
        title:
            replaced.length > 0
                ? t.timetable.instead(replaced.join(", "))
                : undefined,
    };

    if (lesson.href)
        return (
            <a {...props} href={lesson.href}>
                {content}
            </a>
        );
    if (onClick)
        return (
            <button {...props} type="button" onClick={() => onClick(lesson)}>
                {content}
            </button>
        );
    return <div {...props}>{content}</div>;
}
