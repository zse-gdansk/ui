import {
    SegmentedControl,
    Timetable,
    toast,
    type TimeSlot,
    type TimetableLesson,
} from "@zse-gdansk/ui";
import { useState } from "react";

// Dzwonki ZSE; ten sam plan co w TimePicker.
const SLOTS: TimeSlot[] = [
    ["07:45", "08:30"],
    ["08:40", "09:25"],
    ["09:35", "10:20"],
    ["10:35", "11:20"],
    ["11:30", "12:15"],
    ["12:25", "13:10"],
    ["13:20", "14:05"],
    ["14:10", "14:55"],
    ["15:00", "15:45"],
].map(([start, end], index) => ({
    label: String(index + 1),
    start: start ?? "",
    end: end ?? "",
}));

const COLORS: Record<string, string> = {
    Matematyka: "var(--chart-1)",
    "Język polski": "var(--chart-2)",
    "Język angielski": "var(--chart-3)",
    "Język niemiecki": "var(--chart-3)",
    Fizyka: "var(--chart-4)",
    "Pracownia elektryczna": "var(--chart-5)",
    "Maszyny elektryczne": "var(--chart-6)",
    Historia: "var(--chart-7)",
    WF: "var(--chart-8)",
};

type Row = [
    day: number,
    slot: number,
    subject: string,
    room: string,
    teacher: string,
    extra?: Partial<TimetableLesson>,
];

// Przykładowy plan klasy 3C, nie z prawdziwego dziennika.
const PLAN: Row[] = [
    [1, 0, "Matematyka", "112", "A. Nowak"],
    [1, 1, "Język polski", "204", "M. Wiśniewska"],
    [1, 2, "Język angielski", "301", "K. Lewandowska", { group: "gr. 1" }],
    [1, 2, "Język niemiecki", "302", "P. Zając", { group: "gr. 2" }],
    [1, 3, "Pracownia elektryczna", "P4", "J. Kamiński", { span: 2 }],
    [1, 5, "Historia", "208", "T. Wójcik"],
    [2, 1, "Fizyka", "115", "E. Kozłowska"],
    [
        2,
        2,
        "Matematyka",
        "112",
        "A. Nowak",
        {
            status: "substitute",
            substitute: { teacher: "B. Dąbrowski", room: "114" },
        },
    ],
    [2, 3, "Maszyny elektryczne", "P2", "R. Szymański", { span: 2 }],
    [2, 5, "WF", "sala gim.", "D. Jankowski", { status: "cancelled" }],
    [2, 6, "WF", "sala gim.", "D. Jankowski", { status: "cancelled" }],
    [3, 0, "Język polski", "204", "M. Wiśniewska"],
    [3, 1, "Matematyka", "112", "A. Nowak", { note: "sprawdzian" }],
    [3, 2, "Fizyka", "115", "E. Kozłowska"],
    [3, 4, "Język angielski", "301", "K. Lewandowska", { group: "gr. 1" }],
    [3, 4, "Język niemiecki", "302", "P. Zając", { group: "gr. 2" }],
    [3, 5, "Historia", "208", "T. Wójcik"],
    [4, 2, "Pracownia elektryczna", "P4", "J. Kamiński", { span: 3 }],
    [4, 5, "Matematyka", "112", "A. Nowak"],
    [4, 6, "Język polski", "204", "M. Wiśniewska"],
    [5, 0, "Maszyny elektryczne", "P2", "R. Szymański"],
    [5, 1, "Matematyka", "112", "A. Nowak"],
    [5, 2, "WF", "sala gim.", "D. Jankowski"],
    [5, 3, "Język polski", "204", "M. Wiśniewska"],
];

const LESSONS: TimetableLesson[] = PLAN.map(
    ([day, slot, subject, room, teacher, extra], index) => {
        const lesson: TimetableLesson = {
            id: String(index),
            day,
            slot,
            subject,
            room,
            teacher,
        };
        const color = COLORS[subject];
        if (color) lesson.color = color;
        return Object.assign(lesson, extra);
    },
);

// Poniedziałek bieżącego tygodnia.
const MONDAY = (() => {
    const date = new Date();
    date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
    date.setHours(0, 0, 0, 0);
    return date;
})();

export function TimetableDemo() {
    const [width, setWidth] = useState("full");

    return (
        <section className="timetable-demo">
            <SegmentedControl
                aria-label="Szerokość"
                size="sm"
                value={width}
                onValueChange={setWidth}
                options={[
                    { value: "full", label: "Cały tydzień" },
                    { value: "narrow", label: "Wąska kolumna" },
                ]}
            />
            <div
                className="timetable-demo-frame"
                data-narrow={width === "narrow" || undefined}
            >
                <Timetable
                    label="Plan lekcji klasy 3C"
                    slots={SLOTS}
                    lessons={LESSONS}
                    week={MONDAY}
                    onLessonClick={(lesson) =>
                        toast(`${lesson.subject}, sala ${lesson.room}`)
                    }
                />
            </div>
        </section>
    );
}
