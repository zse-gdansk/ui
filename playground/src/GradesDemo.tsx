import {
    CheckmarkBadge01Icon,
    Delete02Icon,
    Search01Icon,
    UserIcon,
} from "@hugeicons/core-free-icons";
import {
    Button,
    ContextMenu,
    createSearch,
    Input,
    MenuItem,
    MenuSeparator,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableEmpty,
    TableFooter,
    TableHead,
    TableHeader,
    TableNumberCell,
    TableRow,
    toast,
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

type Points = (number | null)[];

const INITIAL: Record<string, Points> = Object.fromEntries(
    NAMES.map((name, row) => [
        name,
        TASKS.map(({ max }, col) => (row * 7 + col * 3) % (max + 1)),
    ]),
);

const sumOf = (points: Points) =>
    points.reduce<number>((a, b) => a + (b ?? 0), 0);
const average = (values: number[]) =>
    format(values.reduce((a, b) => a + b, 0) / values.length);
const format = (value: number) =>
    value.toLocaleString("pl-PL", { maximumFractionDigits: 1 });
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
    const [editing, setEditing] = useState(true);
    const [points, setPoints] = useState(INITIAL);
    const [query, setQuery] = useState("");

    const students = NAMES.map((name) => {
        const row = points[name] ?? [];
        return { name, points: row, sum: sumOf(row) };
    });

    function setPoint(name: string, task: number, value: number | null) {
        setPoints((prev) => ({
            ...prev,
            [name]: (prev[name] ?? []).map((old, i) =>
                i === task ? value : old,
            ),
        }));
    }

    const matching = query.trim()
        ? new Set(
              createSearch(students, { keys: ["name"] })(query).map(
                  (result) => result.item.name,
              ),
          )
        : null;
    const rows = students
        .filter((student) => !matching || matching.has(student.name))
        .toSorted((a, b) => {
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
        <section className="grades">
            <Input
                size="sm"
                leftIcon={Search01Icon}
                placeholder="Szukaj ucznia, np. zajac"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
            />
            <Switch
                label="Edycja punktów"
                checked={editing}
                onCheckedChange={setEditing}
            />
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
                    {rows.length === 0 && (
                        <TableEmpty
                            colSpan={TASKS.length + 2}
                            icon={Search01Icon}
                            title={`Brak uczniów pasujących do „${query.trim()}”`}
                            description="Sprawdź pisownię albo wyczyść wyszukiwanie."
                            actions={
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setQuery("")}
                                >
                                    Wyczyść
                                </Button>
                            }
                        />
                    )}
                    {rows.map((student) => (
                        <TableRow
                            key={student.name}
                            selected={!editing && selected === student.name}
                            {...(!editing && {
                                onClick: () =>
                                    setSelected((prev) =>
                                        prev === student.name
                                            ? null
                                            : student.name,
                                    ),
                            })}
                        >
                            <ContextMenu
                                trigger={
                                    <TableCell sticky="left">
                                        {student.name}
                                    </TableCell>
                                }
                            >
                                <MenuItem
                                    icon={UserIcon}
                                    onClick={() => toast.info(student.name)}
                                >
                                    Profil ucznia
                                </MenuItem>
                                <MenuItem
                                    icon={CheckmarkBadge01Icon}
                                    shortcut="mod+m"
                                    onClick={() => {
                                        TASKS.forEach((task, i) =>
                                            setPoint(student.name, i, task.max),
                                        );
                                        toast.success(
                                            `Maksimum dla: ${student.name}`,
                                        );
                                    }}
                                >
                                    Wszystkie zadania na max
                                </MenuItem>
                                <MenuSeparator />
                                <MenuItem
                                    icon={Delete02Icon}
                                    variant="danger"
                                    onClick={() => {
                                        TASKS.forEach((_, i) =>
                                            setPoint(student.name, i, null),
                                        );
                                        toast.undo(
                                            `Wyczyszczono punkty: ${student.name}`,
                                            {
                                                onUndo: () =>
                                                    toast.info(
                                                        "Cofnięcie w demo nie działa",
                                                    ),
                                            },
                                        );
                                    }}
                                >
                                    Wyczyść punkty
                                </MenuItem>
                            </ContextMenu>
                            {TASKS.map((task, i) => {
                                const value = student.points[i] ?? null;
                                return editing ? (
                                    <TableNumberCell
                                        key={task.id}
                                        label={`Zadanie ${task.number}, ${student.name}`}
                                        value={value}
                                        max={task.max}
                                        onValueChange={(next) =>
                                            setPoint(student.name, i, next)
                                        }
                                    />
                                ) : (
                                    <TableCell key={task.id} numeric>
                                        {value === null ? "–" : format(value)}
                                    </TableCell>
                                );
                            })}
                            <TableCell sticky="right" numeric>
                                {format(student.sum)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell sticky="left">Średnia</TableCell>
                        {TASKS.map((task, i) => (
                            <TableCell key={task.id} numeric>
                                {average(students.map((s) => s.points[i] ?? 0))}
                            </TableCell>
                        ))}
                        <TableCell sticky="right" numeric>
                            {average(students.map((s) => s.sum))}
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </section>
    );
}
