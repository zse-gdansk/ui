// Oceny: skala, odczyt wpisanego tekstu, przeliczanie punktów i średnia.
// Bez Reacta, żeby dało się tego użyć także na serwerze i w schemacie.

export type GradeTone = "neutral" | "success" | "warning" | "danger";

export interface GradeStep {
    // Wartość do średniej, np. 4.
    value: number;
    // Zapis ocenie, np. "4".
    label: string;
    // Skrót, który też da się wpisać: "db".
    short?: string;
    // Pełna nazwa; bez niej z katalogu (t.grade.steps) albo `label`.
    name?: string;
    tone?: GradeTone;
}

export interface GradeModifier {
    // Znak w zapisie i w wartości formularza, np. "+" albo "-".
    symbol: string;
    // O ile zmienia wartość: + to 0.5, − to −0.25.
    delta: number;
    // Znak na ekranie, np. typograficzny minus "−" zamiast "-".
    display?: string;
    // Inne znaki, które znaczą to samo: "−", "–".
    aliases?: readonly string[];
    name?: string;
}

// Wpis bez wartości, pomijany w średniej: „np”, „bz”.
export interface GradeMark {
    label: string;
    name?: string;
}

export interface GradeScale {
    // Od najniższej.
    steps: readonly GradeStep[];
    modifiers: readonly GradeModifier[];
    marks: readonly GradeMark[];
    // Modyfikator na krańcach, np. 6+ i 1−. Domyślnie nie ma takich ocen.
    edgeModifiers?: boolean;
}

// Próg: od ilu procent (punktów albo średniej) jest dana ocena.
export interface GradeThreshold {
    grade: string;
    min: number;
}

export interface GradeConfig {
    scale: GradeScale;
    // Procent punktów → ocena.
    points: readonly GradeThreshold[];
    // Średnia → ocena przewidywana. `min` to wartość średniej, nie procent.
    average: readonly GradeThreshold[];
}

export const polishScale: GradeScale = {
    steps: [
        { value: 1, label: "1", short: "ndst", tone: "danger" },
        { value: 2, label: "2", short: "dop", tone: "warning" },
        { value: 3, label: "3", short: "dst", tone: "neutral" },
        { value: 4, label: "4", short: "db", tone: "neutral" },
        { value: 5, label: "5", short: "bdb", tone: "success" },
        { value: 6, label: "6", short: "cel", tone: "success" },
    ],
    modifiers: [
        { symbol: "+", delta: 0.5 },
        { symbol: "-", delta: -0.25, display: "−", aliases: ["−", "–"] },
    ],
    marks: [{ label: "np" }, { label: "bz" }],
};

export const defaultGradeConfig: GradeConfig = {
    scale: polishScale,
    points: [
        { grade: "1", min: 0 },
        { grade: "2", min: 40 },
        { grade: "3", min: 55 },
        { grade: "4", min: 70 },
        { grade: "5", min: 85 },
        { grade: "6", min: 96 },
    ],
    average: [
        { grade: "1", min: 0 },
        { grade: "2", min: 1.75 },
        { grade: "3", min: 2.75 },
        { grade: "4", min: 3.75 },
        { grade: "5", min: 4.75 },
        { grade: "6", min: 5.5 },
    ],
};

export type ParsedGrade =
    | {
          kind: "grade";
          // Zapis kanoniczny do wartości formularza: "4+", "5-".
          label: string;
          // Zapis na ekran: "5−".
          display: string;
          value: number;
          step: GradeStep;
          modifier: GradeModifier | null;
      }
    | { kind: "mark"; label: string; display: string; mark: GradeMark };

const fold = (text: string) =>
    text.trim().toLocaleLowerCase().replace(/\s+/g, "");

function allowed(scale: GradeScale, step: GradeStep, modifier: GradeModifier) {
    if (scale.edgeModifiers) return true;
    const first = scale.steps[0];
    const last = scale.steps[scale.steps.length - 1];
    if (modifier.delta > 0 && step === last) return false;
    if (modifier.delta < 0 && step === first) return false;
    return true;
}

export function makeGrade(
    scale: GradeScale,
    step: GradeStep,
    modifier: GradeModifier | null,
): ParsedGrade {
    return {
        kind: "grade",
        label: step.label + (modifier?.symbol ?? ""),
        display:
            step.label +
            (modifier ? (modifier.display ?? modifier.symbol) : ""),
        value: step.value + (modifier?.delta ?? 0),
        step,
        modifier,
    };
}

// Wszystkie oceny skali od najniższej, z modyfikatorami: 1, 1+, 2−, 2…
export function gradeOptions(scale: GradeScale): ParsedGrade[] {
    const minus = scale.modifiers.filter((modifier) => modifier.delta < 0);
    const plus = scale.modifiers.filter((modifier) => modifier.delta > 0);
    return scale.steps.flatMap((step) =>
        [...minus, null, ...plus]
            .filter((modifier) => !modifier || allowed(scale, step, modifier))
            .map((modifier) => makeGrade(scale, step, modifier)),
    );
}

// „4+”, „+4”, „db+”, „dobry”, „5 −”, „np”. Nazwy pełne tylko przez
// `names`, bo zależą od języka (katalog).
export function parseGrade(
    input: string,
    scale: GradeScale = polishScale,
    names?: (step: GradeStep) => string,
): ParsedGrade | null {
    const text = fold(input);
    if (!text) return null;

    const mark = scale.marks.find((each) => fold(each.label) === text);
    if (mark)
        return { kind: "mark", label: mark.label, display: mark.label, mark };

    const symbols = scale.modifiers.flatMap((modifier) =>
        [modifier.symbol, ...(modifier.aliases ?? [])].map((symbol) => ({
            symbol,
            modifier,
        })),
    );
    let base = text;
    let modifier: GradeModifier | null = null;
    for (const each of symbols) {
        if (base.endsWith(each.symbol)) {
            base = base.slice(0, -each.symbol.length);
            modifier = each.modifier;
            break;
        }
        if (base.startsWith(each.symbol)) {
            base = base.slice(each.symbol.length);
            modifier = each.modifier;
            break;
        }
    }

    const step = scale.steps.find(
        (each) =>
            fold(each.label) === base ||
            (each.short !== undefined && fold(each.short) === base) ||
            (each.name !== undefined && fold(each.name) === base) ||
            (names !== undefined && fold(names(each)) === base),
    );
    if (!step) return null;
    if (modifier && !allowed(scale, step, modifier)) return null;
    return makeGrade(scale, step, modifier);
}

// Ocena z progów: najwyższa, której próg jest osiągnięty.
export function gradeFromThresholds(
    value: number,
    thresholds: readonly GradeThreshold[],
) {
    const sorted = thresholds.toSorted((a, b) => b.min - a.min);
    // Zapas na błąd zmiennoprzecinkowy: 17/20 to dokładnie 85%.
    return (
        sorted.find((threshold) => value + 1e-9 >= threshold.min)?.grade ?? null
    );
}

// 23 z 30 pkt → { percent: 76.67, grade: "4" }. Bez oceny, gdy max ≤ 0.
export function gradeFromPoints(
    points: number,
    max: number,
    thresholds: readonly GradeThreshold[] = defaultGradeConfig.points,
) {
    if (!(max > 0)) return null;
    const percent = (points / max) * 100;
    const grade = gradeFromThresholds(percent, thresholds);
    return grade === null ? null : { percent, grade };
}

export interface GradeEntry {
    grade: string;
    // Domyślnie 1. Waga 0 wyłącza ocenę ze średniej.
    weight?: number;
}

// Średnia ważona. Znaki (np, bz), nieczytelne wpisy i waga 0 się nie
// liczą. Bez żadnej oceny: null.
export function gradeAverage(
    entries: readonly GradeEntry[],
    scale: GradeScale = polishScale,
) {
    let sum = 0;
    let weights = 0;
    for (const entry of entries) {
        const grade = parseGrade(entry.grade, scale);
        const weight = entry.weight ?? 1;
        if (grade?.kind !== "grade" || !(weight > 0)) continue;
        sum += grade.value * weight;
        weights += weight;
    }
    return weights > 0 ? sum / weights : null;
}

export const predictGrade = (
    average: number,
    thresholds: readonly GradeThreshold[] = defaultGradeConfig.average,
) => gradeFromThresholds(average, thresholds);
