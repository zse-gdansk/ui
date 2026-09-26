# Ruch

Animacje są znakiem rozpoznawczym biblioteki. Ten plik opisuje, jakie wartości stosujemy i dlaczego. Wartości są konkretne: `0.96` to nie „około 0.95”, a `cubic-bezier(0.2, 0, 0, 1)` to nie „jakaś ease-out”.

## Czy w ogóle animować

| Jak często użytkownik to widzi                             | Decyzja                            |
| ---------------------------------------------------------- | ---------------------------------- |
| setki razy dziennie (wpisywanie, skróty klawiszowe, hover) | bez animacji albo natychmiast      |
| dziesiątki razy (menu, zakładki, checkbox)                 | krótko, 150–250ms                  |
| czasem (modal, sheet, toast, stepper)                      | pełna animacja, 250–400ms          |
| rzadko (pusty stan, pierwsze wejście)                      | można więcej, np. wejście po kolei |

Animacja musi mieć cel: pokazać, skąd coś przyszło (popover od wyzwalacza), co się zmieniło (znacznik zamiast numeru), w którą stronę idziemy (kalendarz, stepper), albo zamaskować skok układu (zwijanie). „Bo ładnie” nie jest celem.

## Tokeny

| Token             | Wartość                          | Do czego                                        |
| ----------------- | -------------------------------- | ----------------------------------------------- |
| `--ease-out`      | `cubic-bezier(0.23, 1, 0.32, 1)` | wejścia, wyjścia, przesunięcia, prawie wszystko |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)`     | podmiana ikon i warstw                          |
| `--ease-drawer`   | `cubic-bezier(0.32, 0.72, 0, 1)` | sheet, jak w iOS                                |
| `--ease-toast`    | `cubic-bezier(0.22, 1, 0.36, 1)` | stos toastów                                    |
| `--duration-fast` | `150ms`                          | kolory, obramowania, drobne zmiany              |

Nigdy `ease-in` na elementach interfejsu (zaczyna wolno, wygląda na opóźnienie). `linear` tylko dla ruchu ciągłego (spinner). `ease-in-out` dla ruchu na ekranie bez początku i końca (shimmer skeletonu).

## Wzorce, które stosujemy

### Naciśnięcie

`scale: 0.96` na `:active`, przejście `160ms var(--ease-out)`. Małe elementy w siatce (dni kalendarza, kółka steppera) `0.94`. Nigdy poniżej `0.94`. Tekstowe linki w treści się nie skalują.

### Hover

Tylko w `@media (hover: hover)`, żeby na dotyku stan nie zostawał po tapnięciu. **Tło hovera bez przejścia**: przy szybkim ruchu kursorem po liście (menu, tabela, dni) przejście tła zostaje w tyle i wygląda na lag. Kolor tekstu może mieć `var(--duration-fast)`.

### Popover, menu, tooltip, select

Wejście z `opacity: 0` i `scale: 0.97`, `transform-origin: var(--transform-origin)` (od wyzwalacza, nie od środka), `150ms var(--ease-out)`. Wyjście krótsze, `100ms`. `[data-instant]` od Base UI: czas `0ms` (zamknięcie z klawiatury, przełączanie między menu). Modal jest wyjątkiem: rośnie od środka ekranu (`scale: 0.95`, `300ms`), bo nie ma wyzwalacza obok.

### Podmiana ikon i warstw

Dwie (lub więcej) warstwy w jednej komórce siatki (`grid-area: 1 / 1`), ukryta ma `opacity: 0; scale: 0.25; filter: blur(4px)`, przejście `300ms var(--ease-standard)` na `opacity, scale, filter`. Wszystkie warstwy są w DOM, więc przejście działa w obie strony i jest przerywalne. Tak działają: spinner w przycisku, pokaż/ukryj hasło, kopiuj → znacznik, checkbox ✓ ↔ −, status w `InputGroup`, znacznik w stepperze. Napisy podmieniane tak samo trzymają szerokość dłuższego (nic nie skacze).

### Zwijanie i rozwijanie wysokości

Dwa sposoby, oba sprawdzone:

- **Wiersz siatki** `grid-template-rows: 1fr` ↔ `0fr` na elemencie zewnętrznym. **Dziecko, które się zwija, nie może mieć paddingu ani ramki** (`min-height: 0; overflow: hidden`), bo tych wiersz nie ściśnie. Padding i ramka idą na element w środku. (Alert, wiersze uploadu.)
- **Wysokość z Base UI** (`--accordion-panel-height`, `--collapsible-panel-height`) albo mierzona `ResizeObserver` i ustawiana jawnie (stepper).

Treść w środku wchodzi lekkim zjazdem (`translate: 0 -6px` → 0) i przenikaniem, żeby nie była tylko „odsłaniana”.

### Przewijanie z kierunkiem

Kalendarz, stepper: nowa treść wjeżdża z kierunku ruchu (`translate` z ±16–40px), stara wyjeżdża w przeciwną stronę **jednocześnie**. Stara zostaje w DOM jako kopia (`data-leaving`, `inert`, `aria-hidden`, `position: absolute`) do końca animacji. Bez tego przez chwilę jest pusto i widać skok. Zmiana widoku (np. dni → miesiące) się przenika, nie przesuwa.

### Suwaki pod wybranym elementem

SegmentedControl, paginacja: pozycja i szerokość mierzone z DOM (`offsetLeft`, `offsetWidth`) do zmiennych CSS, przejście `translate, width` `280ms var(--ease-out)`. Pierwsze ustawienie bez animacji (`data-ready` po klatce), żeby suwak nie wjeżdżał z lewej przy ładowaniu.

### Postęp

Pasek przesuwany `transform: translateX(calc((var(--p) - 1) * 100%))` w torze z `overflow: hidden` (nie `width`), `500ms var(--ease-out)`, wypełnia się od zera przy pierwszym renderze (`@starting-style`). Pierścienie z `conic-gradient` animują się przez zarejestrowaną zmienną (`@property --zse-progress { syntax: "<number>" }`), bez tego gradient przeskakuje.

### Wejście elementów, które pojawiają się później

Alert, pusty stan: animują się tylko, gdy pojawiły się po załadowaniu strony (np. błąd po wysłaniu formularza). Te obecne od początku stoją. Służy do tego `markEnter` z `src/utils/enter.ts` (atrybut w DOM, nie stan, żeby hydracja się zgadzała). Rzadkie wejścia mogą iść po kolei, co ~60ms.

### Opóźnione pokazanie

Skeleton i spinner pojawiają się dopiero po `150ms` (albo `delay`). Szybkie ładowanie nie mignie.

## Czego unikać

- **Przejść szerokości przy pisaniu.** Pole, które rośnie z tekstem (`InputGroup` z przyrostkiem), zmienia szerokość w tej samej klatce co tekst. Opóźnienie powoduje przewijanie pola i drganie przy każdej literze.
- **Animowania stanu przez React przy przewijaniu.** Znaczniki krawędzi (tabela, ScrollArea) to atrybuty w DOM ustawiane z listenera, nie `useState`.
- **Keyframes tam, gdzie coś może zostać przerwane.** Przejścia (`transition`) są przerywalne, keyframes zaczynają od zera. Keyframes tylko dla sekwencji jednorazowych (wstrząs, wejście z kopią wychodzącą) i ruchu ciągłego.
- **`transition: all`.** Zawsze konkretne właściwości.
- **Sprężyn z odbiciem na elementach, które same się pojawiają** (menu, popover). Odbicie ma sens tylko po geście z pędem.

## prefers-reduced-motion

W każdym pliku CSS z ruchem blok `@media (prefers-reduced-motion: reduce)`:

- bez `translate` i `scale` (w tym naciśnięcia), bez blura przy podmianie ikon,
- przenikanie (`opacity`) zostaje, bo nie powoduje choroby lokomocyjnej i dalej pokazuje zmianę,
- ruch ciągły, który coś komunikuje (spinner), zostaje, ale wolniej,
- wstrząsy przy błędzie znikają, komunikat zostaje.
