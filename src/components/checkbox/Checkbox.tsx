"use client";

import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { MinusSignIcon, Tick02Icon } from "@hugeicons/core-free-icons";
import type { ComponentProps, ReactNode } from "react";

import { Icon } from "../icon/Icon";

export interface CheckboxProps extends Omit<
    ComponentProps<typeof BaseCheckbox.Root>,
    "children"
> {
    label?: ReactNode;
}

export function Checkbox({ label, className, ...props }: CheckboxProps) {
    const control = (
        <BaseCheckbox.Root
            {...props}
            className={(state) =>
                [
                    "zse-checkbox-root",
                    typeof className === "function"
                        ? className(state)
                        : className,
                ]
                    .filter(Boolean)
                    .join(" ")
            }
        >
            <BaseCheckbox.Indicator
                className="zse-checkbox-indicator"
                keepMounted
            >
                <Icon
                    icon={Tick02Icon}
                    strokeWidth={2}
                    className="zse-checkbox-tick"
                />
                <Icon
                    icon={MinusSignIcon}
                    strokeWidth={2}
                    className="zse-checkbox-minus"
                />
            </BaseCheckbox.Indicator>
        </BaseCheckbox.Root>
    );

    if (label == null || label === false) return control;

    return (
        <label className="zse-checkbox">
            {control}
            <span className="zse-checkbox-label">{label}</span>
        </label>
    );
}
