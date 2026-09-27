import { Button } from "@zse-gdansk/ui";
import {
    BarChart,
    DonutChart,
    HeatmapChart,
    LikertChart,
    LineChart,
} from "@zse-gdansk/ui/charts";
import { useState } from "react";

// Dane przykładowe do demo, nie z prawdziwej szkoły.
const ATTENDANCE = [
    { month: "Wrz", klasa: 96, szkola: 94 },
    { month: "Paź", klasa: 93, szkola: 92 },
    { month: "Lis", klasa: 88, szkola: 90 },
    { month: "Gru", klasa: 85, szkola: 87 },
    { month: "Sty", klasa: 90, szkola: 89 },
    { month: "Lut", klasa: 91, szkola: 90 },
];

const VOTES = [
    { name: "Julia Lewandowska", votes: 142 },
    { name: "Mikołaj Zieliński", votes: 118 },
    { name: "Hanna Wiśniewska", votes: 97 },
    { name: "Antoni Zając", votes: 64 },
];

const POINTS = [
    { task: "Zad. 1", "3A": 8.2, "3B": 7.4, "3C": 9.1 },
    { task: "Zad. 2", "3A": 6.5, "3B": 7.9, "3C": 7.2 },
    { task: "Zad. 3", "3A": 4.1, "3B": 5.3, "3C": 6.0 },
    { task: "Zad. 4", "3A": 7.7, "3B": 6.8, "3C": 8.4 },
];

const SURVEY = [
    { label: "Tak", value: 312 },
    { label: "Raczej tak", value: 184 },
    { label: "Raczej nie", value: 61 },
    { label: "Nie", value: 23 },
];

const percent = (value: number) => `${value}%`;

const LIKERT = [
    {
        question: "Lekcje są prowadzone ciekawie",
        yes: 142,
        rather: 188,
        unsure: 96,
        ratherNot: 61,
        no: 23,
    },
    {
        question: "Wiem, za co dostaję oceny",
        yes: 231,
        rather: 164,
        unsure: 48,
        ratherNot: 40,
        no: 27,
    },
    {
        question: "W szkole czuję się bezpiecznie",
        yes: 305,
        rather: 142,
        unsure: 31,
        ratherNot: 18,
        no: 14,
    },
    {
        question: "Mam za dużo zadań domowych",
        yes: 118,
        rather: 97,
        unsure: 72,
        ratherNot: 151,
        no: 72,
    },
    {
        question: "Chcę zajęć dodatkowych po lekcjach",
        yes: 87,
        rather: 124,
        unsure: 139,
        ratherNot: 0,
        no: 0,
    },
];

const DAYS = ["Pn", "Wt", "Śr", "Cz", "Pt"];
const DAY_NAMES: Record<string, string> = {
    Pn: "Poniedziałek",
    Wt: "Wtorek",
    Śr: "Środa",
    Cz: "Czwartek",
    Pt: "Piątek",
};
const LESSONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Frekwencja liczona z indeksów: słabsze pierwsze lekcje w poniedziałek i
// ostatnie w piątek; w piątek bez 9. lekcji.
const PRESENCE = DAYS.flatMap((day, dayIndex) =>
    LESSONS.filter((lesson) => !(day === "Pt" && lesson === 9)).map(
        (lesson) => ({
            day,
            lesson,
            value: Math.round(
                94 -
                    (dayIndex === 0 && lesson <= 2 ? 14 - lesson * 3 : 0) -
                    (dayIndex === 4 ? lesson * 2 : 0) -
                    ((dayIndex * 7 + lesson * 3) % 5),
            ),
        }),
    ),
);

export function ChartsDemo() {
    const [loading, setLoading] = useState(false);
    const [empty, setEmpty] = useState(false);

    return (
        <section className="charts-demo">
            <div className="button-row">
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setLoading((value) => !value)}
                >
                    {loading ? "Koniec wczytywania" : "Odśwież dane"}
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEmpty((value) => !value)}
                >
                    {empty ? "Pokaż dane" : "Bez danych"}
                </Button>
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <h3>Frekwencja</h3>
                    <LineChart
                        label="Frekwencja klasy 3C i szkoły w miesiącach"
                        data={empty ? [] : ATTENDANCE}
                        x="month"
                        xLabel="Miesiąc"
                        series={[
                            { key: "klasa", label: "Klasa 3C" },
                            { key: "szkola", label: "Cała szkoła" },
                        ]}
                        format={percent}
                        loading={loading}
                    />
                </div>

                <div className="chart-card">
                    <h3>Wybory do samorządu</h3>
                    <BarChart
                        label="Głosy na kandydatów"
                        data={empty ? [] : VOTES}
                        x="name"
                        xLabel="Kandydat"
                        series={[{ key: "votes", label: "Głosy" }]}
                        horizontal
                        height={220}
                        loading={loading}
                    />
                </div>

                <div className="chart-card">
                    <h3>Średnia punktów za zadania</h3>
                    <BarChart
                        label="Średnia punktów za zadania w klasach 3A, 3B i 3C"
                        data={empty ? [] : POINTS}
                        x="task"
                        xLabel="Zadanie"
                        series={[
                            { key: "3A", label: "3A" },
                            { key: "3B", label: "3B" },
                            { key: "3C", label: "3C" },
                        ]}
                        loading={loading}
                    />
                </div>

                <div className="chart-card">
                    <h3>Ankieta: czy lekcje zdalne były pomocne?</h3>
                    <DonutChart
                        label="Odpowiedzi w ankiecie o lekcjach zdalnych"
                        data={empty ? [] : SURVEY}
                        totalLabel="odpowiedzi"
                        palette="diverging"
                        loading={loading}
                    />
                </div>

                <div className="chart-card chart-card-wide">
                    <h3>Ankieta uczniów</h3>
                    <LikertChart
                        label="Odpowiedzi uczniów w ankiecie szkolnej"
                        data={empty ? [] : LIKERT}
                        x="question"
                        xLabel="Pytanie"
                        series={[
                            { key: "yes", label: "Tak" },
                            { key: "rather", label: "Raczej tak" },
                            { key: "unsure", label: "Nie wiem" },
                            { key: "ratherNot", label: "Raczej nie" },
                            { key: "no", label: "Nie" },
                        ]}
                        loading={loading}
                    />
                </div>

                <div className="chart-card chart-card-wide">
                    <h3>Frekwencja 3C: dni i lekcje</h3>
                    <HeatmapChart
                        label="Frekwencja klasy 3C według dnia tygodnia i lekcji"
                        data={empty ? [] : PRESENCE}
                        x="lesson"
                        y="day"
                        value="value"
                        xCategories={LESSONS}
                        yCategories={DAYS}
                        formatX={(lesson) => `${lesson}.`}
                        formatY={(day) => DAY_NAMES[day] ?? String(day)}
                        tooltipTitle={(lesson, day) =>
                            `${DAY_NAMES[day] ?? day}, ${lesson}. lekcja`
                        }
                        yLabel="Dzień"
                        valueLabel="frekwencja"
                        format={percent}
                        emphasize="low"
                        loading={loading}
                    />
                </div>
            </div>
        </section>
    );
}
