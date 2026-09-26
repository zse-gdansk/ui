"use client";

import { useSyncExternalStore, type ReactNode } from "react";

import { useMessages } from "../../i18n/context";
import { isApple, shortcutKeys, type Shortcut } from "../menu/shortcut";

export interface KbdProps {
    // Skrót jak w MenuItem: "mod+k" daje ⌘ K na Macu i Ctrl K gdzie indziej.
    shortcut?: Shortcut;
    // Albo dowolny tekst w jednym klawiszu, np. „Esc”.
    children?: ReactNode;
    size?: "sm" | "md";
}

const noop = () => () => {};

const useApple = () => useSyncExternalStore(noop, isApple, () => false);

export function Kbd({ shortcut, children, size = "md" }: KbdProps) {
    const t = useMessages();
    const apple = useApple();
    const keys = shortcut ? shortcutKeys(shortcut, apple, t.kbd) : [];

    if (!shortcut)
        return (
            <kbd className="zse-kbd" data-size={size}>
                {children}
            </kbd>
        );

    return (
        <kbd className="zse-kbd-group" data-size={size}>
            {keys.map((key) => (
                <kbd key={key} className="zse-kbd" data-size={size}>
                    {key}
                </kbd>
            ))}
        </kbd>
    );
}
