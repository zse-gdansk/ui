"use client";

import { useRender } from "@base-ui/react/use-render";
import { MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import {
    createContext,
    useContext,
    useEffect,
    useId,
    useRef,
    useState,
    useSyncExternalStore,
    type ReactElement,
    type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { useMessages } from "../../i18n/context";
import { Breadcrumbs, type BreadcrumbsProps } from "../breadcrumbs/Breadcrumbs";
import { Icon, type IconGlyph } from "../icon/Icon";
import { Menu, MenuItem } from "../menu/Menu";
import { formatShortcut, useShortcut, type Shortcut } from "../menu/shortcut";
import { Tooltip } from "../tooltip/Tooltip";
import { AppShellTrigger, HeaderSlotContext } from "./AppShell";

interface OverflowEntry {
    icon: IconGlyph;
    label: string;
    onClick?: (() => void) | undefined;
    href?: string | undefined;
    render?: ReactElement<Record<string, unknown>> | undefined;
    badge: boolean;
    disabled: boolean;
}

function createOverflowStore() {
    const entries = new Map<string, OverflowEntry>();
    let snapshot: readonly OverflowEntry[] = [];
    const listeners = new Set<() => void>();
    const emit = () => {
        snapshot = [...entries.values()];
        for (const listener of listeners) listener();
    };
    return {
        set(id: string, entry: OverflowEntry) {
            entries.set(id, entry);
            emit();
        },
        remove(id: string) {
            entries.delete(id);
            emit();
        },
        subscribe(listener: () => void) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        get: () => snapshot,
    };
}

type OverflowStore = ReturnType<typeof createOverflowStore>;

const OverflowContext = createContext<OverflowStore | null>(null);
const EMPTY: readonly OverflowEntry[] = [];

// Menu „⋯” z akcjami drugorzędnymi; widoczne tylko na wąskim ekranie (CSS),
// gdzie te akcje znikają z paska.
function OverflowMenu({ store }: { store: OverflowStore }) {
    const t = useMessages();
    const entries = useSyncExternalStore(
        store.subscribe,
        store.get,
        () => EMPTY,
    );
    if (entries.length === 0) return null;

    return (
        <span className="zse-header-more">
            <Menu
                align="end"
                trigger={
                    <button
                        type="button"
                        className="zse-header-action"
                        aria-label={t.appShell.moreActions}
                        data-badge={
                            entries.some((entry) => entry.badge) || undefined
                        }
                    >
                        <Icon icon={MoreHorizontalIcon} size={18} />
                    </button>
                }
            >
                {entries.map((entry) => (
                    <MenuItem
                        key={entry.label}
                        icon={entry.icon}
                        disabled={entry.disabled}
                        {...(entry.onClick && { onClick: entry.onClick })}
                        {...(entry.href !== undefined && { href: entry.href })}
                        {...(entry.render && { render: entry.render })}
                    >
                        {entry.label}
                    </MenuItem>
                ))}
            </Menu>
        </span>
    );
}

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
    const [store] = useState(createOverflowStore);

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
                <div className="zse-header-actions">
                    <OverflowContext value={store}>{actions}</OverflowContext>
                    <OverflowMenu store={store} />
                </div>
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
    // secondary: na telefonie znika z paska i trafia do menu „⋯”, np. motyw.
    // Domyślnie primary, zostaje zawsze (szukaj, powiadomienia).
    priority?: "primary" | "secondary";
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
    priority = "primary",
    disabled = false,
}: HeaderActionProps) {
    const t = useMessages();
    const ref = useRef<HTMLElement>(null);
    const link = href !== undefined || render !== undefined;
    useShortcut(shortcut, ref, disabled);

    const overflow = useContext(OverflowContext);
    const id = useId();
    const secondary = priority === "secondary" && overflow !== null;
    useEffect(() => {
        if (!secondary || !overflow) return;
        overflow.set(id, {
            icon,
            label,
            onClick,
            href,
            render,
            badge,
            disabled,
        });
    });
    useEffect(() => {
        if (!secondary || !overflow) return;
        return () => overflow.remove(id);
    }, [secondary, overflow, id]);

    const element = useRender({
        render,
        defaultTagName: link ? "a" : "button",
        ref,
        props: {
            className: "zse-header-action",
            "aria-label": label,
            "data-active": active || undefined,
            "data-badge": badge || undefined,
            "data-priority": secondary ? "secondary" : undefined,
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
