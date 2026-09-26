"use client";

import { useEffect, type RefObject } from "react";

import { pl } from "../../i18n/pl";
import type { Messages } from "../../i18n/types";

export type Shortcut = string;

interface Parsed {
    ctrl: boolean;
    meta: boolean;
    alt: boolean;
    shift: boolean;
    key: string;
}

const SYMBOLS: Record<string, string> = {
    backspace: "⌫",
    delete: "⌦",
    enter: "↩",
    escape: "⎋",
    tab: "⇥",
    space: "␣",
    arrowup: "↑",
    arrowdown: "↓",
    arrowleft: "←",
    arrowright: "→",
};

// Nazwy klawiszy poza Makiem; spacja, Backspace, Delete i Escape z katalogu.
const NAMES: Record<string, string> = {
    enter: "Enter",
    tab: "Tab",
    arrowup: "↑",
    arrowdown: "↓",
    arrowleft: "←",
    arrowright: "→",
};

const ARIA: Record<string, string> = {
    backspace: "Backspace",
    delete: "Delete",
    enter: "Enter",
    escape: "Escape",
    tab: "Tab",
    space: "Space",
    arrowup: "ArrowUp",
    arrowdown: "ArrowDown",
    arrowleft: "ArrowLeft",
    arrowright: "ArrowRight",
};

export function isApple() {
    if (typeof navigator === "undefined") return false;
    const platform =
        (navigator as { userAgentData?: { platform?: string } }).userAgentData
            ?.platform ?? navigator.platform;
    return /mac|iphone|ipad|ipod/i.test(platform);
}

function parse(shortcut: Shortcut, apple: boolean): Parsed {
    const parts = shortcut.toLowerCase().split("+");
    const key = parts.pop() ?? "";
    const has = (name: string) => parts.includes(name);
    return {
        ctrl: has("ctrl") || (has("mod") && !apple),
        meta: has("meta") || has("cmd") || (has("mod") && apple),
        alt: has("alt") || has("option"),
        shift: has("shift"),
        key,
    };
}

const label = (key: string, names: Record<string, string>) =>
    names[key] ?? key.toUpperCase();

// Klawisze osobno, np. ["⇧", "⌘", "A"] albo ["Ctrl", "Shift", "A"].
export function shortcutKeys(
    shortcut: Shortcut,
    apple = isApple(),
    names: Messages["kbd"] = pl.kbd,
) {
    const { ctrl, meta, alt, shift, key } = parse(shortcut, apple);
    const keys = apple
        ? [
              ctrl && "⌃",
              alt && "⌥",
              shift && "⇧",
              meta && "⌘",
              label(key, SYMBOLS),
          ]
        : [
              ctrl && "Ctrl",
              meta && "Win",
              alt && "Alt",
              shift && "Shift",
              label(key, { ...NAMES, ...names }),
          ];
    return keys.filter((part): part is string => Boolean(part));
}

// Kolejność modyfikatorów jak w menu macOS: ⌃ ⌥ ⇧ ⌘.
export function formatShortcut(
    shortcut: Shortcut,
    apple = isApple(),
    names: Messages["kbd"] = pl.kbd,
) {
    return shortcutKeys(shortcut, apple, names).join(apple ? "" : "+");
}

export function ariaShortcut(shortcut: Shortcut, apple = isApple()) {
    const { ctrl, meta, alt, shift, key } = parse(shortcut, apple);
    return [
        ctrl && "Control",
        meta && "Meta",
        alt && "Alt",
        shift && "Shift",
        label(key, ARIA),
    ]
        .filter(Boolean)
        .join("+");
}

function matches(event: KeyboardEvent, parsed: Parsed) {
    if (
        event.ctrlKey !== parsed.ctrl ||
        event.metaKey !== parsed.meta ||
        event.altKey !== parsed.alt ||
        event.shiftKey !== parsed.shift
    )
        return false;
    const { key } = parsed;
    if (/^[a-z]$/.test(key)) return event.code === `Key${key.toUpperCase()}`;
    if (/^\d$/.test(key)) return event.code === `Digit${key}`;
    if (key === "space") return event.code === "Space";
    return event.key.toLowerCase() === key;
}

// Czy zdarzenie to dany skrót, np. "mod+b" (⌘B na Macu, Ctrl+B gdzie indziej).
export const matchesShortcut = (event: KeyboardEvent, shortcut: Shortcut) =>
    matches(event, parse(shortcut, isApple()));

export function useShortcut(
    shortcut: Shortcut | undefined,
    ref: RefObject<HTMLElement | null>,
    disabled: boolean,
) {
    useEffect(() => {
        if (!shortcut || disabled) return;
        const parsed = parse(shortcut, isApple());
        const onKeyDown = (event: KeyboardEvent) => {
            if (!matches(event, parsed)) return;
            event.preventDefault();
            event.stopPropagation();
            if (!event.repeat) ref.current?.click();
        };
        window.addEventListener("keydown", onKeyDown, { capture: true });
        return () =>
            window.removeEventListener("keydown", onKeyDown, {
                capture: true,
            });
    }, [shortcut, disabled, ref]);
}
