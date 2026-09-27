"use client";

import { useId, type ReactElement, type ReactNode } from "react";

import { useMessages } from "../../i18n/context";
import { useEventListener } from "../../utils/effects";
import {
    daysAgo,
    formatClock,
    formatFull,
    formatUntil,
    useNow,
} from "../../utils/relative-time";
import { Button } from "../button/Button";
import { CopyButton } from "../copy-button/CopyButton";

type Kind = "not-found" | "forbidden" | "error" | "maintenance" | "offline";

const CODES: Partial<Record<Kind, string>> = {
    "not-found": "404",
    forbidden: "403",
    error: "500",
    maintenance: "503",
};

export interface ErrorPageProps {
    kind: Kind;
    // Własny tytuł i opis zamiast tekstów z katalogu.
    title?: ReactNode;
    description?: ReactNode;
    // Kod HTTP nad tytułem; false bez kodu.
    code?: string | false;
    // Identyfikator do zgłoszenia, np. error.digest z Next.js, z kopiowaniem.
    errorId?: string;
    // Przy 403: kto jest zalogowany, np. „Jan Kowalski (uczeń)”.
    account?: string;
    onSwitchAccount?: () => void;
    // Przy błędzie i braku internetu; bez niego odświeżenie strony.
    onRetry?: () => void;
    // Koniec przerwy technicznej, odliczany na bieżąco.
    endsAt?: Date | string | number;
    homeHref?: string;
    // Link routera do strony głównej, np. <Link href="/" />.
    homeLink?: ReactElement<Record<string, unknown>>;
    // Własne przyciski zamiast domyślnych.
    actions?: ReactNode;
    // Cały ekran z logo, np. przerwa techniczna poza szkieletem aplikacji.
    fullscreen?: boolean;
    logo?: ReactNode;
    className?: string;
}

const reload = () => location.reload();

// Strona błędu albo przerwy: 404, brak uprawnień, błąd serwera, przerwa
// techniczna z godziną powrotu, brak internetu (sama wraca po połączeniu).
// W szkielecie aplikacji jako treść strony, poza nim na cały ekran.
export function ErrorPage({
    kind,
    title,
    description,
    code,
    errorId,
    account,
    onSwitchAccount,
    onRetry,
    endsAt,
    homeHref = "/",
    homeLink,
    actions,
    fullscreen = false,
    logo,
    className,
}: ErrorPageProps) {
    const t = useMessages();
    const titleId = useId();
    const now = useNow();
    const texts = {
        "not-found": t.errorPage.notFound,
        forbidden: t.errorPage.forbidden,
        error: t.errorPage.error,
        maintenance: t.errorPage.maintenance,
        offline: t.errorPage.offline,
    }[kind];
    const shownCode = code === false ? null : (code ?? CODES[kind] ?? null);
    const retry = onRetry ?? reload;

    // Bez internetu strona wraca sama, gdy połączenie się pojawi.
    useEventListener("window", "online", retry, {
        enabled: kind === "offline",
    });

    const end = endsAt === undefined ? null : new Date(endsAt);
    const overdue = end !== null && end.getTime() <= now;
    const returns =
        end && !overdue
            ? daysAgo(end, now) === 0
                ? t.errorPage.returnsToday(
                      formatClock(t.locale, end),
                      formatUntil(t, end, now),
                  )
                : t.errorPage.returns(formatUntil(t, end, now))
            : null;

    const home = (variant: "primary" | "outline") => (
        <Button
            variant={variant}
            nativeButton={false}
            // Treść linku daje Button (render), lint jej tu nie widzi.
            // oxlint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/control-has-associated-label
            render={homeLink ?? <a href={homeHref} />}
        >
            {t.errorPage.home}
        </Button>
    );

    const defaults: Record<Kind, ReactNode> = {
        "not-found": (
            <>
                <Button variant="outline" onClick={() => history.back()}>
                    {t.errorPage.back}
                </Button>
                {home("primary")}
            </>
        ),
        forbidden: (
            <>
                {home("primary")}
                {onSwitchAccount && (
                    <Button variant="outline" onClick={onSwitchAccount}>
                        {t.errorPage.switchAccount}
                    </Button>
                )}
            </>
        ),
        error: (
            <>
                <Button onClick={retry}>{t.errorPage.retry}</Button>
                {home("outline")}
            </>
        ),
        maintenance: (
            <Button variant={overdue ? "primary" : "outline"} onClick={reload}>
                {t.errorPage.reload}
            </Button>
        ),
        offline: <Button onClick={retry}>{t.errorPage.retry}</Button>,
    };

    return (
        <div
            className={["zse-error-page", className].filter(Boolean).join(" ")}
            data-kind={kind}
            data-fullscreen={fullscreen || undefined}
        >
            {fullscreen && logo != null && (
                <div className="zse-error-logo">{logo}</div>
            )}
            <section className="zse-error-body" aria-labelledby={titleId}>
                {shownCode && (
                    <span className="zse-error-code" aria-hidden>
                        {shownCode}
                    </span>
                )}
                <h1 id={titleId} className="zse-error-title">
                    {title ?? texts.title}
                </h1>
                <p className="zse-error-description">
                    {description ?? texts.description}
                    {kind === "forbidden" && account && (
                        <>
                            <br />
                            {t.errorPage.signedInAs(account)}.
                        </>
                    )}
                </p>
                {kind === "maintenance" && (returns || overdue) && (
                    <output className="zse-error-when">
                        {overdue ? (
                            t.errorPage.overdue
                        ) : (
                            <time
                                dateTime={end?.toISOString()}
                                title={
                                    end ? formatFull(t.locale, end) : undefined
                                }
                                suppressHydrationWarning
                            >
                                {returns}
                            </time>
                        )}
                    </output>
                )}
                <div className="zse-error-actions">
                    {actions ?? defaults[kind]}
                </div>
                {errorId && (
                    <p className="zse-error-id">
                        <span>
                            {t.errorPage.code}: <code>{errorId}</code>
                        </span>
                        <CopyButton value={errorId} size="sm" />
                    </p>
                )}
            </section>
        </div>
    );
}
