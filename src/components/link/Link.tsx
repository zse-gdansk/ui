"use client";

import { useRender } from "@base-ui/react/use-render";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { useState, type MouseEvent } from "react";

import { useMessages } from "../../i18n/context";
import { Button } from "../button/Button";
import { Checkbox } from "../checkbox/Checkbox";
import { Icon } from "../icon/Icon";
import { Modal, ModalClose } from "../modal/Modal";

export interface LinkProps extends useRender.ComponentProps<"a"> {
    // default: kolor tekstu z podkreśleniem, accent: w kolorze akcentu,
    // plain: bez podkreślenia, np. w nawigacji i stopkach.
    variant?: "default" | "accent" | "plain";
    // Nowa karta ze strzałką. Domyślnie dla adresów http(s).
    external?: boolean;
    // Pytanie przed wyjściem na zewnętrzną stronę. trusted: domeny bez
    // pytania (z subdomenami), np. strona szkoły.
    confirm?: boolean | { trusted?: readonly string[] };
}

const STORAGE_KEY = "zse-trusted-domains";

function domainOf(href: string) {
    try {
        return new URL(href).hostname.replace(/^www\./, "");
    } catch {
        return href;
    }
}

const matches = (host: string, domain: string) =>
    host === domain || host.endsWith(`.${domain}`);

// Domeny, przy których ktoś zaznaczył „nie pytaj ponownie”. Tylko w tej
// przeglądarce; gdy localStorage nie działa (tryb prywatny), pyta zawsze.
function remembered(): string[] {
    try {
        const saved: unknown = JSON.parse(
            localStorage.getItem(STORAGE_KEY) ?? "[]",
        );
        return Array.isArray(saved)
            ? saved.filter((item) => typeof item === "string")
            : [];
    } catch {
        return [];
    }
}

function remember(domain: string) {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify([...new Set([...remembered(), domain])]),
        );
    } catch {}
}

// Każdy adres http(s) traktuje jako zewnętrzny. Bez sprawdzania domeny
// strony, bo na serwerze jej nie ma i wynik różniłby się przy hydracji.
// Link do własnej domeny pełnym adresem: external={false}.
const isExternal = (href: string | undefined) =>
    href !== undefined && /^https?:\/\//i.test(href);

// Link z Next.js: <Link render={<NextLink href="/oceny" />}>Oceny</Link>.
// Base UI łączy propsy, więc prefetch i nawigacja zostają po stronie Next.
export function Link({
    variant = "default",
    external,
    confirm = false,
    render,
    className,
    children,
    onClick,
    ...props
}: LinkProps) {
    const t = useMessages();
    const opensNew = external ?? isExternal(props.href);
    const [asking, setAsking] = useState(false);
    const [dontAsk, setDontAsk] = useState(false);
    const href = props.href;
    const domain = href ? domainOf(href) : "";
    const trusted = typeof confirm === "object" ? (confirm.trusted ?? []) : [];

    function click(event: MouseEvent<HTMLAnchorElement>) {
        onClick?.(event);
        if (event.defaultPrevented || !confirm || !opensNew || !href) return;
        // ⌘/Ctrl/Shift/środkowy przycisk: ktoś wie, co robi, przeglądarka
        // otwiera link po swojemu.
        if (
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            event.button !== 0
        )
            return;
        if ([...trusted, ...remembered()].some((d) => matches(domain, d)))
            return;
        event.preventDefault();
        setDontAsk(false);
        setAsking(true);
    }

    const link = useRender({
        render,
        defaultTagName: "a",
        props: {
            ...(opensNew && { target: "_blank", rel: "noopener noreferrer" }),
            ...props,
            onClick: click,
            "data-variant": variant,
            className: ["zse-link", className].filter(Boolean).join(" "),
            children: (
                <>
                    {children}
                    {opensNew && (
                        <>
                            {"⁠"}
                            <Icon
                                icon={ArrowUpRight01Icon}
                                className="zse-link-external"
                                aria-hidden
                            />
                            <span className="zse-link-hint">
                                {t.link.newTab}
                            </span>
                        </>
                    )}
                </>
            ),
        },
    });

    if (!confirm || !opensNew || !href) return link;

    return (
        <>
            {link}
            <Modal
                open={asking}
                onOpenChange={setAsking}
                title={t.link.leavingTitle}
                description={
                    <>
                        {t.link.leavingBefore} <strong>{domain}</strong>,{" "}
                        {t.link.leavingAfter}
                    </>
                }
                footer={
                    <>
                        <ModalClose
                            render={<Button variant="ghost" size="sm" />}
                        >
                            {t.common.cancel}
                        </ModalClose>
                        <Button
                            size="sm"
                            icon={ArrowUpRight01Icon}
                            iconPosition="right"
                            nativeButton={false}
                            render={({ children: label, ...buttonProps }) => (
                                <a
                                    {...buttonProps}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {label}
                                </a>
                            )}
                            onClick={() => {
                                if (dontAsk) remember(domain);
                                setAsking(false);
                            }}
                        >
                            {t.link.go}
                        </Button>
                    </>
                }
            >
                <p className="zse-link-url">{href}</p>
                <Checkbox
                    label={t.link.dontAsk(domain)}
                    checked={dontAsk}
                    onCheckedChange={(next) => setDontAsk(next)}
                />
            </Modal>
        </>
    );
}
