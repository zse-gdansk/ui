"use client";

import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import { Field } from "@base-ui/react/field";
import { Fieldset } from "@base-ui/react/fieldset";
import { useState, type CSSProperties, type ReactNode } from "react";

import { useMessages } from "../../i18n/context";
import { Checkbox } from "../checkbox/Checkbox";
import { FieldFooter } from "../field/FieldFooter";

export interface CheckboxOption {
    value: string;
    label: ReactNode;
    description?: ReactNode;
    disabled?: boolean;
}

export interface CheckboxGroupProps {
    label?: ReactNode;
    hint?: ReactNode;
    error?: string | undefined;
    options: readonly CheckboxOption[];
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (value: string[]) => void;
    // Checkbox „zaznacz wszystkie” nad listą, w stanie pośrednim, gdy
    // zaznaczona jest część. Tekst albo true dla domyślnego.
    selectAll?: boolean | string;
    // Opcje w kolumnach, np. klasy w trzech.
    columns?: number;
    name?: string;
    disabled?: boolean;
}

const NONE: string[] = [];

export function CheckboxGroup({
    label,
    hint,
    error,
    options,
    value,
    defaultValue = NONE,
    onValueChange,
    selectAll = false,
    columns,
    name,
    disabled = false,
}: CheckboxGroupProps) {
    const t = useMessages();
    const number = new Intl.NumberFormat(t.locale);
    const [internal, setInternal] = useState(defaultValue);
    const selected = value ?? internal;
    const selectable = options
        .filter((option) => !option.disabled)
        .map((option) => option.value);

    return (
        <Field.Root
            className="zse-input zse-check-field"
            disabled={disabled}
            {...(name !== undefined && { name })}
            {...(error && { invalid: true })}
        >
            <Fieldset.Root
                className="zse-checkbox-group"
                render={
                    <BaseCheckboxGroup
                        value={selected}
                        allValues={selectable}
                        disabled={disabled}
                        onValueChange={(next) => {
                            if (value === undefined) setInternal(next);
                            onValueChange?.(next);
                        }}
                    />
                }
            >
                {label != null && label !== false && (
                    <Fieldset.Legend className="zse-radio-legend">
                        {label}
                    </Fieldset.Legend>
                )}
                {selectAll && (
                    <div className="zse-checkbox-all">
                        <Checkbox
                            parent
                            label={
                                typeof selectAll === "string"
                                    ? selectAll
                                    : t.checkboxGroup.selectAll
                            }
                        />
                        <span className="zse-checkbox-count" aria-live="polite">
                            {t.checkboxGroup.count(
                                number.format(selected.length),
                                number.format(selectable.length),
                            )}
                        </span>
                    </div>
                )}
                <div
                    className="zse-checkbox-options"
                    data-columns={columns ? "" : undefined}
                    style={
                        columns
                            ? ({ "--columns": columns } as CSSProperties)
                            : undefined
                    }
                >
                    {options.map((option) => (
                        <Checkbox
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled ?? false}
                            label={
                                option.description == null ? (
                                    option.label
                                ) : (
                                    <span className="zse-checkbox-text">
                                        {option.label}
                                        <span className="zse-checkbox-description">
                                            {option.description}
                                        </span>
                                    </span>
                                )
                            }
                        />
                    ))}
                </div>
            </Fieldset.Root>
            <FieldFooter error={error} hint={hint} />
        </Field.Root>
    );
}
