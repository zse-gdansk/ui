"use client";

import { AlertCircleIcon } from "@hugeicons/core-free-icons";
import { useEffect, useState, type ReactNode } from "react";

import { useMessages } from "../../i18n/context";
import { Button } from "../button/Button";
import { Icon } from "../icon/Icon";
import { Spinner } from "../spinner/Spinner";

// Czas wyjścia, jak w app-loader.css.
const EXIT = 200;
// Po tylu ms dopisek, że trwa dłużej, żeby ekran nie wyglądał na zawieszony,
// potem kolejne teksty co ROTATE.
const SLOW = 8000;
const ROTATE = 4000;

const NO_HINT = { current: -1, previous: -1 };

// Losowy indeks inny niż bieżący.
function nextHint(current: number, count: number) {
    if (count < 2) return 0;
    const next = Math.floor(Math.random() * (count - 1));
    return next >= current ? next + 1 : next;
}

export interface AppLoaderProps {
    // Aplikacja się wczytuje: sesja, dane konta, uprawnienia.
    loading: boolean;
    // Aplikacja pod spodem, renderowana od razu, ale wyłączona do końca.
    children: ReactNode;
    // Tekst pod spinnerem, np. „Wczytywanie dziennika”.
    label?: ReactNode;
    // Nie udało się: komunikat i przycisk ponowienia zamiast spinnera.
    // true pokazuje domyślny komunikat.
    error?: ReactNode;
    onRetry?: () => void;
}

// Pełnoekranowy ekran wczytywania aplikacji, np. panelu po zalogowaniu.
// Widoczny od pierwszej klatki (także w HTML z serwera), bez wejścia.
// Zasłania gotowy już szkielet, więc po wczytaniu tylko się z niego
// wyłania przenikaniem, bez przeskoku układu.
export function AppLoader({
    loading,
    children,
    label,
    error,
    onRetry,
}: AppLoaderProps) {
    const t = useMessages();
    const failed = error != null && error !== false;
    const active = loading || failed;
    const [mounted, setMounted] = useState(active);
    const [{ current, previous }, setSlow] = useState(NO_HINT);
    const hints = t.appLoader.slow;

    if (active && !mounted) setMounted(true);

    useEffect(() => {
        if (!active) return;
        let interval: ReturnType<typeof setInterval> | undefined;
        const timer = setTimeout(() => {
            setSlow({ current: 0, previous: -1 });
            interval = setInterval(
                () =>
                    setSlow(({ current: shown }) => ({
                        current: nextHint(shown, hints.length),
                        previous: shown,
                    })),
                ROTATE,
            );
        }, SLOW);
        return () => {
            clearTimeout(timer);
            clearInterval(interval);
            setSlow(NO_HINT);
        };
    }, [active, hints.length]);

    useEffect(() => {
        if (active || !mounted) return;
        const timer = setTimeout(() => setMounted(false), EXIT);
        return () => clearTimeout(timer);
    }, [active, mounted]);

    return (
        <>
            <div className="zse-app-loader-content" inert={active}>
                {children}
            </div>
            {mounted && (
                <div
                    className="zse-app-loader"
                    data-leaving={!active || undefined}
                >
                    <div className="zse-app-loader-body">
                        {failed ? (
                            <div className="zse-app-loader-error" role="alert">
                                <Icon icon={AlertCircleIcon} size={20} />
                                <p>
                                    {error === true
                                        ? t.appLoader.failed
                                        : error}
                                </p>
                                {onRetry && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onRetry}
                                    >
                                        {t.appLoader.retry}
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <>
                                <Spinner
                                    label={
                                        typeof label === "string"
                                            ? label
                                            : t.appLoader.loading
                                    }
                                />
                                <p className="zse-app-loader-label" aria-hidden>
                                    {label ?? t.appLoader.loading}
                                </p>
                                <p className="zse-app-loader-slow" aria-hidden>
                                    {hints.map((hint, index) => (
                                        <span
                                            key={hint}
                                            data-active={
                                                index === current || undefined
                                            }
                                            data-past={
                                                index === previous || undefined
                                            }
                                        >
                                            {hint}
                                        </span>
                                    ))}
                                </p>
                                <p
                                    className="zse-app-loader-sr"
                                    aria-live="polite"
                                >
                                    {current >= 0 ? hints[current] : ""}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
