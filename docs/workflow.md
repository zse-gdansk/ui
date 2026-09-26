# Praca z repozytorium

## Komendy

| Komenda                         | Co robi                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------- |
| `bun run dev`                   | playground (Vite) z biblioteką prosto ze źródeł, zmiany widać od razu           |
| `bun run check`                 | typy (TS 7), lint (oxlint), format (oxfmt); musi przejść bez błędów i ostrzeżeń |
| `bun run format`                | formatuje (4 spacje, szerokość 80)                                              |
| `bun --filter playground build` | build playgroundu                                                               |
| `bun run colors`                | przelicza palety w `colors.css` ze `scripts/colors.ts`                          |

Lefthook przed commitem formatuje, poprawia lint i sprawdza typy.

## Zależności

- Zawsze najnowsze wersje: sprawdzaj `npm view <paczka> version`, nie wpisuj wersji z pamięci.
- Dokumentację bibliotek (Base UI, Shiki, Zod…) sprawdzaj w zainstalowanej paczce (`*.d.ts`) albo przez Context7, nie z pamięci.
- Ciężka zależność potrzebna jednemu komponentowi: opcjonalny peer i osobny punkt wejścia (jak Shiki w `CodeBlock`).

## Commity

Conventional Commits, po polsku, forma bezosobowa w czasie przeszłym:

```
feat(stepper): dodano linię postępu wypełnianą z pól kroku
fix(file-upload): poprawiono skok układu przy usuwaniu pliku
style(icon): zmniejszono grubość kreski ikon
```

Agent nie commituje: proponuje nazwę, commit robi autor.

## Sprawdzanie pracy

- `bun run check` i build to minimum, ale sprawdzają tylko kod, nie wygląd.
- Animacje, układ i gesty sprawdza się w przeglądarce. Przeglądarki przez narzędzia (Claude in Chrome) używaj tylko, gdy autor na to pozwoli. Do pomiaru ruchu wystarczy skrypt w konsoli: pozycja elementu w każdej klatce (`requestAnimationFrame` + `getBoundingClientRect`) pokazuje skoki lepiej niż oko.
- Jeśli czegoś nie sprawdziłeś w przeglądarce, napisz to w odpowiedzi.

## Pliki YAML

Rozszerzenie `.yaml`, nie `.yml`.
