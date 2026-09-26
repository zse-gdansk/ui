import { Separator as BaseSeparator } from "@base-ui/react/separator";
import type { ReactNode } from "react";

export interface SeparatorProps {
    orientation?: "horizontal" | "vertical";
    // Tekst na środku linii, np. „lub” między logowaniem hasłem i kodem.
    label?: ReactNode;
    className?: string;
}

export function Separator({
    orientation = "horizontal",
    label,
    className,
}: SeparatorProps) {
    const classes = ["zse-separator", className].filter(Boolean).join(" ");

    if (label != null && orientation === "horizontal")
        return (
            <div className={classes} data-labelled="">
                <span className="zse-separator-label">{label}</span>
            </div>
        );

    return <BaseSeparator orientation={orientation} className={classes} />;
}
