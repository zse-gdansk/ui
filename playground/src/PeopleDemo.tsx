import { PeoplePicker, type PeopleGroup, type Person } from "@zse-gdansk/ui";
import { useState } from "react";

const STUDENTS: Person[] = [
    ["Anna Nowak", "3C"],
    ["Bartosz Kowalski", "3C"],
    ["Celina Wiśniewska", "3C"],
    ["Dawid Łukasik", "3C"],
    ["Ewa Zielińska", "2A"],
    ["Filip Żak", "2A"],
    ["Gabriela Mazur", "2A"],
].map(([name, klass], i) => ({
    value: `u:${i + 1}`,
    name: name!,
    description: `Uczeń, ${klass}`,
}));

const TEACHERS: Person[] = [
    { value: "t:1", name: "Tomasz Wójcik", description: "Historia" },
    { value: "t:2", name: "Magdalena Krawczyk", description: "Matematyka" },
    { value: "t:3", name: "Piotr Szymański", description: "Informatyka" },
];

const GROUPS: PeopleGroup[] = [
    {
        value: "class:3C",
        label: "Klasa 3C",
        members: STUDENTS.slice(0, 4).map((person) => person.value),
    },
    {
        value: "class:2A",
        label: "Klasa 2A",
        members: STUDENTS.slice(4).map((person) => person.value),
    },
    {
        value: "staff",
        label: "Rada pedagogiczna",
        members: TEACHERS.map((person) => person.value),
        description: "Wszyscy nauczyciele",
    },
];

const EVERYONE = [...GROUPS, ...TEACHERS, ...STUDENTS];

// Udaje wyszukiwanie na serwerze.
async function search(query: string, signal: AbortSignal) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    signal.throwIfAborted();
    const needle = query.toLocaleLowerCase("pl");
    return EVERYONE.filter((item) =>
        ("name" in item ? item.name : item.label)
            .toLocaleLowerCase("pl")
            .includes(needle),
    );
}

export function PeopleDemo() {
    const [value, setValue] = useState(["class:3C", "t:2"]);

    return (
        <section className="fields people-demo">
            <PeoplePicker
                label="Do"
                placeholder="Osoby albo klasy"
                people={[...TEACHERS, ...STUDENTS]}
                groups={GROUPS}
                value={value}
                onValueChange={setValue}
                hint={`Wartość: ${value.join(", ") || "pusta"}`}
            />
            <PeoplePicker
                label="Opiekunowie koła (wyszukiwanie na serwerze)"
                placeholder="Zacznij pisać nazwisko"
                onSearch={search}
            />
            <PeoplePicker
                label="Z błędem"
                people={TEACHERS}
                error="Wybierz przynajmniej jedną osobę"
            />
            <PeoplePicker
                label="Wyłączone"
                people={TEACHERS}
                defaultValue={["t:1"]}
                disabled
            />
        </section>
    );
}
