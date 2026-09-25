"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import { LoaderCircleIcon } from "@hugeicons/core-free-icons";
import type { ComponentProps } from "react";

import { Icon, type IconGlyph } from "../icon/Icon";

export interface ButtonProps extends ComponentProps<typeof BaseButton> {
    variant?: "primary" | "ghost" | "outline" | "danger";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    icon?: IconGlyph;
    iconPosition?: "left" | "right";
    // Wyłącza zmniejszenie przy naciśnięciu.
    static?: boolean;
}

export function Button({
    variant = "primary",
    size = "md",
    loading = false,
    icon,
    iconPosition = "left",
    static: isStatic = false,
    disabled = false,
    className,
    children,
    ...props
}: ButtonProps) {
    const slot = (
        <span
            className="zse-button-icon"
            data-position={iconPosition}
            data-open={icon !== undefined || loading || undefined}
        >
            <span className="zse-button-icon-inner">
                {icon !== undefined && (
                    <span
                        className="zse-button-icon-layer"
                        data-hidden={loading || undefined}
                    >
                        <Icon icon={icon} />
                    </span>
                )}
                <span
                    className="zse-button-icon-layer"
                    data-hidden={!loading || undefined}
                >
                    <Icon
                        icon={LoaderCircleIcon}
                        className="zse-button-spinner"
                    />
                </span>
            </span>
        </span>
    );

    return (
        <BaseButton
            {...props}
            disabled={disabled || loading}
            // Podczas ładowania fokus zostaje na przycisku.
            focusableWhenDisabled={loading || props.focusableWhenDisabled}
            aria-busy={loading || undefined}
            data-variant={variant}
            data-size={size}
            data-loading={loading || undefined}
            data-static={isStatic || undefined}
            className={(state) =>
                [
                    "zse-button",
                    typeof className === "function"
                        ? className(state)
                        : className,
                ]
                    .filter(Boolean)
                    .join(" ")
            }
        >
            {iconPosition === "left" && slot}
            {children}
            {iconPosition === "right" && slot}
        </BaseButton>
    );
}
