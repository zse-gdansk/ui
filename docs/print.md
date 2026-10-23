# Wydruki

Dokumenty do druku i PDF (protokoły, raporty, zestawienia, listy) składa się z klocków: w kodzie jako komponenty albo z opisu w JSON-ie, który przysyła API. Druk idzie przez przeglądarkę (`window.print()`, „Zapisz jako PDF”), bez serwera i bez dodatkowych zależności.

## Jak działa

- `PrintDocument` to kartka. Na ekranie podgląd w szerokości papieru, w węższym miejscu pomniejszony (nie przelany), więc podgląd i wydruk mają ten sam układ. Przy druku znika cała reszta aplikacji, a przewijane kontenery i wysokości ekranu nad dokumentem przestają go ucinać.
- Zawsze jasny jak papier, także w ciemnym motywie: komponenty w środku (`Text`, `Badge`, `VoteBar`) liczą kolory jak w jasnym. Akcent bierze z aplikacji.
- `@page` z rozmiarem i marginesami, „Strona 2 z 5” na każdej stronie (Chrome, Edge; Firefox i Safari drukują bez numeru). `runningHeader` i `runningFooter` powtarzają się na każdej stronie we wszystkich przeglądarkach (na ostatniej stopka stoi zaraz pod treścią).
- Tytuł sekcji nie zostaje sam na dole strony, wiersz tabeli nie łamie się, nagłówek tabeli powtarza się na kolejnych stronach, podpisy, wynik głosowania i kafelki zostają w całości.
- `printDocument({ title })` drukuje z nazwą pliku PDF (przeglądarka bierze ją z tytułu strony).

## Z komponentów

```tsx
<PrintDocument
    logo="/logo-zse.svg"
    organization="Rada Samorządu Uczniowskiego"
    organizationDetail="Zespół Szkół Energetycznych w Gdańsku"
    place="Gdańsk, 23 października 2026"
    reference="RSU/3/2026"
    title="Protokół z posiedzenia nr 3/2026"
    runningHeader="Protokół nr 3/2026"
    watermark={draft}
>
    <PrintMeta items={[{ label: "Miejsce", value: session.location }]} />
    <PrintSection number="1." title="Obecność">
        <PrintAttendance people={people} quorum={13} />
    </PrintSection>
    <PrintSection number="2." title="Głosowania">
        {rounds.map((round) => (
            <PrintVote key={round.id} title={round.question} {...round.tally} />
        ))}
    </PrintSection>
    <PrintSignatures signatures={[{ role: "Przewodnicząca", name }, { role: "Protokolant" }]} />
</PrintDocument>

<Button onClick={() => printDocument({ title: "Protokół 3-2026" })}>Drukuj</Button>
```

Klocki: `PrintSection` (numer, `breakBefore`, `keepTogether`), `PrintText` (pusta linia dzieli akapity), `PrintList`, `PrintMeta`, `PrintTable` (formaty, `total: "sum" | "count"`, `numbered`, `striped`, własna komórka przez `render`), `PrintStats`, `PrintVote`, `PrintAttendance` (podsumowanie i kworum), `PrintSignatures`, `PrintNote`, `PrintImage`, `PrintFigure`, `PrintPageBreak`. Wykres i QR są w osobnych wejściach: `PrintChart` z `@zse-gdansk/ui/charts`, `PrintQR` z `@zse-gdansk/ui/qr`. Wewnątrz dokumentu działają też zwykłe komponenty biblioteki.

Dokument nieoficjalny (lista dla wychowawcy, zestawienie robocze): bez `logo` i `organization` nie ma nagłówka firmowego, zostaje sam tytuł; `watermark` ze swoim tekstem, np. `watermark="Do użytku wewnętrznego"`.

## Z JSON-a (API)

`PrintSpec` to sam JSON (bez elementów i funkcji), więc backend może zbudować raport i go przysłać. `PrintFromSpec` składa z niego ten sam dokument:

```tsx
import { PrintFromSpec } from "@zse-gdansk/ui";
import { printChartBlock } from "@zse-gdansk/ui/charts";
import { printQRBlock } from "@zse-gdansk/ui/qr";

const RENDERERS = { chart: printChartBlock, qr: printQRBlock };

<PrintFromSpec spec={report} renderers={RENDERERS} />;
```

```json
{
    "document": {
        "title": "Frekwencja w październiku",
        "pageNumbers": "pageOf"
    },
    "blocks": [
        { "type": "stats", "items": [{ "label": "Średnia", "value": "87%" }] },
        {
            "type": "table",
            "numbered": true,
            "columns": [
                { "key": "class", "label": "Klasa" },
                { "key": "rate", "label": "Frekwencja", "format": "percent" }
            ],
            "rows": [{ "class": "3C", "rate": 0.91 }]
        },
        {
            "type": "chart",
            "kind": "bar",
            "title": "Frekwencja",
            "x": "class",
            "series": [{ "key": "rate", "label": "Frekwencja" }],
            "data": []
        }
    ]
}
```

Typy klocków: `section` (z zagnieżdżonymi `blocks`), `heading`, `text`, `list`, `meta`, `table`, `stats`, `vote`, `attendance`, `signatures`, `note`, `image`, `pageBreak`, oraz przez `renderers`: `chart`, `qr` i dowolne własne. Formaty wartości: `text`, `number`, `integer`, `percent` (ułamek: 0,36 to 36%), `date`, `datetime`, `time`, `boolean` („Tak”/„Nie”); pusta wartość to kreska, nie zero.

## Własne klocki

`renderers` dodaje nowe typy albo podmienia wbudowane. Renderer dostaje cały obiekt klocka i funkcję do zagnieżdżonych bloków:

```tsx
const RENDERERS: Record<string, PrintRenderer> = {
    ...{ chart: printChartBlock },
    agendaItem: (block, render) => (
        <PrintSection
            number={String(block.position)}
            title={String(block.title)}
        >
            {render(block.blocks as PrintBlock[])}
        </PrintSection>
    ),
};
```

Nieznany typ (nowszy klocek z API na starszym froncie) jest pomijany z ostrzeżeniem w konsoli; `onUnknown` pozwala pokazać zamiast niego np. notkę.

## Ograniczenia druku z przeglądarki

- Numery stron tylko w Chrome i Edge (`@page` z polami marginesu).
- Przeglądarka może dodać własny nagłówek i stopkę (data, adres): w oknie druku opcja „Nagłówki i stopki”.
- Jeden dokument na stronę aplikacji: `@page` jest wspólne dla całej strony.
