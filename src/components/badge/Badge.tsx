"use client";

import { useRender } from "@base-ui/react/use-render";

import { Icon, type IconGlyph } from "../icon/Icon";

export interface BadgeProps extends useRender.ComponentProps<"span"> {
    tone?: "neutral" | "accent" | "success" | "warning" | "danger";
    variant?: "soft" | "solid" | "outline";
    size?: "sm" | "md";
    // Kropka statusu; "pulse" dla czegoś, co trwa teraz.
    dot?: boolean | "pulse";
    icon?: IconGlyph;
}

export function Badge({
    tone = "neutral",
    variant = "soft",
    size = "md",
    dot = false,
    icon,
    render,
    className,
    children,
    ...props
}: BadgeProps) {
    return useRender({
        render,
        defaultTagName: "span",
        props: {
            ...props,
            "data-tone": tone,
            "data-variant": variant,
            "data-size": size,
            className: ["zse-badge", className].filter(Boolean).join(" "),
            children: (
                <>
                    {dot && (
                        <span
                            className="zse-badge-dot"
                            data-pulse={dot === "pulse" || undefined}
                            aria-hidden
                        />
                    )}
                    {icon && (
                        <Icon
                            icon={icon}
                            strokeWidth={2}
                            className="zse-badge-icon"
                            aria-hidden
                        />
                    )}
                    {children}
                </>
            ),
        },
    });
}
