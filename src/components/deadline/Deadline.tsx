"use client";

import {
    AlertCircleIcon,
    Clock01Icon,
    Tick02Icon,
} from "@hugeicons/core-free-icons";

import { useMessages } from "../../i18n/context";
import {
    formatFull,
    formatRelative,
    formatUntil,
    useNow,
} from "../../utils/relative-time";
import { Badge } from "../badge/Badge";
import { Icon } from "../icon/Icon";

const HOUR = 3_600_000;

type Tone = "neutral" | "warning" | "danger" | "success";

const ICONS = {
    neutral: Clock01Icon,
    warning: Clock01Icon,
    danger: AlertCircleIcon,
    success: Tick02Icon,
} as const;

export interface DeadlineProps {
    date: Date | string | number;
    // Od ilu milisekund przed terminem jest pomarańczowy. Domyślnie 24 h.
    warnBefore?: number;
    // Zadanie oddane, ankieta wypełniona: zielone zamiast czasu.
    done?: boolean;
    // Napis przy `done`, np. „Oddano”, „Wypełniono”.
    doneLabel?: string;
    // badge: pigułka, np. na karcie zadania; text: sam tekst z ikoną,
    // np. w wierszu listy.
    variant?: "badge" | "text";
    size?: "sm" | "md";
    className?: string;
}

// Termin, który sam się odświeża: „za 20 min”, „jutro o 15:00”,
// „Po terminie: wczoraj o 14:32”. Kolor zmienia się z czasem, ale
// zawsze razem z tekstem i ikoną.
export function Deadline({
    date,
    warnBefore = 24 * HOUR,
    done = false,
    doneLabel,
    variant = "badge",
    size = "md",
    className,
}: DeadlineProps) {
    const t = useMessages();
    const now = useNow();
    const end = new Date(date);
    const left = end.getTime() - now;

    const tone: Tone = done
        ? "success"
        : left <= 0
          ? "danger"
          : left <= warnBefore
            ? "warning"
            : "neutral";

    const text = done
        ? (doneLabel ?? t.deadline.done)
        : left <= 0
          ? t.deadline.overdue(formatRelative(t, end, now))
          : formatUntil(t, end, now);

    const full = formatFull(t.locale, end);
    const time = (
        <time
            dateTime={end.toISOString()}
            title={t.deadline.due(full)}
            // Serwer i przeglądarka liczą czas w innej chwili.
            suppressHydrationWarning
        />
    );
    const content = (
        <>
            {tone === "neutral" || tone === "warning" ? (
                <span className="zse-deadline-sr">{t.deadline.dueLabel}</span>
            ) : null}
            <span className="zse-deadline-text" suppressHydrationWarning>
                {text}
            </span>
        </>
    );

    if (variant === "badge")
        return (
            <Badge
                tone={tone}
                size={size}
                icon={ICONS[tone]}
                render={time}
                className={["zse-deadline", className]
                    .filter(Boolean)
                    .join(" ")}
            >
                {content}
            </Badge>
        );

    return (
        <time
            dateTime={end.toISOString()}
            title={t.deadline.due(full)}
            suppressHydrationWarning
            className={["zse-deadline", className].filter(Boolean).join(" ")}
            data-variant="text"
            data-tone={tone}
            data-size={size}
        >
            <Icon icon={ICONS[tone]} className="zse-deadline-icon" />
            {content}
        </time>
    );
}
