"use client";

import { Meter as BaseMeter } from "@base-ui/react/meter";
import { Progress as BaseProgress } from "@base-ui/react/progress";
import type { CSSProperties, ReactNode } from "react";

type Tone = "accent" | "success" | "warning" | "danger";
type Size = "sm" | "md" | "lg";
type ShowValue = boolean | "percent" | "value" | "fraction";

interface SharedProps {
    value: number;
    min?: number;
    max?: number;
    label?: ReactNode;
    showValue?: ShowValue;
    size?: Size;
    tone?: Tone;
    // Pierścień zamiast paska, np. na kafelkach dashboardu.
    shape?: "bar" | "ring";
    // Średnica pierścienia w px.
    ringSize?: number;
    // Pasek z tylu kawałków, jak bateria. Wartość zaokrągla się w górę
    // do pełnego kawałka.
    segments?: number;
    className?: string;
}

const NUMBER = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 1 });
const PERCENT = new Intl.NumberFormat("pl-PL", {
    style: "percent",
    maximumFractionDigits: 0,
});

function ratio(value: number, min: number, max: number) {
    return max > min
        ? Math.min(Math.max((value - min) / (max - min), 0), 1)
        : 0;
}

function valueText(show: ShowValue, value: number, min: number, max: number) {
    if (show === "value") return NUMBER.format(value);
    if (show === "fraction")
        return `${NUMBER.format(value)} / ${NUMBER.format(max)}`;
    return PERCENT.format(ratio(value, min, max));
}

function Visual({
    fill,
    shape,
    ringSize,
    segments,
    center,
    indeterminate = false,
    Track,
}: {
    fill: number;
    shape: "bar" | "ring";
    ringSize: number;
    segments: number | undefined;
    center: ReactNode;
    indeterminate?: boolean;
    Track: typeof BaseProgress.Track | typeof BaseMeter.Track;
}) {
    const shown =
        segments && segments > 1 ? Math.ceil(fill * segments) / segments : fill;
    const style = {
        "--zse-progress": shown,
        ...(segments && segments > 1 && { "--segments": segments }),
        ...(shape === "ring" && { "--ring-size": `${ringSize}px` }),
    } as CSSProperties;

    if (shape === "ring")
        return (
            <Track
                className="zse-progress-ring"
                data-indeterminate={indeterminate || undefined}
                style={style}
            >
                {center != null && (
                    <span className="zse-progress-ring-value">{center}</span>
                )}
            </Track>
        );

    return (
        <Track
            className="zse-progress-track"
            data-segmented={segments && segments > 1 ? "" : undefined}
            style={style}
        >
            <span
                className="zse-progress-indicator"
                data-indeterminate={indeterminate || undefined}
            />
        </Track>
    );
}

export interface ProgressProps extends Omit<SharedProps, "value"> {
    // null: czas nieznany, pasek krąży.
    value: number | null;
}

// Postęp czegoś, co trwa: wysyłka, import ocen. Po dojściu do końca
// przechodzi w kolor sukcesu.
export function Progress({
    value,
    min = 0,
    max = 100,
    label,
    showValue = false,
    size = "md",
    tone = "accent",
    shape = "bar",
    ringSize = 40,
    segments,
    className,
}: ProgressProps) {
    const indeterminate = value === null;
    const fill = indeterminate ? 0 : ratio(value, min, max);
    const text =
        showValue && !indeterminate
            ? valueText(showValue, value, min, max)
            : null;
    const ringCenter = shape === "ring" && ringSize >= 36 ? text : null;

    return (
        <BaseProgress.Root
            value={value}
            min={min}
            max={max}
            locale="pl-PL"
            className={["zse-progress", className].filter(Boolean).join(" ")}
            data-size={size}
            data-tone={tone}
            data-shape={shape}
        >
            {(label != null || (text && shape === "bar")) && (
                <span className="zse-progress-header">
                    {label != null && (
                        <BaseProgress.Label className="zse-progress-label">
                            {label}
                        </BaseProgress.Label>
                    )}
                    {text && shape === "bar" && (
                        <span className="zse-progress-value">{text}</span>
                    )}
                </span>
            )}
            <Visual
                fill={fill}
                shape={shape}
                ringSize={ringSize}
                segments={segments}
                center={ringCenter}
                indeterminate={indeterminate}
                Track={BaseProgress.Track}
            />
        </BaseProgress.Root>
    );
}

export interface MeterProps extends SharedProps {
    low?: number;
    high?: number;
    optimum?: number;
}

type Region = "low" | "mid" | "high";

function regionOf(value: number, low: number, high: number): Region {
    return value < low ? "low" : value > high ? "high" : "mid";
}

function meterTone(
    value: number,
    min: number,
    max: number,
    low: number | undefined,
    high: number | undefined,
    optimum: number | undefined,
): Tone | undefined {
    if (low === undefined && high === undefined) return undefined;
    const lo = low ?? min;
    const hi = high ?? max;
    const best = regionOf(optimum ?? max, lo, hi);
    const here = regionOf(value, lo, hi);
    if (here === best) return "success";
    if (best === "mid" || here === "mid") return "warning";
    return "danger";
}

// Stały pomiar w zakresie: frekwencja, oddane prace, wynik głosowania.
export function Meter({
    value,
    min = 0,
    max = 100,
    label,
    showValue = false,
    size = "md",
    tone,
    shape = "bar",
    ringSize = 40,
    segments,
    low,
    high,
    optimum,
    className,
}: MeterProps) {
    const fill = ratio(value, min, max);
    const text = showValue ? valueText(showValue, value, min, max) : null;
    const resolved =
        tone ?? meterTone(value, min, max, low, high, optimum) ?? "accent";

    return (
        <BaseMeter.Root
            value={value}
            min={min}
            max={max}
            locale="pl-PL"
            className={["zse-progress", className].filter(Boolean).join(" ")}
            data-size={size}
            data-tone={resolved}
            data-shape={shape}
        >
            {(label != null || (text && shape === "bar")) && (
                <span className="zse-progress-header">
                    {label != null && (
                        <BaseMeter.Label className="zse-progress-label">
                            {label}
                        </BaseMeter.Label>
                    )}
                    {text && shape === "bar" && (
                        <span className="zse-progress-value">{text}</span>
                    )}
                </span>
            )}
            <Visual
                fill={fill}
                shape={shape}
                ringSize={ringSize}
                segments={segments}
                center={shape === "ring" && ringSize >= 36 ? text : null}
                Track={BaseMeter.Track}
            />
        </BaseMeter.Root>
    );
}
