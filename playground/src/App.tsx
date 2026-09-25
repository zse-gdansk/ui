import { useState } from "react";

const RAMPS = ["gray", "blue", "green", "orange", "red", "violet"] as const;
const STEPS = Array.from({ length: 12 }, (_, i) => i + 1);

export function App() {
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
        </main>
    );
}
