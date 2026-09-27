import { SearchRemoveIcon } from "@hugeicons/core-free-icons";
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableEmpty,
    TableHead,
    TableHeader,
    TableRow,
    TableToolbar,
    useTable,
    useVirtualRows,
} from "@zse-gdansk/ui";

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
    "Lena",
    "Jan",
    "Alicja",
    "Filip",
];
const LAST = [
    "Nowak",
    "Kowalczyk",
    "Wójcik",
    "Zając",
    "Mazur",
    "Krawczyk",
    "Kaczmarek",
    "Piotrowski",
    "Grabowski",
    "Pawlak",
    "Michalak",
    "Król",
    "Wieczorek",
    "Jabłoński",
    "Nowakowski",
    "Majewski",
    "Olszewski",
    "Stępień",
    "Malinowski",
    "Jaworski",
];
const CLASSES = [
    "1A",
    "1B",
    "1C",
    "2A",
    "2B",
    "2C",
    "3A",
    "3B",
    "3C",
    "4A",
    "4B",
    "4C",
    "5A",
    "5B",
];

// Imiona na parzystych miejscach żeńskie: nazwisko na -ski i -cki w formie
// żeńskiej, bez „Zofii Grabowskiego”.
const surname = (first: number, last: string) =>
    first % 2 === 0 ? last.replace(/(sk|ck|dzk)i$/, "$1a") : last;

// Cała szkoła do testu wirtualizacji, dane liczone z indeksu.
const SCHOOL = Array.from({ length: 3000 }, (_, index) => {
    const first = index % FIRST.length;
    const last =
        LAST[(index * 7 + Math.floor(index / FIRST.length)) % LAST.length] ??
        "Nowak";
    return {
        id: index + 1,
        name: `${FIRST[first]} ${surname(first, last)}`,
        className: CLASSES[(index * 3) % CLASSES.length] ?? "1A",
        points: (index * 37) % 101,
        attendance: 70 + ((index * 13) % 31),
    };
});

export function VirtualTableDemo() {
    const table = useTable({
        data: SCHOOL,
        search: ["name", "className"],
        sortBy: {
            name: (student) => student.name,
            className: (student) => student.className,
            points: { value: (student) => student.points, first: "desc" },
            attendance: {
                value: (student) => student.attendance,
                first: "desc",
            },
        },
        paginate: false,
        getRowId: (student) => student.id,
    });
    const virtual = useVirtualRows(table.rows.length);

    return (
        <section className="table-demo">
            <TableToolbar
                {...table.toolbarProps}
                searchPlaceholder="Szukaj w całej szkole"
            />
            <Table
                label="Wszyscy uczniowie"
                size="sm"
                maxHeight={480}
                striped
                {...virtual.tableProps}
            >
                {/* Stałe szerokości: bez wierszy (brak wyników) kolumny nie skaczą. */}
                <colgroup>
                    <col style={{ width: "40%" }} />
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "20%" }} />
                </colgroup>
                <TableHeader>
                    <TableRow>
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
                    </TableRow>
                </TableHeader>
                <TableBody {...virtual.bodyProps}>
                    {table.rows.length === 0 && (
                        <TableEmpty
                            colSpan={4}
                            icon={SearchRemoveIcon}
                            title="Brak wyników"
                            description="Nikt w szkole nie pasuje do wyszukiwania."
                            actions={
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={table.clearFilters}
                                >
                                    Wyczyść wyszukiwanie
                                </Button>
                            }
                        />
                    )}
                    {virtual.before}
                    {table.rows
                        .slice(virtual.start, virtual.end)
                        .map((student, offset) => (
                            <TableRow
                                key={student.id}
                                {...virtual.rowProps(virtual.start + offset)}
                            >
                                <TableCell>{student.name}</TableCell>
                                <TableCell>{student.className}</TableCell>
                                <TableCell numeric>{student.points}</TableCell>
                                <TableCell numeric>
                                    {student.attendance}%
                                </TableCell>
                            </TableRow>
                        ))}
                    {virtual.after}
                </TableBody>
            </Table>
        </section>
    );
}
