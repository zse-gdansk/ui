"use client";

import { useState, useSyncExternalStore } from "react";

import { useMessages } from "../../i18n/context";
import { useTimeout } from "../../utils/effects";
import { Badge, type BadgeProps } from "../badge/Badge";
import { Button } from "../button/Button";
import { Countdown } from "../countdown/Countdown";

export type ConnectionState =
    | "connecting"
    | "live"
    | "reconnecting"
    | "polling"
    | "offline";

type Shown = ConnectionState | "network";

export interface ConnectionStatusProps {
    // connecting: pierwsze łączenie; live: dane na żywo; reconnecting:
    // połączenie zerwane, trwa ponowna próba; polling: zamiast strumienia
    // odświeżanie co pollInterval; offline: bez połączenia i bez prób.
    status: ConnectionState;
    // Kiedy przyszły ostatnie dane: poza „na żywo” dopisek „dane z 14:02”.
    updatedAt?: Date | string | number | null;
    // Następna automatyczna próba: odliczanie obok.
    retryAt?: Date | string | number | null;
    // Przycisk „Połącz ponownie” przy reconnecting i offline.
    onRetry?: () => void;
    // Co ile ms polling odświeża dane, do napisu.
    pollInterval?: number;
    // Ekran pokazuje tylko problemy: „Na żywo” bez plakietki (ogłoszenie
    // o powrocie połączenia zostaje).
    hideWhenLive?: boolean;
    // Pogorszenie stanu pokazuje się dopiero po tylu ms: strumień często
    // łączy się ponownie w ułamku sekundy i plakietka by mrugała. Powrót
    // do „na żywo” od razu.
    delay?: number;
    size?: BadgeProps["size"];
    className?: string;
}

const TONE: Record<Shown, Pick<BadgeProps, "tone" | "dot">> = {
    connecting: { tone: "neutral", dot: true },
    live: { tone: "success", dot: "pulse" },
    reconnecting: { tone: "warning", dot: true },
    polling: { tone: "neutral", dot: true },
    offline: { tone: "danger", dot: true },
    network: { tone: "danger", dot: true },
};

function subscribeOnline(onChange: () => void) {
    window.addEventListener("online", onChange);
    window.addEventListener("offline", onChange);
    return () => {
        window.removeEventListener("online", onChange);
        window.removeEventListener("offline", onChange);
    };
}

// Przeglądarka wie o braku sieci wcześniej, niż strumień zgłosi błąd.
const useOnline = () =>
    useSyncExternalStore(
        subscribeOnline,
        () => navigator.onLine,
        () => true,
    );

const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

// Stan połączenia na żywo (SSE, WebSocket) ze spójnym tekstem i kolorem:
// „Na żywo”, „Łączenie ponownie · dane z 14:02”, „Brak internetu”. Czytnik
// słyszy tylko zmiany, bez pierwszego renderu i bez krótkich mrugnięć.
export function ConnectionStatus({
    status,
    updatedAt,
    retryAt,
    onRetry,
    pollInterval,
    hideWhenLive = false,
    delay = 1500,
    size = "sm",
    className,
}: ConnectionStatusProps) {
    const t = useMessages();
    const online = useOnline();
    const target: Shown = online ? status : "network";
    const [shown, setShown] = useState<Shown>(target);
    const [announcement, setAnnouncement] = useState("");

    const label = (state: Shown) =>
        state === "polling"
            ? pollInterval
                ? t.connection.pollingEvery(Math.round(pollInterval / 1000))
                : t.connection.polling
            : t.connection[state];

    const apply = () => {
        if (target === shown) return;
        setAnnouncement(
            target === "live"
                ? t.connection.restored
                : target === "connecting"
                  ? ""
                  : label(target),
        );
        setShown(target);
    };
    // Klucz target: nowy stan zaczyna czekanie od nowa, a powrót do
    // poprzedniego przed czasem nic nie pokazuje.
    useTimeout(
        apply,
        target === shown ? null : target === "live" ? 0 : delay,
        target,
    );

    const updated = updatedAt == null ? null : new Date(updatedAt);
    const time =
        updated &&
        new Intl.DateTimeFormat(t.locale, {
            ...(sameDay(updated, new Date())
                ? {}
                : { day: "numeric", month: "short" }),
            hour: "2-digit",
            minute: "2-digit",
        }).format(updated);
    const degraded = shown !== "live";
    const canRetry =
        onRetry !== undefined &&
        (shown === "reconnecting" || shown === "offline");
    const retrying =
        retryAt != null && (shown === "reconnecting" || shown === "offline");

    return (
        <span
            className={["zse-connection", className].filter(Boolean).join(" ")}
            data-status={shown}
        >
            {!(hideWhenLive && shown === "live") && (
                <Badge size={size} {...TONE[shown]}>
                    {label(shown)}
                    {degraded && time && (
                        <span className="zse-connection-age">
                            {t.connection.dataFrom(time)}
                        </span>
                    )}
                </Badge>
            )}
            {retrying && (
                <span className="zse-connection-retry">
                    {t.connection.retryIn} <Countdown until={retryAt} />
                </span>
            )}
            {canRetry && (
                <Button variant="ghost" size="xs" onClick={onRetry}>
                    {t.connection.retry}
                </Button>
            )}
            <output className="zse-connection-sr">{announcement}</output>
        </span>
    );
}
