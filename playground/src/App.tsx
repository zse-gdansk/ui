import {
    ArrowRight02Icon,
    BookOpen01Icon,
    Calendar03Icon,
    Copy01Icon,
    Delete02Icon,
    InformationCircleIcon,
    Note01Icon,
    Search01Icon,
} from "@hugeicons/core-free-icons";
import {
    Button,
    Checkbox,
    Input,
    Radio,
    RadioGroup,
    Select,
    Switch,
    Tabs,
    Tooltip,
    TooltipProvider,
    Icon,
} from "@zse-gdansk/ui";
import { useState } from "react";

const RAMPS = ["gray", "blue", "green", "orange", "red", "violet"] as const;
const STEPS = Array.from({ length: 12 }, (_, i) => i + 1);
const VARIANTS = ["primary", "ghost", "outline", "danger"] as const;
const CLASSES = [
    { value: "1a", label: "1A" },
    { value: "2b", label: "2B" },
    { value: "3c", label: "3C" },
] as const;
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
                <Select
                    label="Klasa"
                    placeholder="Wybierz klasę"
                    options={CLASSES}
                    hint="Lista oddziałów"
                />
                <Select
                    label="Przedmiot"
                    defaultValue="inf"
                    options={[
                        { value: "inf", label: "Informatyka" },
                        { value: "mat", label: "Matematyka" },
                        { value: "fiz", label: "Fizyka", disabled: true },
                    ]}
                />
                <Select
                    label="Ocena"
                    placeholder="Wybierz"
                    options={[
                        { value: "1", label: "1" },
                        { value: "2", label: "2" },
                        { value: "3", label: "3" },
                    ]}
                    error="Wybierz ocenę"
                />
                <Select
                    label="Rok"
                    defaultValue="2026"
                    options={[{ value: "2026", label: "2026/2027" }]}
                    disabled
                />
            </section>

            <section className="checks">
                <Checkbox label="Obecny" defaultChecked />
                <Checkbox label="Usprawiedliwiony" />
                <Checkbox label="Zablokowany" disabled defaultChecked />
            </section>

            <section className="checks">
                <Switch label="Powiadomienia" defaultChecked />
                <Switch label="Tryb cichy" />
                <Switch label="Zablokowany" disabled defaultChecked />
            </section>

            <section className="checks">
                <RadioGroup
                    label="Kandydat"
                    name="kandydat"
                    defaultValue="anna"
                >
                    <Radio value="anna" label="Anna Kowalska" />
                    <Radio value="jan" label="Jan Nowak" />
                    <Radio value="ewa" label="Ewa Wiśniewska" disabled />
                </RadioGroup>
            </section>

            <section className="tabs">
                <Tabs
                    defaultValue="oceny"
                    items={[
                        {
                            value: "oceny",
                            label: "Oceny",
                            icon: BookOpen01Icon,
                            content:
                                "Średnia 4,6. Ostatnia ocena: 5 z matematyki.",
                        },
                        {
                            value: "frekwencja",
                            label: "Frekwencja",
                            icon: Calendar03Icon,
                            content: "Obecność w tym miesiącu: 96%.",
                        },
                        {
                            value: "plan",
                            label: "Plan",
                            content: "Jutro pierwsza lekcja: fizyka, sala 12.",
                        },
                        {
                            value: "uwagi",
                            label: "Uwagi",
                            icon: Note01Icon,
                            disabled: true,
                            content: "Brak uwag.",
                        },
                    ]}
                />
            </section>

            <section className="button-row">
                <TooltipProvider>
                    <Tooltip content="Skopiuj link do sprawdzianu">
                        <Button variant="outline" icon={Copy01Icon}>
                            Kopiuj
                        </Button>
                    </Tooltip>
                    <Tooltip content="Usuwa sprawdzian i wszystkie oceny z niego">
                        <Button variant="outline" icon={Delete02Icon}>
                            Usuń
                        </Button>
                    </Tooltip>
                    <Tooltip
                        side="bottom"
                        content="Średnia ważona z ocen z tego semestru, bez ocen poprawionych."
                    >
                        <button
                            type="button"
                            className="info"
                            aria-label="Jak liczona jest średnia"
                        >
                            <Icon icon={InformationCircleIcon} />
                        </button>
                    </Tooltip>
                </TooltipProvider>
            </section>
        </main>
    );
}
