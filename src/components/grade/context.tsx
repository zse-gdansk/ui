"use client";

import { createContext, type ReactNode, use, useMemo } from "react";

import {
    defaultGradeConfig,
    type GradeConfig,
    type GradeStep,
    type ParsedGrade,
    parseGrade,
} from "../../grades/grades";
import { useMessages } from "../../i18n/context";
import type { Messages } from "../../i18n/types";

const GradesContext = createContext<GradeConfig>(defaultGradeConfig);

export interface GradesProviderProps {
    // Skala i progi szkoły; brakujące części z domyślnych (1–6, progi
    // 40/55/70/85/96%).
    config: Partial<GradeConfig>;
    children: ReactNode;
}

export function GradesProvider({ config, children }: GradesProviderProps) {
    const parent = use(GradesContext);
    const value = useMemo(() => ({ ...parent, ...config }), [parent, config]);
    return <GradesContext value={value}>{children}</GradesContext>;
}

export const stepName = (t: Messages, step: GradeStep) =>
    step.name ?? t.grade.steps[step.value] ?? step.label;

// „dobry plus”, „nieprzygotowany”.
export function gradeName(t: Messages, grade: ParsedGrade) {
    if (grade.kind === "mark")
        return grade.mark.name ?? t.grade.marks[grade.label] ?? grade.label;
    const modifier = grade.modifier
        ? (grade.modifier.name ?? t.grade.modifiers[grade.modifier.symbol])
        : undefined;
    return [stepName(t, grade.step), modifier].filter(Boolean).join(" ");
}

export function useGrades() {
    const config = use(GradesContext);
    const t = useMessages();
    return {
        config,
        t,
        parse: (input: string) =>
            parseGrade(input, config.scale, (step) => stepName(t, step)),
    };
}
