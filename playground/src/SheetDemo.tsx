import {
    Badge,
    Button,
    Checkbox,
    NumberField,
    Select,
    Sheet,
    SheetClose,
    Textarea,
} from "@zse-gdansk/ui";

export function SheetDemo() {
    return (
        <section className="button-row">
            <Sheet
                trigger={<Button variant="outline">Szczegóły ucznia</Button>}
                title="Nowak Szymon"
                description="Klasa 3C, numer w dzienniku 14"
                footer={
                    <>
                        <SheetClose
                            render={<Button variant="ghost" size="sm" />}
                        >
                            Anuluj
                        </SheetClose>
                        <SheetClose render={<Button size="sm" />}>
                            Zapisz
                        </SheetClose>
                    </>
                }
            >
                <div className="sheet-stack">
                    <div className="button-row">
                        <Badge tone="success" dot>
                            Oddane 7 z 8
                        </Badge>
                        <Badge tone="warning">1 spóźnione</Badge>
                    </div>
                    <NumberField
                        label="Punkty za zadanie 4"
                        defaultValue={5}
                        min={0}
                        max={8}
                        suffix="/ 8 pkt"
                    />
                    <Textarea
                        label="Uwagi"
                        placeholder="Widoczne dla ucznia"
                        maxLength={300}
                    />
                </div>
            </Sheet>

            <Sheet
                side="auto"
                size="sm"
                trigger={<Button variant="outline">Filtry</Button>}
                title="Filtry"
                footer={
                    <SheetClose render={<Button size="sm" />}>
                        Pokaż 28 prac
                    </SheetClose>
                }
            >
                <div className="sheet-stack">
                    <Select
                        label="Klasa"
                        placeholder="Wszystkie"
                        options={[
                            { value: "3c", label: "3C" },
                            { value: "3k", label: "3K" },
                        ]}
                    />
                    <Checkbox label="Tylko spóźnione" />
                    <Checkbox label="Bez oceny" defaultChecked />
                </div>
            </Sheet>

            <Sheet
                side="left"
                trigger={<Button variant="ghost">Menu z lewej</Button>}
                title="Tabela punktów"
            >
                Nawigacja aplikacji na telefonie.
            </Sheet>

            <Sheet
                side="bottom"
                trigger={<Button variant="ghost">Od dołu</Button>}
                title="Oddaj głos"
                description="Przeciągnij w dół, żeby zamknąć."
            >
                Głos można zmienić do piątku, 15:00.
            </Sheet>

            <Sheet
                side="bottom"
                expandable
                trigger={<Button variant="ghost">Kandydaci</Button>}
                title="Kandydaci do samorządu"
                description="Przeciągnij w górę, żeby zobaczyć wszystkich."
            >
                <div className="sheet-stack">
                    {Array.from({ length: 12 }, (_, i) => (
                        <p key={`kandydat-${i + 1}`}>
                            Kandydat {i + 1}: klasa {(i % 4) + 1}C, program
                            wyborczy i krótki opis.
                        </p>
                    ))}
                </div>
            </Sheet>
        </section>
    );
}
