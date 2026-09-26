import { UserGroupIcon } from "@hugeicons/core-free-icons";
import { Button, Stat, StatGroup } from "@zse-gdansk/ui";
import { useState } from "react";

const POINTS = [14.2, 15.1, 14.8, 16.3, 16.9, 17.8];

export function StatDemo() {
    const [points, setPoints] = useState(POINTS);
    const [loading, setLoading] = useState(false);
    const last = points.at(-1) ?? 0;

    const nextWeek = () => {
        const next = Math.round((last + (Math.random() * 4 - 2)) * 10) / 10;
        setPoints([...points.slice(1), next]);
    };

    return (
        <section className="stat-demo">
            <StatGroup variant="outline">
                <Stat
                    label="Średnia punktów"
                    value={last}
                    previous={points.at(-2) ?? null}
                    format={{ maximumFractionDigits: 1 }}
                    unit="pkt"
                    deltaLabel="od zeszłego tygodnia"
                    trend={points}
                    loading={loading}
                />
                <Stat
                    label="Frekwencja"
                    value={0.924}
                    previous={0.9}
                    format={{ style: "percent", maximumFractionDigits: 1 }}
                    deltaFormat="absolute"
                    loading={loading}
                />
                <Stat
                    label="Nieobecności"
                    value={14}
                    previous={19}
                    intent="decrease"
                    unit="godz."
                    loading={loading}
                />
                <Stat label="Oddane prace" value={null} loading={loading} />
            </StatGroup>

            <div className="stat-demo-row">
                <Stat
                    variant="outline"
                    icon={UserGroupIcon}
                    label="Uczniowie w klasie 3C"
                    value={28}
                    delta={0}
                    deltaLabel="od września"
                    description="Dwie osoby na indywidualnym toku nauczania."
                />
                <Stat
                    variant="subtle"
                    size="sm"
                    label="Budżet samorządu"
                    value={1250}
                    previous={1500}
                    intent="neutral"
                    format={{ style: "currency", currency: "PLN" }}
                    trend={[1800, 1650, 1500, 1250]}
                />
                <Stat
                    variant="elevated"
                    size="lg"
                    label="Głosy na liście A"
                    value={312}
                    unit="głosów"
                    render={({ children, ...props }) => (
                        <a {...props} href="#glosowanie">
                            {children}
                        </a>
                    )}
                />
            </div>

            <div className="button-row">
                <Button variant="outline" onClick={nextWeek}>
                    Kolejny tydzień
                </Button>
                <Button variant="ghost" onClick={() => setLoading(!loading)}>
                    {loading ? "Pokaż dane" : "Ładowanie"}
                </Button>
            </div>
        </section>
    );
}
