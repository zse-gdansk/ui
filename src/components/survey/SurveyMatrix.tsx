"use client";

import { Field } from "@base-ui/react/field";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { useId, useState, type CSSProperties, type ReactNode } from "react";

import { useMessages } from "../../i18n/context";
import { FieldFooter } from "../field/FieldFooter";
import { useFormValue } from "../form/context";
import { resolveScale, type SurveyScale } from "./scale";

export interface SurveyQuestion {
    id: string;
    label: ReactNode;
    // Domyślnie jak required całej macierzy.
    required?: boolean;
}

export type SurveyAnswers = Record<string, string>;

export interface SurveyMatrixProps {
    // Nazwa bloku pytań, np. „Jak oceniasz lekcje?”.
    label: ReactNode;
    questions: readonly SurveyQuestion[];
    scale: SurveyScale;
    hint?: ReactNode;
    // W Form: obiekt { id pytania: odpowiedź } pod name, a każde pytanie
    // także jako pole name.id.
    name?: string;
    required?: boolean;
    disabled?: boolean;
    value?: SurveyAnswers;
    defaultValue?: SurveyAnswers;
    onValueChange?: (value: SurveyAnswers) => void;
    className?: string;
}

const NONE: SurveyAnswers = {};

// Wiele pytań z tą samą skalą: tabela pytania × odpowiedzi, na wąskim
// kontenerze każde pytanie jako karta z odpowiedziami w kolumnie. Każde
// pytanie to osobne pole, więc Form przy wysyłce zaznacza pytania bez
// odpowiedzi i przenosi fokus do pierwszego.
export function SurveyMatrix({
    label,
    questions,
    scale,
    hint,
    name,
    required = false,
    disabled = false,
    value,
    defaultValue = NONE,
    onValueChange,
    className,
}: SurveyMatrixProps) {
    const t = useMessages();
    const labelId = useId();
    const hintId = useId();
    const [inner, setInner] = useState(defaultValue);
    const answers = value ?? inner;
    const { options, numeric, minLabel, maxLabel } = resolveScale(
        scale,
        t.survey,
    );
    useFormValue(name, answers);

    function answer(question: string, next: string) {
        const updated = { ...answers, [question]: next };
        if (value === undefined) setInner(updated);
        onValueChange?.(updated);
    }

    const columns = {
        "--survey-count": options.length,
    } as CSSProperties;

    return (
        <fieldset
            {...(hint != null && { "aria-describedby": hintId })}
            className={["zse-survey", className].filter(Boolean).join(" ")}
            data-kind={numeric ? "numbers" : "words"}
            style={columns}
        >
            <legend id={labelId} className="zse-survey-label">
                {label}
            </legend>
            {hint != null && (
                <p id={hintId} className="zse-survey-hint">
                    {hint}
                </p>
            )}
            <div className="zse-survey-grid">
                {/* Nagłówek tylko dla oka; czytnik dostaje nazwę przy każdej odpowiedzi. */}
                <div className="zse-survey-head" aria-hidden>
                    <span className="zse-survey-corner">
                        {t.survey.question}
                    </span>
                    {options.map((option, index) => (
                        <span key={option.value} className="zse-survey-column">
                            {option.label}
                            {numeric && index === 0 && minLabel && (
                                <small>{minLabel}</small>
                            )}
                            {numeric &&
                                index === options.length - 1 &&
                                maxLabel && <small>{maxLabel}</small>}
                        </span>
                    ))}
                </div>
                {questions.map((question) => {
                    const questionId = `${labelId}-${question.id}`;
                    const isRequired = question.required ?? required;
                    return (
                        <Field.Root
                            key={question.id}
                            className="zse-survey-row"
                            disabled={disabled}
                            {...(name !== undefined && {
                                name: `${name}.${question.id}`,
                            })}
                            validate={(current) =>
                                isRequired &&
                                (current == null || current === "")
                                    ? t.survey.missing
                                    : null
                            }
                        >
                            <div
                                id={questionId}
                                className="zse-survey-question"
                            >
                                {question.label}
                            </div>
                            <BaseRadioGroup
                                className="zse-survey-options"
                                aria-labelledby={questionId}
                                required={isRequired}
                                disabled={disabled}
                                value={answers[question.id] ?? null}
                                onValueChange={(next) =>
                                    answer(question.id, String(next))
                                }
                            >
                                {options.map((option) => (
                                    // Cała komórka klika się jak odpowiedź.
                                    // oxlint-disable-next-line jsx-a11y/label-has-associated-control
                                    <label
                                        key={option.value}
                                        className="zse-survey-cell"
                                    >
                                        <BaseRadio.Root
                                            value={option.value}
                                            className="zse-radio-root"
                                            aria-label={option.label}
                                        >
                                            <BaseRadio.Indicator
                                                className="zse-radio-indicator"
                                                keepMounted
                                            />
                                        </BaseRadio.Root>
                                        <span className="zse-survey-cell-label">
                                            {option.label}
                                        </span>
                                    </label>
                                ))}
                            </BaseRadioGroup>
                            <FieldFooter />
                        </Field.Root>
                    );
                })}
            </div>
        </fieldset>
    );
}
