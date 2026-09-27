"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";

import { useMessages } from "../../i18n/context";
import { Icon, type IconGlyph } from "../icon/Icon";

export interface ThemeButtonProps {
    // Zmiana motywu po stronie aplikacji, np. setTheme z @wrksz/themes.
    onClick: () => void;
    size?: "sm" | "md";
    // outline: z ramką, jak Button i Toggle w tym wariancie.
    variant?: "ghost" | "outline";
    // Własne ikony zamiast słońca i księżyca.
    lightIcon?: IconGlyph;
    darkIcon?: IconGlyph;
    label?: string;
    disabled?: boolean;
    className?: string;
}

export function ThemeButton({
    onClick,
    size = "md",
    variant = "ghost",
    lightIcon = Sun03Icon,
    darkIcon = Moon02Icon,
    label,
    disabled = false,
    className,
}: ThemeButtonProps) {
    const t = useMessages();
    return (
        <BaseButton
            className={["zse-theme-button", className]
                .filter(Boolean)
                .join(" ")}
            data-size={size}
            data-variant={variant}
            aria-label={label ?? t.themeButton.label}
            disabled={disabled}
            onClick={onClick}
        >
            <span className="zse-theme-button-icons" aria-hidden>
                <Icon icon={lightIcon} data-icon="light" />
                <Icon icon={darkIcon} data-icon="dark" />
            </span>
        </BaseButton>
    );
}
