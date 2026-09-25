"use client";

import { Switch as BaseSwitch } from "@base-ui/react/switch";
import type { ComponentProps, ReactNode } from "react";

export interface SwitchProps extends Omit<
    ComponentProps<typeof BaseSwitch.Root>,
    "children"
> {
    label?: ReactNode;
}

export function Switch({ label, className, ...props }: SwitchProps) {
    const control = (
        <BaseSwitch.Root
            {...props}
            className={(state) =>
                [
                    "zse-switch-root",
                    typeof className === "function"
                        ? className(state)
                        : className,
                ]
                    .filter(Boolean)
                    .join(" ")
            }
        >
            <BaseSwitch.Thumb className="zse-switch-thumb" />
        </BaseSwitch.Root>
    );

    if (label == null || label === false) return control;

    return (
        <label className="zse-switch">
            {control}
            <span className="zse-switch-label">{label}</span>
        </label>
    );
}
