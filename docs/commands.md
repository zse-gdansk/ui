# Paleta poleceń i skróty

`CommandProvider` daje aplikacji paletę poleceń (⌘K / Ctrl+K), skróty klawiszowe z sekwencjami (`g u`) i okno ze wszystkimi skrótami (`?`). Polecenia nie są wpisane w jednym miejscu: każdy komponent rejestruje swoje na czas, gdy jest zamontowany. Layout daje nawigację i akcje ogólne, strona uczniów dokłada „Dodaj ucznia”, a po wyjściu ze strony to polecenie znika z palety i jego skrót przestaje działać.

## Podłączenie

Provider raz, nad `AppShell`. W Next.js `navigate` to `router.push`, bez tego `href` robi pełne przejście przez `location.assign`.

```tsx
"use client";

import { useRouter } from "next/navigation";
import { AppShell, CommandProvider } from "@zse-gdansk/ui";

export function Shell({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    return (
        <CommandProvider navigate={router.push}>
            <AppShell sidebar={<Nav />} header={<Header />}>
                <AppCommands />
                {children}
            </AppShell>
        </CommandProvider>
    );
}
```

Przycisk w pasku otwiera paletę przez `useCommandPalette()`. `shortcut` na `HeaderAction` tylko pokazuje ⌘K w tooltipie; provider obsługuje go sam i nie przełącza palety drugi raz.

```tsx
const palette = useCommandPalette();

<HeaderAction
    icon={Search01Icon}
    label="Szukaj"
    shortcut="mod+k"
    onClick={palette.toggle}
/>;
```

`useCommandPalette()` zwraca `isOpen`, `open(id?)`, `close()` i `toggle()`. `open("action.note")` otwiera paletę od razu w podmenu albo na pierwszym kroku tego polecenia, np. z przycisku „Dodaj uwagę” na karcie ucznia.

| Prop          | Domyślnie              | Co robi                                                                |
| ------------- | ---------------------- | ---------------------------------------------------------------------- |
| `navigate`    | `location.assign`      | przejście pod `href` polecenia                                         |
| `shortcut`    | `"mod+k"`              | otwiera i zamyka paletę; `false` bez skrótu                            |
| `help`        | `"?"`                  | okno skrótów, też jako polecenie „Skróty klawiszowe”; `false` bez okna |
| `recent`      | `"zse-command-recent"` | klucz localStorage pięciu ostatnio użytych; `false` bez pamiętania     |
| `placeholder` | z katalogu             | tekst pustego pola na głównej liście                                   |

## Polecenia

```tsx
const COMMANDS: Command[] = [
    {
        id: "nav.students",
        title: "Uczniowie",
        icon: UserGroupIcon,
        group: "Przejdź do",
        shortcut: "g u",
        href: "/uczniowie",
    },
];

export function AppCommands() {
    useCommands(COMMANDS);
    return null;
}
```

Tablica musi być stała: poza komponentem albo w `useMemo`. Nowa tablica w każdym renderze to ponowna rejestracja przy każdym renderze.

| Pole             | Co robi                                                                                                           |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| `id`             | unikalne w aplikacji; po nim pamiętane ostatnio użyte. Ten sam `id` zarejestrowany później nadpisuje wcześniejszy |
| `title`          | nazwa na liście, zdaniowo („Dodaj uwagę”, nie „Dodaj Uwagę”)                                                      |
| `subtitle`       | dopisek po tytule, np. klasa ucznia; przeszukiwany słabiej niż tytuł                                              |
| `group`          | nagłówek grupy; kolejność grup przy pustym polu jak kolejność rejestracji                                         |
| `icon`, `avatar` | ikona Hugeicons albo awatar z imienia (uczniowie, nauczyciele)                                                    |
| `keywords`       | dodatkowe słowa do wyszukiwania, np. `["dark", "noc"]` przy motywie                                               |
| `shortcut`       | skrót albo tablica skrótów; na liście widać pierwszy                                                              |
| `danger`         | czerwone przy podświetleniu, np. „Wyloguj”                                                                        |
| `disabled`       | wyszarzone, bez akcji i bez skrótu                                                                                |
| `searchOnly`     | tylko w wynikach wyszukiwania, pusta lista zostaje krótka (rzadkie strony administracji)                          |
| `hidden`         | tylko skrót, bez pozycji na liście                                                                                |
| `keepOpen`       | paleta zostaje otwarta po akcji                                                                                   |

Co robi wybór, jedno z trzech:

- `href`: przejście przez `navigate`.
- `children`: podmenu. Stała tablica poleceń (filtrowana w palecie) albo funkcja `(query, signal) => Promise<Command[]>` z wynikami z serwera. `placeholder` zmienia tekst pola w podmenu.
- `perform(context)`: akcja. Zwrócony Promise trzyma paletę otwartą ze wskaźnikiem w wierszu; odrzucony zostawia ją z komunikatem błędu w stopce. Bez błędu paleta się zamyka, chyba że `keepOpen`.

Polecenia ze stałych podmenu są też szukane z głównej listy: „ciemny” znajduje Motyw › Ciemny, ze ścieżką w dopisku.

## Akcje z krokami

`steps` zbiera wartości przed `perform`: wybór z listy (`type: "choice"`) i tekst (domyślnie). Każdy krok ma `id` (klucz w `values`), `label` (nazwa w ścieżce nad polem) i `placeholder`. Wybrane wartości stoją w ścieżce obok nazwy polecenia, np. „Dodaj uwagę · Jan Kowalski”.

```tsx
{
    id: "action.note",
    title: "Dodaj uwagę",
    icon: NoteEditIcon,
    group: "Akcje",
    shortcut: "n",
    steps: [
        {
            id: "student",
            type: "choice",
            label: "Uczeń",
            placeholder: "Szukaj ucznia…",
            options: async (query, signal) =>
                (await api.students(query, { signal })).map((student) => ({
                    value: student.id,
                    label: student.name,
                    subtitle: student.className,
                    avatar: { name: student.name },
                })),
        },
        {
            id: "text",
            label: "Treść uwagi",
            validate: (value) => (value.length < 5 ? "Co najmniej 5 znaków" : null),
        },
    ],
    perform: async ({ values, labels }) => {
        await api.addNote(values.student, values.text);
        toast.success(`Dodano uwagę: ${labels.student}`);
    },
}
```

- `options` to stała tablica albo funkcja `(query, signal, values)`, więc lista może zależeć od wcześniejszych kroków.
- Tekst: `validate` zwraca komunikat albo `null`; komunikat stoi w wierszu, a Enter nic nie robi, dopóki wartość jest zła. Puste pole blokuje, chyba że `optional`. `defaultValue` może być funkcją poprzednich wartości (punkty wstępnie wpisane według powodu). `inputMode` dla klawiatury na telefonie.
- `perform` dostaje `values` (wartości po `id` kroku, dla wyboru `value` opcji) i `labels` (to, co widział użytkownik, do toastu).

## Wyniki z serwera w głównej liście

```tsx
useCommandSource({
    id: "students",
    group: "Uczniowie",
    minLength: 2,
    search: async (query, signal) =>
        (await api.students(query, { signal })).map((student) => ({
            id: `student.${student.id}`,
            title: student.name,
            subtitle: student.className,
            avatar: { name: student.name },
            href: `/uczniowie/${student.id}`,
        })),
});
```

Wyszukiwanie rusza 150 ms po ostatnim znaku, poprzednie zapytanie dostaje `abort` (przekaż `signal` do `fetch`). Stare wyniki zostają do przyjścia nowych, wskaźnik w polu pokazuje się dopiero po 250 ms. Grupa z lepszym trafieniem stoi wyżej, także gdy przyszła z serwera: „ziel” to najpierw uczniowie, dopiero potem polecenia. `search` może być nową funkcją w każdym renderze; źródło rejestruje się ponownie tylko ze zmianą `id`, `group` albo `minLength`.

## Skróty

- **Sekwencja**: klawisze po spacji, `"g u"` to G, potem U. Po G czeka do 6 s; kto się zawaha, po 0,5 s widzi na dole podpowiedź z tym, co może być dalej. Inny klawisz, Escape albo kliknięcie przerywa.
- **Akord**: `"mod+shift+p"`, `mod` to ⌘ na Macu i Ctrl gdzie indziej.
- Skróty bez ⌘, Ctrl i Alt (`g u`, `n`, `?`) nie działają w polach tekstowych, menu i otwartych oknach, bo tam te klawisze się pisze. Akordy działają wszędzie.
- Polecenie z `children` albo `steps` pod skrótem otwiera paletę od razu na swojej stronie.
- Skrót, który obsługuje ktoś inny (⌘B w `AppShell`), też warto zarejestrować jako polecenie z `perform`: wtedy jest w palecie i w oknie `?`. Provider pomija zdarzenia, które ktoś już obsłużył (`defaultPrevented`), więc akcja nie wykona się dwa razy.

Umowa w naszych aplikacjach:

| Rodzaj               | Skrót                 | Przykład                      |
| -------------------- | --------------------- | ----------------------------- |
| przejście do strony  | `g` + pierwsza litera | `g u` Uczniowie, `g p` Punkty |
| tworzenie na stronie | `c` + litera          | `c u` Dodaj ucznia            |
| częsta akcja         | jedna litera          | `n` Dodaj uwagę               |
| przełącznik widoku   | akord z `mod`         | `mod+b` panel                 |
| pomoc                | `?`                   | okno skrótów                  |

Skrót polecenia z `href` sam pojawia się w tooltipie zwiniętego `SidebarItem` z tym samym `href` („Uczniowie G potem U”); nie wpisuje się go drugi raz w panelu. `Kbd` i `formatSequence` pokazują sekwencje w innych miejscach.

## Klawiatura w palecie

| Klawisz       | Co robi                                                           |
| ------------- | ----------------------------------------------------------------- |
| ↑ ↓           | wybór wiersza                                                     |
| Enter         | wykonanie, otwarcie podmenu, wybór opcji, zatwierdzenie tekstu    |
| →             | otwarcie podmenu albo pierwszego kroku (z kursorem na końcu pola) |
| ← , Backspace | w pustym polu o stronę wstecz                                     |
| Escape        | w podmenu wstecz, na głównej liście zamknięcie                    |

Na telefonie strzałka przy polu cofa, a stopki z klawiszami i skrótów w wierszach nie ma.
