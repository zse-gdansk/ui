"use client";

import { Tick02Icon } from "@hugeicons/core-free-icons";
import { type ReactNode, useState } from "react";

import { useMessages } from "../../i18n/context";
import { useNow } from "../../utils/relative-time";
import { Badge } from "../badge/Badge";
import { Button } from "../button/Button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../card/Card";
import { Deadline } from "../deadline/Deadline";
import { Capacity, capacityState } from "./Capacity";

export type SignupStatus = "none" | "joined" | "waitlist";

export interface SignupCardProps {
    title: ReactNode;
    // Termin, miejsce, prowadzący: „Wtorki 15:00 · sala 208”.
    meta?: ReactNode;
    description?: ReactNode;
    taken: number;
    limit?: number;
    waitlist?: number;
    // Lista rezerwowa, gdy nie ma miejsc. Domyślnie tak.
    allowWaitlist?: boolean;
    // Koniec zapisów; po nim zapisy są zamknięte.
    closesAt?: Date | string | number;
    // Zamknięte ręcznie, np. przez organizatora.
    closed?: boolean;
    status?: SignupStatus;
    // Miejsce na liście rezerwowej.
    waitlistPosition?: number | undefined;
    // Zwrócona obietnica trzyma spinner w przycisku; odrzucona pokazuje
    // błąd pod przyciskiem. Liczby i status aktualizuje aplikacja.
    onJoin?: () => void | Promise<unknown>;
    onLeave?: () => void | Promise<unknown>;
    // Dodatkowa treść pod paskiem, np. lista zapisanych.
    children?: ReactNode;
    className?: string;
}

// Zapisy z limitem miejsc: koło, wycieczka, konsultacje, dzień otwarty.
export function SignupCard({
    title,
    meta,
    description,
    taken,
    limit,
    waitlist = 0,
    allowWaitlist = true,
    closesAt,
    closed = false,
    status = "none",
    waitlistPosition,
    onJoin,
    onLeave,
    children,
    className,
}: SignupCardProps) {
    const t = useMessages();
    const now = useNow();
    const [busy, setBusy] = useState(false);
    const [failed, setFailed] = useState(false);

    const end = closesAt === undefined ? null : new Date(closesAt);
    const isClosed = closed || (end !== null && end.getTime() <= now);
    const full = capacityState(taken, limit) === "full";

    async function run(action: (() => void | Promise<unknown>) | undefined) {
        if (!action || busy) return;
        setFailed(false);
        setBusy(true);
        try {
            await action();
        } catch {
            setFailed(true);
        } finally {
            setBusy(false);
        }
    }

    let action: ReactNode;
    if (status !== "none")
        action = (
            <Button
                variant="ghost"
                size="sm"
                loading={busy}
                disabled={isClosed}
                onClick={() => run(onLeave)}
            >
                {status === "joined" ? t.signup.leave : t.signup.leaveWaitlist}
            </Button>
        );
    else if (isClosed)
        action = (
            <Button variant="outline" size="sm" disabled>
                {t.signup.closed}
            </Button>
        );
    else if (full && !allowWaitlist)
        action = (
            <Button variant="outline" size="sm" disabled>
                {t.signup.full}
            </Button>
        );
    else
        action = (
            <Button
                variant={full ? "outline" : "primary"}
                size="sm"
                loading={busy}
                onClick={() => run(onJoin)}
            >
                {full ? t.signup.joinWaitlist : t.signup.join}
            </Button>
        );

    return (
        <Card className={["zse-signup", className].filter(Boolean).join(" ")}>
            <CardHeader>
                <div className="zse-signup-title">
                    <CardTitle>{title}</CardTitle>
                    {status === "joined" && (
                        <Badge tone="success" icon={Tick02Icon} size="sm">
                            {t.signup.joined}
                        </Badge>
                    )}
                    {status === "waitlist" && (
                        <Badge tone="warning" size="sm">
                            {t.signup.waitlisted(waitlistPosition)}
                        </Badge>
                    )}
                </div>
                {meta != null && (
                    <CardDescription className="zse-signup-meta">
                        {meta}
                    </CardDescription>
                )}
            </CardHeader>
            {(description != null || children != null) && (
                <CardContent>
                    {description != null && (
                        <p className="zse-signup-description">{description}</p>
                    )}
                    {children}
                </CardContent>
            )}
            <Capacity
                taken={taken}
                waitlist={waitlist}
                {...(limit !== undefined && { limit })}
            />
            <CardFooter className="zse-signup-footer">
                {/* Błąd w miejscu terminu: stopka nie rośnie. */}
                {failed ? (
                    <span className="zse-signup-error" role="alert">
                        {t.signup.failed}
                    </span>
                ) : (
                    end &&
                    !isClosed && (
                        <span className="zse-signup-closes">
                            {t.signup.closes}{" "}
                            <Deadline date={end} variant="text" size="sm" />
                        </span>
                    )
                )}
                <span className="zse-signup-action">{action}</span>
            </CardFooter>
        </Card>
    );
}
