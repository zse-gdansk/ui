import { Button, Countdown, Text, VoteBar, toast } from "@zse-gdansk/ui";
import { useState } from "react";

export function ResultDemo() {
    const [yes, setYes] = useState(9);
    const [until] = useState(() => Date.now() + 90_000);

    return (
        <section className="fields">
            <div className="button-row">
                <Text>
                    Do końca głosowania:{" "}
                    <Countdown
                        until={until}
                        label="Do końca głosowania"
                        onEnd={() => toast("Głosowanie zamknięte")}
                    />
                </Text>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setYes((value) => Math.min(value + 1, 20))}
                >
                    Głos za
                </Button>
            </div>
            <VoteBar
                label="Wynik głosowania"
                yes={yes}
                no={4}
                abstain={2}
                notCast={Math.max(0, 25 - yes - 6)}
                required={13}
            />
            <VoteBar
                label="Wynik głosowania na tablicy"
                size="lg"
                yes={14}
                no={6}
                abstain={3}
            />
        </section>
    );
}
