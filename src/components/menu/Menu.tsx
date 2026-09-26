"use client";

import { Menu as BaseMenu } from "@base-ui/react/menu";
import { ArrowRight01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import {
    useRef,
    type ReactElement,
    type ReactNode,
    type RefObject,
} from "react";

import { useMessages } from "../../i18n/context";
import { Icon, type IconGlyph } from "../icon/Icon";
import {
    ariaShortcut,
    formatShortcut,
    useShortcut,
    type Shortcut,
} from "./shortcut";

type Side = "top" | "bottom" | "left" | "right";
type Align = "start" | "center" | "end";

export interface MenuProps {
    // Element otwierający menu, np. <Button />.
    trigger: ReactElement<Record<string, unknown>>;
    children: ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    side?: Side;
    align?: Align;
}

function Popup({
    children,
    side,
    align,
    sideOffset,
    alignOffset,
}: {
    children: ReactNode;
    side: Side | "inline-end";
    align: Align;
    sideOffset: number;
    alignOffset: number;
}) {
    return (
        <BaseMenu.Portal>
            <BaseMenu.Positioner
                className="zse-menu-positioner"
                side={side}
                align={align}
                sideOffset={sideOffset}
                alignOffset={alignOffset}
            >
                <BaseMenu.Popup className="zse-menu">{children}</BaseMenu.Popup>
            </BaseMenu.Positioner>
        </BaseMenu.Portal>
    );
}

export function Menu({
    trigger,
    children,
    open,
    onOpenChange,
    side = "bottom",
    align = "start",
}: MenuProps) {
    return (
        <BaseMenu.Root
            {...(open !== undefined && { open })}
            {...(onOpenChange && {
                onOpenChange: (next: boolean) => onOpenChange(next),
            })}
        >
            <BaseMenu.Trigger render={trigger} />
            <Popup side={side} align={align} sideOffset={6} alignOffset={0}>
                {children}
            </Popup>
        </BaseMenu.Root>
    );
}

// Kolumna ikon pojawia się w całym menu, gdy choć jedna pozycja ma ikonę,
// dlatego slot jest zawsze, a pusty ma zerową szerokość.
function ItemContent({
    icon,
    shortcut,
    children,
}: {
    icon?: ReactNode;
    shortcut?: Shortcut | undefined;
    children: ReactNode;
}) {
    const t = useMessages();
    return (
        <>
            <span className="zse-menu-icon">{icon}</span>
            <span className="zse-menu-text">{children}</span>
            {shortcut && (
                <kbd className="zse-menu-shortcut" aria-hidden>
                    {formatShortcut(shortcut, undefined, t.kbd)}
                </kbd>
            )}
        </>
    );
}

export interface MenuItemProps {
    children: ReactNode;
    icon?: IconGlyph;
    // Np. "mod+d": ⌘D na Apple, Ctrl+D gdzie indziej. Działa, gdy menu
    // jest otwarte, i wtedy przejmuje skrót przeglądarki.
    shortcut?: Shortcut;
    onClick?: () => void;
    disabled?: boolean;
    // danger: stale czerwone, dla akcji nieodwracalnych (Usuń).
    // danger-hover: czerwone dopiero przy najechaniu, dla akcji, które nic
    // nie niszczą, ale kończą coś ważnego (Wyloguj).
    variant?: "default" | "danger" | "danger-hover";
    // Link zamiast akcji, zamyka menu po kliknięciu.
    href?: string;
    // Link z routera zamiast <a>, np. <NextLink href="/oceny" />, żeby
    // przejście nie przeładowało strony.
    render?: ReactElement<Record<string, unknown>>;
}

export function MenuItem({
    children,
    icon,
    shortcut,
    onClick,
    disabled = false,
    variant = "default",
    href,
    render,
}: MenuItemProps) {
    const ref = useRef<HTMLElement>(null);
    useShortcut(shortcut, ref, disabled);
    const aria = shortcut
        ? { "aria-keyshortcuts": ariaShortcut(shortcut) }
        : {};

    const content = (
        <ItemContent icon={icon && <Icon icon={icon} />} shortcut={shortcut}>
            {children}
        </ItemContent>
    );

    if (href !== undefined) {
        return (
            <BaseMenu.LinkItem
                ref={ref as RefObject<HTMLAnchorElement | null>}
                {...aria}
                {...(render && { render })}
                href={href}
                closeOnClick
                className="zse-menu-item"
                data-variant={variant}
            >
                {content}
            </BaseMenu.LinkItem>
        );
    }

    return (
        <BaseMenu.Item
            ref={ref as RefObject<HTMLDivElement | null>}
            {...aria}
            className="zse-menu-item"
            data-variant={variant}
            disabled={disabled}
            {...(onClick && { onClick: () => onClick() })}
        >
            {content}
        </BaseMenu.Item>
    );
}

export interface MenuCheckboxItemProps {
    children: ReactNode;
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    shortcut?: Shortcut;
    // Tekst po prawej zamiast skrótu, np. liczba wierszy przy filtrze.
    suffix?: ReactNode;
    disabled?: boolean;
    // Domyślnie menu zostaje otwarte, żeby zaznaczyć kilka pozycji.
    closeOnClick?: boolean;
}

export function MenuCheckboxItem({
    children,
    checked,
    defaultChecked,
    onCheckedChange,
    shortcut,
    suffix,
    disabled = false,
    closeOnClick = false,
}: MenuCheckboxItemProps) {
    const ref = useRef<HTMLDivElement>(null);
    useShortcut(shortcut, ref, disabled);

    return (
        <BaseMenu.CheckboxItem
            ref={ref}
            {...(shortcut && { "aria-keyshortcuts": ariaShortcut(shortcut) })}
            className="zse-menu-item"
            disabled={disabled}
            closeOnClick={closeOnClick}
            {...(checked !== undefined && { checked })}
            {...(defaultChecked !== undefined && { defaultChecked })}
            {...(onCheckedChange && {
                onCheckedChange: (next: boolean) => onCheckedChange(next),
            })}
        >
            <ItemContent
                icon={<Icon icon={Tick02Icon} className="zse-menu-indicator" />}
                shortcut={shortcut}
            >
                {children}
            </ItemContent>
            {suffix != null && (
                <span className="zse-menu-shortcut">{suffix}</span>
            )}
        </BaseMenu.CheckboxItem>
    );
}

export interface MenuRadioGroupProps {
    children: ReactNode;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
}

export function MenuRadioGroup({
    children,
    value,
    defaultValue,
    onValueChange,
}: MenuRadioGroupProps) {
    return (
        <BaseMenu.RadioGroup
            className="zse-menu-group"
            {...(value !== undefined && { value })}
            {...(defaultValue !== undefined && { defaultValue })}
            {...(onValueChange && {
                onValueChange: (next: unknown) => onValueChange(String(next)),
            })}
        >
            {children}
        </BaseMenu.RadioGroup>
    );
}

export interface MenuRadioItemProps {
    value: string;
    children: ReactNode;
    disabled?: boolean;
    // Zamyka menu po wyborze, gdy wybór jest jedynym celem menu.
    closeOnClick?: boolean;
    // Np. flaga; zaznaczenie przechodzi wtedy na znacznik po prawej.
    icon?: ReactNode;
}

export function MenuRadioItem({
    value,
    children,
    disabled = false,
    closeOnClick = false,
    icon,
}: MenuRadioItemProps) {
    return (
        <BaseMenu.RadioItem
            className="zse-menu-item"
            value={value}
            disabled={disabled}
            closeOnClick={closeOnClick}
        >
            <ItemContent
                icon={
                    icon ?? <span className="zse-menu-indicator zse-menu-dot" />
                }
            >
                {children}
            </ItemContent>
            {icon && (
                <Icon
                    icon={Tick02Icon}
                    className="zse-menu-indicator zse-menu-trailing"
                />
            )}
        </BaseMenu.RadioItem>
    );
}

export interface MenuSubProps {
    label: ReactNode;
    icon?: IconGlyph;
    children: ReactNode;
    disabled?: boolean;
    // Bieżąca wartość przed strzałką, np. „Polski” przy „Język”.
    suffix?: ReactNode;
}

export function MenuSub({
    label,
    icon,
    children,
    disabled = false,
    suffix,
}: MenuSubProps) {
    return (
        <BaseMenu.SubmenuRoot>
            <BaseMenu.SubmenuTrigger
                className="zse-menu-item zse-menu-sub-trigger"
                disabled={disabled}
            >
                <ItemContent icon={icon && <Icon icon={icon} />}>
                    {label}
                </ItemContent>
                {suffix != null && (
                    <span className="zse-menu-sub-suffix">{suffix}</span>
                )}
                <Icon
                    icon={ArrowRight01Icon}
                    size={14}
                    className="zse-menu-chevron"
                />
            </BaseMenu.SubmenuTrigger>
            <Popup
                side="inline-end"
                align="start"
                sideOffset={9}
                alignOffset={-5}
            >
                {children}
            </Popup>
        </BaseMenu.SubmenuRoot>
    );
}

export function MenuGroup({
    label,
    children,
}: {
    label?: ReactNode;
    children: ReactNode;
}) {
    return (
        <BaseMenu.Group className="zse-menu-group">
            {label != null && (
                <BaseMenu.GroupLabel className="zse-menu-label">
                    {label}
                </BaseMenu.GroupLabel>
            )}
            {children}
        </BaseMenu.Group>
    );
}

export function MenuSeparator() {
    return <BaseMenu.Separator className="zse-menu-separator" />;
}
