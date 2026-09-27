// Formatery Intl zapamiętane per język.

const numbers = new Map<string, Intl.NumberFormat>();
export function formatNumber(locale: string, value: number, digits = 0) {
    const key = `${locale}:${digits}`;
    let format = numbers.get(key);
    if (!format) {
        format = new Intl.NumberFormat(locale, {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits,
        });
        numbers.set(key, format);
    }
    return format.format(value);
}

const dates = new Map<string, Intl.DateTimeFormat>();
export function formatDate(locale: string, date: Date) {
    let format = dates.get(locale);
    if (!format) {
        format = new Intl.DateTimeFormat(locale, {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
        dates.set(locale, format);
    }
    return format.format(date);
}
