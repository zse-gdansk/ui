"use client";

import { type ReactNode, useState } from "react";

import type { GradeThreshold } from "../../grades/grades";
import { NumberField } from "../number-field/NumberField";
import { stepName, useGrades } from "./context";
import { formatNumber } from "./format";

export interface GradeThresholdsProps {
    value?: readonly GradeThreshold[];
    defaultValue?: readonly GradeThreshold[];
    onValueChange?: (value: GradeThreshold[]) => void;
    // Punkty za cały sprawdzian: pod progiem „od 21 pkt”.
    maxPoints?: number;
    label?: ReactNode;
    disabled?: boolean;
}

const byMin = (a: GradeThreshold, b: GradeThreshold) => a.min - b.min;

// Progi procentowe ocen, np. do przeliczania punktów. Najniższa ocena
// zawsze od 0%, więc nie ma pola.
export function GradeThresholds({
    value,
    defaultValue,
    onValueChange,
    maxPoints,
    label,
    disabled = false,
}: GradeThresholdsProps) {
    const { config, t, parse } = useGrades();
    const [own, setOwn] = useState<readonly GradeThreshold[]>(
        () => defaultValue ?? config.points,
    );
    const thresholds = (value ?? own).toSorted(byMin);

    function change(grade: string, min: number | null) {
        if (min === null) return;
        const next = thresholds.map((threshold) =>
            threshold.grade === grade ? { ...threshold, min } : threshold,
        );
        if (value === undefined) setOwn(next);
        onValueChange?.(next);
    }

    const percent = (n: number) =>
        `${formatNumber(t.locale, n, n % 1 ? 1 : 0)}%`;

    return (
        <fieldset className="zse-grade-thresholds" disabled={disabled}>
            {label != null && (
                <legend className="zse-grade-thresholds-label">{label}</legend>
            )}
            <div className="zse-grade-thresholds-grid">
                {thresholds.slice(1).map((threshold, index) => {
                    const lower = thresholds[index];
                    const upper = thresholds[index + 2];
                    const grade = parse(threshold.grade);
                    const name =
                        grade?.kind === "grade"
                            ? stepName(t, grade.step)
                            : threshold.grade;
                    const top = upper
                        ? upper.min % 1 || threshold.min % 1
                            ? upper.min
                            : upper.min - 1
                        : 100;
                    const range = t.grade.range(
                        percent(threshold.min),
                        percent(top),
                    );
                    const points =
                        maxPoints === undefined
                            ? null
                            : t.grade.pointsFrom(
                                  formatNumber(
                                      t.locale,
                                      Math.ceil(
                                          (threshold.min / 100) * maxPoints -
                                              1e-9,
                                      ),
                                  ),
                              );
                    const wrong =
                        (lower !== undefined && threshold.min <= lower.min) ||
                        threshold.min > 100;
                    return (
                        <NumberField
                            key={threshold.grade}
                            size="sm"
                            label={t.grade.from(
                                `${grade?.display ?? threshold.grade} ${name}`,
                            )}
                            value={threshold.min}
                            onValueChange={(min) =>
                                change(threshold.grade, min)
                            }
                            min={0}
                            max={100}
                            step={1}
                            suffix="%"
                            hideButtons
                            disabled={disabled}
                            hint={[range, points].filter(Boolean).join(" · ")}
                            error={wrong ? t.grade.thresholdOrder : undefined}
                        />
                    );
                })}
            </div>
        </fieldset>
    );
}
