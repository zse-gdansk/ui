import {
    ComputerIcon,
    Home01Icon,
    UserGroupIcon,
} from "@hugeicons/core-free-icons";
import {
    Badge,
    Button,
    CheckboxCard,
    CheckboxCardGroup,
    RadioCard,
    RadioCardGroup,
    confirm,
    toast,
} from "@zse-gdansk/ui";
import { useState } from "react";

const CANDIDATES = [
    {
        value: "julia",
        name: "Julia Lewandowska",
        className: "3C",
        pitch: "Dłuższa przerwa obiadowa i szafki dla wszystkich klas.",
    },
    {
        value: "mikolaj",
        name: "Mikołaj Zieliński",
        className: "2A",
        pitch: "Turniej e-sportowy i otwarta pracownia po lekcjach.",
    },
    {
        value: "hanna",
        name: "Hanna Wiśniewska",
        className: "4B",
        pitch: "Więcej wycieczek i głos uczniów w planie zastępstw.",
    },
];

export function VoteDemo() {
    const [vote, setVote] = useState<string | null>(null);
    const chosen = CANDIDATES.find((candidate) => candidate.value === vote);

    const submit = async () => {
        if (!chosen) return;
        const ok = await confirm({
            title: `Oddać głos na: ${chosen.name}?`,
            description: "Głosu nie da się potem zmienić.",
            confirmLabel: "Oddaj głos",
            pendingLabel: "Wysyłanie…",
            onConfirm: () => new Promise((done) => setTimeout(done, 700)),
        });
        if (ok) toast.success("Głos oddany. Dziękujemy!");
    };

    return (
        <section className="vote-demo">
            <RadioCardGroup
                label="Przewodniczący samorządu"
                layout="stack"
                minWidth={200}
                value={vote}
                onValueChange={setVote}
                hint="Jeden głos. Wyniki po zamknięciu głosowania."
            >
                {CANDIDATES.map((candidate) => (
                    <RadioCard
                        key={candidate.value}
                        value={candidate.value}
                        avatar={{ name: candidate.name }}
                        title={candidate.name}
                        description={candidate.pitch}
                        meta={
                            <Badge size="sm" tone="neutral">
                                Klasa {candidate.className}
                            </Badge>
                        }
                    />
                ))}
            </RadioCardGroup>
            <div className="button-row">
                <Button disabled={!chosen} onClick={submit}>
                    Oddaj głos
                </Button>
            </div>

            <CheckboxCardGroup
                label="Koła zainteresowań"
                max={3}
                defaultValue={["robotyka"]}
                minWidth={220}
            >
                <CheckboxCard
                    value="robotyka"
                    title="Robotyka"
                    description="Wtorki, 15:00, sala 214"
                />
                <CheckboxCard
                    value="teatr"
                    title="Teatr"
                    description="Środy, 14:10, aula"
                />
                <CheckboxCard
                    value="debaty"
                    title="Debaty"
                    description="Czwartki, 15:00, biblioteka"
                />
                <CheckboxCard
                    value="fotografia"
                    title="Fotografia"
                    description="Piątki, 13:20, sala 108"
                />
                <CheckboxCard
                    value="szachy"
                    title="Szachy"
                    description="Poniedziałki, 14:10, sala 12"
                    disabled
                    meta="Brak miejsc"
                />
            </CheckboxCardGroup>

            <RadioCardGroup label="Forma zajęć" defaultValue="stacjonarnie">
                <RadioCard
                    value="stacjonarnie"
                    icon={UserGroupIcon}
                    title="Stacjonarnie"
                    description="W szkole, według planu lekcji."
                />
                <RadioCard
                    value="zdalnie"
                    icon={ComputerIcon}
                    title="Zdalnie"
                    description="Przez Teams, link w dzienniku."
                />
                <RadioCard
                    value="hybrydowo"
                    icon={Home01Icon}
                    title="Hybrydowo"
                    description="Na zmianę co tydzień."
                />
            </RadioCardGroup>
        </section>
    );
}
