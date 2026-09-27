"use client";

import { Fragment, useSyncExternalStore, type ReactNode } from "react";

import { useMessages } from "../../i18n/context";
import { isApple, shortcutKeys, type Shortcut } from "../menu/shortcut";

export interface KbdProps {
    // Skrót jak w MenuItem: "mod+k" daje ⌘ K na Macu i Ctrl K gdzie indziej.
    // Sekwencja po spacji: "g u" to „G potem U”.
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

    if (!shortcut)
        return (
            <kbd className="zse-kbd" data-size={size}>
                {children}
            </kbd>
        );

    const steps = shortcut.trim().split(/\s+/);

    return (
        <kbd className="zse-kbd-group" data-size={size}>
            {steps.map((step, index) => (
                <Fragment key={steps.slice(0, index + 1).join(" ")}>
                    {index > 0 && (
                        <span className="zse-kbd-then">{t.kbd.sequence}</span>
                    )}
                    {shortcutKeys(step, apple, t.kbd).map((key) => (
                        <kbd key={key} className="zse-kbd" data-size={size}>
                            {key}
                        </kbd>
                    ))}
                </Fragment>
            ))}
        </kbd>
    );
}
