import {
    Card,
    CardContent,
    Checkbox,
    Input,
    Select,
    Stepper,
    Textarea,
    toast,
} from "@zse-gdansk/ui";
import { useState } from "react";

export function StepperDemo() {
    const [title, setTitle] = useState("");
    const [accepted, setAccepted] = useState(false);

    return (
        <Card className="form-demo">
            <CardContent>
                <Stepper
                    onComplete={() =>
                        new Promise<void>((done) =>
                            setTimeout(done, 1200),
                        ).then(() => toast.success("Utworzono sprawdzian"))
                    }
                    steps={[
                        {
                            title: "Podstawy",
                            description:
                                "Nazwa i klasa, dla której jest sprawdzian.",
                            content: (
                                <div className="sheet-stack">
                                    <Input
                                        label="Tytuł"
                                        required
                                        value={title}
                                        onChange={(event) =>
                                            setTitle(event.target.value)
                                        }
                                        placeholder="Sprawdzian z optyki"
                                    />
                                    <Select
                                        label="Klasa"
                                        defaultValue="3c"
                                        options={[
                                            { value: "3c", label: "3C" },
                                            { value: "3k", label: "3K" },
                                        ]}
                                    />
                                </div>
                            ),
                            validate: () =>
                                title.trim().length >= 3 ||
                                "Wpisz tytuł, co najmniej 3 znaki",
                        },
                        {
                            title: "Zadania",
                            description:
                                "Treść zadań możesz uzupełnić później.",
                            optional: true,
                            content: (
                                <Textarea
                                    label="Zadania"
                                    rows={6}
                                    placeholder="1. Oblicz ogniskową soczewki…"
                                />
                            ),
                        },
                        {
                            title: "Ocenianie",
                            content: (
                                <Select
                                    label="Skala"
                                    defaultValue="proc"
                                    options={[
                                        {
                                            value: "proc",
                                            label: "Procentowa (progi szkolne)",
                                        },
                                        { value: "pkt", label: "Punktowa" },
                                    ]}
                                />
                            ),
                            // Udawane sprawdzenie na serwerze.
                            validate: () =>
                                new Promise((done) =>
                                    setTimeout(() => done(true), 700),
                                ),
                        },
                        {
                            title: "Podsumowanie",
                            content: (
                                <div className="sheet-stack">
                                    <p className="misc-text">
                                        {title || "Bez tytułu"} dla klasy 3C,
                                        skala procentowa.
                                    </p>
                                    <Checkbox
                                        label="Pokaż uczniom od razu"
                                        checked={accepted}
                                        onCheckedChange={setAccepted}
                                    />
                                </div>
                            ),
                        },
                    ]}
                />
            </CardContent>
        </Card>
    );
}
