export function parseTime(text: string | null | undefined) {
    const match = text ? /^(\d{1,2}):(\d{2})$/.exec(text.trim()) : null;
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours > 23 || minutes > 59) return null;
    return hours * 60 + minutes;
}

export const toTimeValue = (minutes: number) =>
    `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

const formats = new Map<string, Intl.DateTimeFormat>();

export function formatTime(locale: string, minutes: number) {
    let format = formats.get(locale);
    if (!format) {
        format = new Intl.DateTimeFormat(locale, {
            hour: "numeric",
            minute: "2-digit",
        });
        formats.set(locale, format);
    }
    return format.format(
        new Date(2000, 0, 1, Math.floor(minutes / 60), minutes % 60),
    );
}

export const nowInMinutes = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
};
