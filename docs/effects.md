# Efekty

W `src/` nie ma gołego `useEffect` ani `useLayoutEffect`. Pilnuje tego oxlint (`no-restricted-imports` w `.oxlintrc.json`); jedynym wyjątkiem jest `src/utils/effects.ts`, gdzie żyją nazwane hooki. Efekt to ostatnia deska ratunku, nie sposób na przepływ danych: większość rzeczy robionych kiedyś w efekcie da się zrobić bez niego, a to, co zostaje, ma nazwę mówiącą, po co jest.

## Najpierw bez efektu

| Zamiast efektu              | Kiedy                                                 | Przykład                                                                                        |
| --------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| liczenie w renderze         | wartość wynika z propsów albo stanu                   | długość w `Textarea` z `value`; `pending` w wyszukiwaniu palety to „wynik jest dla innej frazy” |
| poprawka stanu w renderze   | stan musi dogonić prop (`if (x !== prev) setY(…)`)    | `AppLoader` montuje ekran, gdy `loading` wraca na `true`                                        |
| obsługa zdarzenia           | coś ma się stać, bo ktoś kliknął albo wcisnął klawisz | fokus za dniem w `Calendar`: `flushSync` w `onKeyDown`, potem `focus()`                         |
| `key`                       | reset całego stanu przy zmianie encji                 | formularz innego ucznia                                                                         |
| `useSyncExternalStore`      | subskrypcja magazynu, media query, zegara             | rejestr poleceń, `useNow`, motyw                                                                |
| callback ref ze sprzątaniem | obserwator jednego elementu bez zależności            | `watchGutters` w `Menu`, pomiar listy w palecie                                                 |

## Nazwane hooki (`src/utils/effects.ts`)

| Hook                                                                    | Do czego                                                                                                                     | Przykład                                                                                 |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `useMountEffect(fn)`                                                    | raz po zamontowaniu, sprzątanie przy odmontowaniu; wartości z renderu przez `useEffectEvent` albo `useLatest`                | nasłuch skrótów w `CommandProvider`, zwolnienie podglądów w `FileUpload`                 |
| `useEventListener(target, type, handler, { enabled })`                  | nasłuch z zawsze aktualnym handlerem; `target` to `"window"`, `"document"`, ref, obiekt albo funkcja (`() => matchMedia(…)`) | ⌘B w `AppShell`, `beforeunload` w `Form`, przeciąganie plików                            |
| `useTimeout(fn, delay \| null, key?)`, `useInterval(fn, delay \| null)` | odliczanie; `null` wyłącza, zmiana `key` zaczyna od nowa                                                                     | mrugnięcie duplikatu w `TagInput`, dopiski w `AppLoader`                                 |
| `useResizeObserver(refs, fn, { enabled, children })`                    | zmiana rozmiaru elementów; wywołanie od razu i przy każdej zmianie                                                           | suwak w `SegmentedControl`, breadcrumbs chowające środek                                 |
| `useAbortableTask(key \| null, task, delay)`                            | zadanie asynchroniczne dla klucza z `abort` poprzedniego; stan ustawiany po `await`, gdy `!signal.aborted`                   | wyszukiwanie w `Combobox` i palecie, sprawdzenie w `InputGroup`, kolorowanie `CodeBlock` |
| `useDomEffect(fn, deps?)`                                               | praca na DOM po renderze, przed malowaniem: pomiar, fokus, przewinięcie, animacja; bez ustawiania stanu                      | przewinięcie do aktywnej pozycji w `Sidebar`, animacja liczby w `Stat`                   |
| `useExternalEffect(fn, deps?)`                                          | synchronizacja z czymś poza Reactem, ponawiana ze zmianą `deps`                                                              | instancja ECharts w `Chart`, rejestracja w `useCommands`                                 |
| `useLatest(value)`                                                      | najnowsza wartość dla kodu spoza renderu (getter w rejestrze), nie do czytania w renderze                                    | `useFormValue`, źródło wyników palety                                                    |

`useDomEffect` i `useExternalEffect` to te same efekty co w React, z nazwą, która mówi, czego wolno w nich używać. Lint nie widzi `setState` przez hook, więc pilnuje tego przegląd kodu: stan ustawiany w nich synchronicznie to znak, że wartość powinna się liczyć w renderze.

## Nowy przypadek

Gdy żaden hook nie pasuje, najpierw sprawdź tabelę „bez efektu”. Jeśli dalej trzeba efektu, dopisz nazwany hook do `src/utils/effects.ts` z komentarzem, do czego jest i czego w nim nie robić, i dodaj go do tabeli wyżej.
