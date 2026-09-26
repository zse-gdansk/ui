# Tokeny

Wszystkie tokeny są w `src/styles/tokens.css`, a palety kolorów w `src/styles/colors.css` (generowane, nie edytuj ręcznie).

## Kolory: dwie warstwy

1. **Prymitywy** (`colors.css`): 12-stopniowe skale w OKLCH dla `gray`, `blue`, `green`, `orange`, `red`, `violet`, plus `--X-contrast` (kolor tekstu na stopniu 9). Generuje je `scripts/colors.ts` (`bun run colors`) z kontrolą kontrastu: stopień 11 ma co najmniej 4.5:1, stopień 12 co najmniej 7:1 wobec stopnia 3.
2. **Tokeny semantyczne** (`tokens.css`): nazwane od roli, nie od koloru. **Komponenty używają wyłącznie ich.**

| Grupa       | Tokeny                                                                                                          |
| ----------- | --------------------------------------------------------------------------------------------------------------- |
| tło         | `--color-bg`, `-subtle`, `-muted`, `-hover`, `-active`, `-surface`, `-raised`, `-elevated`, `-tint`, `-overlay` |
| tekst       | `--color-text`, `-secondary`, `-disabled`, `-inverse`, `-on-accent`, `-on-danger`, `-on-success`, `-on-warning` |
| obramowania | `--color-border-subtle`, `--color-border`, `-strong`, `-hover`, `--color-separator`, `--color-focus-ring`       |
| akcent      | `--color-accent-bg`, `-bg-hover`, `-border`, `-solid`, `-solid-hover`, `-text`                                  |
| statusy     | `--color-danger-*`, `--color-success-solid`/`-text`, `--color-warning-solid`/`-text`                            |
| obrazy      | `--color-image-outline`: obrys 1px na zdjęciach i flagach (`outline-offset: -1px`), czerń albo biel 10%         |

Brakuje roli? Dodaj token semantyczny, nie sięgaj po prymityw w komponencie i nie pożyczaj tokenu z innej roli, bo „wartość akurat pasuje”.

## Akcent i motyw

- Akcent zmienia się atrybutem `data-accent` (np. `data-accent="violet"`) na dowolnym elemencie. Tokeny są zadeklarowane na `:root, [data-accent]`, więc przeliczają się w miejscu zmiany. Tło i tekst **nie** zależą od akcentu.
- Motyw: `data-theme="light"` albo `"dark"` tylko na `<html>`. Tokeny zależne od motywu (tła warstw, cienie) są w blokach `[data-theme="…"]`.
- W ciemnym motywie cienie prawie nie działają, dlatego warstwy nad tłem (`--color-bg-raised`, `--color-bg-elevated`) są jaśniejsze, a obrysy robi się półprzezroczystą bielą.

## Mieszanie kolorów

Tła statusów, zaznaczenia i podświetlenia robimy przez `color-mix`, np. `color-mix(in oklab, var(--color-accent-solid) 10%, transparent)`.

- **Zawsze `in oklab`.** W `in oklch` szare (odcień 0°) zmieszane z kolorem dają czerwonawy odcień, bo interpolacja idzie po kole barw. Patrz `pitfalls.md`.
- Mieszanie z `transparent` daje półprzezroczyste tło, które pasuje na każdą powierzchnię (strona, karta, wiersz tabeli). Mieszanie z tłem daje kolor nieprzezroczysty, potrzebny tam, gdzie pod spodem przewija się treść (przyklejone kolumny tabeli).

## Promienie

`--radius-sm` 6px, `--radius-md` 8px, `--radius-lg` 12px, `--radius-xl` 16px, `--radius-full` 999px.

**Zaokrąglenia współśrodkowe:** element wewnątrz innego ma promień zewnętrzny minus odstęp. Pozycja w menu z paddingiem 4px w kontenerze `--radius-md`: `calc(var(--radius-md) - 4px)`. Suwak w SegmentedControl: promień toru minus jego padding.

## Cienie

`--shadow-card`, `--shadow-popover`, `--shadow-modal`, każdy z cienką półprzezroczystą obwódką na końcu (w dark jasną). Obramowanie tylko tam, gdzie oznacza strukturę albo stan; głębię daje cień.

## Warstwy (z-index)

| Warstwa                                      | z-index |
| -------------------------------------------- | ------- |
| przyklejone części tabeli                    | 1–3     |
| tło i okno modala, sheet                     | 90 / 91 |
| popover, menu, select, combobox, date picker | 95      |
| tooltip                                      | 96      |
| toasty                                       | 100     |

Popover otwierany w modalu albo sheecie musi być nad nim, stąd 95 powyżej 91. Nowy nakładający się komponent dopisz do tej tabeli.

## Typografia i fonty

- Font tekstu dziedziczy się z aplikacji (biblioteka go nie narzuca). Przykład konfiguracji Intera (lokalny plik zmienny, preload, zapasowy Arial dopasowany metrykami, `font-optical-sizing`, warianty znaków): `playground/src/layout/inter.css`.
- `--font-mono`: Ioskeley Mono (SIL OFL, pliki w `src/fonts`, `@font-face` w `fonts.css`), z zapasem systemowym. Do kodu i tam, gdzie cyfry i znaki muszą mieć stałą szerokość.
- Liczby zmieniające się w miejscu (liczniki, punkty, procenty, daty w kalendarzu): `font-variant-numeric: tabular-nums`.
- Pola formularzy mają `font-size: 1rem` na telefonie (poniżej 16px iOS przybliża stronę przy fokusie), a od 640px `0.875rem`.
- `text-wrap: balance` na tytułach, `pretty` na opisach.
