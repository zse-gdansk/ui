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
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Checkbox,
    Input,
    Modal,
    ModalClose,
    Radio,
    RadioGroup,
    Select,
    Switch,
    Tabs,
    Textarea,
    toast,
    Toaster,
    Tooltip,
    TooltipProvider,
    Icon,
} from "@zse-gdansk/ui";
import { useState } from "react";

import { AccordionDemo } from "./AccordionDemo";
import { AlertDemo } from "./AlertDemo";
import { AvatarDemo } from "./AvatarDemo";
import { BadgeDemo } from "./BadgeDemo";
import { CalendarDemo } from "./CalendarDemo";
import { CodeDemo } from "./CodeDemo";
import { CodeBlockDemo } from "./CodeDemo2";
import { ComboboxDemo } from "./ComboboxDemo";
import { EmptyDemo } from "./EmptyDemo";
import { FormDemo } from "./FormDemo";
import { GradesDemo } from "./GradesDemo";
import { LinkDemo } from "./LinkDemo";
import { MenuDemo } from "./MenuDemo";
import { MiscDemo } from "./MiscDemo";
import { NumberDemo } from "./NumberDemo";
import { PaginationDemo } from "./PaginationDemo";
import { PopoverDemo } from "./PopoverDemo";
import { ProgressDemo } from "./ProgressDemo";
import { SegmentedDemo } from "./SegmentedDemo";
import { SheetDemo } from "./SheetDemo";
import { SkeletonDemo } from "./SkeletonDemo";
import { SliderDemo } from "./SliderDemo";
import { UploadDemo } from "./UploadDemo";

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
                <Textarea
                    label="Uwagi do pracy"
                    placeholder="Co poprawić w następnym zadaniu…"
                    hint="Uczeń zobaczy je przy ocenie"
                    maxLength={300}
                />
                <Textarea
                    label="Opis zadania"
                    rows={4}
                    maxRows={false}
                    defaultValue="Napisz program, który wczytuje listę uczniów z pliku CSV i wypisuje średnią punktów z każdego zadania."
                />
                <Textarea
                    label="Uzasadnienie"
                    error="Uzasadnienie jest wymagane"
                />
                <Textarea label="Notatka" disabled defaultValue="Zablokowane" />
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

            <section className="button-row">
                <Button
                    variant="outline"
                    onClick={() => toast.success("Zapisano wyniki sprawdzianu")}
                >
                    Sukces
                </Button>
                <Button
                    variant="outline"
                    onClick={() =>
                        toast.error("Nie udało się oddać głosu", {
                            description: "Głosowanie zakończyło się o 15:00.",
                        })
                    }
                >
                    Błąd
                </Button>
                <Button
                    variant="outline"
                    onClick={() =>
                        toast.undo("Usunięto ocenę z matematyki", {
                            onUndo: () => toast.info("Przywrócono ocenę"),
                        })
                    }
                >
                    Cofnij
                </Button>
                <Button
                    variant="outline"
                    onClick={() =>
                        void toast.promise(
                            new Promise((done) => setTimeout(done, 1800)),
                            {
                                loading: "Wysyłanie ocen do dziennika…",
                                success: "Wysłano 28 ocen",
                                error: "Błąd wysyłania",
                            },
                        )
                    }
                >
                    Promise
                </Button>
                <Toaster />
            </section>

            <section className="cards">
                <Card>
                    <CardHeader>
                        <CardTitle>Sprawdzian z fizyki</CardTitle>
                        <CardDescription>
                            Klasa 3C, 26 września, 28 uczniów
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        Średnia 3,8. Oddane prace: 26 z 28.
                    </CardContent>
                    <CardFooter>
                        <Button size="sm">Wystaw oceny</Button>
                        <Button size="sm" variant="ghost">
                            Szczegóły
                        </Button>
                    </CardFooter>
                </Card>
                <Card variant="elevated">
                    <CardHeader>
                        <CardTitle>Wybory do samorządu</CardTitle>
                        <CardDescription>
                            Głosowanie do piątku, 15:00
                        </CardDescription>
                    </CardHeader>
                    <CardContent>Oddano 412 głosów z 780.</CardContent>
                </Card>
                <Card
                    variant="subtle"
                    render={({ children, ...props }) => (
                        <a {...props} href="#plan">
                            {children}
                        </a>
                    )}
                >
                    <CardHeader>
                        <CardTitle>Plan lekcji</CardTitle>
                        <CardDescription>
                            Karta jako link: hover i fokus
                        </CardDescription>
                    </CardHeader>
                </Card>
            </section>

            <section className="button-row">
                <Modal
                    alert
                    trigger={<Button variant="danger">Usuń sprawdzian</Button>}
                    title="Usunąć sprawdzian?"
                    description="Sprawdzian z fizyki i 28 ocen znikną z dziennika. Tego nie da się cofnąć."
                    footer={
                        <>
                            <ModalClose
                                render={<Button variant="ghost" size="sm" />}
                            >
                                Anuluj
                            </ModalClose>
                            <ModalClose
                                render={<Button variant="danger" size="sm" />}
                            >
                                Usuń
                            </ModalClose>
                        </>
                    }
                />
            </section>

            <SheetDemo />

            <PopoverDemo />

            <CodeBlockDemo />

            <LinkDemo />

            <EmptyDemo />

            <PaginationDemo />

            <SegmentedDemo />

            <ProgressDemo />

            <SkeletonDemo />

            <MiscDemo />

            <SliderDemo />

            <FormDemo />

            <AccordionDemo />

            <CalendarDemo />

            <CodeDemo />

            <ComboboxDemo />

            <UploadDemo />

            <AvatarDemo />

            <BadgeDemo />

            <AlertDemo />

            <NumberDemo />

            <MenuDemo />

            <GradesDemo />
        </main>
    );
}
