# @zse-gdansk/ui: instrukcja dla agentów

Biblioteka komponentów React dla aplikacji szkolnych ZSE w Gdańsku. Zbudowana na [Base UI](https://base-ui.com), stylowana zwykłym CSS z tokenami, bez Tailwinda.

Zanim cokolwiek zmienisz, przeczytaj plik z `docs/` dotyczący tego, co robisz. Najważniejsze zasady są niżej; szczegóły, wartości i uzasadnienia są w dokumentach.

## Mapa dokumentacji

| Plik                                                   | Kiedy czytać                                            |
| ------------------------------------------------------ | ------------------------------------------------------- |
| [docs/principles.md](docs/principles.md)               | zawsze: charakter biblioteki, czego nie robimy          |
| [docs/adding-components.md](docs/adding-components.md) | nowy komponent albo większa zmiana w istniejącym        |
| [docs/motion.md](docs/motion.md)                       | każda animacja, przejście, hover, stan wciśnięcia       |
| [docs/tokens.md](docs/tokens.md)                       | kolory, promienie, cienie, warstwy, fonty               |
| [docs/forms.md](docs/forms.md)                         | pola formularzy, walidacja, `Form`                      |
| [docs/i18n.md](docs/i18n.md)                           | każdy tekst widoczny w interfejsie albo dla czytnika    |
| [docs/pitfalls.md](docs/pitfalls.md)                   | przed oddaniem pracy: błędy, które już raz popełniliśmy |
| [docs/components.md](docs/components.md)               | spis komponentów i tego, co już potrafią                |
| [docs/workflow.md](docs/workflow.md)                   | komendy, commity, sprawdzanie pracy                     |

## Zasady bez wyjątków

1. **Base UI najpierw.** Jeśli Base UI ma prymityw (Menu, Popover, Slider, OTPField, Drawer…), budujemy na nim. Własna implementacja tylko wtedy, gdy go nie ma (kalendarz, upload, stepper).
2. **Tylko tokeny.** Komponent nie używa `--gray-*`, `--blue-*` ani surowych kolorów, tylko tokenów semantycznych z `tokens.css`. Mieszanie kolorów zawsze `color-mix(in oklab, …)`, nigdy `in oklch` (patrz pitfalls).
3. **Ikony tylko z Hugeicons** przez komponent `Icon`. Żadnego ręcznie pisanego SVG. Przed użyciem sprawdź, czy ikona istnieje w `@hugeicons/core-free-icons`.
4. **Ruch według `docs/motion.md`**: konkretne wartości, nie „coś podobnego”. Hover tylko w `@media (hover: hover)`, tła hovera bez przejścia, `prefers-reduced-motion` w każdym komponencie z ruchem.
5. **Teksty z katalogu.** Etykiety, komunikaty i `aria-label` biorą się z `useMessages()` (`src/i18n/`), nigdy nie są wpisane w komponencie. Nowy tekst to klucz w `types.ts` i wartość w `pl.ts`; na razie jest tylko katalog polski. Liczby, daty i odmiana przez `Intl` z `t.locale`, nie z `"pl-PL"`. Szczegóły w `docs/i18n.md`. Komentarze w kodzie po polsku i oszczędnie: tylko to, czego nie widać z kodu.
6. **Dostępność to nie dodatek.** Klawiatura, focus ring, nazwy dla czytników, role. Szczegóły w `adding-components.md`.
7. **Nie commituj.** Proponuj nazwę commita (Conventional Commits, po polsku, bezosobowo: `feat(nazwa): dodano …`). Commit robi autor.
8. **Nie twierdź, że sprawdziłeś w przeglądarce, jeśli nie sprawdziłeś.** `bun run check` weryfikuje typy, lint i format, nie wygląd ani animację.
