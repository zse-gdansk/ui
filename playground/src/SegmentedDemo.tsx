import {
    GridViewIcon,
    LeftToRightListBulletIcon,
} from "@hugeicons/core-free-icons";
import { SegmentedControl } from "@zse-gdansk/ui";
import { useState } from "react";

export function SegmentedDemo() {
    const [range, setRange] = useState("tydzien");

    return (
        <section className="badges">
            <div className="button-row">
                <SegmentedControl
                    aria-label="Zakres kalendarza"
                    value={range}
                    onValueChange={setRange}
                    options={[
                        { value: "dzien", label: "Dzień" },
                        { value: "tydzien", label: "Tydzień" },
                        { value: "miesiac", label: "Miesiąc" },
                    ]}
                />
                <SegmentedControl
                    aria-label="Układ"
                    size="sm"
                    defaultValue="lista"
                    options={[
                        {
                            value: "lista",
                            icon: LeftToRightListBulletIcon,
                            "aria-label": "Lista",
                        },
                        {
                            value: "siatka",
                            icon: GridViewIcon,
                            "aria-label": "Siatka",
                        },
                    ]}
                />
            </div>
            <SegmentedControl
                aria-label="Filtr prac"
                fullWidth
                size="lg"
                defaultValue="wszystkie"
                options={[
                    { value: "wszystkie", label: "Wszystkie" },
                    { value: "oddane", label: "Oddane" },
                    { value: "spoznione", label: "Spóźnione" },
                    { value: "brak", label: "Brak pracy" },
                ]}
            />
            <SegmentedControl
                aria-label="Semestr"
                defaultValue="1"
                options={[
                    { value: "1", label: "I semestr" },
                    { value: "2", label: "II semestr", disabled: true },
                ]}
            />
        </section>
    );
}
