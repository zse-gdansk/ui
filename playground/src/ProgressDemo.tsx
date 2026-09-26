import { Button, Meter, Progress } from "@zse-gdansk/ui";
import { useEffect, useState } from "react";

export function ProgressDemo() {
    const [upload, setUpload] = useState(0);
    const [running, setRunning] = useState(false);
    const animating = running && upload < 100;

    useEffect(() => {
        if (!animating) return;
        const timer = setInterval(() => {
            setUpload((value) => Math.min(value + 7 + Math.random() * 9, 100));
        }, 300);
        return () => clearInterval(timer);
    }, [animating]);

    return (
        <section className="progress-demo">
            <div className="progress-column">
                <Progress
                    label="Wysyłanie ocen do dziennika"
                    value={upload}
                    showValue
                />
                <div className="button-row">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            setUpload(0);
                            setRunning(true);
                        }}
                    >
                        {upload >= 100 ? "Wyślij ponownie" : "Wyślij"}
                    </Button>
                </div>
                <Progress label="Import uczniów z pliku" value={null} />
                <Progress label="Małe" value={40} size="sm" />
                <Progress label="Duże" value={72} size="lg" showValue />
            </div>

            <div className="progress-column">
                <Meter
                    label="Frekwencja w głosowaniu"
                    value={412}
                    max={780}
                    showValue="fraction"
                    low={390}
                    high={600}
                />
                <Meter
                    label="Oddane prace"
                    value={26}
                    max={28}
                    showValue="fraction"
                    low={14}
                    high={24}
                />
                <Meter
                    label="Nieobecności"
                    value={31}
                    max={50}
                    showValue="value"
                    low={10}
                    high={25}
                    optimum={0}
                />
                <Meter
                    label="Punkty ze sprawdzianu"
                    value={38}
                    max={50}
                    showValue="fraction"
                    segments={10}
                />
            </div>

            <div className="progress-column">
                <Meter
                    shape="ring"
                    ringSize={48}
                    label="Oddane"
                    value={26}
                    max={28}
                    showValue
                    low={14}
                    high={24}
                />
                <Meter
                    shape="ring"
                    ringSize={48}
                    label="Frekwencja"
                    value={53}
                    showValue
                    low={50}
                    high={75}
                />
                <Progress
                    shape="ring"
                    ringSize={48}
                    label="Wysyłanie"
                    value={upload}
                    showValue
                />
                <Progress
                    shape="ring"
                    ringSize={24}
                    label="Ładowanie"
                    value={null}
                />
            </div>
        </section>
    );
}
