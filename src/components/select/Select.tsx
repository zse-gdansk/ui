"use client";

import { Field } from "@base-ui/react/field";
import { Select as BaseSelect } from "@base-ui/react/select";
import { ArrowDown01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import type { ComponentProps, ReactNode } from "react";

import { Icon } from "../icon/Icon";
import { ScrollArea } from "../scroll-area/ScrollArea";

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

type SelectSize = "sm" | "md" | "lg";

export interface SelectProps {
    label?: ReactNode;
    hint?: ReactNode;
    error?: string;
    size?: SelectSize;
    options: readonly SelectOption[];
    placeholder?: string;
    value?: string | null;
    defaultValue?: string | null;
    onValueChange?: (value: string | null) => void;
    disabled?: boolean;
    name?: string;
    id?: string;
    className?: ComponentProps<typeof BaseSelect.Trigger>["className"];
}

export function Select({
    label,
    hint,
    error,
    size = "md",
    options,
    placeholder,
    value,
    defaultValue,
    onValueChange,
    disabled = false,
    name,
    id,
    className,
}: SelectProps) {
    const items = Object.fromEntries(
        options.map((option) => [option.value, option.label]),
    );

    return (
        <Field.Root
            className="zse-input"
            data-size={size}
            disabled={disabled}
            invalid={Boolean(error)}
        >
            {label != null && label !== false && (
                <Field.Label className="zse-input-label">{label}</Field.Label>
            )}

            <BaseSelect.Root
                items={items}
                disabled={disabled}
                {...(id !== undefined ? { id } : {})}
                {...(name !== undefined ? { name } : {})}
                {...(value !== undefined ? { value } : {})}
                {...(defaultValue !== undefined ? { defaultValue } : {})}
                {...(onValueChange !== undefined
                    ? {
                          onValueChange: (next: string | null) =>
                              onValueChange(next),
                      }
                    : {})}
            >
                <div className="zse-input-control">
                    <BaseSelect.Trigger
                        className={(state) =>
                            [
                                "zse-input-field",
                                "zse-select-trigger",
                                typeof className === "function"
                                    ? className(state)
                                    : className,
                            ]
                                .filter(Boolean)
                                .join(" ")
                        }
                    >
                        <BaseSelect.Value
                            className="zse-select-value"
                            {...(placeholder !== undefined
                                ? { placeholder }
                                : {})}
                        />
                        <BaseSelect.Icon className="zse-select-icon">
                            <Icon icon={ArrowDown01Icon} />
                        </BaseSelect.Icon>
                    </BaseSelect.Trigger>
                </div>

                <BaseSelect.Portal>
                    <BaseSelect.Positioner
                        className="zse-select-positioner"
                        side="bottom"
                        sideOffset={6}
                        alignItemWithTrigger={false}
                    >
                        <BaseSelect.Popup className="zse-select-popup">
                            <ScrollArea maxHeight="var(--available-height)">
                                <BaseSelect.List className="zse-select-list">
                                    {options.map((option) => (
                                        <BaseSelect.Item
                                            key={option.value}
                                            value={option.value}
                                            disabled={option.disabled}
                                            className="zse-select-item"
                                        >
                                            <BaseSelect.ItemText className="zse-select-item-text">
                                                {option.label}
                                            </BaseSelect.ItemText>
                                            <BaseSelect.ItemIndicator className="zse-select-item-indicator">
                                                <Icon icon={Tick02Icon} />
                                            </BaseSelect.ItemIndicator>
                                        </BaseSelect.Item>
                                    ))}
                                </BaseSelect.List>
                            </ScrollArea>
                        </BaseSelect.Popup>
                    </BaseSelect.Positioner>
                </BaseSelect.Portal>
            </BaseSelect.Root>

            {error ? (
                <Field.Error className="zse-input-hint" match>
                    {error}
                </Field.Error>
            ) : (
                hint != null &&
                hint !== false && (
                    <Field.Description className="zse-input-hint">
                        {hint}
                    </Field.Description>
                )
            )}
        </Field.Root>
    );
}
