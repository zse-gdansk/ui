"use client";

import { useEffect, useRef, useState } from "react";

export type CopyState = "idle" | "copied" | "failed";

type Source = string | (() => string | Promise<string>);

export function useCopy(duration = 2000) {
    const [state, setState] = useState<CopyState>("idle");
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => () => clearTimeout(timer.current), []);

    async function copy(source: Source) {
        let next: CopyState = "copied";
        try {
            const text = typeof source === "function" ? await source() : source;
            await navigator.clipboard.writeText(text);
        } catch {
            next = "failed";
        }
        setState(next);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setState("idle"), duration);
    }

    return [state, copy] as const;
}
