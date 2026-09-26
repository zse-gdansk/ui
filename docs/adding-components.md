# Dodawanie komponentu

## Najpierw sprawdź

1. **Czy już jest?** Zajrzyj do `docs/components.md`. Często wystarczy nowy prop albo wariant istniejącego.
2. **Czy Base UI ma prymityw?** Lista w `node_modules/@base-ui/react/` (menu, popover, slider, otp-field, drawer, toggle-group, context-menu…). Czytaj typy (`*.d.ts`) i atrybuty danych (`*DataAttributes.d.ts`, `*CssVars.d.ts`) zainstalowanej wersji, nie pamięć ani stare przykłady. Base UI często ma wbudowane rzeczy, których łatwo nie zauważyć: bezpieczny trójkąt w podmenu, przytrzymanie palcem w menu kontekstowym, `hiddenUntilFound` w accordionie.

## Pliki

| Co                 | Gdzie                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| komponent          | `src/components/<nazwa>/<Nazwa>.tsx`                                                           |
| style              | `src/styles/<nazwa>.css`, import w `src/styles/index.css`                                      |
| eksport            | `src/index.ts`: komponent i jego typy (`type XProps`)                                          |
| demo               | `playground/src/<Nazwa>Demo.tsx`, podpięte w `playground/src/App.tsx`                          |
| pomocnicze funkcje | obok komponentu (`dates.ts`, `search.ts`) albo w `src/utils/`, gdy używa ich kilka komponentów |

Komponent z ciężką zależnością (np. Shiki w `CodeBlock`) dostaje **osobny punkt wejścia** (`src/code-block.ts`, wpis w `exports` w `package.json`, ścieżka w `playground/tsconfig.json`), a zależność idzie do `peerDependencies` z `optional: true`. Główny `index.ts` nie może jej dotykać, inaczej build aplikacji bez tej zależności się wysypie.

## Konwencje kodu

- **Klasy CSS `zse-<komponent>-<część>`**, stan w atrybutach `data-*` (`data-size`, `data-variant`, `data-state`), nie w klasach. Style Base UI też przez jego atrybuty (`data-open`, `data-starting-style`, `data-highlighted`…).
- **API z propsami, nie z dziećmi,** gdy komponent ma stałą strukturę (`Select` z `options`, `Tabs` z `items`). Części składane (`Menu` + `MenuItem`) tylko tam, gdzie treść jest dowolna.
- **`exactOptionalPropertyTypes` jest włączone.** Opcjonalne propsy przekazywane do Base UI rozsmarowuj warunkowo: `{...(value !== undefined && { value })}`. Propsy, które użytkownik poda jako `x ? "…" : undefined`, typuj `string | undefined` (np. `error`).
- **Kontrolowany i niekontrolowany:** `value` / `defaultValue` / `onValueChange`, wewnętrzny stan tylko wtedy, gdy `value` nie jest podane.
- **Teksty jako propsy z polskimi domyślnymi** (`closeLabel = "Zamknij"`), żeby dało się je zmienić.
- **`className` od użytkownika łączone** z własną klasą (`[..].filter(Boolean).join(" ")`), a przy Base UI obsługuj też wariant z funkcją stanu.
- **`render` do podmiany elementu** (link z routera, np. `NextLink`) przez `useRender` albo prop `render` części Base UI. Biblioteka nie zależy od `next`.

## Pola formularzy

Każde pole: `Field.Root` z `name`, etykieta `Field.Label`, pod spodem `FieldFooter` (błąd z propa albo z walidacji i podpowiedź), `invalid` tylko gdy jest błąd (`{...(error && { invalid: true })}`, nigdy `invalid={false}`). Wartość, która nie jest tekstem z natywnej kontrolki (data, pliki), rejestruj przez `useFormValue` z `src/components/form/context.ts`. Szczegóły w `docs/forms.md`.

## Dostępność: lista kontrolna

- [ ] Wszystko osiągalne z klawiatury; widoczny focus ring (`outline: 1.5px solid var(--color-focus-ring)`), nie ucięty przez `overflow: hidden` rodzica.
- [ ] Przycisk z samą ikoną ma `aria-label`.
- [ ] Zmiany ważne dla użytkownika ogłaszane (`aria-live="polite"`, `role="status"`/`<output>`, błędy `role="alert"`).
- [ ] Elementy ozdobne (`aria-hidden`), kopie do mierzenia i wychodzące kopie (`aria-hidden` + `inert`).
- [ ] Semantyka zamiast ról na `div`, gdzie się da (lint pilnuje: `prefer-tag-over-role`). Wyjątek z komentarzem, jeśli wzorzec WAI-ARIA wymaga inaczej (grid w kalendarzu).
- [ ] Pola dotyku na telefonie około 40px (`@media (pointer: coarse)`).

## Działanie w Next i na serwerze

- `"use client"` na górze komponentów z hookami i zdarzeniami.
- **Żadnego `window`, `navigator`, `matchMedia` w renderze.** Zależności od przeglądarki przez `useSyncExternalStore` z wartością serwerową (np. `Kbd` pokazuje wersję nie-Apple przy hydracji) albo w efektach i ref callbackach.
- Atrybuty zależne od przeglądarki (np. „pojawił się po załadowaniu”) ustawiaj w DOM w ref callbacku, nie przez stan, żeby hydracja się zgadzała.

## Mierzenie i obserwowanie DOM

- Szerokości i pozycje (suwaki, skracanie breadcrumbs, pole rosnące z tekstem) mierz w `useLayoutEffect` albo ref callbacku z `ResizeObserver`, przed narysowaniem klatki.
- Ref callback z funkcją sprzątającą (React 19) jest najprostszy, gdy element montuje się od nowa (np. z `key`).
- Stan, który zmienia się przy przewijaniu albo ruchu myszy, trzymaj w atrybutach DOM, nie w stanie Reacta.

## Przed oddaniem

1. `bun run check` (typy, lint, format) bez błędów i ostrzeżeń.
2. `bun --filter playground build` przechodzi.
3. Demo w playgroundzie pokazuje warianty, stany brzegowe (puste, długie teksty, błąd, wyłączony) i oba motywy.
4. Przejrzyj `docs/pitfalls.md`.
5. Wpis w `docs/components.md`.
6. Jeśli nie sprawdziłeś w przeglądarce, napisz to wprost.
