"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import type { ComponentProps } from "react";

import { useMessages } from "../../i18n/context";
import { Icon } from "../icon/Icon";

export interface CloseButtonProps extends Omit<
    ComponentProps<"button">,
    "children"
> {
    // Nazwa dla czytnika. Domyślnie „Zamknij”.
    label?: string | undefined;
}

// X w nagłówku okna, panelu albo dymka. Zamykanie daje rodzic przez
// render, np. <Dialog.Close render={<CloseButton />} />.
export function CloseButton({
    label,
    className,
    type = "button",
    ...props
}: CloseButtonProps) {
    const t = useMessages();
    return (
        <button
            type={type}
            {...props}
            className={["zse-close-button", className]
                .filter(Boolean)
                .join(" ")}
            aria-label={label ?? t.common.close}
        >
            <Icon icon={Cancel01Icon} size={14} />
        </button>
    );
}
