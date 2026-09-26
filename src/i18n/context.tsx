"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import { pl } from "./pl";
import type { Messages, MessagesOverride } from "./types";

const MessagesContext = createContext<Messages>(pl);

export interface LocaleProviderProps {
    // Pełny katalog innego języka albo domyślny pl.
    messages?: Messages;
    // Pojedyncze teksty do podmiany, np. { common: { close: "Zamknij okno" } }.
    override?: MessagesOverride;
    children: ReactNode;
}

// Język interfejsu biblioteki. Bez providera wszystko jest po polsku.
export function LocaleProvider({
    messages = pl,
    override,
    children,
}: LocaleProviderProps) {
    const value = useMemo(() => {
        if (!override) return messages;
        const merged: Record<string, unknown> = { ...messages };
        for (const [key, part] of Object.entries(override)) {
            const base = merged[key];
            merged[key] =
                typeof part === "object" &&
                part !== null &&
                typeof base === "object"
                    ? { ...base, ...part }
                    : part;
        }
        return merged as unknown as Messages;
    }, [messages, override]);

    return <MessagesContext value={value}>{children}</MessagesContext>;
}

export const useMessages = () => useContext(MessagesContext);
