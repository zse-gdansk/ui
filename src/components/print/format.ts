import type { Messages } from "../../i18n/types";

// Formaty kolumn tabeli i wartości z API. percent to ułamek (0,36 → 36%),
// jak w Intl; daty jako ISO albo Date.
export type PrintFormat =
    | "text"
    | "number"
    | "integer"
    | "percent"
    | "date"
    | "datetime"
    | "time"
    | "boolean";

const cache = new Map<string, Intl.NumberFormat | Intl.DateTimeFormat>();

function formatter<T extends Intl.NumberFormat | Intl.DateTimeFormat>(
    key: string,
    create: () => T,
): T {
    let value = cache.get(key) as T | undefined;
    if (!value) {
        value = create();
        cache.set(key, value);
    }
    return value;
}

const DATE: Record<"date" | "datetime" | "time", Intl.DateTimeFormatOptions> = {
    date: { day: "numeric", month: "long", year: "numeric" },
    datetime: { dateStyle: "medium", timeStyle: "short" },
    time: { hour: "2-digit", minute: "2-digit" },
};

// Pusta wartość to kreska, nie „null” ani „0”: brak danych to nie zero.
export function formatValue(
    value: unknown,
    format: PrintFormat | undefined,
    t: Messages,
): string {
    if (value === null || value === undefined || value === "") return "–";
    const { locale } = t;
    switch (format) {
        case "number":
        case "integer":
        case "percent": {
            const number = typeof value === "number" ? value : Number(value);
            if (!Number.isFinite(number)) return String(value);
            return formatter(
                `${locale}:${format}`,
                () =>
                    new Intl.NumberFormat(
                        locale,
                        format === "percent"
                            ? { style: "percent", maximumFractionDigits: 1 }
                            : format === "integer"
                              ? { maximumFractionDigits: 0 }
                              : { maximumFractionDigits: 2 },
                    ),
            ).format(number);
        }
        case "date":
        case "datetime":
        case "time": {
            const date =
                value instanceof Date ? value : new Date(String(value));
            if (Number.isNaN(date.getTime())) return String(value);
            return formatter(
                `${locale}:${format}`,
                () => new Intl.DateTimeFormat(locale, DATE[format]),
            ).format(date);
        }
        case "boolean":
            return value ? t.print.yes : t.print.no;
        default:
            return String(value);
    }
}

// Liczby do prawej, żeby cyfry stały pod sobą.
export const alignFor = (format: PrintFormat | undefined) =>
    format === "number" || format === "integer" || format === "percent"
        ? "end"
        : "start";
