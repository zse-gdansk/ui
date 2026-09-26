"use client";

import { useRender } from "@base-ui/react/use-render";
import { useContext, useRef, type ReactElement, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { useMessages } from "../../i18n/context";
import { Breadcrumbs, type BreadcrumbsProps } from "../breadcrumbs/Breadcrumbs";
import { Icon, type IconGlyph } from "../icon/Icon";
import { formatShortcut, useShortcut, type Shortcut } from "../menu/shortcut";
import { Tooltip } from "../tooltip/Tooltip";
import { AppShellTrigger, HeaderSlotContext } from "./AppShell";

export interface AppHeaderProps {
    // Tekst, zanim strona poda breadcrumby (i w pierwszym renderze na serwerze),
    // np. nazwa sekcji.
    title?: ReactNode;
    // Akcje po prawej, np. HeaderAction, LocaleSwitcher. Zawsze w całości,
    // breadcrumby zwężają się przed nimi.
    actions?: ReactNode;
}

// Pasek nad treścią dla <AppShell header={…}>: przycisk panelu na telefonie,
// breadcrumby bieżącej strony i akcje.
export function AppHeader({ title, actions }: AppHeaderProps) {
    const { setSlot } = useContext(HeaderSlotContext);

    return (
        <div className="zse-header">
            <AppShellTrigger />
            <div className="zse-header-start">
                <div ref={setSlot} className="zse-header-slot" />
                {title != null && (
                    <span className="zse-header-title">{title}</span>
                )}
            </div>
            {actions != null && (
                <div className="zse-header-actions">{actions}</div>
            )}
        </div>
    );
}

// Breadcrumby bieżącej strony, deklarowane w samej stronie, bo dopiero ona zna
// nazwy (np. ucznia z bazy). Renderują się w pasku AppHeader. Jedne na stronę.
export function HeaderBreadcrumbs(props: BreadcrumbsProps) {
    const { slot } = useContext(HeaderSlotContext);
    return slot ? createPortal(<Breadcrumbs {...props} />, slot) : null;
}

export interface HeaderActionProps {
    icon: IconGlyph;
    // Treść tooltipa i nazwa dla czytników.
    label: string;
    onClick?: () => void;
    href?: string;
    // Link z routera, np. <Link href="/powiadomienia" />.
    render?: ReactElement<Record<string, unknown>>;
    // Np. "mod+k": działa globalnie i jest pokazany w tooltipie.
    shortcut?: Shortcut;
    // Kropka na ikonie, np. nowe powiadomienia.
    badge?: boolean;
    // Otwarty panel albo bieżąca strona.
    active?: boolean;
    disabled?: boolean;
}

// Przycisk z ikoną do paska, kwadrat 32×32 jak przyciski w panelu.
export function HeaderAction({
    icon,
    label,
    onClick,
    href,
    render,
    shortcut,
    badge = false,
    active = false,
    disabled = false,
}: HeaderActionProps) {
    const t = useMessages();
    const ref = useRef<HTMLElement>(null);
    const link = href !== undefined || render !== undefined;
    useShortcut(shortcut, ref, disabled);

    const element = useRender({
        render,
        defaultTagName: link ? "a" : "button",
        ref,
        props: {
            className: "zse-header-action",
            "aria-label": label,
            "data-active": active || undefined,
            "data-badge": badge || undefined,
            "aria-disabled": disabled || undefined,
            ...(!link && { type: "button" as const }),
            ...(href !== undefined && { href }),
            onClick: (event: { preventDefault: () => void }) => {
                if (disabled) {
                    event.preventDefault();
                    return;
                }
                onClick?.();
            },
            children: <Icon icon={icon} size={18} />,
        },
    });

    return (
        <Tooltip
            side="bottom"
            content={
                <>
                    {label}
                    {shortcut && (
                        <kbd className="zse-shell-kbd">
                            {formatShortcut(shortcut, undefined, t.kbd)}
                        </kbd>
                    )}
                </>
            }
        >
            {element as ReactElement<Record<string, unknown>>}
        </Tooltip>
    );
}
