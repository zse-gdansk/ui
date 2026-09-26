"use client";

import {
    Alert02Icon,
    AlertCircleIcon,
    Cancel01Icon,
    CheckmarkCircle02Icon,
    InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { useState, type HTMLAttributes, type ReactNode } from "react";

import { Icon, type IconGlyph } from "../icon/Icon";

type AlertVariant = "info" | "success" | "warning" | "danger";

const ICONS: Record<AlertVariant, IconGlyph> = {
    info: InformationCircleIcon,
    success: CheckmarkCircle02Icon,
    warning: Alert02Icon,
    danger: AlertCircleIcon,
};

export interface AlertProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    "title"
> {
    variant?: AlertVariant;
    title?: ReactNode;
    // Własna ikona albo false bez ikony.
    icon?: IconGlyph | false;
    // Przyciski pod treścią.
    actions?: ReactNode;
    // Z nim pojawia się X. Wywoływane po animacji zamknięcia.
    onDismiss?: () => void;
    dismissLabel?: string;
}

// Alert, który pojawia się po załadowaniu strony (np. błąd po wysłaniu
// formularza), wjeżdża. Te obecne od początku stoją bez animacji.
let pageReady = false;
if (typeof window !== "undefined") {
    if (document.readyState === "complete") pageReady = true;
    else
        window.addEventListener(
            "load",
            () => {
                pageReady = true;
            },
            { once: true },
        );
}

function markEnter(element: HTMLDivElement | null) {
    if (element && pageReady) element.dataset.enter = "";
}

export function Alert({
    variant = "info",
    title,
    icon,
    actions,
    onDismiss,
    dismissLabel = "Zamknij",
    className,
    children,
    ...props
}: AlertProps) {
    const [closing, setClosing] = useState(false);
    const glyph = icon === false ? null : (icon ?? ICONS[variant]);
    const urgent = variant === "danger" || variant === "warning";

    return (
        <div
            ref={markEnter}
            className="zse-alert-frame"
            data-closing={closing || undefined}
            inert={closing}
            onTransitionEnd={(event) => {
                if (
                    closing &&
                    event.target === event.currentTarget &&
                    event.propertyName === "grid-template-rows"
                )
                    onDismiss?.();
            }}
        >
            <div
                role={urgent ? "alert" : "status"}
                {...props}
                data-variant={variant}
                className={["zse-alert", className].filter(Boolean).join(" ")}
            >
                <div className="zse-alert-content">
                    {glyph && (
                        <span className="zse-alert-icon">
                            <Icon icon={glyph} />
                        </span>
                    )}
                    <div className="zse-alert-body">
                        {title != null && (
                            <p className="zse-alert-title">{title}</p>
                        )}
                        {children != null && (
                            <div className="zse-alert-description">
                                {children}
                            </div>
                        )}
                        {actions != null && (
                            <div className="zse-alert-actions">{actions}</div>
                        )}
                    </div>
                    {onDismiss && (
                        <button
                            type="button"
                            className="zse-alert-close"
                            aria-label={dismissLabel}
                            onClick={() => {
                                if (
                                    matchMedia(
                                        "(prefers-reduced-motion: reduce)",
                                    ).matches
                                )
                                    onDismiss();
                                else setClosing(true);
                            }}
                        >
                            <Icon icon={Cancel01Icon} size={14} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
