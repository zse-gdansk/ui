# Komponenty

Spis tego, co jest i co już potrafi. Zanim dodasz komponent albo prop, sprawdź, czy tego tu nie ma. Po dodaniu komponentu dopisz go tutaj.

## Akcje

| Komponent               | Base UI             | Najważniejsze                                                                                                                                 |
| ----------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                | Button              | warianty `primary`/`ghost`/`outline`/`danger`, `loading` ze spinnerem podmienianym z ikoną, `icon` + `iconPosition`, `static` bez naciśnięcia |
| `Toggle`, `ToggleGroup` | Toggle, ToggleGroup | `pressedIcon` podmieniana, `multiple`, `variant="outline"` sklejony w pasek narzędzi                                                          |
| `CopyButton`            | –                   | podmiana ikony i napisu bez skoku szerokości, błąd na `http`                                                                                  |
| `Link`                  | useRender           | `default`/`accent`/`plain`, zewnętrzne ze strzałką, `confirm` z oknem i „nie pytaj ponownie”, `render` dla `NextLink`                         |

## Pola

| Komponent                                   | Base UI                    | Najważniejsze                                                                                                                        |
| ------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `Input`                                     | Field                      | ikony, pokaż/ukryj hasło                                                                                                             |
| `InputGroup`                                | Field                      | przedrostek, przyrostek jadący za tekstem, `check` z opóźnieniem i abortem, status spinner/✓/błąd                                    |
| `Textarea`                                  | Field                      | wysokość z treści (`rows`, `maxRows`), miękki `maxLength` z licznikiem                                                               |
| `NumberField`                               | NumberField                | przyciski −/+, `suffix`, przeciąganie etykiety (`scrub`), `format` przez `Intl`                                                      |
| `Select`                                    | Select                     | lista w `ScrollArea`                                                                                                                 |
| `Combobox`                                  | Combobox                   | wyszukiwanie z rankingiem i bez polskich znaków, podświetlenie, `multiple` z chipami, `onSearch` z serwera                           |
| `DatePicker`, `Calendar`                    | Popover (kalendarz własny) | tydzień od poniedziałku, zakresy w obie strony, widoki dni/miesięcy/lat, kropki wydarzeń, klawiatura WAI-ARIA                        |
| `CodeField`                                 | OTPField                   | grupy z kreską, wklejanie, SMS, `onComplete` z weryfikacją, wstrząs przy błędzie                                                     |
| `Checkbox`, `CheckboxGroup`                 | Checkbox, CheckboxGroup    | „zaznacz wszystkie” w stanie pośrednim, licznik, kolumny, opisy                                                                      |
| `Radio`, `RadioGroup`                       | Radio, RadioGroup          |                                                                                                                                      |
| `Switch`                                    | Switch                     |                                                                                                                                      |
| `Slider`                                    | Slider                     | zakres, dymek z wartością, kreski z podpisami                                                                                        |
| `FileUpload`                                | – (własny)                 | przeciąganie nad oknem, wklejanie, walidacja typu i rozmiaru, podgląd miniatur poza głównym wątkiem, `onUpload` z postępem i abortem |
| `PasswordStrength`                          | –                          | ocena 0–4, wymagania, lista popularnych haseł                                                                                        |
| `Label`                                     | –                          | `required`, `optional`                                                                                                               |
| `Form`, `FormSubmit`, `Fieldset`, `FormRow` | Form, Fieldset             | patrz `docs/forms.md`                                                                                                                |

## Nakładki

| Komponent                      | Base UI             | Najważniejsze                                                                                               |
| ------------------------------ | ------------------- | ----------------------------------------------------------------------------------------------------------- |
| `Modal`, `ModalClose`          | Dialog, AlertDialog | `alert` bez X i Escape                                                                                      |
| `Sheet`, `SheetClose`          | Drawer              | `right`/`left`/`bottom`/`auto`, przeciąganie z prędkością, `expandable` i `snapPoints`                      |
| `Popover`, `PopoverClose`      | Popover             | strzałka, `openOnHover`, `closable`                                                                         |
| `Menu`, `MenuItem`, `MenuSub`… | Menu                | podmenu z bezpiecznym trójkątem, działające skróty (`mod+d`), checkbox i radio, `render` dla linków routera |
| `ContextMenu`                  | ContextMenu         | prawy przycisk i przytrzymanie palcem, części z `Menu`                                                      |
| `Tooltip`, `TooltipProvider`   | Tooltip             | tapnięcie na dotyku                                                                                         |
| `Toaster`, `toast`             | Toast               | grupowanie duplikatów, `toast.undo`, `toast.promise`                                                        |

## Treść i informacja

| Komponent                                         | Base UI                | Najważniejsze                                                                                                                                                                                                        |
| ------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Card`, `Container`                               | useRender              |                                                                                                                                                                                                                      |
| `Table` i części, `TableNumberCell`, `TableEmpty` | –                      | przyklejony nagłówek i kolumny, cienie krawędzi, krzyżyk hovera, edycja punktów jak w arkuszu                                                                                                                        |
| `Accordion`, `Collapsible`                        | Accordion, Collapsible | `plain`/`card`/`separated`, otwieranie przy ⌘F                                                                                                                                                                       |
| `Tabs`                                            | Tabs                   |                                                                                                                                                                                                                      |
| `SegmentedControl`                                | RadioGroup             | suwak pod wybranym                                                                                                                                                                                                   |
| `Stepper`                                         | –                      | linia postępu wypełniana z pól kroku, walidacja kroku, wersja kompaktowa                                                                                                                                             |
| `Pagination`                                      | –                      | stała liczba pozycji, skok do strony z „…”, `@container`                                                                                                                                                             |
| `Breadcrumbs`                                     | –                      | chowanie środka do menu „…” z mierzenia szerokości                                                                                                                                                                   |
| `Alert`                                           | –                      | akcja w linii z Promise, zwijanie przy zamknięciu                                                                                                                                                                    |
| `Badge`                                           | useRender              | `soft`/`outline`/`solid`, kropka z pulsem                                                                                                                                                                            |
| `Avatar`, `AvatarGroup`                           | Avatar                 | generator gradientów z seeda, inicjały z kontrastem                                                                                                                                                                  |
| `Progress`, `Meter`                               | Progress, Meter        | kolor z progów, kawałki, pierścień                                                                                                                                                                                   |
| `Stat`, `StatGroup`                               | –                      | format z `Intl` (`t.locale`), zmiana z `previous` albo `delta` z tonem według `intent`, wykres z `trend`, liczba dojeżdża przy zmianie, szkielet przy `loading`, warianty jak `Card`, grupa z kreskami na każdym tle |
| `Skeleton`, `SkeletonText`                        | –                      | wspólna fala shimmeru, tryb z dziećmi bez skoku układu                                                                                                                                                               |
| `EmptyState`                                      | –                      | kafelek na kartach, wejście po kolei                                                                                                                                                                                 |
| `Spinner`, `Kbd`, `Separator`                     | Separator              | `Kbd` z systemowymi skrótami                                                                                                                                                                                         |
| `ScrollArea`                                      | –                      | wygaszanie maską, przewijanie po najechaniu na strzałkę                                                                                                                                                              |
| `CodeBlock`                                       | – (Shiki)              | osobne wejście `@zse-gdansk/ui/code-block`, diffy, słowa, błędy, ikony języków                                                                                                                                       |
| `Icon`                                            | –                      | owijka Hugeicons                                                                                                                                                                                                     |
| `LocaleSwitcher`                                  | Menu                   | nazwy języków z `Intl.DisplayNames` (własna + w języku interfejsu), spinner do końca obietnicy `onValueChange`, flagi z `flags` (np. country-flag-icons), bez zależności od i18next                                  |

## Narzędzia

| Eksport                                         | Co robi                                                              |
| ----------------------------------------------- | -------------------------------------------------------------------- |
| `createSearch`, `fold`, `Highlight`             | wyszukiwanie z rankingiem, literówką i podświetleniem (`src/search`) |
| `formatShortcut`, `shortcutKeys`                | skróty klawiszowe pod system (⌘ / Ctrl)                              |
| `passwordScore`, `defaultRules`                 | ocena hasła, np. do walidacji w schemacie                            |
| `LocaleProvider`, `useMessages`, `pl`, `plural` | katalog tekstów i jego nadpisywanie (`docs/i18n.md`)                 |
