import type { Messages } from "../../i18n/types";

export interface SurveyOption {
    value: string;
    label: string;
}

// Skala odpowiedzi: własne opcje, zakres liczb (1–5, NPS 0–10) z opisem
// krańców albo gotowa z katalogu tekstów. Kolejność od najbardziej
// pozytywnej, jak series w LikertChart.
export type SurveyScale =
    | readonly SurveyOption[]
    | { min: number; max: number; minLabel?: string; maxLabel?: string }
    | "agreement"
    | "yesNo"
    | "frequency";

// Wartości gotowych skal stałe niezależnie od języka, do zliczania wyników.
const PRESET_VALUES = {
    agreement: ["5", "4", "3", "2", "1"],
    yesNo: ["yes", "no"],
    frequency: ["always", "often", "sometimes", "rarely", "never"],
} as const;

export interface ResolvedScale {
    options: SurveyOption[];
    // Liczby: krótkie pola w rzędzie i opisy krańców pod nimi.
    numeric: boolean;
    minLabel?: string | undefined;
    maxLabel?: string | undefined;
}

export function resolveScale(
    scale: SurveyScale,
    t: Messages["survey"],
): ResolvedScale {
    if (typeof scale === "string")
        return {
            numeric: false,
            options: PRESET_VALUES[scale].map((value, index) => ({
                value,
                label: t[scale][index] ?? value,
            })),
        };
    if (Array.isArray(scale))
        return { numeric: false, options: [...(scale as SurveyOption[])] };
    const { min, max, minLabel, maxLabel } = scale as Exclude<
        SurveyScale,
        string | readonly SurveyOption[]
    >;
    const options: SurveyOption[] = [];
    for (let value = min; value <= max; value += 1)
        options.push({ value: String(value), label: String(value) });
    return { numeric: true, options, minLabel, maxLabel };
}
