"use client";

import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Field } from "@base-ui/react/field";
import { MinusSignIcon, Tick02Icon } from "@hugeicons/core-free-icons";
import type { ComponentProps, ReactNode } from "react";

import { FieldFooter } from "../field/FieldFooter";
import { Icon } from "../icon/Icon";

export interface CheckboxProps extends Omit<
    ComponentProps<typeof BaseCheckbox.Root>,
    "children"
> {
    label?: ReactNode;
    hint?: ReactNode;
    error?: string | undefined;
}

export function Checkbox({
    label,
    hint,
    error,
    className,
    ...props
}: CheckboxProps) {
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

    const labelled =
        label == null || label === false ? (
            control
        ) : (
            <label className="zse-checkbox">
                {control}
                <span className="zse-checkbox-label">{label}</span>
            </label>
        );

    // W formularzu (name) albo z podpowiedzią: pole z komunikatem pod
    // spodem, np. „Zaakceptuj regulamin” przy wymaganej zgodzie.
    if (props.name === undefined && hint == null && !error) return labelled;

    return (
        <Field.Root
            className="zse-input zse-check-field"
            {...(props.name !== undefined && { name: props.name })}
            {...(error && { invalid: true })}
        >
            {labelled}
            <FieldFooter error={error} hint={hint} />
        </Field.Root>
    );
}
