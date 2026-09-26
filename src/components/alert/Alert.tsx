"use client";

import {
    Alert02Icon,
    AlertCircleIcon,
    Cancel01Icon,
    CheckmarkCircle02Icon,
    InformationCircleIcon,
    LoaderCircleIcon,
} from "@hugeicons/core-free-icons";
import { useState, type HTMLAttributes, type ReactNode } from "react";

import { markEnter } from "../../utils/enter";
import { Icon, type IconGlyph } from "../icon/Icon";

type AlertVariant = "info" | "success" | "warning" | "danger";

const ICONS: Record<AlertVariant, IconGlyph> = {
    info: InformationCircleIcon,
    success: CheckmarkCircle02Icon,
    warning: Alert02Icon,
    danger: AlertCircleIcon,
};

export interface AlertAction {
    label: ReactNode;
    onClick: () => unknown;
}

export interface AlertProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    "title"
> {
    variant?: AlertVariant;
    title?: ReactNode;
    // Własna ikona albo false bez ikony.
    icon?: IconGlyph | false;
    // Akcja w linii z treścią, np. „Spróbuj ponownie”. Gdy onClick zwróci
    // Promise, przycisk czeka na niego ze spinnerem.
    action?: AlertAction;
    // Przyciski pod treścią, gdy akcji jest więcej albo są ważniejsze.
    actions?: ReactNode;
    // Z nim pojawia się X. Wywoływane po animacji zamknięcia.
    onDismiss?: () => void;
    dismissLabel?: string;
}

export function Alert({
    variant = "info",
    title,
    icon,
    action,
    actions,
    onDismiss,
    dismissLabel = "Zamknij",
    className,
    children,
    ...props
}: AlertProps) {
    const [closing, setClosing] = useState(false);
    const [pending, setPending] = useState(false);

    async function runAction() {
        if (!action || pending) return;
        const result = action.onClick();
        if (!(result instanceof Promise)) return;
        setPending(true);
        try {
            await result;
        } catch {
            // Błąd obsługuje wywołujący (np. toast), tu tylko kończymy czekanie.
        } finally {
            setPending(false);
        }
    }
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
                    {action && (
                        <button
                            type="button"
                            className="zse-alert-action"
                            aria-busy={pending || undefined}
                            aria-disabled={pending || undefined}
                            onClick={() => void runAction()}
                        >
                            {action.label}
                            {pending && (
                                <Icon
                                    icon={LoaderCircleIcon}
                                    size={14}
                                    className="zse-alert-spinner"
                                />
                            )}
                        </button>
                    )}
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
