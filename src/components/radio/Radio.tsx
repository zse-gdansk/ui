"use client";

import { Field } from "@base-ui/react/field";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { useId, type ComponentProps, type ReactNode } from "react";

import { FieldFooter } from "../field/FieldFooter";

export interface RadioGroupProps extends ComponentProps<typeof BaseRadioGroup> {
    label?: ReactNode;
    hint?: ReactNode;
    error?: string | undefined;
}

export function RadioGroup({
    label,
    hint,
    error,
    className,
    children,
    ...props
}: RadioGroupProps) {
    const labelId = useId();

    // Pole wokół grupy: błąd z formularza („Wybierz kandydata”) i podpowiedź
    // pod opcjami.
    return (
        <Field.Root
            className="zse-input zse-check-field"
            {...(props.name !== undefined && { name: props.name })}
            {...(error && { invalid: true })}
        >
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
            <FieldFooter error={error} hint={hint} />
        </Field.Root>
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
