"use client";

import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { useId, type ComponentProps, type ReactNode } from "react";

export interface RadioGroupProps extends ComponentProps<typeof BaseRadioGroup> {
    label?: ReactNode;
}

export function RadioGroup({
    label,
    className,
    children,
    ...props
}: RadioGroupProps) {
    const labelId = useId();

    return (
        <BaseRadioGroup
            {...props}
            {...(label != null && label !== false
                ? { "aria-labelledby": labelId }
                : {})}
            className={(state) =>
                [
                    "zse-radio-group",
                    typeof className === "function"
                        ? className(state)
                        : className,
                ]
                    .filter(Boolean)
                    .join(" ")
            }
        >
            {label != null && label !== false && (
                <div id={labelId} className="zse-radio-legend">
                    {label}
                </div>
            )}
            {children}
        </BaseRadioGroup>
    );
}

export interface RadioProps extends Omit<
    ComponentProps<typeof BaseRadio.Root>,
    "children"
> {
    label?: ReactNode;
}

export function Radio({ label, className, ...props }: RadioProps) {
    const control = (
        <BaseRadio.Root
            {...props}
            className={(state) =>
                [
                    "zse-radio-root",
                    typeof className === "function"
                        ? className(state)
                        : className,
                ]
                    .filter(Boolean)
                    .join(" ")
            }
        >
            <BaseRadio.Indicator className="zse-radio-indicator" keepMounted />
        </BaseRadio.Root>
    );

    if (label == null || label === false) return control;

    return (
        <label className="zse-radio">
            {control}
            <span className="zse-radio-label">{label}</span>
        </label>
    );
}
