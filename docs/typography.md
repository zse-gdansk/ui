# Typografia

Tekst w aplikacji piszesz komponentami `Text`, `Heading`, `Strong` i `Code`, a nie gołym `<p>`, `<span>` czy `<h2>` z własną klasą. Rozmiar, kolor i grubość biorą się wtedy z jednego miejsca (`src/styles/typography.css`) i zgadzają się z resztą biblioteki. Reguły, z których wynikają wartości, są w [design.md](design.md): `body-size`, `weight-scale`, `state-weight`, `mono-in-text`, `color-meaning`.

## Co czego używać

| Chcesz                                             | Użyj                                     | Nie                                                       |
| -------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------- |
| akapit treści                                      | `<Text>`                                 | `<p className="opis">`                                    |
| podpis, licznik, „ostatnia zmiana…”                | `<Text size="sm" tone="secondary">`      | `<span style={{ fontSize: 12, color: "#888" }}>`          |
| fragment zdania w innym kolorze                    | `<Text render={<span />} tone="danger">` | `<span className="red">`                                  |
| nagłówek strony, sekcji, bloku                     | `<Heading level={1 \| 2 \| 3}>`          | `<h2 className="title">`                                  |
| nagłówek wyglądający inaczej, niż wynika z poziomu | `<Heading level={3} size="md">`          | przeskakiwanie poziomów (`h4` po `h1`), żeby był mniejszy |
| wyróżnienie w zdaniu                               | `<Strong>`                               | `<b>` albo `fontWeight: 600`                              |
| kod, ścieżka, zmienna w zdaniu                     | `<Code>`                                 | `<code>` bez stylu albo `<span className="mono">`         |
| HTML z edytora albo markdownu                      | `<Prose dangerouslySetInnerHTML={…}>`    | stylowanie `h2`, `ul`, `table` od nowa w aplikacji        |

```tsx
<Card>
    <Heading level={2}>Koło robotyki</Heading>
    <Text tone="secondary">
        Prowadzi <Strong>Piotr Szymański</Strong>, sala <Code>208</Code>.
    </Text>
    <Text size="sm" tone="secondary" tabular>
        Zapisanych: 12
    </Text>
</Card>
```

## Skala

| Komponent                   | Rozmiar | Do czego                                     |
| --------------------------- | ------- | -------------------------------------------- |
| `Heading size="xl"`         | 24px    | strona błędu, duża liczba na kafelku         |
| `Heading level={1}`         | 20px    | nagłówek strony (jak `PageHeader`)           |
| `Heading level={2}`         | 16px    | tytuł karty, modala, sekcji                  |
| `Heading level={3}` i niżej | 14px    | tytuł bloku w karcie                         |
| `Text size="lg"`            | 16px    | wstęp pod nagłówkiem                         |
| `Text`                      | 14px    | treść, dane, opisy                           |
| `Text size="sm"`            | 12px    | podpisy, liczniki, etykiety grup             |
| `Prose size="sm"`           | 13px    | treść w wąskim miejscu, np. opis w popoverze |

## Zasady

- **`level` to semantyka, `size` to wygląd.** Poziomy idą po kolei (czytnik ekranu nawiguje po nich), a rozmiar zmienia się propem. Bez `size` rozmiar wynika z poziomu.
- **Kolor tylko ze znaczeniem.** `tone` ma `default`, `secondary`, `accent`, `success`, `warning`, `danger`. Dowolnego koloru nie ma, bo kolor zawsze coś znaczy (`color-meaning`).
- **Trzy grubości.** 400 tekst, 500 wyróżnienie (`Strong` albo `weight="medium"`), 600 tylko nagłówki. Stan (wybrany, aktywny) nie zmienia grubości (`state-weight`).
- **`Strong` ma pełny kolor tekstu**, więc wyróżnienie widać także w szarym zdaniu („Wypisano **Annę Nowak** z koła”).
- **`Code` jest o stopień mniejszy (`0.9em`)**, bo monospace obok zwykłych liter wygląda na większy.
- **Liczby, które się zmieniają, z `tabular`**: liczniki, punkty, godziny.
- **Ucinanie przez `truncate`** (jedna linia) albo `truncate={2}`; interlinia zostaje, więc ogonki ą, ę, y nie są ucięte.
- **Bez `letter-spacing` i `text-transform: uppercase`** (`no-tracking`, `sentence-case`).

## Kiedy gołe elementy są w porządku

- **Układ, nie tekst.** `<div>` do siatki i odstępów. `Text` nie służy do layoutu.
- **Wewnątrz komponentów biblioteki.** `Button`, `Badge`, `MenuItem`, `Label`, pola formularzy, `Card` z `CardTitle` mają już własną typografię. `<Text>` w `<Button>` tylko by ją nadpisał.
- **Zwykły tekst w `Text`.** Dziedziczy styl rodzica i nie potrzebuje `<span>`. `render={<span />}` jest tylko dla fragmentu, który wygląda inaczej niż reszta zdania.

## Prose

Tylko dla HTML-a, którego nie składasz z komponentów: treść z edytora, markdown, opis z CMS-a. `Prose` nie ma własnej typografii: dzieli reguły CSS z komponentami, więc `h2` z edytora wygląda jak `<Heading level={2}>`, `strong` jak `Strong`, `code` jak `Code`, a lista zadań (`- [x]`) jak `Checkbox`. Style są w `:where()`, więc aplikacja nadpisze pojedynczy element bez walki o specyficzność.

**HTML od użytkowników zawsze najpierw czyść** (np. DOMPurify), dopiero potem `dangerouslySetInnerHTML`. Biblioteka tego nie robi.

```tsx
import DOMPurify from "dompurify";

<Prose
    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(ogloszenie.html) }}
/>;
```

Jeśli treść da się złożyć z komponentów (tekst z bazy, który znasz w kodzie), składaj ją z `Text` i `Heading`, a nie przez `Prose`.
