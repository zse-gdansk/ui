import {
    Calendar03Icon,
    HelpCircleIcon,
    UserMultipleIcon,
} from "@hugeicons/core-free-icons";
import { Accordion, Collapsible } from "@zse-gdansk/ui";

const RULES = [
    {
        value: "kto",
        title: "Kto może głosować?",
        content:
            "Każdy uczeń szkoły z aktywnym kontem. Głos jest tajny, a system zapisuje tylko to, że głos został oddany.",
    },
    {
        value: "kiedy",
        title: "Do kiedy trwa głosowanie?",
        content:
            "Do piątku, 15:00. Po tym czasie wyniki pokazują się wszystkim od razu.",
    },
    {
        value: "zmiana",
        title: "Czy mogę zmienić głos?",
        content:
            "Tak, do końca głosowania. Liczy się ostatni oddany głos, poprzednie są usuwane.",
    },
];

export function AccordionDemo() {
    return (
        <section className="accordion-demo">
            <Accordion items={RULES} defaultValue={["kto"]} />

            <Accordion
                variant="card"
                multiple
                items={[
                    {
                        value: "kandydaci",
                        title: "Kandydaci",
                        meta: "6 osób",
                        icon: UserMultipleIcon,
                        content:
                            "Lista kandydatów z klas 1–4 z programami wyborczymi.",
                    },
                    {
                        value: "terminy",
                        title: "Terminy",
                        meta: "do 3 paź",
                        icon: Calendar03Icon,
                        content:
                            "Zgłoszenia do 26 września, głosowanie 1–3 października.",
                    },
                    {
                        value: "pomoc",
                        title: "Pomoc",
                        icon: HelpCircleIcon,
                        disabled: true,
                        content: "Wkrótce.",
                    },
                ]}
            />

            <Accordion variant="separated" items={RULES} />

            <Collapsible label="Pokaż szczegóły liczenia głosów">
                Głosy liczy serwer po zamknięciu głosowania. Remis rozstrzyga
                dogrywka między kandydatami z tą samą liczbą głosów.
            </Collapsible>
        </section>
    );
}
