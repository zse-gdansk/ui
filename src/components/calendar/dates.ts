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

const cache = new Map<string, ReturnType<typeof build>>();

function build(locale: string) {
    const format = (options: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat(locale, options);
    const monthYear = format({ month: "long", year: "numeric" });
    const full = format({ day: "numeric", month: "long", year: "numeric" });
    const weekday = format({ weekday: "long" });
    const dayMonth = format({ day: "numeric", month: "long" });
    const month = format({ month: "long" });
    const capitalize = (text: string) =>
        text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);

    const date = (value: Date) => full.format(value);
    return {
        // "Wrzesień 2026".
        monthYear: (value: Date) => capitalize(monthYear.format(value)),
        // "26 września 2026".
        date,
        // "26 września 2026, sobota" dla czytnika ekranu.
        dayLabel: (value: Date) => `${date(value)}, ${weekday.format(value)}`,
        // "Styczeń"..."Grudzień".
        month: (value: Date) => capitalize(month.format(value)),
        // Zakres: "12–19 września 2026", "28 września – 3 października 2026".
        range(from: Date, to: Date) {
            if (sameDay(from, to)) return date(from);
            if (sameMonth(from, to)) return `${from.getDate()}–${date(to)}`;
            if (from.getFullYear() === to.getFullYear())
                return `${dayMonth.format(from)} – ${date(to)}`;
            return `${date(from)} – ${date(to)}`;
        },
    };
}

// Formatowanie dat w danym języku, z pamięcią formaterów.
export function dateFormats(locale: string) {
    let formats = cache.get(locale);
    if (!formats) {
        formats = build(locale);
        cache.set(locale, formats);
    }
    return formats;
}
