"use client";

import {
    Alert02Icon,
    AlertCircleIcon,
    Cancel01Icon,
    CheckmarkCircle02Icon,
    InformationCircleIcon,
    Megaphone01Icon,
} from "@hugeicons/core-free-icons";
import { useState, type ReactNode } from "react";

import { useMessages } from "../../i18n/context";
import { markEnter } from "../../utils/enter";
import { formatFull, formatUntil, useNow } from "../../utils/relative-time";
import { Icon, type IconGlyph } from "../icon/Icon";

type Tone = "info" | "success" | "warning" | "danger" | "neutral";

const ICONS: Record<Tone, IconGlyph> = {
    info: InformationCircleIcon,
    success: CheckmarkCircle02Icon,
    warning: Alert02Icon,
    danger: AlertCircleIcon,
    neutral: Megaphone01Icon,
};

export interface BannerProps {
    // Treść ogłoszenia, np. „Głosowanie do samorządu trwa”.
    children: ReactNode;
    tone?: Tone;
    // Własna ikona albo false bez ikony.
    icon?: IconGlyph | false;
    // Akcja obok tekstu, np. <Link href="/glosowanie">Zagłosuj</Link>.
    action?: ReactNode;
    // Termin: dopisek „Koniec za 5 godz.”, odświeżany; po terminie baner
    // sam znika.
    endsAt?: Date | string | number;
    // Bez przycisku zamknięcia, np. przy przerwie technicznej.
    dismissible?: boolean;
    // Klucz zapamiętania zamknięcia w cookie, np. "glosowanie-2026". Serwer
    // czyta je i podaje defaultDismissed, więc zamknięty baner nie mignie.
    persist?: string;
    defaultDismissed?: boolean;
    onDismiss?: () => void;
}

const cookieName = (key: string) => `zse-banner-${encodeURIComponent(key)}`;

// Ogłoszenie na całą szerokość, np. nad aplikacją (<AppShell banner>).
// Zamknięcie zwija baner płynnie, treść pod nim nie skacze.
export function Banner({
    children,
    tone = "info",
    icon,
    action,
    endsAt,
    dismissible = true,
    persist,
    defaultDismissed = false,
    onDismiss,
}: BannerProps) {
    const t = useMessages();
    const now = useNow();
    const [dismissed, setDismissed] = useState(defaultDismissed);
    const end = endsAt === undefined ? null : new Date(endsAt);
    const expired = end !== null && end.getTime() <= now;
    const hidden = dismissed || expired;
    const glyph = icon === false ? null : (icon ?? ICONS[tone]);

    function dismiss() {
        setDismissed(true);
        if (persist)
            document.cookie = `${cookieName(persist)}=1; path=/; max-age=31536000; samesite=lax`;
        onDismiss?.();
    }

    return (
        <div
            ref={markEnter}
            className="zse-banner-frame"
            data-hidden={hidden || undefined}
            inert={hidden}
            aria-hidden={hidden || undefined}
        >
            <section
                className="zse-banner"
                data-tone={tone}
                aria-label={t.banner.label}
            >
                <div className="zse-banner-inner">
                    {glyph && (
                        <span className="zse-banner-icon">
                            <Icon icon={glyph} size={16} />
                        </span>
                    )}
                    <div className="zse-banner-text">
                        <span>{children}</span>
                        {end && !expired && (
                            <time
                                className="zse-banner-deadline"
                                dateTime={end.toISOString()}
                                title={formatFull(t.locale, end)}
                                suppressHydrationWarning
                            >
                                {t.banner.ends(formatUntil(t, end, now))}
                            </time>
                        )}
                    </div>
                    {action != null && (
                        <div className="zse-banner-action">{action}</div>
                    )}
                    {dismissible && (
                        <button
                            type="button"
                            className="zse-banner-close"
                            aria-label={t.banner.dismiss}
                            onClick={dismiss}
                        >
                            <Icon icon={Cancel01Icon} size={14} />
                        </button>
                    )}
                </div>
            </section>
        </div>
    );
}
