import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@zse-gdansk/ui";
import { useState } from "react";

const TASKS = [4, 6, 5, 8, 3, 6, 10, 8].map((max, i) => ({
    id: `zadanie-${i + 1}`,
    number: i + 1,
    max,
}));
const NAMES = [
    "Adamczyk Zofia",
    "Bąk Michał",
    "Czarnecka Lena",
    "Dudek Kacper",
    "Filipek Hanna",
    "Górski Jan",
    "Jankowska Maja",
    "Kaczmarek Filip",
    "Kowalczyk Oliwia",
    "Lewandowski Adam",
    "Mazur Julia",
    "Nowak Szymon",
    "Olszewska Alicja",
    "Pawlak Wiktor",
    "Rutkowska Pola",
    "Sikora Igor",
    "Tomaszewska Nina",
    "Wieczorek Leon",
    "Wróbel Amelia",
    "Zając Tymon",
];

const STUDENTS = NAMES.map((name, row) => {
    const points = TASKS.map(({ max }, col) => (row * 7 + col * 3) % (max + 1));
    return { name, points, sum: points.reduce((a, b) => a + b, 0) };
});
const MAX = TASKS.reduce((a, task) => a + task.max, 0);

export function GradesDemo() {
    const [sort, setSort] = useState<{
        by: "name" | "sum";
        dir: "asc" | "desc";
    }>({
        by: "name",
        dir: "asc",
    });
    const [selected, setSelected] = useState<string | null>(null);

    const rows = STUDENTS.toSorted((a, b) => {
        const order =
            sort.by === "name"
                ? a.name.localeCompare(b.name, "pl")
                : a.sum - b.sum;
        return sort.dir === "asc" ? order : -order;
    });

    function toggle(by: "name" | "sum") {
        setSort((prev) =>
            prev.by === by
                ? { by, dir: prev.dir === "asc" ? "desc" : "asc" }
                : { by, dir: by === "sum" ? "desc" : "asc" },
        );
    }

    return (
        <Table label="Wyniki sprawdzianu, klasa 3C" maxHeight={360} striped>
            <TableHeader>
                <TableRow>
                    <TableHead
                        sticky="left"
                        sort={sort.by === "name" && sort.dir}
                        onSort={() => toggle("name")}
                    >
                        Uczeń
                    </TableHead>
                    {TASKS.map((task) => (
                        <TableHead key={task.id} numeric>
                            Zad. {task.number} / {task.max}
                        </TableHead>
                    ))}
                    <TableHead
                        sticky="right"
                        numeric
                        sort={sort.by === "sum" && sort.dir}
                        onSort={() => toggle("sum")}
                    >
                        Suma / {MAX}
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map((student) => (
                    <TableRow
                        key={student.name}
                        selected={selected === student.name}
                        onClick={() =>
                            setSelected((prev) =>
                                prev === student.name ? null : student.name,
                            )
                        }
                    >
                        <TableCell sticky="left">{student.name}</TableCell>
                        {student.points.map((value, i) => (
                            <TableCell key={TASKS[i]?.id} numeric>
                                {value}
                            </TableCell>
                        ))}
                        <TableCell sticky="right" numeric>
                            {student.sum}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell sticky="left">Średnia</TableCell>
                    {TASKS.map((task, i) => (
                        <TableCell key={task.id} numeric>
                            {(
                                STUDENTS.reduce(
                                    (a, s) => a + (s.points[i] ?? 0),
                                    0,
                                ) / STUDENTS.length
                            ).toFixed(1)}
                        </TableCell>
                    ))}
                    <TableCell sticky="right" numeric>
                        {(
                            STUDENTS.reduce((a, s) => a + s.sum, 0) /
                            STUDENTS.length
                        ).toFixed(1)}
                    </TableCell>
                </TableRow>
            </TableFooter>
        </Table>
    );
}
