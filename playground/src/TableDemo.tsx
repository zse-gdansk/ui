import {
    ArrowLeftRightIcon,
    Delete02Icon,
    Mail01Icon,
    PencilEdit02Icon,
    SearchRemoveIcon,
    ViewIcon,
} from "@hugeicons/core-free-icons";
import {
    Badge,
    Button,
    Highlight,
    MenuItem,
    MenuRadioGroup,
    MenuRadioItem,
    MenuSeparator,
    MenuSub,
    Pagination,
    Table,
    TableActions,
    TableActionsHead,
    TableBody,
    TableCell,
    TableEmpty,
    TableHead,
    TableHeader,
    TableRow,
    TableSelectCell,
    TableSelectHead,
    TableToolbar,
    confirm,
    Menu,
    toast,
    useTable,
} from "@zse-gdansk/ui";
import { useState } from "react";

const FIRST = [
    "Anna",
    "Jakub",
    "Zofia",
    "Szymon",
    "Łucja",
    "Mikołaj",
    "Julia",
    "Franciszek",
    "Maja",
    "Antoni",
    "Hanna",
    "Stanisław",
];
const LAST = [
    "Nowak",
    "Kowalska",
    "Wiśniewski",
    "Zając",
    "Wójcik",
    "Kamińska",
    "Lewandowski",
    "Zielińska",
    "Szymański",
    "Dąbrowska",
    "Kozłowski",
    "Jankowska",
];
const CLASSES = ["1A", "1B", "2A", "2C", "3C", "4B"];

interface Student {
    id: number;
    name: string;
    className: string;
    points: number | null;
    attendance: number;
    status: "active" | "individual" | "left";
}

// Stałe dane do demo, liczone z indeksu, żeby się nie zmieniały.
const STUDENTS: Student[] = Array.from({ length: 64 }, (_, index) => ({
    id: index + 1,
    name: `${FIRST[(index * 5) % FIRST.length]} ${LAST[(index * 7) % LAST.length]}`,
    className: CLASSES[index % CLASSES.length] ?? "1A",
    points: index % 11 === 0 ? null : (index * 37) % 101,
    attendance: 70 + ((index * 13) % 31),
    status:
        index % 17 === 0 ? "left" : index % 9 === 0 ? "individual" : "active",
}));

const STATUS = {
    active: { label: "Uczy się", tone: "success" },
    individual: { label: "Tok indywidualny", tone: "warning" },
    left: { label: "Skreślony", tone: "neutral" },
} as const;

const SEARCH = ["name"] as const;

export function TableDemo() {
    const [students, setStudents] = useState(STUDENTS);

    const remove = (student: Student) => {
        const previous = students;
        setStudents(students.filter((item) => item.id !== student.id));
        toast.undo(`Usunięto: ${student.name}`, {
            onUndo: () => setStudents(previous),
        });
    };
    const move = (student: Student, className: string) =>
        setStudents(
            students.map((item) =>
                item.id === student.id ? { ...item, className } : item,
            ),
        );

    const table = useTable({
        data: students,
        search: SEARCH,
        sortBy: {
            name: (student) => student.name,
            className: (student) => student.className,
            points: { value: (student) => student.points, first: "desc" },
            attendance: {
                value: (student) => student.attendance,
                first: "desc",
            },
        },
        filters: {
            className: {
                label: "Klasa",
                value: (student) => student.className,
            },
            status: {
                label: "Status",
                value: (student) => student.status,
                options: Object.entries(STATUS).map(([value, { label }]) => ({
                    value,
                    label,
                })),
            },
        },
        initialState: { pageSize: 10 },
        getRowId: (student) => student.id,
    });

    const moveSelected = (className: string) => {
        const ids = new Set(table.selection.rows.map((student) => student.id));
        setStudents(
            students.map((item) =>
                ids.has(item.id)
                    ? Object.assign({}, item, { className })
                    : item,
            ),
        );
        toast.success(`Przeniesiono do ${className}: ${ids.size}`);
        table.selection.clear();
    };

    const removeSelected = async () => {
        const ids = new Set(table.selection.rows.map((student) => student.id));
        const removed = await confirm({
            title: `Usunąć zaznaczonych uczniów (${ids.size})?`,
            description:
                "Znikną z listy razem z punktami. Tego nie da się cofnąć.",
            confirmLabel: "Usuń",
            pendingLabel: "Usuwanie…",
            danger: true,
            // Udaje zapytanie do serwera, żeby było widać spinner.
            onConfirm: () => new Promise((resolve) => setTimeout(resolve, 800)),
        });
        if (!removed) return;
        setStudents((current) => current.filter((item) => !ids.has(item.id)));
        table.selection.clear();
        toast.success(`Usunięto uczniów: ${ids.size}`);
    };

    return (
        <section className="table-demo">
            <TableToolbar
                {...table.toolbarProps}
                searchPlaceholder="Szukaj ucznia"
                selectionLabels={{
                    selectAll: (_, n) => `Zaznacz wszystkich (${n})`,
                    allSelected: (_, n) => `Zaznaczono wszystkich (${n})`,
                }}
                bulkActions={
                    <>
                        <Menu
                            align="end"
                            trigger={
                                <Button
                                    variant="outline"
                                    size="sm"
                                    icon={ArrowLeftRightIcon}
                                >
                                    Przenieś
                                </Button>
                            }
                        >
                            {CLASSES.map((name) => (
                                <MenuItem
                                    key={name}
                                    onClick={() => moveSelected(name)}
                                >
                                    {name}
                                </MenuItem>
                            ))}
                        </Menu>
                        <Button
                            variant="outline"
                            size="sm"
                            icon={Delete02Icon}
                            onClick={removeSelected}
                        >
                            Usuń
                        </Button>
                    </>
                }
            >
                <Button size="sm">Dodaj ucznia</Button>
            </TableToolbar>

            <Table label="Uczniowie" size="sm">
                <TableHeader>
                    <TableRow>
                        <TableSelectHead {...table.selectAllProps} />
                        <TableHead {...table.sortProps("name")}>
                            Uczeń
                        </TableHead>
                        <TableHead {...table.sortProps("className")}>
                            Klasa
                        </TableHead>
                        <TableHead numeric {...table.sortProps("points")}>
                            Punkty
                        </TableHead>
                        <TableHead numeric {...table.sortProps("attendance")}>
                            Frekwencja
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableActionsHead sticky />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {table.rows.length === 0 && (
                        <TableEmpty
                            colSpan={7}
                            icon={SearchRemoveIcon}
                            title="Brak wyników"
                            description="Zmień wyszukiwanie albo filtry."
                            actions={
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={table.clearFilters}
                                >
                                    Wyczyść filtry
                                </Button>
                            }
                        />
                    )}
                    {table.rows.map((student) => (
                        <TableRow
                            key={student.id}
                            selected={table.selection.isSelected(student)}
                        >
                            <TableSelectCell
                                {...table.selectProps(student)}
                                label={`Zaznacz: ${student.name}`}
                            />
                            <TableCell>
                                <Highlight
                                    text={student.name}
                                    ranges={table.getRanges(student, "name")}
                                />
                            </TableCell>
                            <TableCell>{student.className}</TableCell>
                            <TableCell numeric>
                                {student.points ?? "–"}
                            </TableCell>
                            <TableCell numeric>{student.attendance}%</TableCell>
                            <TableCell>
                                <Badge
                                    tone={STATUS[student.status].tone}
                                    size="sm"
                                >
                                    {STATUS[student.status].label}
                                </Badge>
                            </TableCell>
                            <TableActions
                                sticky
                                label={`Akcje: ${student.name}`}
                                quick={[
                                    {
                                        icon: PencilEdit02Icon,
                                        label: "Edytuj",
                                        onClick: () =>
                                            toast(`Edycja: ${student.name}`),
                                    },
                                ]}
                            >
                                <MenuItem icon={ViewIcon}>Szczegóły</MenuItem>
                                <MenuItem icon={Mail01Icon}>
                                    Napisz do rodzica
                                </MenuItem>
                                <MenuSub
                                    icon={ArrowLeftRightIcon}
                                    label="Przenieś do klasy"
                                >
                                    <MenuRadioGroup
                                        value={student.className}
                                        onValueChange={(next) =>
                                            move(student, next)
                                        }
                                    >
                                        {CLASSES.map((name) => (
                                            <MenuRadioItem
                                                key={name}
                                                value={name}
                                                closeOnClick
                                            >
                                                {name}
                                            </MenuRadioItem>
                                        ))}
                                    </MenuRadioGroup>
                                </MenuSub>
                                <MenuSeparator />
                                <MenuItem
                                    icon={Delete02Icon}
                                    variant="danger"
                                    onClick={() => remove(student)}
                                >
                                    Usuń
                                </MenuItem>
                            </TableActions>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Pagination
                {...table.paginationProps}
                pageSizeOptions={[10, 20, 50]}
            />
        </section>
    );
}
