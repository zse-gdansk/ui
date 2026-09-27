"use client";

import { Field } from "@base-ui/react/field";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { useId, type CSSProperties, type ReactNode } from "react";

import { useMessages } from "../../i18n/context";
import { FieldFooter } from "../field/FieldFooter";
import { resolveScale, type SurveyScale } from "./scale";

export interface LikertScaleProps {
    // Pytanie, np. „Lekcje są prowadzone ciekawie”.
    label: ReactNode;
    scale: SurveyScale;
    hint?: ReactNode;
    error?: string | undefined;
    name?: string;
    required?: boolean;
    disabled?: boolean;
    value?: string | null;
    defaultValue?: string | null;
    onValueChange?: (value: string) => void;
    className?: string;
}

// Jedno pytanie ze skalą odpowiedzi jako rząd pól: słowa (Tak… Nie) albo
// liczby (1–5, 0–10) z opisem krańców. Strzałki przechodzą między
// odpowiedziami, w Form wymagane jak każde pole. Na wąskim kontenerze
// słowa układają się w kolumnę.
export function LikertScale({
    label,
    scale,
    hint,
    error,
    name,
    required = false,
    disabled = false,
    value,
    defaultValue,
    onValueChange,
    className,
}: LikertScaleProps) {
    const t = useMessages();
    const labelId = useId();
    const endsId = useId();
    const { options, numeric, minLabel, maxLabel } = resolveScale(
        scale,
        t.survey,
    );

    return (
        <Field.Root
            className={["zse-input zse-check-field zse-likert", className]
                .filter(Boolean)
                .join(" ")}
            disabled={disabled}
            {...(name !== undefined && { name })}
            {...(error && { invalid: true })}
            // W ankiecie „Odpowiedz na to pytanie”, tak jak w SurveyMatrix.
            validate={(current) =>
                required && (current == null || current === "")
                    ? t.survey.missing
                    : null
            }
        >
            <div id={labelId} className="zse-radio-legend zse-likert-question">
                {label}
            </div>
            <BaseRadioGroup
                className="zse-likert-options"
                data-kind={numeric ? "numbers" : "words"}
                style={{ "--likert-count": options.length } as CSSProperties}
                aria-labelledby={labelId}
                {...(numeric &&
                    (minLabel || maxLabel) && { "aria-describedby": endsId })}
                required={required}
                disabled={disabled}
                {...(value !== undefined && { value })}
                {...(defaultValue !== undefined && { defaultValue })}
                {...(onValueChange && {
                    onValueChange: (next: unknown) =>
                        onValueChange(String(next)),
                })}
            >
                {options.map((option) => (
                    <BaseRadio.Root
                        key={option.value}
                        value={option.value}
                        className="zse-likert-option"
                    >
                        {option.label}
                    </BaseRadio.Root>
                ))}
            </BaseRadioGroup>
            {numeric && (minLabel || maxLabel) && (
                // Dla czytnika z liczbą: „1: źle, 5: świetnie”.
                <div id={endsId} className="zse-likert-ends">
                    <span>
                        <span className="zse-likert-sr">
                            {options[0]?.label}:{" "}
                        </span>
                        {minLabel}
                    </span>
                    <span>
                        <span className="zse-likert-sr">
                            {options.at(-1)?.label}:{" "}
                        </span>
                        {maxLabel}
                    </span>
                </div>
            )}
            <FieldFooter error={error} hint={hint} />
        </Field.Root>
    );
}
