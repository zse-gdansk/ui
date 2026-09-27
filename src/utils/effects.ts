"use client";

// Jedyne miejsce z useEffect i useLayoutEffect. Komponenty biorą stąd hook
// nazwany po tym, co robi, a lint zabrania gołych efektów w src/components
// (docs/effects.md). Zanim sięgniesz po któryś: stan wyliczany liczy się w
// renderze, reakcja na kliknięcie idzie do obsługi zdarzenia, reset stanu
// przy zmianie encji to key.

import {
    useEffect,
    useEffectEvent,
    useLayoutEffect,
    useRef,
    type DependencyList,
    type RefObject,
} from "react";

// Raz po zamontowaniu, sprzątanie przy odmontowaniu. Wartości z renderu
// czytaj przez useEffectEvent albo useLatest, nie przez domknięcie.
export function useMountEffect(effect: () => void | (() => void)) {
    const run = useEffectEvent(effect);
    useEffect(() => run(), []);
}

// Najnowsza wartość dla kodu spoza renderu: getter oddany do rejestru,
// nasłuch założony raz. Nie do czytania w renderze.
export function useLatest<T>(value: T) {
    const ref = useRef(value);
    useLayoutEffect(() => {
        ref.current = value;
    });
    return ref as Readonly<RefObject<T>>;
}

// Synchronizacja z czymś poza Reactem (rejestr, biblioteka, instancja
// wykresu), ponawiana ze zmianą deps. Bez deps po każdym renderze. Nie do
// liczenia stanu z propsów ani do reakcji na zdarzenia.
export function useExternalEffect(
    effect: () => void | (() => void),
    deps?: DependencyList,
) {
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- deps podaje wołający
    useEffect(effect, deps);
}

// Praca na DOM po renderze, przed malowaniem: pomiar, fokus, przewinięcie,
// animacja. Nie ustawia stanu Reacta.
export function useDomEffect(
    effect: () => void | (() => void),
    deps?: DependencyList,
) {
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- deps podaje wołający
    useLayoutEffect(effect, deps);
}

type ListenerTarget = Window | Document | HTMLElement | MediaQueryList;

interface ListenerOptions extends AddEventListenerOptions {
    enabled?: boolean;
}

// Nasłuch zdarzenia z zawsze aktualnym handlerem, bez ponownego zakładania
// przy każdym renderze. target: "window", "document" (bezpieczne przy
// SSR), obiekt, ref elementu albo funkcja (np. () => matchMedia(…));
// enabled: false zdejmuje nasłuch.
export function useEventListener<E extends Event = Event>(
    target:
        | "window"
        | "document"
        | ListenerTarget
        | RefObject<HTMLElement | null>
        | (() => ListenerTarget | null)
        | null,
    type: string,
    handler: (event: E) => void,
    { enabled = true, capture = false, passive, once }: ListenerOptions = {},
) {
    const handle = useEffectEvent(handler);
    const resolve = useEffectEvent((): ListenerTarget | null => {
        if (target === "window") return window;
        if (target === "document") return document;
        if (typeof target === "function") return target();
        return target && "current" in target ? target.current : target;
    });
    // Funkcja jako cel nie zakłada nasłuchu od nowa przy każdym renderze.
    const identity = typeof target === "function" ? "function" : target;
    useEffect(() => {
        if (!enabled) return;
        const resolved = resolve();
        if (!resolved) return;
        const listener = (event: Event) => handle(event as E);
        const options = {
            capture,
            ...(passive !== undefined && { passive }),
            ...(once !== undefined && { once }),
        };
        resolved.addEventListener(type, listener, options);
        return () => resolved.removeEventListener(type, listener, options);
        // oxlint-disable-next-line react/exhaustive-effect-dependencies -- identity zamiast funkcji celu, żeby nie zakładać nasłuchu co render
    }, [identity, type, enabled, capture, passive, once]);
}

// Wywołanie po czasie. delay null wyłącza; zmiana delay albo key zaczyna
// odliczanie od nowa (np. key = wartość, która ma zgasnąć).
export function useTimeout(
    callback: () => void,
    delay: number | null,
    key?: unknown,
) {
    const run = useEffectEvent(callback);
    useEffect(() => {
        if (delay === null) return;
        const timer = setTimeout(() => run(), delay);
        return () => clearTimeout(timer);
        // oxlint-disable-next-line react/exhaustive-effect-dependencies -- key celowo restartuje odliczanie
    }, [delay, key]);
}

export function useInterval(callback: () => void, delay: number | null) {
    const run = useEffectEvent(callback);
    useEffect(() => {
        if (delay === null) return;
        const timer = setInterval(() => run(), delay);
        return () => clearInterval(timer);
    }, [delay]);
}

// Zmiana rozmiaru elementów (i opcjonalnie ich dzieci). Callback raz od
// razu i przy każdej zmianie, zawsze w aktualnej wersji.
export function useResizeObserver(
    refs:
        | RefObject<HTMLElement | null>
        | readonly RefObject<HTMLElement | null>[],
    callback: () => void,
    { enabled = true, children = false } = {},
) {
    const run = useEffectEvent(callback);
    // Refy są stałe, więc obserwacja zaczyna się od nowa tylko z enabled.
    const elementsOf = useEffectEvent(() =>
        (Array.isArray(refs) ? refs : [refs])
            .map((ref) => ref.current)
            .filter((element): element is HTMLElement => element !== null),
    );
    useLayoutEffect(() => {
        if (!enabled) return;
        const elements = elementsOf();
        if (elements.length === 0) return;
        const observer = new ResizeObserver(() => run());
        for (const element of elements) {
            observer.observe(element);
            if (children)
                for (const child of element.children) observer.observe(child);
        }
        return () => observer.disconnect();
    }, [enabled, children]);
}

// Zadanie asynchroniczne dla klucza, np. wyszukiwanie dla frazy: po delay
// ms od ostatniej zmiany, poprzednie dostaje abort. key null nic nie robi.
// Stan ustawiaj w zadaniu po await, sprawdzając signal.aborted.
export function useAbortableTask(
    key: string | null,
    task: (signal: AbortSignal) => void | Promise<unknown>,
    delay = 0,
) {
    const run = useEffectEvent(task);
    useEffect(() => {
        if (key === null) return;
        const controller = new AbortController();
        const timer = setTimeout(() => {
            void Promise.resolve(run(controller.signal)).catch(() => {});
        }, delay);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [key, delay]);
}
