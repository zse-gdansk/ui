import { Badge, HoverCard, ProfilePreview } from "@zse-gdansk/ui";

const wait = (ms: number, signal: AbortSignal) =>
    new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, ms);
        signal.addEventListener("abort", () => {
            clearTimeout(timer);
            reject(signal.reason);
        });
    });

// Udaje wczytanie profilu z API przy pierwszym otwarciu karty.
async function loadTeacher(signal: AbortSignal) {
    await wait(700, signal);
    return (
        <ProfilePreview
            name="Tomasz Wójcik"
            subtitle="Nauczyciel historii"
            details={[
                { label: "Sala", value: "208" },
                { label: "Dyżur", value: "wtorek, 10:20" },
            ]}
        />
    );
}

export function HoverCardDemo() {
    return (
        <section className="hovercard-demo">
            <p>
                Kandydatką na przewodniczącą samorządu jest{" "}
                <HoverCard
                    href="#"
                    content={
                        <ProfilePreview
                            name="Julia Lewandowska"
                            subtitle="Uczennica klasy 3C"
                            badge={
                                <Badge size="sm" tone="accent">
                                    Kandydatka
                                </Badge>
                            }
                            details={[
                                { label: "W samorządzie", value: "od 2024" },
                                {
                                    label: "Program",
                                    value: "Strefa ciszy, radiowęzeł",
                                },
                            ]}
                        />
                    }
                >
                    Julia Lewandowska
                </HoverCard>
                , a opiekunem wyborów{" "}
                <HoverCard href="#" content={loadTeacher}>
                    Tomasz Wójcik
                </HoverCard>
                . Debata kandydatów odbędzie się na{" "}
                <HoverCard
                    href="#"
                    width={260}
                    content={
                        <div className="hovercard-demo-event">
                            <strong>Debata kandydatów</strong>
                            <span>Czwartek, 2 października, 12:25</span>
                            <span>Aula, parter</span>
                        </div>
                    }
                >
                    długiej przerwie w czwartek
                </HoverCard>
                .
            </p>
        </section>
    );
}
