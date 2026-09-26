import {
    Add01Icon,
    FilterIcon,
    InboxIcon,
    Note01Icon,
    Search01Icon,
} from "@hugeicons/core-free-icons";
import { Button, Card, EmptyState, Input } from "@zse-gdansk/ui";
import { useState } from "react";

const CLASSES = ["1K", "2K", "3C", "3K", "4E"];

export function EmptyDemo() {
    const [query, setQuery] = useState("5A");
    const found = CLASSES.filter((name) =>
        name.toLowerCase().includes(query.trim().toLowerCase()),
    );

    return (
        <section className="cards">
            <Card>
                <EmptyState
                    icon={Note01Icon}
                    title="Brak sprawdzianów"
                    description="Dodaj pierwszy sprawdzian, a uczniowie zobaczą go w swoim kalendarzu."
                    actions={
                        <>
                            <Button size="sm" icon={Add01Icon}>
                                Dodaj sprawdzian
                            </Button>
                            <Button size="sm" variant="ghost">
                                Importuj z pliku
                            </Button>
                        </>
                    }
                />
            </Card>

            <EmptyState
                variant="dashed"
                icon={InboxIcon}
                title="Nikt jeszcze nie oddał pracy"
                description="Termin mija w piątek o 15:00."
            />

            <Card>
                <div className="empty-search">
                    <Input
                        size="sm"
                        leftIcon={Search01Icon}
                        placeholder="Szukaj klasy"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                    />
                    {found.length > 0 ? (
                        <ul className="empty-list">
                            {found.map((name) => (
                                <li key={name}>{name}</li>
                            ))}
                        </ul>
                    ) : (
                        <EmptyState
                            size="sm"
                            icon={FilterIcon}
                            title={`Brak klas pasujących do „${query.trim()}”`}
                            description="Sprawdź pisownię albo wyczyść filtr."
                            actions={
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setQuery("")}
                                >
                                    Wyczyść filtr
                                </Button>
                            }
                        />
                    )}
                </div>
            </Card>
        </section>
    );
}
