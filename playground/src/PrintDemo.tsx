import {
    Button,
    PrintFromSpec,
    printDocument,
    type PrintSpec,
} from "@zse-gdansk/ui";
import { printChartBlock } from "@zse-gdansk/ui/charts";
import { printQRBlock } from "@zse-gdansk/ui/qr";

const COUNCIL = [
    "Anna Kowalska",
    "Jan Nowak",
    "Julia Lewandowska",
    "Mikołaj Zieliński",
    "Hanna Wiśniewska",
    "Szymon Nowak",
    "Zofia Wójcik",
    "Antoni Kamiński",
    "Maja Kaczmarek",
    "Filip Mazur",
    "Lena Krawczyk",
    "Igor Piotrowski",
];

// Tak mógłby wyglądać protokół zwrócony przez API.
const PROTOCOL: PrintSpec = {
    document: {
        logo: "/demo-logo.svg",
        organization: "Rada Samorządu Uczniowskiego",
        organizationDetail: "Zespół Szkół Energetycznych w Gdańsku",
        place: "Gdańsk, 23 października 2026",
        reference: "RSU/3/2026",
        title: "Protokół z posiedzenia nr 3/2026",
        subtitle: "Posiedzenie zwyczajne Rady Samorządu Uczniowskiego",
        runningHeader: "Protokół z posiedzenia nr 3/2026 · RSU ZSE w Gdańsku",
        runningFooter: "Wygenerowano w aplikacji Głosowania samorządu",
        watermark: true,
    },
    blocks: [
        {
            type: "meta",
            items: [
                {
                    label: "Data i godzina",
                    value: "23 października 2026, 14:30",
                },
                { label: "Miejsce", value: "Aula, budynek A" },
                { label: "Prowadzący", value: "Anna Kowalska" },
                { label: "Protokolant", value: "Jan Nowak" },
            ],
        },
        {
            type: "section",
            number: "1.",
            title: "Obecność",
            blocks: [
                {
                    type: "attendance",
                    quorum: 7,
                    people: COUNCIL.map((name, index) =>
                        index === 3
                            ? { name, present: false, note: "usprawiedliwiony" }
                            : { name, present: index % 5 !== 3 },
                    ),
                },
            ],
        },
        {
            type: "section",
            number: "2.",
            title: "Porządek obrad",
            blocks: [
                {
                    type: "list",
                    ordered: true,
                    items: [
                        "Otwarcie posiedzenia i stwierdzenie kworum.",
                        "Przyjęcie porządku obrad.",
                        "Uchwała w sprawie budżetu na drugi semestr.",
                        "Wolne wnioski.",
                    ],
                },
            ],
        },
        {
            type: "section",
            number: "3.",
            title: "Uchwała w sprawie budżetu na drugi semestr",
            blocks: [
                {
                    type: "text",
                    text: "Przewodnicząca przedstawiła projekt budżetu. Najwięcej środków przeznaczono na dzień sportu i wymianę szafek.\n\nPo dyskusji przystąpiono do głosowania jawnego.",
                },
                {
                    type: "table",
                    caption: "Projekt budżetu",
                    numbered: true,
                    columns: [
                        { key: "item", label: "Pozycja" },
                        {
                            key: "amount",
                            label: "Kwota (zł)",
                            format: "number",
                            total: "sum",
                        },
                        { key: "share", label: "Udział", format: "percent" },
                    ],
                    rows: [
                        { item: "Dzień sportu", amount: 1800, share: 0.45 },
                        { item: "Wymiana szafek", amount: 1200, share: 0.3 },
                        {
                            item: "Wycieczka integracyjna",
                            amount: 600,
                            share: 0.15,
                        },
                        { item: "Rezerwa", amount: 400, share: 0.1 },
                    ],
                },
                {
                    type: "chart",
                    kind: "bar",
                    title: "Podział budżetu",
                    x: "item",
                    horizontal: true,
                    height: "45mm",
                    series: [{ key: "amount", label: "Kwota (zł)" }],
                    data: [
                        { item: "Dzień sportu", amount: 1800 },
                        { item: "Wymiana szafek", amount: 1200 },
                        { item: "Wycieczka", amount: 600 },
                        { item: "Rezerwa", amount: 400 },
                    ],
                },
                {
                    type: "vote",
                    title: "Głosowanie nad uchwałą nr 7/2026",
                    yes: 7,
                    no: 2,
                    abstain: 1,
                    notCast: 2,
                    required: 7,
                    outcome: "Uchwała przyjęta",
                    passed: true,
                },
            ],
        },
        { type: "pageBreak" },
        {
            type: "section",
            number: "4.",
            title: "Wolne wnioski",
            blocks: [
                {
                    type: "stats",
                    items: [
                        { label: "Zgłoszone wnioski", value: 3 },
                        { label: "Przyjęte", value: 2 },
                        {
                            label: "Frekwencja",
                            value: "83%",
                            hint: "10 z 12 radnych",
                        },
                    ],
                },
                {
                    type: "note",
                    text: "Następne posiedzenie odbędzie się 20 listopada 2026 r.",
                },
            ],
        },
        {
            type: "signatures",
            signatures: [
                { role: "Przewodnicząca", name: "Anna Kowalska" },
                { role: "Protokolant", name: "Jan Nowak" },
            ],
        },
        {
            type: "qr",
            value: "https://glosowania.zse.edu.pl/sesje/3",
            caption: "Zeskanuj, aby otworzyć posiedzenie w aplikacji",
        },
    ],
};

const RENDERERS = { chart: printChartBlock, qr: printQRBlock };

export function PrintDemo() {
    return (
        <section className="fields">
            <div className="button-row">
                <Button
                    onClick={() => printDocument({ title: "Protokół 3-2026" })}
                >
                    Drukuj protokół
                </Button>
            </div>
            <PrintFromSpec spec={PROTOCOL} renderers={RENDERERS} />
        </section>
    );
}
