"use client";

import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import type { ReactNode } from "react";

import { Icon, type IconGlyph } from "../icon/Icon";

type Size = "sm" | "md";
type Variant = "ghost" | "outline";

function Glyph({
    icon,
    pressedIcon,
}: {
    icon: IconGlyph;
    pressedIcon?: IconGlyph | undefined;
}) {
    if (!pressedIcon) return <Icon icon={icon} className="zse-toggle-icon" />;
    return (
        <span className="zse-toggle-swap" aria-hidden>
            <Icon icon={icon} className="zse-toggle-icon" data-when="off" />
            <Icon
                icon={pressedIcon}
                className="zse-toggle-icon"
                data-when="on"
            />
        </span>
    );
}

export interface ToggleProps {
    pressed?: boolean;
    defaultPressed?: boolean;
    onPressedChange?: (pressed: boolean) => void;
    icon?: IconGlyph;
    // Inna ikona, gdy wciśnięty.
    pressedIcon?: IconGlyph;
    children?: ReactNode;
    // Wymagane, gdy przycisk ma samą ikonę.
    "aria-label"?: string;
    size?: Size;
    variant?: Variant;
    disabled?: boolean;
}

// Przycisk z dwoma stanami, np. „Pokaż tylko spóźnione”, przypięcie.
export function Toggle({
    pressed,
    defaultPressed,
    onPressedChange,
    icon,
    pressedIcon,
    children,
    "aria-label": label,
    size = "md",
    variant = "ghost",
    disabled = false,
}: ToggleProps) {
    return (
        <BaseToggle
            className="zse-toggle"
            data-size={size}
            data-variant={variant}
            data-icon-only={children == null || undefined}
            disabled={disabled}
            {...(label && { "aria-label": label })}
            {...(pressed !== undefined && { pressed })}
            {...(defaultPressed !== undefined && { defaultPressed })}
            {...(onPressedChange && {
                onPressedChange: (next: boolean) => onPressedChange(next),
            })}
        >
            {icon && <Glyph icon={icon} pressedIcon={pressedIcon} />}
            {children}
        </BaseToggle>
    );
}

export interface ToggleGroupItem {
    value: string;
    label?: ReactNode;
    icon?: IconGlyph;
    pressedIcon?: IconGlyph;
    "aria-label"?: string;
    disabled?: boolean;
}

export interface ToggleGroupProps {
    items: readonly ToggleGroupItem[];
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (value: string[]) => void;
    // Kilka wciśniętych naraz, np. pogrubienie i kursywa. Bez tego jeden
    // albo żaden (w przeciwieństwie do SegmentedControl, gdzie zawsze
    // jeden jest wybrany).
    multiple?: boolean;
    "aria-label": string;
    size?: Size;
    // outline: przyciski sklejone w jedną ramkę, jak pasek narzędzi.
    variant?: Variant;
    disabled?: boolean;
}

export function ToggleGroup({
    items,
    value,
    defaultValue,
    onValueChange,
    multiple = false,
    "aria-label": label,
    size = "md",
    variant = "ghost",
    disabled = false,
}: ToggleGroupProps) {
    return (
        <BaseToggleGroup
            className="zse-toggle-group"
            data-variant={variant}
            aria-label={label}
            multiple={multiple}
            disabled={disabled}
            {...(value !== undefined && { value })}
            {...(defaultValue !== undefined && { defaultValue })}
            {...(onValueChange && {
                onValueChange: (next: string[]) => onValueChange(next),
            })}
        >
            {items.map((item) => (
                <BaseToggle
                    key={item.value}
                    value={item.value}
                    disabled={item.disabled ?? false}
                    className="zse-toggle"
                    data-size={size}
                    data-variant={variant}
                    data-icon-only={item.label == null || undefined}
                    {...(item["aria-label"] && {
                        "aria-label": item["aria-label"],
                    })}
                >
                    {item.icon && (
                        <Glyph
                            icon={item.icon}
                            pressedIcon={item.pressedIcon}
                        />
                    )}
                    {item.label}
                </BaseToggle>
            ))}
        </BaseToggleGroup>
    );
}
