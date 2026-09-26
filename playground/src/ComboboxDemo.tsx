import { Combobox, type ComboboxOption } from "@zse-gdansk/ui";
import { useState } from "react";

const FIRST = [
    "Zofia",
    "Michał",
    "Lena",
    "Kacper",
    "Hanna",
    "Jan",
    "Maja",
    "Filip",
    "Oliwia",
    "Adam",
    "Julia",
    "Szymon",
    "Alicja",
    "Wiktor",
    "Pola",
    "Igor",
    "Nina",
    "Leon",
    "Amelia",
    "Tymon",
    "Łucja",
    "Oskar",
    "Natalia",
    "Antoni",
];
const LAST = [
    "Adamczyk",
    "Bąk",
    "Czarnecka",
    "Dudek",
    "Filipek",
    "Górski",
    "Jankowska",
    "Kaczmarek",
    "Kowalczyk",
    "Lewandowski",
    "Łukaszewicz",
    "Mazur",
    "Nowak",
    "Olszewska",
    "Pawlak",
    "Rutkowska",
    "Sikora",
    "Tomaszewska",
    "Wieczorek",
    "Wróbel",
    "Zając",
    "Żak",
    "Kwiatkowska",
    "Ślusarczyk",
];
const CLASSES = ["1K", "2K", "3K", "3C", "4E", "2E"];

const STUDENTS: ComboboxOption[] = LAST.flatMap((last, i) =>
    [0, 1].map((n) => {
        const name = `${last} ${FIRST[(i * 2 + n) % FIRST.length]}`;
        return {
            value: `${i}-${n}`,
            label: name,
            description: CLASSES[(i + n) % CLASSES.length] ?? "",
        };
    }),
);

const SUBJECTS: ComboboxOption[] = [
    "Matematyka",
    "Fizyka",
    "Informatyka",
    "Język polski",
    "Język angielski",
    "Historia",
    "Chemia",
    "Elektrotechnika",
].map((label) => ({ value: label.toLowerCase(), label }));

// Udawane API: 400ms opóźnienia, szuka po nazwisku.
function searchTeachers(query: string, signal: AbortSignal) {
    const all = [
        "Kowalska Anna",
        "Wiśniewski Piotr",
        "Wójcik Ewa",
        "Kamiński Tomasz",
        "Lewandowska Katarzyna",
        "Zieliński Marek",
    ];
    return new Promise<ComboboxOption[]>((resolve, reject) => {
        const timer = setTimeout(
            () =>
                resolve(
                    all
                        .filter((name) =>
                            name
                                .toLowerCase()
                                .normalize("NFD")
                                .replace(/\p{M}/gu, "")
                                .includes(query.toLowerCase()),
                        )
                        .map((name) => ({
                            value: name,
                            label: name,
                            description: "Nauczyciel",
                        })),
                ),
            400,
        );
        signal.addEventListener("abort", () => {
            clearTimeout(timer);
            reject(new DOMException("aborted", "AbortError"));
        });
    });
}

export function ComboboxDemo() {
    const [student, setStudent] = useState<string | null>(null);

    return (
        <section className="fields">
            <Combobox
                label="Uczeń"
                placeholder="Wpisz nazwisko, np. zajac"
                options={STUDENTS}
                value={student}
                onValueChange={setStudent}
                hint={
                    student
                        ? `Wybrano: ${student}`
                        : "Działa bez polskich znaków"
                }
            />
            <Combobox
                multiple
                label="Przedmioty"
                placeholder="Dodaj przedmiot"
                options={SUBJECTS}
                defaultValue={["matematyka", "informatyka"]}
            />
            <Combobox
                label="Wychowawca"
                placeholder="Szukaj w bazie nauczycieli"
                onSearch={searchTeachers}
            />
            <Combobox
                label="Klasa"
                size="sm"
                options={[
                    { value: "3c", label: "3C" },
                    { value: "3k", label: "3K", disabled: true },
                ]}
                error="Wybierz klasę"
            />
        </section>
    );
}
