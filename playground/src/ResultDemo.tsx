import { Copy01Icon, MaximizeScreenIcon } from "@hugeicons/core-free-icons";
import {
    Button,
    Countdown,
    HoldButton,
    IconButton,
    Meter,
    Text,
    VoteBar,
    toast,
} from "@zse-gdansk/ui";
import { useState } from "react";

export function ResultDemo() {
    const [yes, setYes] = useState(9);
    const [until] = useState(() => Date.now() + 90_000);
    const [present, setPresent] = useState(11);

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
            <div className="button-row">
                <HoldButton
                    onConfirm={() =>
                        new Promise<void>((done) =>
                            setTimeout(() => {
                                toast.success("Zamknięto głosowanie");
                                done();
                            }, 600),
                        )
                    }
                    confirmDescription="Oddane głosy zostaną policzone, nowych nie będzie można oddać."
                >
                    Zamknij głosowanie
                </HoldButton>
                <IconButton icon={Copy01Icon} label="Kopiuj link" />
                <IconButton
                    icon={MaximizeScreenIcon}
                    label="Pełny ekran"
                    variant="outline"
                />
            </div>
            <Meter
                label="Obecni"
                value={present}
                max={25}
                showValue="fraction"
                low={13}
                marker={{ value: 13, label: "Kworum: 13" }}
                valueText={`Obecnych ${present} z 25`}
            />
            <div className="button-row">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        setPresent((value) => Math.min(value + 1, 25))
                    }
                >
                    Obecny
                </Button>
            </div>
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
