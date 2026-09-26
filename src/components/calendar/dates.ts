// Daty jako lokalny dzień, bez godzin: wszystko na new Date(r, m, d),
// więc zmiana czasu letniego nie przesuwa dni.

export const startOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const startOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1);

export const addDays = (date: Date, days: number) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

export const daysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

// 31 stycznia + 1 miesiąc = 28/29 lutego, nie 3 marca.
export function addMonths(date: Date, months: number) {
    const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
    return new Date(
        target.getFullYear(),
        target.getMonth(),
        Math.min(date.getDate(), daysInMonth(target)),
    );
}

export const compareDays = (a: Date, b: Date) =>
    startOfDay(a).getTime() - startOfDay(b).getTime();

export const sameDay = (
    a: Date | null | undefined,
    b: Date | null | undefined,
) => Boolean(a && b) && compareDays(a as Date, b as Date) === 0;

export const sameMonth = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

// Tydzień od poniedziałku.
export const startOfWeek = (date: Date) =>
    addDays(date, -((date.getDay() + 6) % 7));

// Zawsze 6 tygodni, żeby kalendarz nie zmieniał wysokości między
// miesiącami.
export function monthGrid(month: Date) {
    const start = startOfWeek(startOfMonth(month));
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export const WEEKDAYS = ["pn", "wt", "śr", "cz", "pt", "sb", "nd"];
export const WEEKDAY_NAMES = [
    "poniedziałek",
    "wtorek",
    "środa",
    "czwartek",
    "piątek",
    "sobota",
    "niedziela",
];

const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("pl-PL", options);

const MONTH_YEAR = format({ month: "long", year: "numeric" });
const FULL = format({ day: "numeric", month: "long", year: "numeric" });
const WEEKDAY = format({ weekday: "long" });
const DAY_MONTH = format({ day: "numeric", month: "long" });
const MONTH = format({ month: "long" });

const capitalize = (text: string) =>
    text.charAt(0).toLocaleUpperCase("pl") + text.slice(1);

// "Wrzesień 2026".
export const formatMonthYear = (date: Date) =>
    capitalize(MONTH_YEAR.format(date));

// "26 września 2026".
export const formatDate = (date: Date) => FULL.format(date);

// "26 września 2026, sobota" dla czytnika ekranu.
export const formatDayLabel = (date: Date) =>
    `${FULL.format(date)}, ${WEEKDAY.format(date)}`;

// "Styczeń"..."Grudzień".
export const formatMonth = (date: Date) => capitalize(MONTH.format(date));

// Zakres: "12–19 września 2026", "28 września – 3 października 2026".
export function formatRange(from: Date, to: Date) {
    if (sameDay(from, to)) return formatDate(from);
    if (sameMonth(from, to)) return `${from.getDate()}–${formatDate(to)}`;
    if (from.getFullYear() === to.getFullYear())
        return `${DAY_MONTH.format(from)} – ${formatDate(to)}`;
    return `${formatDate(from)} – ${formatDate(to)}`;
}
