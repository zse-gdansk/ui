import {
    Grade,
    GradeAverage,
    GradeField,
    GradeThresholds,
    NumberField,
    type GradeThreshold,
    defaultGradeConfig,
    gradeFromPoints,
} from "@zse-gdansk/ui";
import { useState } from "react";

const HISTORY = [
    {
        value: "5",
        category: "Sprawdzian",
        weight: 3,
        date: "2026-09-12",
        author: "Magdalena Krawczyk",
    },
    {
        value: "4+",
        previous: "2",
        category: "Kartkówka",
        weight: 2,
        date: "2026-09-19",
        comment: "Poprawa po konsultacjach.",
    },
    { value: "3-", category: "Odpowiedź ustna", weight: 1 },
    { value: "np", category: "Przygotowanie", weight: 1 },
    { value: "6", category: "Konkurs", weight: 2 },
    { value: "1", category: "Kartkówka", weight: 2 },
];

export function GradeDemo() {
    const [grade, setGrade] = useState<string | null>("4+");
    const [thresholds, setThresholds] = useState<GradeThreshold[]>([
        ...defaultGradeConfig.points,
    ]);
    const [points, setPoints] = useState(23);
    const result = gradeFromPoints(points, 30, thresholds);

    return (
        <section className="grade-demo">
            <div className="button-row">
                {HISTORY.map((entry) => (
                    <Grade
                        key={`${entry.category}:${entry.value}`}
                        {...entry}
                    />
                ))}
                <GradeAverage
                    grades={HISTORY.map((entry) => ({
                        grade: entry.value,
                        weight: entry.weight,
                    }))}
                    predict
                />
            </div>

            <div className="button-row">
                <Grade value="5" tone="neutral" />
                <Grade value="4+" size="sm" />
                <Grade value="bz" size="sm" />
                <Grade value="coś" />
                <GradeAverage grades={[]} size="sm" />
            </div>

            <div className="fields grade-demo-fields">
                <GradeField
                    label="Ocena"
                    value={grade}
                    onValueChange={setGrade}
                    hint={`Wartość: ${grade ?? "pusta"}. Wpisz np. db+, +4 albo dobry.`}
                />
                <GradeField
                    label="Siatka po wejściu w pole"
                    autoOpen
                    hint="autoOpen: fokus zostaje w polu, dalej można pisać"
                />
                <GradeField
                    label="Siatka na dotyku"
                    autoOpen="touch"
                    hint='autoOpen="touch": na telefonie bez klawiatury'
                />
                <GradeField label="Bez np i bz" marks={false} size="sm" />
                <GradeField label="Wyłączone" defaultValue="5" disabled />
            </div>

            <GradeThresholds
                label="Progi ocen ze sprawdzianu (30 pkt)"
                value={thresholds}
                onValueChange={setThresholds}
                maxPoints={30}
            />
            <div className="button-row grade-demo-points">
                <NumberField
                    label="Punkty ze sprawdzianu"
                    value={points}
                    onValueChange={(next) => setPoints(next ?? 0)}
                    min={0}
                    max={30}
                    suffix="/ 30 pkt"
                    size="sm"
                />
                {result && <Grade value={result.grade} />}
            </div>
        </section>
    );
}
