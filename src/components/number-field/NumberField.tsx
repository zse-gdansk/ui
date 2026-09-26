"use client";

import { Field } from "@base-ui/react/field";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import {
    ArrowLeftRightIcon,
    MinusSignIcon,
    PlusSignIcon,
} from "@hugeicons/core-free-icons";
import type { ReactNode } from "react";

import { FieldFooter } from "../field/FieldFooter";
import { Icon } from "../icon/Icon";

export interface NumberFieldProps {
    label?: ReactNode;
    hint?: ReactNode;
    error?: string | undefined;
    size?: "sm" | "md" | "lg";
    value?: number | null;
    defaultValue?: number;
    onValueChange?: (value: number | null) => void;
    // Po zatwierdzeniu: blur, Enter, puszczenie przycisku albo scrubbingu.
    onValueCommitted?: (value: number | null) => void;
    min?: number;
    max?: number;
    step?: number;
    // Shift + strzałka / PageUp.
    largeStep?: number;
    // Alt + strzałka.
    smallStep?: number;
    format?: Intl.NumberFormatOptions;
    locale?: Intl.LocalesArgument;
    // Jednostka za liczbą, np. "pkt".
    suffix?: ReactNode;
    // Przeciąganie etykiety w poziomie zmienia wartość.
    scrub?: boolean;
    // Kółko myszy zmienia wartość, gdy pole ma fokus.
    wheel?: boolean;
    // Bez przycisków − i +.
    hideButtons?: boolean;
    placeholder?: string;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    name?: string;
    id?: string;
    decrementLabel?: string;
    incrementLabel?: string;
}

function defined<T extends object>(props: T) {
    return Object.fromEntries(
        Object.entries(props).filter(([, value]) => value !== undefined),
    ) as { [K in keyof T]: Exclude<T[K], undefined> };
}

function focusOnPress(group: HTMLDivElement | null) {
    if (!group) return;
    const press = (event: PointerEvent) => {
        const target = event.target as Element;
        if (target.closest("input, button")) return;
        event.preventDefault();
        group.querySelector("input")?.focus();
    };
    group.addEventListener("pointerdown", press);
    return () => group.removeEventListener("pointerdown", press);
}

export function NumberField({
    label,
    hint,
    error,
    size = "md",
    value,
    defaultValue,
    onValueChange,
    onValueCommitted,
    min,
    max,
    step,
    largeStep,
    smallStep,
    format,
    locale = "pl-PL",
    suffix,
    scrub = false,
    wheel = false,
    hideButtons = false,
    placeholder,
    disabled = false,
    readOnly = false,
    required = false,
    name,
    id,
    decrementLabel = "Zmniejsz",
    incrementLabel = "Zwiększ",
}: NumberFieldProps) {
    const hasLabel = label != null && label !== false;
    const labelNode = hasLabel && (
        <Field.Label className="zse-input-label">{label}</Field.Label>
    );

    return (
        <Field.Root
            className="zse-input zse-number"
            data-size={size}
            disabled={disabled}
            {...(error && { invalid: true })}
            {...(name !== undefined && { name: name })}
        >
            <BaseNumberField.Root
                className="zse-number-root"
                disabled={disabled}
                readOnly={readOnly}
                required={required}
                locale={locale}
                allowWheelScrub={wheel}
                {...defined({
                    value,
                    defaultValue,
                    min,
                    max,
                    step,
                    largeStep,
                    smallStep,
                    format,
                    name,
                    id,
                })}
                {...(onValueChange && {
                    onValueChange: (next: number | null) => onValueChange(next),
                })}
                {...(onValueCommitted && {
                    onValueCommitted: (next: number | null) =>
                        onValueCommitted(next),
                })}
            >
                {scrub && hasLabel ? (
                    <BaseNumberField.ScrubArea className="zse-number-scrub">
                        {labelNode}
                        <BaseNumberField.ScrubAreaCursor className="zse-number-scrub-cursor">
                            <Icon icon={ArrowLeftRightIcon} />
                        </BaseNumberField.ScrubAreaCursor>
                    </BaseNumberField.ScrubArea>
                ) : (
                    labelNode
                )}

                <BaseNumberField.Group
                    ref={focusOnPress}
                    className="zse-input-control zse-number-group"
                    data-buttons={hideButtons ? undefined : ""}
                    data-suffix={suffix == null ? undefined : ""}
                >
                    <BaseNumberField.Input
                        className="zse-number-input"
                        {...(placeholder !== undefined && { placeholder })}
                    />
                    {suffix != null && (
                        <span className="zse-number-suffix" aria-hidden>
                            {suffix}
                        </span>
                    )}
                    {!hideButtons && (
                        <span className="zse-number-buttons">
                            <BaseNumberField.Decrement
                                className="zse-number-button"
                                aria-label={decrementLabel}
                            >
                                <Icon icon={MinusSignIcon} />
                            </BaseNumberField.Decrement>
                            <BaseNumberField.Increment
                                className="zse-number-button"
                                aria-label={incrementLabel}
                            >
                                <Icon icon={PlusSignIcon} />
                            </BaseNumberField.Increment>
                        </span>
                    )}
                </BaseNumberField.Group>
            </BaseNumberField.Root>

            <FieldFooter error={error} hint={hint} />
        </Field.Root>
    );
}
