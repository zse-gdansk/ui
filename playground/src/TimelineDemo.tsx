import {
    ArrowLeftRightIcon,
    CheckmarkCircle02Icon,
    Delete02Icon,
    PencilEdit02Icon,
    UserAdd01Icon,
    VoteIcon,
} from "@hugeicons/core-free-icons";
import {
    Button,
    Timeline,
    TimelineChange,
    TimelineGroup,
    TimelineItem,
} from "@zse-gdansk/ui";
import { useState } from "react";

const now = Date.now();
const ago = (minutes: number) => now - minutes * 60_000;
const DAY = 24 * 60;

interface Entry {
    id: number;
    time: number;
    points: [number, number];
}

export function TimelineDemo() {
    const [loading, setLoading] = useState(false);
    // Wpisy dodane na żywo wchodzą z animacją, te z początku stoją.
    const [live, setLive] = useState<Entry[]>([]);

    const addEntry = () =>
        setLive((entries) => {
            const last = entries[0]?.points[1] ?? 17;
            const next = last + Math.round(Math.random() * 6) - 2;
            return [
                { id: entries.length, time: Date.now(), points: [last, next] },
                ...entries,
            ];
        });

    return (
        <section className="timeline-demo">
            <div className="button-row">
                <Button size="sm" variant="outline" onClick={addEntry}>
                    Dodaj wpis
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setLoading((value) => !value)}
                >
                    {loading ? "Pokaż historię" : "Wczytywanie"}
                </Button>
            </div>

            <Timeline label="Historia zmian ucznia" loading={loading}>
                <TimelineGroup date={now}>
                    {live.map((entry) => (
                        <TimelineItem
                            key={entry.id}
                            avatar={{ name: "Anna Kowalska" }}
                            title={
                                <>
                                    <strong>Anna Kowalska</strong> zmieniła
                                    punkty za sprawdzian
                                </>
                            }
                            time={entry.time}
                        >
                            <TimelineChange
                                label="Punkty"
                                from={entry.points[0]}
                                to={entry.points[1]}
                            />
                        </TimelineItem>
                    ))}
                    <TimelineItem
                        avatar={{ name: "Anna Kowalska" }}
                        title={
                            <>
                                <strong>Anna Kowalska</strong> zmieniła punkty
                                za sprawdzian z fizyki
                            </>
                        }
                        time={ago(4)}
                    >
                        <TimelineChange label="Punkty" from={12} to={17} />
                    </TimelineItem>
                    <TimelineItem
                        icon={ArrowLeftRightIcon}
                        tone="accent"
                        title="Przeniesiono do klasy 3C"
                        description="Decyzja rady pedagogicznej z 25 września."
                        time={ago(95)}
                    >
                        <TimelineChange label="Klasa" from="2C" to="3C" />
                    </TimelineItem>
                </TimelineGroup>

                <TimelineGroup date={ago(DAY)} collapsedAfter={2}>
                    <TimelineItem
                        icon={PencilEdit02Icon}
                        title="Poprawiono frekwencję za wrzesień"
                        time={ago(DAY + 30)}
                    >
                        <TimelineChange
                            label="Nieobecności"
                            from={6}
                            to={4}
                            better="down"
                        />
                    </TimelineItem>
                    <TimelineItem
                        icon={VoteIcon}
                        tone="success"
                        title="Oddano głos w wyborach do samorządu"
                        time={ago(DAY + 120)}
                    />
                    <TimelineItem
                        icon={CheckmarkCircle02Icon}
                        tone="success"
                        title="Oddano pracę domową z matematyki"
                        time={ago(DAY + 200)}
                    />
                    <TimelineItem
                        title="Zalogowano z nowego urządzenia"
                        description="Chrome, macOS"
                        time={ago(DAY + 320)}
                    />
                </TimelineGroup>

                <TimelineGroup date={ago(12 * DAY)}>
                    <TimelineItem
                        icon={Delete02Icon}
                        tone="danger"
                        title="Usunięto uwagę"
                        time={ago(12 * DAY + 60)}
                    >
                        <TimelineChange
                            label="Uwaga"
                            from="Brak zadania domowego"
                        />
                    </TimelineItem>
                    <TimelineItem
                        icon={UserAdd01Icon}
                        title="Dodano ucznia do dziennika"
                        time={ago(12 * DAY + 400)}
                    />
                </TimelineGroup>
            </Timeline>
        </section>
    );
}
