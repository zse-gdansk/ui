"use client";

import { Button, type ButtonProps } from "../button/Button";
import type { IconGlyph } from "../icon/Icon";
import { Tooltip, type TooltipProps } from "../tooltip/Tooltip";

export interface IconButtonProps extends Omit<
    ButtonProps,
    "children" | "icon" | "iconPosition" | "aria-label"
> {
    icon: IconGlyph;
    // Wymagana nazwa: aria-label i treść tooltipa. Przycisk z samą ikoną
    // bez nazwy jest dla czytnika pusty.
    label: string;
    // Bez tooltipa, gdy nazwę widać obok (np. w pasku z podpisem).
    tooltip?: boolean;
    tooltipSide?: TooltipProps["side"];
}

// Przycisk z samą ikoną: kopiuj, pełny ekran, akcje w wierszu tabeli.
// Domyślnie ghost, bo zwykle stoi w pasku albo obok treści.
export function IconButton({
    icon,
    label,
    tooltip = true,
    tooltipSide = "top",
    variant = "ghost",
    ...props
}: IconButtonProps) {
    const button = (
        <Button {...props} variant={variant} icon={icon} aria-label={label} />
    );
    if (!tooltip) return button;
    // touch="none": na dotyku tapnięcie wykonuje akcję, nazwa jest w aria-label.
    return (
        <Tooltip content={label} side={tooltipSide} touch="none">
            {button}
        </Tooltip>
    );
}
