import type { HTMLAttributes, ReactNode } from "react";

import { markEnter } from "../../utils/enter";
import { Icon, type IconGlyph } from "../icon/Icon";

export interface EmptyStateProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    "title"
> {
    icon?: IconGlyph;
    title: ReactNode;
    description?: ReactNode;
    // Przyciski pod opisem: główna akcja i ewentualnie druga.
    actions?: ReactNode;
    // dashed: przerywana ramka, jako miejsce, które czeka na treść.
    variant?: "plain" | "dashed";
    // sm do wnętrza tabeli, listy albo popovera.
    size?: "sm" | "md";
}

// Pusty stan: co tu będzie, dlaczego jest pusto i co zrobić dalej.
export function EmptyState({
    icon,
    title,
    description,
    actions,
    variant = "plain",
    size = "md",
    className,
    ...props
}: EmptyStateProps) {
    return (
        <div
            ref={markEnter}
            {...props}
            className={["zse-empty", className].filter(Boolean).join(" ")}
            data-variant={variant}
            data-size={size}
        >
            {icon && (
                <span className="zse-empty-icon" aria-hidden>
                    <span className="zse-empty-tile">
                        <Icon icon={icon} size={size === "sm" ? 18 : 20} />
                    </span>
                </span>
            )}
            <p className="zse-empty-title">{title}</p>
            {description != null && (
                <p className="zse-empty-description">{description}</p>
            )}
            {actions != null && (
                <div className="zse-empty-actions">{actions}</div>
            )}
        </div>
    );
}
