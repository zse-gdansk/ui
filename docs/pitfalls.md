# Pułapki

Błędy, które już raz popełniliśmy. Przejrzyj przed oddaniem pracy.

## Kolory

- **`color-mix(in oklch, …)` z szarym daje czerwony.** Szare mają odcień 0° (róż-czerwień), a OKLCH interpoluje po kole barw, więc przy małej domieszce koloru wynik zostaje przy odcieniu szarego. Alerty wszystkich wariantów wyszły brudnoczerwone. Zawsze `in oklab`.

## Tekst

- **`line-height: 1` + `overflow: hidden` ucina ogonki** liter y, j, ą, ę (chip w comboboxie, wartość selecta). Tekst z `overflow: hidden` dostaje `line-height` około 1.3.
- **Polska odmiana:** „1 plik, 2 pliki, 5 plików, 22 pliki”. Zawsze `Intl.PluralRules("pl-PL")`, nigdy `count === 1 ? … : …`.
- **Wyszukiwanie bez polskich znaków:** „ł” nie rozkłada się w NFD na literę i ogonek jak „ą”, trzeba ją mapować osobno (`fold` w `src/search/search.ts`). Do dopasowań całych słów `\b` nie zna polskich liter, używaj `(?<![\p{L}\p{N}_])` z flagą `u`.

## Układ

- **Zwijany element z paddingiem albo ramką nie zwinie się do zera** przez `grid-template-rows: 0fr`. Zatrzymuje się na sumie paddingu i ramki, a po odmontowaniu treść pod nim skacze. Padding i ramka idą do elementu w środku.
- **Odstęp liczony od sąsiada** (`element + element { margin-top }`) zmienia się, gdy usuwasz pierwszy element, i kolejny podskakuje. Daj odstęp każdemu elementowi i cofnij pierwszy marginesem rodzica.
- **Odmontowanie pustej listy zabiera odstęp** (`gap`) rodzica. Lista zostaje w DOM także pusta.
- **`overflow: hidden` ucina focus ring** pól przy krawędzi (stepper, collapsible). Kontener dostaje `padding: 4px; margin: -4px`.
- **Znak na marginesie liczony od geometrii kciuka:** Base UI stawia środek kciuka suwaka na procencie całego toru, więc podpisy pod torem liczą pozycję od całej szerokości, bez wcięcia o połowę kciuka.
- **Przyklejanie do krawędzi tylko dla elementów na krawędzi.** Podpis wartości minimalnej i maksymalnej dosuwa się do brzegu, pozostałe są wyśrodkowane.

## Ruch

- **Przejście szerokości przy pisaniu powoduje drganie:** pole rośnie za tekstem, na moment tekst wychodzi poza pole i przeglądarka je przewija. Szerokość ustawiana w tej samej klatce, bez przejścia.
- **Stara treść znikała od razu, nowa wjeżdżała z przezroczystości**, więc przez chwilę było pusto (kalendarz). Stara zostaje jako wychodząca kopia do końca animacji.
- **Wychodząca kopia, która się nie narysowała, nie kończy animacji** i czeka ukryta, aż wrócisz do widoku. Przy zmianie widoku nie zapamiętuj kopii (`showMonth(…, false)`).
- **`transitionend` nie zawsze przychodzi** (element przerenderował się w trakcie). Usuwanie po animacji potrzebuje zapasu (`setTimeout`), a funkcja usuwająca musi być idempotentna.
- **FLIP (przesuwanie sąsiadów transformem) w uploadzie wyszedł gorzej** niż zwykłe zwijanie siatką. Nie wracaj do niego bez pomiaru.
- **`--zmienna` z `@property { inherits: false }` nie dotrze do `::before`.** Zmienna czytana przez pseudo-element musi mieć `inherits: true`.
- **Przygaszanie na `:active`** tekstu, który już jest podświetlony hoverem, wygląda jak mrugnięcie.

## Formularze i Base UI

- **`invalid={false}` zasłania błędy formularza** (Base UI traktuje to jak wymuszony stan). Tylko `{...(error && { invalid: true })}`.
- **`setCustomValidity` w efekcie spóźnia się o jedną zmianę:** Base UI sprawdza poprawność w `onChange`, przed efektem. Własną walidację dawaj przez `validate` na `Field.Root`.
- **Filtr comboboxa reagował na tekst wpisywany przez Base UI** (etykieta wybranej opcji po kliknięciu i przy zamykaniu), przez co zamykająca się lista migała wszystkimi opcjami. Filtruj tylko po `reason === "input-change"` i `"input-clear"`.
- **Base UI Form nie zbiera dat ani plików.** Rejestruj je przez `useFormValue`.

## Narzędzia i proces

- **Zamiana nazw wyrażeniem regularnym z `\b`** złapała koniec nazwy klasy (`zse-calendar-month` → `zse-calendar-shown`, bo myślnik to granica słowa). Po takiej zamianie przeszukaj plik pod kątem skutków ubocznych.
- **`position: absolute` na strzałce popovera** trzeba dać samemu. Base UI podaje tylko współrzędne.
- **Import CSS przez `url()` w bibliotece:** ścieżki względne do `src/fonts`, bundler aplikacji je rozwiązuje.
- **`background-attachment: fixed` nie działa na iOS Safari** (wspólna fala shimmeru), tam każdy skeleton ma własną falę. To akceptowalne, nie naprawiaj.
- **`document.execCommand("copy")` jest przestarzałe.** Kopiowanie tylko przez Clipboard API (`useCopy`), z jawnym stanem błędu na `http`.
