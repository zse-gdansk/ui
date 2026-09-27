"use client";

import { useSyncExternalStore } from "react";

import type { Messages } from "../i18n/types";

// Wspólny zegar dla wszystkich czasów względnych: jeden interwał na
// aplikację, odświeżenie co 30 s wystarcza dla „5 min temu”.
const listeners = new Set<() => void>();
let now = Date.now();
let timer: ReturnType<typeof setInterval> | undefined;

function subscribe(listener: () => void) {
    listeners.add(listener);
    if (!timer)
        timer = setInterval(() => {
            now = Date.now();
            for (const each of listeners) each();
        }, 30_000);
    return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
            clearInterval(timer);
            timer = undefined;
        }
    };
}

export const useNow = () =>
    useSyncExternalStore(
        subscribe,
        () => now,
        () => now,
    );

const cache = new Map<string, Intl.DateTimeFormat | Intl.RelativeTimeFormat>();
function formatter<T extends Intl.DateTimeFormat | Intl.RelativeTimeFormat>(
    key: string,
    create: () => T,
): T {
    let result = cache.get(key) as T | undefined;
    if (!result) {
        result = create();
        cache.set(key, result);
    }
    return result;
}

const startOfDay = (time: number) => {
    const date = new Date(time);
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
    ).getTime();
};
const DAY = 86_400_000;

// Ile dni kalendarzowych między datami (0: ten sam dzień, 1: wczoraj).
export const daysAgo = (date: Date, reference: number) =>
    Math.round((startOfDay(reference) - startOfDay(date.getTime())) / DAY);

export function formatClock(locale: string, date: Date) {
    return formatter(
        `clock:${locale}`,
        () =>
            new Intl.DateTimeFormat(locale, {
                hour: "numeric",
                minute: "2-digit",
            }),
    ).format(date);
}

export function formatFull(locale: string, date: Date) {
    return formatter(
        `full:${locale}`,
        () =>
            new Intl.DateTimeFormat(locale, {
                dateStyle: "long",
                timeStyle: "short",
            }),
    ).format(date);
}

// Dzień dla nagłówka grupy: „Dziś”, „Wczoraj”, „12 września”, rok tylko,
// gdy inny niż bieżący.
export function formatDay(t: Messages, date: Date, reference: number) {
    const days = daysAgo(date, reference);
    if (days === 0) return t.timeline.today;
    if (days === 1) return t.timeline.yesterday;
    const sameYear = new Date(reference).getFullYear() === date.getFullYear();
    return formatter(
        `day:${t.locale}:${sameYear}`,
        () =>
            new Intl.DateTimeFormat(t.locale, {
                day: "numeric",
                month: "long",
                ...(!sameYear && { year: "numeric" }),
            }),
    ).format(date);
}

// Czas wpisu: „przed chwilą”, „5 min temu”, „2 godz. temu”, „wczoraj
// o 14:32”, „wtorek, 14:32”, a starsze pełną datą.
export function formatRelative(t: Messages, date: Date, reference: number) {
    const seconds = Math.round((reference - date.getTime()) / 1000);
    const relative = formatter(
        `rel:${t.locale}`,
        () =>
            new Intl.RelativeTimeFormat(t.locale, {
                style: "short",
                numeric: "auto",
            }),
    ) as Intl.RelativeTimeFormat;
    if (seconds < 45) return t.timeline.justNow;
    const days = daysAgo(date, reference);
    if (days === 0) {
        if (seconds < 3600)
            return relative.format(-Math.round(seconds / 60), "minute");
        return relative.format(-Math.round(seconds / 3600), "hour");
    }
    const clock = formatClock(t.locale, date);
    if (days === 1) return t.timeline.yesterdayAt(clock);
    if (days < 7) {
        const weekday = formatter(
            `wd:${t.locale}`,
            () => new Intl.DateTimeFormat(t.locale, { weekday: "long" }),
        ).format(date);
        return t.timeline.dayAt(weekday, clock);
    }
    return formatFull(t.locale, date);
}

// Czas do terminu: „za 20 min”, „za 5 godz.”, „jutro o 15:00”, dzień
// tygodnia z godziną, a dalej pełna data.
export function formatUntil(t: Messages, date: Date, reference: number) {
    const seconds = Math.round((date.getTime() - reference) / 1000);
    const relative = formatter(
        `rel:${t.locale}`,
        () =>
            new Intl.RelativeTimeFormat(t.locale, {
                style: "short",
                numeric: "auto",
            }),
    ) as Intl.RelativeTimeFormat;
    const days = -daysAgo(date, reference);
    if (days === 0) {
        if (seconds < 3600)
            return relative.format(
                Math.max(1, Math.round(seconds / 60)),
                "minute",
            );
        return relative.format(Math.round(seconds / 3600), "hour");
    }
    const clock = formatClock(t.locale, date);
    if (days === 1) return t.banner.tomorrowAt(clock);
    if (days < 7) {
        const weekday = formatter(
            `wd:${t.locale}`,
            () => new Intl.DateTimeFormat(t.locale, { weekday: "long" }),
        ).format(date);
        return t.timeline.dayAt(weekday, clock);
    }
    return formatFull(t.locale, date);
}
