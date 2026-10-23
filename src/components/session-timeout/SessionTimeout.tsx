"use client";

import { useState } from "react";

import { useMessages } from "../../i18n/context";
import { useInterval, useTimeout } from "../../utils/effects";
import { Button } from "../button/Button";
import { Modal } from "../modal/Modal";

const SECOND = 1000;

export interface SessionTimeoutProps {
    // Kiedy sesja wygaśnie bez dalszej aktywności; null, póki nieznane.
    expiresAt: Date | string | number | null;
    // Od ilu milisekund przed końcem pokazuje okno z odliczaniem.
    // Domyślnie 2 min.
    warnBefore?: number;
    // „Zostań zalogowany”: zapytanie, które przedłuża sesję. Nowy
    // expiresAt zamyka okno.
    onExtend: () => unknown;
    // Czas minął. Aplikacja sprawdza sesję, bo mogła ją przedłużyć inna
    // karta, i dopiero wtedy przenosi do logowania.
    onExpire: () => void;
    // Przycisk „Wyloguj” w oknie; bez niego tylko przedłużenie.
    onSignOut?: () => unknown;
}

const clock = (ms: number) => {
    const seconds = Math.max(0, Math.ceil(ms / SECOND));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

// Ostrzeżenie przed wygaśnięciem sesji z odliczaniem. Do ostatnich minut
// nic nie widać i nic nie tyka: jedno budzenie na początek ostrzeżenia,
// dopiero w nim co sekundę.
export function SessionTimeout({
    expiresAt,
    warnBefore = 2 * 60 * SECOND,
    onExtend,
    onExpire,
    onSignOut,
}: SessionTimeoutProps) {
    const t = useMessages();
    const [now, setNow] = useState(() => Date.now());
    const [extending, setExtending] = useState(false);
    const end = expiresAt === null ? null : new Date(expiresAt).getTime();
    const left = end === null ? null : end - now;
    const warning = left !== null && left <= warnBefore;
    const tick = () => setNow(Date.now());

    // Nowy koniec liczy się od teraz, nie od tyknięcia sprzed godziny
    // bezczynności: najpierw świeży czas, potem reszta odliczania.
    useTimeout(tick, end === null ? null : 0, end);
    useTimeout(tick, left !== null && !warning ? left - warnBefore : null, end);
    useInterval(tick, warning ? SECOND : null);
    // Klucz end: po przedłużeniu odliczanie do nowego końca.
    useTimeout(onExpire, left === null ? null : Math.max(0, left), end);

    async function extend() {
        setExtending(true);
        try {
            await onExtend();
        } finally {
            setExtending(false);
        }
    }

    return (
        <Modal
            alert
            open={warning}
            title={t.sessionTimeout.title}
            description={
                <>
                    {t.sessionTimeout.expiresIn}{" "}
                    <span role="timer" className="zse-session-timeout-clock">
                        {clock(left ?? 0)}
                    </span>
                    .
                </>
            }
            footer={
                <>
                    {onSignOut && (
                        <Button variant="ghost" onClick={() => onSignOut()}>
                            {t.sessionTimeout.signOut}
                        </Button>
                    )}
                    <Button loading={extending} onClick={() => void extend()}>
                        {t.sessionTimeout.stay}
                    </Button>
                </>
            }
        />
    );
}
