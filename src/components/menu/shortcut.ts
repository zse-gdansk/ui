"use client";

import { useEffect, type RefObject } from "react";

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

const NAMES: Record<string, string> = {
    backspace: "Backspace",
    delete: "Del",
    enter: "Enter",
    escape: "Esc",
    tab: "Tab",
    space: "Spacja",
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

export function formatShortcut(shortcut: Shortcut, apple = isApple()) {
    const { ctrl, meta, alt, shift, key } = parse(shortcut, apple);
    if (apple) {
        return [
            ctrl && "⌃",
            alt && "⌥",
            shift && "⇧",
            meta && "⌘",
            label(key, SYMBOLS),
        ]
            .filter(Boolean)
            .join("");
    }
    return [
        ctrl && "Ctrl",
        meta && "Win",
        alt && "Alt",
        shift && "Shift",
        label(key, NAMES),
    ]
        .filter(Boolean)
        .join("+");
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
