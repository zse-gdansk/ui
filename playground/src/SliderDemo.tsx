import { CheckboxGroup, Slider } from "@zse-gdansk/ui";
import { useState } from "react";

const GRADES = [
    { value: 30, label: "2" },
    { value: 50, label: "3" },
    { value: 70, label: "4" },
    { value: 85, label: "5" },
    { value: 95, label: "6" },
];

export function SliderDemo() {
    const [range, setRange] = useState<number | number[]>([12, 38]);

    return (
        <section className="fields">
            <Slider
                label="Próg na dopuszczający"
                defaultValue={30}
                step={5}
                marks={GRADES}
                format={{ style: "unit", unit: "percent" }}
                hint="Kreski to progi kolejnych ocen"
            />
            <Slider
                label="Punkty"
                value={range}
                onValueChange={setRange}
                max={50}
                marks={[0, 10, 20, 30, 40, 50]}
            />
            <Slider label="Głośność dzwonka" defaultValue={40} disabled />

            <CheckboxGroup
                label="Wyślij do klas"
                selectAll
                columns={3}
                defaultValue={["3c", "3k"]}
                options={["1K", "2K", "3C", "3K", "4E", "2E"].map((name) => ({
                    value: name.toLowerCase(),
                    label: name,
                }))}
                hint="Wiadomość zobaczą uczniowie i wychowawcy"
            />
            <CheckboxGroup
                label="Powiadomienia"
                defaultValue={["oceny"]}
                options={[
                    {
                        value: "oceny",
                        label: "Nowe oceny",
                        description: "Od razu po wystawieniu",
                    },
                    {
                        value: "terminy",
                        label: "Terminy oddania",
                        description: "Dzień przed terminem, o 18:00",
                    },
                    {
                        value: "sms",
                        label: "SMS",
                        description: "Wkrótce",
                        disabled: true,
                    },
                ]}
            />
        </section>
    );
}
