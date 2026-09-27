import { Button, Input, SegmentedControl, toast } from "@zse-gdansk/ui";
import { QRCode, QRScanner } from "@zse-gdansk/ui/qr";
import { useState } from "react";

const LEVELS = ["L", "M", "Q", "H"] as const;

export function QRDemo() {
    const [value, setValue] = useState(
        "https://zse.edu.gdansk.pl/bilet/2027-studniowka/0142",
    );
    const [level, setLevel] = useState<(typeof LEVELS)[number]>("M");
    const [scanning, setScanning] = useState(false);
    const [checking, setChecking] = useState(false);
    const [scanned, setScanned] = useState<{ id: number; code: string }[]>([]);

    return (
        <section className="qr-demo">
            <div className="qr-demo-column">
                <QRCode
                    value={value || " "}
                    level={level}
                    size={176}
                    label="Wejściówka na studniówkę"
                />
                <Input
                    label="Treść kodu"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                />
                <SegmentedControl
                    aria-label="Odporność na uszkodzenia"
                    size="sm"
                    value={level}
                    onValueChange={(next) =>
                        setLevel(next as (typeof LEVELS)[number])
                    }
                    options={LEVELS.map((item) => ({
                        value: item,
                        label: item,
                    }))}
                />
            </div>
            <div className="qr-demo-column">
                {scanning ? (
                    <QRScanner
                        paused={checking}
                        onScan={(code) => {
                            // Udaje sprawdzenie biletu na serwerze.
                            setChecking(true);
                            setTimeout(() => {
                                setChecking(false);
                                setScanned((list) =>
                                    [{ id: Date.now(), code }, ...list].slice(
                                        0,
                                        5,
                                    ),
                                );
                                toast.success("Bilet ważny");
                            }, 700);
                        }}
                    />
                ) : (
                    <div className="qr-demo-placeholder">
                        <Button onClick={() => setScanning(true)}>
                            Skanuj bilety
                        </Button>
                    </div>
                )}
                {scanning && (
                    <Button
                        variant="outline"
                        onClick={() => setScanning(false)}
                    >
                        Zakończ skanowanie
                    </Button>
                )}
                <ul className="qr-demo-list">
                    {scanned.map((entry) => (
                        <li key={entry.id}>{entry.code}</li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
