"use client";

import { useMessages } from "../../i18n/context";
import { Meter } from "../progress/Progress";

export interface CapacityProps {
    // Zajęte miejsca.
    taken: number;
    // Bez limitu: sama liczba zapisanych, bez paska.
    limit?: number;
    // Osoby na liście rezerwowej.
    waitlist?: number;
    // Od ilu wolnych miejsc pasek jest pomarańczowy. Domyślnie 20% limitu,
    // co najmniej 1.
    fewAt?: number;
    size?: "sm" | "md";
    className?: string;
}

export type CapacityState = "open" | "few" | "full";

export function capacityState(
    taken: number,
    limit: number | undefined,
    fewAt?: number,
): CapacityState {
    if (limit === undefined) return "open";
    const free = limit - taken;
    if (free <= 0) return "full";
    const few = fewAt ?? Math.max(1, Math.ceil(limit * 0.2));
    return free <= few ? "few" : "open";
}

const TONES = { open: "accent", few: "warning", full: "danger" } as const;

// „12 z 20 miejsc · Zostały 3 miejsca” z paskiem zapełnienia.
export function Capacity({
    taken,
    limit,
    waitlist = 0,
    fewAt,
    size = "md",
    className,
}: CapacityProps) {
    const t = useMessages();
    const classes = ["zse-capacity", className].filter(Boolean).join(" ");
    const queue = waitlist > 0 && (
        <span className="zse-capacity-waitlist">
            {t.capacity.waitlist(waitlist)}
        </span>
    );

    if (limit === undefined)
        return (
            <div className={classes} data-size={size}>
                <span className="zse-capacity-count">
                    {t.capacity.signedUp(taken)}
                </span>
                {queue}
            </div>
        );

    const state = capacityState(taken, limit, fewAt);
    const free = Math.max(0, limit - taken);
    const of = t.capacity.of(taken, limit);

    return (
        <div className={classes} data-size={size} data-state={state}>
            <Meter
                value={Math.min(taken, limit)}
                max={limit}
                size="sm"
                tone={TONES[state]}
                valueText={of}
                label={
                    <span className="zse-capacity-header">
                        <span className="zse-capacity-count">{of}</span>
                        <span className="zse-capacity-free">
                            {state === "full"
                                ? t.capacity.full
                                : t.capacity.left(free)}
                        </span>
                    </span>
                }
            />
            {queue}
        </div>
    );
}
