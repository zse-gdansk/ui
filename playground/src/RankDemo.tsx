import {
    Atom01Icon,
    BookOpen01Icon,
    CalculatorIcon,
    ComputerProgramming01Icon,
    Globe02Icon,
    TestTube01Icon,
} from "@hugeicons/core-free-icons";
import { RankList } from "@zse-gdansk/ui";
import { useState } from "react";

const SUBJECTS = [
    {
        value: "mat",
        label: "Matematyka",
        icon: CalculatorIcon,
        description: "Profil techniczny, matura rozszerzona",
    },
    {
        value: "fiz",
        label: "Fizyka",
        icon: Atom01Icon,
        description: "Laboratorium w sali 115",
    },
    { value: "inf", label: "Informatyka", icon: ComputerProgramming01Icon },
    {
        value: "ang",
        label: "Język angielski",
        icon: Globe02Icon,
        description: "Poziom B2+",
    },
    { value: "che", label: "Chemia", icon: TestTube01Icon },
    { value: "pol", label: "Język polski", icon: BookOpen01Icon },
];

const CANDIDATES = [
    {
        value: "jl",
        label: "Julia Lewandowska",
        description: "3C",
        avatar: { name: "Julia Lewandowska" },
    },
    {
        value: "mz",
        label: "Mikołaj Zieliński",
        description: "2A",
        avatar: { name: "Mikołaj Zieliński" },
    },
    {
        value: "hw",
        label: "Hanna Wiśniewska",
        description: "4B",
        avatar: { name: "Hanna Wiśniewska" },
    },
    {
        value: "az",
        label: "Antoni Zając",
        description: "1B",
        avatar: { name: "Antoni Zając" },
    },
];

export function RankDemo() {
    const [subjects, setSubjects] = useState<string[]>([]);

    return (
        <section className="rank-demo">
            <RankList
                label="Rozszerzenia od najważniejszego"
                hint="Liczą się trzy pierwsze. Przeciągnij albo użyj Spacji i strzałek na uchwycie."
                items={SUBJECTS}
                max={3}
                onValueChange={setSubjects}
                name="rozszerzenia"
            />
            <p className="rank-demo-value">
                {subjects.length
                    ? subjects.slice(0, 3).join(" › ")
                    : "Kolejność domyślna"}
            </p>
            <RankList
                label="Kandydaci w kolejności preferencji"
                items={CANDIDATES}
            />
        </section>
    );
}
