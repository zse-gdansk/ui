"use client";

import { Field } from "@base-ui/react/field";
import { Slider as BaseSlider } from "@base-ui/react/slider";
import { useState, type ReactNode } from "react";

import { useMessages } from "../../i18n/context";
import { FieldFooter } from "../field/FieldFooter";

export interface SliderMark {
    value: number;
    label?: ReactNode;
}

export interface SliderProps {
    label?: ReactNode;
    hint?: ReactNode;
    error?: string | undefined;
    // Liczba albo [od, do] dla zakresu.
    value?: number | number[];
    defaultValue?: number | number[];
    onValueChange?: (value: number | number[]) => void;
    // Po puszczeniu suwaka: tu zapisuj do API, nie w onValueChange.
    onValueCommitted?: (value: number | number[]) => void;
    min?: number;
    max?: number;
    step?: number;
    // Shift + strzałka / PageUp.
    largeStep?: number;
    // Kreski z podpisami pod torem, np. progi ocen.
    marks?: readonly (number | SliderMark)[];
    format?: Intl.NumberFormatOptions;
    // Wartość w nagłówku obok etykiety.
    showValue?: boolean;
    name?: string;
    disabled?: boolean;
}

export function Slider({
    label,
    hint,
    error,
    value,
    defaultValue,
    onValueChange,
    onValueCommitted,
    min = 0,
    max = 100,
    step = 1,
    largeStep,
    marks,
    format,
    showValue = true,
    name,
    disabled = false,
}: SliderProps) {
    const t = useMessages();
    const [internal, setInternal] = useState<number | number[]>(
        defaultValue ?? min,
    );
    const current = value ?? internal;
    const values = Array.isArray(current) ? current : [current];
    const formatter = new Intl.NumberFormat(t.locale, format);
    const text = values.map((item) => formatter.format(item)).join("–");
    const position = (item: number) =>
        `${((item - min) / (max - min || 1)) * 100}%`;

    return (
        <Field.Root
            className="zse-input zse-slider"
            disabled={disabled}
            {...(name !== undefined && { name })}
            {...(error && { invalid: true })}
        >
            <BaseSlider.Root
                className="zse-slider-root"
                value={current}
                min={min}
                max={max}
                step={step}
                locale={t.locale}
                disabled={disabled}
                {...(largeStep !== undefined && { largeStep })}
                {...(format && { format })}
                onValueChange={(next) => {
                    if (value === undefined) setInternal(next);
                    onValueChange?.(next);
                }}
                {...(onValueCommitted && {
                    onValueCommitted: (next: number | number[]) =>
                        onValueCommitted(next),
                })}
            >
                {(label != null || showValue) && (
                    <div className="zse-slider-header">
                        {label != null && label !== false && (
                            <BaseSlider.Label className="zse-input-label">
                                {label}
                            </BaseSlider.Label>
                        )}
                        {showValue && (
                            <span className="zse-slider-value">{text}</span>
                        )}
                    </div>
                )}
                <BaseSlider.Control className="zse-slider-control">
                    <BaseSlider.Track className="zse-slider-track">
                        <BaseSlider.Indicator className="zse-slider-indicator" />
                        {values.map((item, index) => (
                            <BaseSlider.Thumb
                                // Kciuki mają stałe miejsca w tablicy.
                                // oxlint-disable-next-line react/no-array-index-key
                                key={index}
                                index={index}
                                className="zse-slider-thumb"
                                getAriaLabel={
                                    values.length > 1
                                        ? (i) =>
                                              i === 0
                                                  ? t.slider.from
                                                  : t.slider.to
                                        : null
                                }
                            >
                                <span className="zse-slider-bubble" aria-hidden>
                                    {formatter.format(item)}
                                </span>
                            </BaseSlider.Thumb>
                        ))}
                    </BaseSlider.Track>
                </BaseSlider.Control>
                {marks && marks.length > 0 && (
                    <div className="zse-slider-marks" aria-hidden>
                        {marks.map((mark) => {
                            const item =
                                typeof mark === "number"
                                    ? { value: mark }
                                    : mark;
                            return (
                                <span
                                    key={item.value}
                                    className="zse-slider-mark"
                                    data-active={
                                        (values.length > 1
                                            ? item.value >=
                                                  (values[0] ?? min) &&
                                              item.value <=
                                                  (values.at(-1) ?? max)
                                            : item.value <=
                                              (values[0] ?? min)) || undefined
                                    }
                                    data-edge={
                                        item.value <= min
                                            ? "start"
                                            : item.value >= max
                                              ? "end"
                                              : undefined
                                    }
                                    style={{ left: position(item.value) }}
                                >
                                    <span className="zse-slider-tick" />
                                    {item.label ?? formatter.format(item.value)}
                                </span>
                            );
                        })}
                    </div>
                )}
            </BaseSlider.Root>
            <FieldFooter error={error} hint={hint} />
        </Field.Root>
    );
}
