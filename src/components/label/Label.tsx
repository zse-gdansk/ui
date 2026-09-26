import type { LabelHTMLAttributes, ReactNode } from "react";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
    children: ReactNode;
    // Czerwona gwiazdka, jak przy wymaganych polach formularza.
    required?: boolean;
    // Dopisek „opcjonalne”, gdy w formularzu większość pól jest wymagana.
    optional?: boolean;
}

// Etykieta dla własnych kontrolek poza Field, w stylu etykiet pól.
export function Label({
    children,
    required = false,
    optional = false,
    className,
    ...props
}: LabelProps) {
    return (
        // htmlFor przychodzi w props.
        // oxlint-disable-next-line jsx-a11y/label-has-associated-control
        <label
            {...props}
            className={["zse-input-label", "zse-label", className]
                .filter(Boolean)
                .join(" ")}
            data-required={required || undefined}
        >
            {children}
            {optional && <span className="zse-label-optional">opcjonalne</span>}
        </label>
    );
}
