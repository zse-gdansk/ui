"use client";

import type { GradeTone } from "../../grades/grades";
import { Tooltip } from "../tooltip/Tooltip";
import { gradeName, useGrades } from "./context";
import { formatDate, formatNumber } from "./format";

export interface GradeProps {
    // Zapis oceny: "4+", "5-", "np". Nieznany zapis stoi bez koloru.
    value: string;
    // Ocena przed poprawą, przekreślona obok.
    previous?: string;
    // Szczegóły w tooltipie: „Sprawdzian · waga 3”.
    category?: string;
    weight?: number;
    date?: Date | string | number;
    comment?: string;
    // Kto wystawił, np. „Tomasz Wójcik”.
    author?: string;
    // Zamiast koloru ze skali, np. "neutral" w tabeli pełnej ocen.
    tone?: GradeTone;
    size?: "sm" | "md";
    className?: string;
}

export function Grade({
    value,
    previous,
    category,
    weight,
    date,
    comment,
    author,
    tone,
    size = "md",
    className,
}: GradeProps) {
    const { t, parse } = useGrades();
    const grade = parse(value);
    const before = previous === undefined ? null : parse(previous);
    const shown = grade?.display ?? value;
    const name = grade ? gradeName(t, grade) : value;

    const when =
        date === undefined ? undefined : formatDate(t.locale, new Date(date));
    const weightText =
        weight === undefined
            ? undefined
            : t.grade.weight(
                  formatNumber(t.locale, weight, weight % 1 ? 1 : 0),
              );
    const meta = [category, weightText].filter(Boolean).join(" · ");
    const improved =
        previous === undefined
            ? undefined
            : t.grade.improvedFrom(before?.display ?? previous);
    const details = [meta, when, author, improved, comment].filter(Boolean);

    const chip = (
        <span
            className={["zse-grade", className].filter(Boolean).join(" ")}
            data-tone={
                tone ??
                (grade?.kind === "grade"
                    ? (grade.step.tone ?? "neutral")
                    : "neutral")
            }
            data-size={size}
            data-mark={grade?.kind === "mark" || undefined}
            // Z tooltipem osiągalny z klawiatury, żeby szczegóły nie były
            // tylko pod myszą.
            {...(details.length > 0 && { tabIndex: 0 })}
        >
            {previous !== undefined && (
                <s className="zse-grade-previous" aria-hidden>
                    {before?.display ?? previous}
                </s>
            )}
            <span aria-hidden>{shown}</span>
            {/* Czytnik dostaje nazwę i szczegóły od razu, bez tooltipa. */}
            <span className="zse-visually-hidden">
                {[`${shown}, ${name}`, ...details].join(", ")}
            </span>
        </span>
    );

    if (details.length === 0) return chip;
    return (
        <Tooltip
            content={
                <span className="zse-grade-details">
                    <span className="zse-grade-details-name">
                        {shown} · {name}
                    </span>
                    {meta && <span>{meta}</span>}
                    {when && <span>{when}</span>}
                    {author && <span>{author}</span>}
                    {improved && <span>{improved}</span>}
                    {comment && (
                        <span className="zse-grade-details-comment">
                            {comment}
                        </span>
                    )}
                </span>
            }
        >
            {chip}
        </Tooltip>
    );
}
