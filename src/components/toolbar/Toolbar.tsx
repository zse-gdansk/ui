"use client";

import { Menu as BaseMenu } from "@base-ui/react/menu";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import {
    type ComponentProps,
    createContext,
    type ReactElement,
    type ReactNode,
    use,
} from "react";

import { Icon, type IconGlyph } from "../icon/Icon";
import { MenuPopup } from "../menu/Menu";
import { Tooltip } from "../tooltip/Tooltip";

type Orientation = "horizontal" | "vertical";

// Etykiety mają wagę 500, więc kreska jak w Button, jedna dla całego paska.
const TOOLBAR_STROKE = 1.75;

const OrientationContext = createContext<Orientation>("horizontal");
// ToggleGroup nie jest Toolbar.Group, więc jego `disabled` nie dociera do
// Toolbar.Button sam z siebie.
const ToggleGroupDisabledContext = createContext(false);

function join(...classes: (string | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}

export interface ToolbarProps {
    // Nazwa paska dla czytników, np. „Formatowanie tekstu”.
    "aria-label": string;
    children: ReactNode;
    orientation?: Orientation;
    size?: "sm" | "md";
    // plain: same przyciski, np. w nagłówku; outline: ramka nad edytorem
    // albo tabelą; floating: pływający pasek z cieniem, np. akcje na
    // zaznaczonym tekście.
    variant?: "plain" | "outline" | "floating";
    disabled?: boolean;
    // Strzałki przeskakują z końca na początek.
    loopFocus?: boolean;
    className?: string;
}

export function Toolbar({
    "aria-label": label,
    children,
    orientation = "horizontal",
    size = "md",
    variant = "plain",
    disabled = false,
    loopFocus = true,
    className,
}: ToolbarProps) {
    return (
        <OrientationContext value={orientation}>
            {/* Po pierwszym tooltipie kolejne w pasku otwierają się od razu. */}
            <BaseTooltip.Provider>
                <BaseToolbar.Root
                    aria-label={label}
                    orientation={orientation}
                    disabled={disabled}
                    loopFocus={loopFocus}
                    data-size={size}
                    data-variant={variant}
                    className={join("zse-toolbar", className)}
                >
                    {children}
                </BaseToolbar.Root>
            </BaseTooltip.Provider>
        </OrientationContext>
    );
}

interface ItemBase {
    icon?: IconGlyph;
    // Nazwa dla czytników i treść tooltipa. Wymagana, gdy jest sama ikona.
    label?: string;
    // Inna treść tooltipa, np. z opisem. false wyłącza tooltip.
    tooltip?: ReactNode;
}

// To samo co ItemBase, z jawnym undefined po rozebraniu propsów.
interface ItemInfo {
    icon: IconGlyph | undefined;
    label: string | undefined;
    tooltip: ReactNode;
}

function Glyph({
    icon,
    pressedIcon,
}: {
    icon: IconGlyph;
    pressedIcon?: IconGlyph | undefined;
}) {
    if (!pressedIcon)
        return (
            <Icon
                icon={icon}
                strokeWidth={TOOLBAR_STROKE}
                className="zse-toolbar-icon"
            />
        );
    return (
        <span className="zse-toolbar-swap" aria-hidden>
            <Icon
                icon={icon}
                strokeWidth={TOOLBAR_STROKE}
                className="zse-toolbar-icon"
                data-when="off"
            />
            <Icon
                icon={pressedIcon}
                strokeWidth={TOOLBAR_STROKE}
                className="zse-toolbar-icon"
                data-when="on"
            />
        </span>
    );
}

function itemProps(
    { icon, label }: ItemInfo,
    children: ReactNode,
    className: string | undefined,
) {
    return {
        className: join("zse-toolbar-item", className),
        "data-icon-only": (icon !== undefined && children == null) || undefined,
        ...(label && { "aria-label": label }),
    };
}

function WithTooltip({
    item: { label, tooltip },
    iconOnly,
    children,
}: {
    item: ItemInfo;
    iconOnly: boolean;
    children: ReactElement<Record<string, unknown>>;
}) {
    const orientation = use(OrientationContext);
    const content = tooltip ?? (iconOnly ? label : undefined);
    if (content == null || content === false) return children;
    return (
        <Tooltip
            content={content}
            side={orientation === "vertical" ? "right" : "top"}
            // Tapnięcie wykonuje akcję, nazwa jest w aria-label.
            touch="none"
        >
            {children}
        </Tooltip>
    );
}

export interface ToolbarButtonProps
    extends
        ItemBase,
        Omit<ComponentProps<typeof BaseToolbar.Button>, "className"> {
    className?: string;
}

export function ToolbarButton({
    icon,
    label,
    tooltip,
    children,
    className,
    ...props
}: ToolbarButtonProps) {
    const item: ItemInfo = { icon, label, tooltip };
    return (
        <WithTooltip item={item} iconOnly={children == null}>
            <BaseToolbar.Button
                {...props}
                {...itemProps(item, children, className)}
            >
                {icon && <Glyph icon={icon} />}
                {children}
            </BaseToolbar.Button>
        </WithTooltip>
    );
}

export interface ToolbarToggleProps extends ItemBase {
    // Wartość w ToolbarToggleGroup.
    value?: string;
    pressed?: boolean;
    defaultPressed?: boolean;
    onPressedChange?: (pressed: boolean) => void;
    // Inna ikona, gdy wciśnięty, np. przypięte.
    pressedIcon?: IconGlyph;
    children?: ReactNode;
    disabled?: boolean;
    className?: string;
}

export function ToolbarToggle({
    icon,
    label,
    tooltip,
    value,
    pressed,
    defaultPressed,
    onPressedChange,
    pressedIcon,
    children,
    disabled = false,
    className,
}: ToolbarToggleProps) {
    const item: ItemInfo = { icon, label, tooltip };
    const groupDisabled = use(ToggleGroupDisabledContext);
    return (
        <WithTooltip item={item} iconOnly={children == null}>
            <BaseToolbar.Button
                disabled={disabled || groupDisabled}
                {...itemProps(item, children, className)}
                render={
                    <BaseToggle
                        {...(value !== undefined && { value })}
                        {...(pressed !== undefined && { pressed })}
                        {...(defaultPressed !== undefined && {
                            defaultPressed,
                        })}
                        {...(onPressedChange && {
                            onPressedChange: (next: boolean) =>
                                onPressedChange(next),
                        })}
                    />
                }
            >
                {icon && <Glyph icon={icon} pressedIcon={pressedIcon} />}
                {children}
            </BaseToolbar.Button>
        </WithTooltip>
    );
}

export interface ToolbarToggleGroupProps {
    // Nazwa grupy dla czytników, np. „Wyrównanie”.
    "aria-label": string;
    // ToolbarToggle z `value`.
    children: ReactNode;
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (value: string[]) => void;
    // Kilka wciśniętych naraz (pogrubienie i kursywa). Bez tego jeden
    // albo żaden (wyrównanie).
    multiple?: boolean;
    disabled?: boolean;
}

export function ToolbarToggleGroup({
    "aria-label": label,
    children,
    value,
    defaultValue,
    onValueChange,
    multiple = false,
    disabled = false,
}: ToolbarToggleGroupProps) {
    return (
        <BaseToggleGroup
            className="zse-toolbar-group"
            aria-label={label}
            multiple={multiple}
            disabled={disabled}
            {...(value !== undefined && { value })}
            {...(defaultValue !== undefined && { defaultValue })}
            {...(onValueChange && {
                onValueChange: (next: string[]) => onValueChange(next),
            })}
        >
            <ToggleGroupDisabledContext value={disabled}>
                {children}
            </ToggleGroupDisabledContext>
        </BaseToggleGroup>
    );
}

export interface ToolbarMenuProps extends ItemBase {
    // Widoczny napis na przycisku, np. „Eksportuj”. Bez niego sama ikona.
    text?: ReactNode;
    // Pozycje menu: MenuItem, MenuCheckboxItem, MenuSub…
    children: ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    side?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";
    disabled?: boolean;
}

export function ToolbarMenu({
    icon,
    label,
    tooltip,
    text,
    children,
    open,
    onOpenChange,
    side = "bottom",
    align = "start",
    disabled = false,
}: ToolbarMenuProps) {
    const item: ItemInfo = { icon, label, tooltip };
    return (
        <BaseMenu.Root
            {...(open !== undefined && { open })}
            {...(onOpenChange && {
                onOpenChange: (next: boolean) => onOpenChange(next),
            })}
        >
            <WithTooltip item={item} iconOnly={text == null}>
                <BaseToolbar.Button
                    disabled={disabled}
                    {...itemProps(item, text, undefined)}
                    render={<BaseMenu.Trigger />}
                >
                    {icon && <Glyph icon={icon} />}
                    {text}
                </BaseToolbar.Button>
            </WithTooltip>
            <MenuPopup side={side} align={align} sideOffset={6} alignOffset={0}>
                {children}
            </MenuPopup>
        </BaseMenu.Root>
    );
}

export interface ToolbarLinkProps
    extends
        ItemBase,
        Omit<ComponentProps<typeof BaseToolbar.Link>, "className"> {
    className?: string;
}

// Link w pasku, np. „Podgląd wydruku”. `render` dla linku z routera.
export function ToolbarLink({
    icon,
    label,
    tooltip,
    children,
    className,
    ...props
}: ToolbarLinkProps) {
    const item: ItemInfo = { icon, label, tooltip };
    return (
        <WithTooltip item={item} iconOnly={children == null}>
            <BaseToolbar.Link
                {...props}
                {...itemProps(item, children, className)}
            >
                {icon && <Glyph icon={icon} />}
                {children}
            </BaseToolbar.Link>
        </WithTooltip>
    );
}

export interface ToolbarGroupProps {
    children: ReactNode;
    "aria-label"?: string;
    disabled?: boolean;
}

export function ToolbarGroup({
    children,
    "aria-label": label,
    disabled = false,
}: ToolbarGroupProps) {
    return (
        <BaseToolbar.Group
            className="zse-toolbar-group"
            disabled={disabled}
            {...(label && { "aria-label": label })}
        >
            {children}
        </BaseToolbar.Group>
    );
}

export function ToolbarSeparator() {
    return <BaseToolbar.Separator className="zse-toolbar-separator" />;
}

// Wypycha dalsze pozycje na koniec paska.
export function ToolbarSpacer() {
    return <div className="zse-toolbar-spacer" aria-hidden />;
}
