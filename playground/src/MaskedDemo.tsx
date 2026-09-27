import { createMask, MaskedInput, studentIdMask } from "@zse-gdansk/ui";
import { useState } from "react";

const postalCode = createMask("99-999");
const date = createMask("99.99.9999");

export function MaskedDemo() {
    const [id, setId] = useState("");

    return (
        <section className="fields masked-demo">
            <MaskedInput
                label="Numer legitymacji"
                placeholder="np. 123/2023"
                format={studentIdMask.format}
                finalize={studentIdMask.finalize}
                inputMode={studentIdMask.inputMode}
                pattern={studentIdMask.pattern}
                value={id}
                onValueChange={setId}
                hint={`Wartość: ${id || "pusta"} · poprawna: ${studentIdMask.isValid(id) ? "tak" : "nie"}`}
            />
            <MaskedInput
                label="Kod pocztowy"
                placeholder="80-000"
                {...postalCode}
            />
            <MaskedInput
                label="Data urodzenia"
                placeholder="DD.MM.RRRR"
                {...date}
                size="sm"
            />
            <MaskedInput
                label="Wyłączone"
                defaultValue="1234/2019"
                format={studentIdMask.format}
                disabled
            />
        </section>
    );
}
