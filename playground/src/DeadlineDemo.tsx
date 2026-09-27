import { Deadline } from "@zse-gdansk/ui";
import { useState } from "react";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function DeadlineDemo() {
    // Stałe od wejścia na stronę, a Deadline sam przesuwa czas.
    const [now] = useState(() => Date.now());
    const at = (offset: number) => new Date(now + offset);

    return (
        <section className="deadline-demo">
            <div className="button-row">
                <Deadline date={at(12 * MINUTE)} />
                <Deadline date={at(5 * HOUR)} />
                <Deadline date={at(DAY + 3 * HOUR)} />
                <Deadline date={at(4 * DAY)} />
                <Deadline date={at(30 * DAY)} />
                <Deadline date={at(-2 * HOUR)} />
                <Deadline date={at(-DAY)} done doneLabel="Oddano" />
            </div>
            <ul className="deadline-demo-list">
                <li>
                    <span>Wypracowanie: „Lalka” jako powieść realistyczna</span>
                    <Deadline date={at(2 * DAY)} variant="text" />
                </li>
                <li>
                    <span>Ankieta o stołówce</span>
                    <Deadline
                        date={at(40 * MINUTE)}
                        variant="text"
                        warnBefore={HOUR}
                    />
                </li>
                <li>
                    <span>Karta zgłoszenia na wycieczkę</span>
                    <Deadline date={at(-3 * DAY)} variant="text" />
                </li>
                <li>
                    <span>Zapisy na koło robotyki</span>
                    <Deadline
                        date={at(DAY)}
                        variant="text"
                        size="sm"
                        done
                        doneLabel="Zapisano"
                    />
                </li>
            </ul>
        </section>
    );
}
