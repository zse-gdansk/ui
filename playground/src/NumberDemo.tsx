import { NumberField } from "@zse-gdansk/ui";
import { useState } from "react";

export function NumberDemo() {
    const [points, setPoints] = useState<number | null>(6);

    return (
        <section className="fields">
            <NumberField
                label="Punkty za zadanie 4"
                hint="Przeciągnij etykietę albo użyj strzałek, Shift x 5"
                value={points}
                onValueChange={setPoints}
                min={0}
                max={8}
                step={0.5}
                largeStep={5}
                suffix="/ 8 pkt"
                scrub
                error={points === null ? "Wpisz liczbę punktów" : undefined}
            />
            <NumberField
                label="Liczba uczniów"
                size="sm"
                defaultValue={28}
                min={1}
                max={40}
            />
            <NumberField
                label="Waga oceny"
                size="lg"
                defaultValue={0.25}
                min={0}
                max={1}
                step={0.05}
                format={{ style: "percent" }}
                wheel
            />
            <NumberField
                label="Rok"
                defaultValue={2026}
                format={{ useGrouping: false }}
                hideButtons
                disabled
            />
        </section>
    );
}
