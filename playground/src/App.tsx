import { ArrowRight02Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { Button, Input } from "@zse-gdansk/ui";
import { useState } from "react";

const RAMPS = ["gray", "blue", "green", "orange", "red", "violet"] as const;
const STEPS = Array.from({ length: 12 }, (_, i) => i + 1);
const VARIANTS = ["primary", "ghost", "outline", "danger"] as const;
const SIZES = ["sm", "md", "lg"] as const;

export function App() {
    const [loading, setLoading] = useState(false);
    const [theme, setTheme] = useState(
        () => document.documentElement.dataset.theme ?? "light",
    );

    function toggleTheme() {
        const next = theme === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", next);
        setTheme(next);
    }

    return (
        <main className="page">
            <header className="toolbar">
                <button type="button" onClick={toggleTheme}>
                    Motyw: {theme}
                </button>
            </header>

            <section className="ramps">
                {RAMPS.map((name) => (
                    <div key={name} className="ramp">
                        <span>{name}</span>
                        {STEPS.map((step) => (
                            <div
                                key={step}
                                className="swatch"
                                title={`--${name}-${step}`}
                                style={{ background: `var(--${name}-${step})` }}
                            />
                        ))}
                    </div>
                ))}
            </section>

            <section className="buttons">
                <label className="toggle">
                    <input
                        type="checkbox"
                        checked={loading}
                        onChange={(event) => setLoading(event.target.checked)}
                    />
                    loading
                </label>
                {SIZES.map((size) => (
                    <div key={size} className="button-row">
                        {VARIANTS.map((variant) => (
                            <Button
                                key={variant}
                                variant={variant}
                                size={size}
                                loading={loading}
                            >
                                Zapisz
                            </Button>
                        ))}
                        <Button size={size} disabled>
                            Wyłączony
                        </Button>
                    </div>
                ))}
                <div className="button-row">
                    <Button
                        icon={ArrowRight02Icon}
                        iconPosition="right"
                        loading={loading}
                    >
                        Dalej
                    </Button>
                    <Button
                        variant="outline"
                        icon={ArrowRight02Icon}
                        loading={loading}
                    >
                        Z ikoną
                    </Button>
                </div>
            </section>

            <section className="fields">
                {SIZES.map((size) => (
                    <div key={size} className="field-row">
                        <div className="field-grow">
                            <Input
                                size={size}
                                label={`Imię (${size})`}
                                placeholder="Jan Kowalski"
                            />
                        </div>
                        <Button size={size}>Zapisz</Button>
                    </div>
                ))}
                <Input
                    label="Hasło"
                    type="password"
                    placeholder="Hasło"
                    hint="Co najmniej 8 znaków"
                />
                <Input
                    label="Szukaj ucznia"
                    placeholder="Nazwisko"
                    leftIcon={Search01Icon}
                />
                <Input
                    label="Ocena"
                    defaultValue="0"
                    error="Ocena musi być od 1 do 6"
                />
                <Input
                    label="Klasa"
                    defaultValue="1K"
                    disabled
                    hint="Pole zablokowane"
                />
            </section>
        </main>
    );
}
