"use client";

import {
    type GradeEntry,
    gradeAverage,
    predictGrade,
} from "../../grades/grades";
import { useGrades } from "./context";
import { formatNumber } from "./format";
import { Grade } from "./Grade";

export interface GradeAverageProps {
    grades: readonly GradeEntry[];
    // Ocena przewidywana obok średniej, z progów `average` z GradesProvider.
    predict?: boolean;
    // Miejsca po przecinku.
    digits?: number;
    // Podpis przed liczbą; domyślnie „Średnia”, false bez podpisu.
    label?: string | false;
    size?: "sm" | "md";
}

// „Średnia 4,37 [4]”: ważona, bez np i bz.
export function GradeAverage({
    grades,
    predict = false,
    digits = 2,
    label,
    size = "md",
}: GradeAverageProps) {
    const { config, t } = useGrades();
    const average = gradeAverage(grades, config.scale);
    const predicted =
        predict && average !== null
            ? predictGrade(average, config.average)
            : null;
    const caption = label === false ? null : (label ?? t.grade.average);
    const number =
        average === null ? null : formatNumber(t.locale, average, digits);

    return (
        <span className="zse-grade-average" data-size={size}>
            {caption && (
                <span className="zse-grade-average-label">{caption}</span>
            )}
            <span className="zse-grade-average-value">
                {number ?? t.grade.noAverage}
            </span>
            {predicted !== null && (
                <Grade value={predicted} size={size === "md" ? "md" : "sm"} />
            )}
        </span>
    );
}
