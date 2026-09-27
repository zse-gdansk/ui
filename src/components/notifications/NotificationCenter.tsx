"use client";

import { Popover } from "@base-ui/react/popover";
import {
    Notification01Icon,
    Tick02Icon,
    TickDouble02Icon,
} from "@hugeicons/core-free-icons";
import { useState, type ReactNode } from "react";

import { useMessages } from "../../i18n/context";
import { markEnter } from "../../utils/enter";
import {
    formatDay,
    formatFull,
    formatRelative,
    useNow,
} from "../../utils/relative-time";
import { Avatar } from "../avatar/Avatar";
import { Icon, type IconGlyph } from "../icon/Icon";
import { ScrollArea } from "../scroll-area/ScrollArea";
import { SegmentedControl } from "../segmented/SegmentedControl";

export interface NotificationItem {
    id: string;
    title: string;
    body?: ReactNode;
    time: Date | string | number;
    read?: boolean;
    href?: string;
    icon?: IconGlyph;
    avatar?: { name: string; src?: string };
    // Kolor ikony: np. danger przy odwołanej lekcji.
    tone?: "neutral" | "accent" | "success" | "warning" | "danger";
}

export interface NotificationCenterProps {
    notifications: readonly NotificationItem[];
    // Przeczytanie: kliknięcie wpisu albo ptaszek przy nim.
    onRead?: (id: string) => void;
    onReadAll?: () => void;
    // Kliknięcie wpisu bez href, np. otwarcie szczegółów.
    onOpen?: (notification: NotificationItem) => void;
    // Link do pełnej listy pod spodem.
    allHref?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

type Filter = "all" | "unread";

// Dzwonek w pasku z liczbą nieprzeczytanych i okno z listą: grupy dni jak w
// Timeline, nieprzeczytane z kropką, filtr, „Oznacz wszystkie”. Stan
// przeczytania trzyma aplikacja (onRead, onReadAll).
export function NotificationCenter({
    notifications,
    onRead,
    onReadAll,
    onOpen,
    allHref,
    open,
    onOpenChange,
}: NotificationCenterProps) {
    const t = useMessages();
    const now = useNow();
    const [filter, setFilter] = useState<Filter>("all");
    const unread = notifications.filter((item) => !item.read).length;
    const shown = notifications
        .map((item) => ({ item, date: new Date(item.time) }))
        .filter(({ item }) => filter === "all" || !item.read)
        .toSorted((a, b) => b.date.getTime() - a.date.getTime());

    // Grupy dni od najnowszego: „Dziś”, „Wczoraj”, „12 września”.
    const groups: { label: string; items: typeof shown }[] = [];
    for (const entry of shown) {
        const label = formatDay(t, entry.date, now);
        const last = groups.at(-1);
        if (last?.label === label) last.items.push(entry);
        else groups.push({ label, items: [entry] });
    }

    return (
        <Popover.Root
            {...(open !== undefined && { open })}
            {...(onOpenChange && {
                onOpenChange: (next: boolean) => onOpenChange(next),
            })}
        >
            <Popover.Trigger
                className="zse-header-action zse-notifications-trigger"
                aria-label={t.notifications.trigger(unread)}
            >
                <Icon icon={Notification01Icon} size={18} />
                {unread > 0 && (
                    <span className="zse-notifications-count" aria-hidden>
                        {unread > 9 ? "9+" : unread}
                    </span>
                )}
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Positioner
                    className="zse-notifications-positioner"
                    side="bottom"
                    align="end"
                    sideOffset={8}
                    collisionPadding={8}
                >
                    <Popover.Popup className="zse-notifications">
                        <header className="zse-notifications-header">
                            <Popover.Title className="zse-notifications-title">
                                {t.notifications.label}
                            </Popover.Title>
                            {onReadAll && (
                                <button
                                    type="button"
                                    className="zse-notifications-read-all"
                                    onClick={onReadAll}
                                    disabled={unread === 0}
                                    aria-label={t.notifications.markAll}
                                >
                                    <Icon icon={TickDouble02Icon} size={16} />
                                    {t.notifications.markAllShort}
                                </button>
                            )}
                        </header>
                        <div className="zse-notifications-filter">
                            <SegmentedControl
                                aria-label={t.notifications.label}
                                size="sm"
                                fullWidth
                                value={filter}
                                onValueChange={(next) =>
                                    setFilter(next as Filter)
                                }
                                options={[
                                    {
                                        value: "all",
                                        label: t.notifications.all,
                                    },
                                    {
                                        value: "unread",
                                        label:
                                            unread > 0
                                                ? `${t.notifications.unread} (${unread})`
                                                : t.notifications.unread,
                                    },
                                ]}
                            />
                        </div>
                        <ScrollArea
                            className="zse-notifications-scroll"
                            maxHeight="min(28rem, calc(var(--available-height, 70dvh) - 140px))"
                            arrows={false}
                        >
                            {groups.length === 0 ? (
                                <p className="zse-notifications-empty">
                                    {filter === "unread"
                                        ? t.notifications.emptyUnread
                                        : t.notifications.empty}
                                </p>
                            ) : (
                                groups.map((group) => (
                                    <section
                                        key={group.label}
                                        className="zse-notifications-group"
                                        aria-label={group.label}
                                    >
                                        <h3 className="zse-notifications-day">
                                            {group.label}
                                        </h3>
                                        <ul className="zse-notifications-list">
                                            {group.items.map(
                                                ({ item, date }) => (
                                                    <Entry
                                                        key={item.id}
                                                        item={item}
                                                        time={formatRelative(
                                                            t,
                                                            date,
                                                            now,
                                                        )}
                                                        full={formatFull(
                                                            t.locale,
                                                            date,
                                                        )}
                                                        date={date}
                                                        {...(onRead && {
                                                            onRead,
                                                        })}
                                                        {...(onOpen && {
                                                            onOpen,
                                                        })}
                                                    />
                                                ),
                                            )}
                                        </ul>
                                    </section>
                                ))
                            )}
                        </ScrollArea>
                        {allHref && (
                            <footer className="zse-notifications-footer">
                                <a href={allHref}>{t.notifications.showAll}</a>
                            </footer>
                        )}
                    </Popover.Popup>
                </Popover.Positioner>
            </Popover.Portal>
        </Popover.Root>
    );
}

function Entry({
    item,
    time,
    full,
    date,
    onRead,
    onOpen,
}: {
    item: NotificationItem;
    time: string;
    full: string;
    date: Date;
    onRead?: (id: string) => void;
    onOpen?: (notification: NotificationItem) => void;
}) {
    const t = useMessages();
    const activate = () => {
        if (!item.read) onRead?.(item.id);
        onOpen?.(item);
    };
    const content = (
        <>
            <span className="zse-notification-dot" aria-hidden />
            {item.avatar ? (
                <span className="zse-notification-icon" data-avatar>
                    <Avatar
                        name={item.avatar.name}
                        size="lg"
                        {...(item.avatar.src !== undefined && {
                            src: item.avatar.src,
                        })}
                    />
                </span>
            ) : item.icon ? (
                <span className="zse-notification-icon" data-tone={item.tone}>
                    <Icon icon={item.icon} size={16} />
                </span>
            ) : null}
            <span className="zse-notification-text">
                <span className="zse-notification-title">{item.title}</span>
                {item.body != null && (
                    <span className="zse-notification-body">{item.body}</span>
                )}
                <time
                    className="zse-notification-time"
                    dateTime={date.toISOString()}
                    title={full}
                    suppressHydrationWarning
                >
                    {time}
                </time>
            </span>
        </>
    );

    return (
        <li
            ref={markEnter}
            className="zse-notification"
            data-unread={!item.read || undefined}
        >
            {item.href ? (
                <a
                    className="zse-notification-main"
                    href={item.href}
                    onClick={activate}
                >
                    {content}
                </a>
            ) : (
                <button
                    type="button"
                    className="zse-notification-main"
                    onClick={activate}
                >
                    {content}
                </button>
            )}
            {!item.read && onRead && (
                <button
                    type="button"
                    className="zse-notification-mark"
                    aria-label={`${t.notifications.markRead}: ${item.title}`}
                    onClick={() => onRead(item.id)}
                >
                    <Icon icon={Tick02Icon} size={14} />
                </button>
            )}
        </li>
    );
}
