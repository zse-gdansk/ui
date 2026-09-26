# Komponenty

Spis tego, co jest i co już potrafi. Zanim dodasz komponent albo prop, sprawdź, czy tego tu nie ma. Po dodaniu komponentu dopisz go tutaj.

## Układ

| Komponent                                                                                                                  | Base UI                    | Najważniejsze                                                                                                                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AppShell`, `AppShellTrigger`, `useAppShell`                                                                               | Drawer                     | panel po lewej i pasek nad treścią, szkielet na wysokość ekranu i przewija się tylko `main` (jak w Linearze, bez gumowego odbicia całego layoutu); zwinięcie do 56px animowane szerokością (⌘B / Ctrl+B bez animacji), poniżej 768px ta sama treść w wysuwanym panelu, `AppShellTrigger` tylko na telefonie; `cookie` zapisuje zwinięcie dla SSR; link „Przejdź do treści” |
| `AppHeader`, `HeaderBreadcrumbs`, `HeaderAction`                                                                           | – (Breadcrumbs, Tooltip)   | pasek dla `header`: przycisk panelu na telefonie, breadrumbs albo `title`, akcje zawsze w całości; breadrumbs deklaruje strona przez `<HeaderBreadcrumbs>` (portal do paska, środek chowa się do „…”); `HeaderAction` 32×32 z tooltipem, `shortcut` działa globalnie i jest w tooltipie, `badge` jako kropka, `render` dla linków                                          |
| `PageHeader`                                                                                                               | – (Skeleton)               | nagłówek treści strony z `<h1>`, opisem, `meta` i akcjami na linii bazowej tytułu; w wąskim kontenerze (`@container`) akcje schodzą pod opis; `loading` ze szkieletami w wysokości tekstu                                                                                                                                                                                  |
| `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarGroup`, `SidebarItem`, `SidebarSub`, `SidebarFooter`, `isActivePath` | Collapsible, Menu, Tooltip | ikony w stałej kolumnie i etykiety ucinane krawędzią, więc zwijanie nic nie przesuwa; po zwinięciu najechanie zamienia znak w przycisk rozwijania, tooltipy (kolejne od razu), licznik jako kropka, grupy z kreską w tym samym wierszu; `SidebarSub` rozwija się w miejscu, a po zwinięciu otwiera menu obok ikony; `render` dla linków routera                            |
| `UserMenu`                                                                                                                 | Menu (Avatar)              | konto zalogowanej osoby: w `SidebarFooter` wiersz z awatarem, imieniem i rolą, po zwinięciu sam awatar w kolumnie ikon (bez przeskoku), menu nad wierszem na jego szerokość albo obok awatara z imieniem na górze; poza panelem okrągły przycisk 32px; pozycje menu podaje aplikacja; `loading` ze szkieletem                                                              |

Zwinięcie bez mignięcia w Next.js: serwer czyta cookie i podaje stan startowy, szkielet sam zapisuje zmiany.

```tsx
// app/(app)/layout.tsx
import { cookies } from "next/headers";
import { AppShell } from "@zse-gdansk/ui";

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const collapsed = (await cookies()).get("zse-sidebar")?.value === "1";
    return (
        <AppShell
            cookie="zse-sidebar"
            defaultCollapsed={collapsed}
            sidebar={<Nav />}
            header={<Header />}
        >
            {children}
        </AppShell>
    );
}
```

Panel to części `Sidebar` w propie `sidebar`:

```tsx
<Sidebar>
    <SidebarHeader logo={<img src="/znak.svg" alt="" />} title="Dziennik ZSE" />
    <SidebarContent>
        <SidebarGroup label="Dziennik">
            <SidebarItem
                icon={UserGroupIcon}
                render={<Link href="/uczniowie" />}
                active={isActivePath(pathname, "/uczniowie")}
            >
                Uczniowie
            </SidebarItem>
        </SidebarGroup>
    </SidebarContent>
</Sidebar>
```

Pasek i breadrumbs strony. `AppHeader` idzie do layoutu, breadrumbs do strony, bo dopiero ona zna nazwy (np. ucznia z bazy). Na pierwszym renderze na serwerze widać `title`, breadrumbs pojawiają się po hydracji w tym samym miejscu.

```tsx
// layout
<AppShell header={<AppHeader title="Dziennik ZSE" actions={<HeaderAction icon={Search01Icon} label="Szukaj" shortcut="mod+k" onClick={openPalette} />} />} sidebar={…}>

// components/crumbs.tsx: funkcji renderLink nie przekaże strona serwerowa,
// więc Link podpina raz małe opakowanie klienckie.
"use client";
export const Crumbs = (props: BreadcrumbsProps) => (
    <HeaderBreadcrumbs {...props} renderLink={(link) => <Link {...link} />} />
);

// app/(app)/uczniowie/[id]/page.tsx (serwerowa)
<Crumbs items={[{ label: "Uczniowie", href: "/uczniowie" }, { label: student.name }]} />
```

Części panelu czytają `useAppShell()`: `collapsed` i `inDrawer` (w wysuwanym panelu treść jest zawsze w pełnej wersji).

## Akcje

| Komponent               | Base UI             | Najważniejsze                                                                                                                                 |
| ----------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                | Button              | warianty `primary`/`ghost`/`outline`/`danger`, `loading` ze spinnerem podmienianym z ikoną, `icon` + `iconPosition`, `static` bez naciśnięcia |
| `Toggle`, `ToggleGroup` | Toggle, ToggleGroup | `pressedIcon` podmieniana, `multiple`, `variant="outline"` sklejony w pasek narzędzi                                                          |
| `CopyButton`            | –                   | podmiana ikony i napisu bez skoku szerokości, błąd na `http`                                                                                  |
| `Link`                  | useRender           | `default`/`accent`/`plain`, zewnętrzne ze strzałką, `confirm` z oknem i „nie pytaj ponownie”, `render` dla `NextLink`                         |

## Pola

| Komponent                                   | Base UI                    | Najważniejsze                                                                                                                                                                                                                       |
| ------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Input`                                     | Field                      | ikony, pokaż/ukryj hasło                                                                                                                                                                                                            |
| `InputGroup`                                | Field                      | przedrostek, przyrostek jadący za tekstem, `check` z opóźnieniem i abortem, status spinner/✓/błąd                                                                                                                                   |
| `Textarea`                                  | Field                      | wysokość z treści (`rows`, `maxRows`), miękki `maxLength` z licznikiem                                                                                                                                                              |
| `NumberField`                               | NumberField                | przyciski −/+, `suffix`, przeciąganie etykiety (`scrub`), `format` przez `Intl`                                                                                                                                                     |
| `Select`                                    | Select                     | lista w `ScrollArea`                                                                                                                                                                                                                |
| `Combobox`                                  | Combobox                   | wyszukiwanie z rankingiem i bez polskich znaków, podświetlenie, `multiple` z chipami, `onSearch` z serwera                                                                                                                          |
| `DatePicker`, `Calendar`                    | Popover (kalendarz własny) | tydzień od poniedziałku, zakresy w obie strony, widoki dni/miesięcy/lat, kropki wydarzeń, klawiatura WAI-ARIA                                                                                                                       |
| `TimePicker`                                | Popover                    | wartość `"HH:MM"`, kolumny godzin i minut (`step`, `min`/`max`) albo `slots` z planem podanym przez aplikację (lekcje, zmiany), `slotEdge` start/koniec, znacznik trwającego przedziału, `ScrollArea`, to samo pole co `DatePicker` |
| `CodeField`                                 | OTPField                   | grupy z kreską, wklejanie, SMS, `onComplete` z weryfikacją, wstrząs przy błędzie                                                                                                                                                    |
| `Checkbox`, `CheckboxGroup`                 | Checkbox, CheckboxGroup    | „zaznacz wszystkie” w stanie pośrednim, licznik, kolumny, opisy                                                                                                                                                                     |
| `Radio`, `RadioGroup`                       | Radio, RadioGroup          |                                                                                                                                                                                                                                     |
| `Switch`                                    | Switch                     |                                                                                                                                                                                                                                     |
| `Slider`                                    | Slider                     | zakres, dymek z wartością, kreski z podpisami                                                                                                                                                                                       |
| `FileUpload`                                | – (własny)                 | przeciąganie nad oknem, wklejanie, walidacja typu i rozmiaru, podgląd miniatur poza głównym wątkiem, `onUpload` z postępem i abortem                                                                                                |
| `PasswordStrength`                          | –                          | ocena 0–4, wymagania, lista popularnych haseł                                                                                                                                                                                       |
| `Label`                                     | –                          | `required`, `optional`                                                                                                                                                                                                              |
| `Form`, `FormSubmit`, `Fieldset`, `FormRow` | Form, Fieldset             | patrz `docs/forms.md`                                                                                                                                                                                                               |

## Nakładki

| Komponent                      | Base UI             | Najważniejsze                                                                                                                                                                                                                                        |
| ------------------------------ | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Modal`, `ModalClose`          | Dialog, AlertDialog | `alert` bez X i Escape                                                                                                                                                                                                                               |
| `Sheet`, `SheetClose`          | Drawer              | `right`/`left`/`bottom`/`auto`, przeciąganie z prędkością, `expandable` i `snapPoints`                                                                                                                                                               |
| `Popover`, `PopoverClose`      | Popover             | strzałka, `openOnHover`, `closable`                                                                                                                                                                                                                  |
| `Menu`, `MenuItem`, `MenuSub`… | Menu                | podmenu z bezpiecznym trójkątem, działające skróty (`mod+d`), checkbox i radio, `render` dla linków routera, `variant` `danger` (stale czerwone, Usuń) i `danger-hover` (czerwone przy najechaniu, Wyloguj), `MenuSub` z `suffix` na bieżącą wartość |
| `ContextMenu`                  | ContextMenu         | prawy przycisk i przytrzymanie palcem, części z `Menu`                                                                                                                                                                                               |
| `Tooltip`, `TooltipProvider`   | Tooltip             | tapnięcie na dotyku                                                                                                                                                                                                                                  |
| `Toaster`, `toast`             | Toast               | grupowanie duplikatów, `toast.undo`, `toast.promise`                                                                                                                                                                                                 |
| `Confirmer`, `confirm`         | AlertDialog         | `await confirm({ title, danger })` zwraca `boolean`, bez stanu modala; `onConfirm` ze spinnerem i `pendingLabel` („Usuwanie…”) i błędem w oknie, przy `danger` fokus na „Anuluj”, kolejka pytań; `<Confirmer />` raz obok `<Toaster />`              |

## Treść i informacja

| Komponent                                         | Base UI                | Najważniejsze                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Card`, `Container`                               | useRender              |                                                                                                                                                                                                                                                                                                                                                        |
| `Table` i części, `TableNumberCell`, `TableEmpty` | –                      | przyklejony nagłówek i kolumny, cienie krawędzi, krzyżyk hovera, edycja punktów jak w arkuszu                                                                                                                                                                                                                                                          |
| `useTable`, `TableToolbar`                        | – (Menu, Input)        | jeden stan sortowania, wyszukiwania, filtrów i stron; `sortProps`/`toolbarProps`/`paginationProps` do rozsmarowania, liczniki opcji filtrów, polskie sortowanie z pustymi na końcu, `manual` dla serwera, stan kontrolowany do adresu strony                                                                                                           |
| `TableActions`, `TableActionsHead`                | Menu, Tooltip          | akcje wiersza: menu „⋯” z dowolnymi pozycjami i szybkie ikony z tooltipem, `revealOnHover` (na dotyku zawsze widoczne), `sticky` do prawej, nie wywołuje `onClick` wiersza                                                                                                                                                                             |
| `TableSelectCell`, `TableSelectHead`              | Checkbox               | zaznaczanie wierszy z `useTable` (`getRowId`, `selectProps`, `selectAllProps`, `selection`): zakres z Shiftem, cała strona albo wszystkie pasujące, liczą się tylko widoczne po filtrach; `selectionLabels` do odmiany („Zaznacz wszystkich (64)”); `TableToolbar` z `bulkActions` zamienia się w pasek akcji bez przesunięcia tabeli, Escape odznacza |
| `Accordion`, `Collapsible`                        | Accordion, Collapsible | `plain`/`card`/`separated`, otwieranie przy ⌘F                                                                                                                                                                                                                                                                                                         |
| `Tabs`                                            | Tabs                   |                                                                                                                                                                                                                                                                                                                                                        |
| `SegmentedControl`                                | RadioGroup             | suwak pod wybranym                                                                                                                                                                                                                                                                                                                                     |
| `Stepper`                                         | –                      | linia postępu wypełniana z pól kroku, walidacja kroku, wersja kompaktowa                                                                                                                                                                                                                                                                               |
| `Pagination`                                      | –                      | stała liczba pozycji, skok do strony z „…”, `@container`                                                                                                                                                                                                                                                                                               |
| `Breadcrumbs`                                     | –                      | chowanie środka do menu „…” z mierzenia szerokości                                                                                                                                                                                                                                                                                                     |
| `Alert`                                           | –                      | akcja w linii z Promise, zwijanie przy zamknięciu                                                                                                                                                                                                                                                                                                      |
| `Badge`                                           | useRender              | `soft`/`outline`/`solid`, kropka z pulsem                                                                                                                                                                                                                                                                                                              |
| `Avatar`, `AvatarGroup`                           | Avatar                 | generator gradientów z seeda, inicjały z kontrastem                                                                                                                                                                                                                                                                                                    |
| `Progress`, `Meter`                               | Progress, Meter        | kolor z progów, kawałki, pierścień                                                                                                                                                                                                                                                                                                                     |
| `Stat`, `StatGroup`                               | –                      | format z `Intl` (`t.locale`), zmiana z `previous` albo `delta` z tonem według `intent`, wykres z `trend`, liczba dojeżdża przy zmianie, szkielet przy `loading`, warianty jak `Card`, grupa z kreskami na każdym tle                                                                                                                                   |
| `Skeleton`, `SkeletonText`                        | –                      | wspólna fala shimmeru, tryb z dziećmi bez skoku układu                                                                                                                                                                                                                                                                                                 |
| `EmptyState`                                      | –                      | kafelek na kartach, wejście po kolei                                                                                                                                                                                                                                                                                                                   |
| `Spinner`, `Kbd`, `Separator`                     | Separator              | `Kbd` z systemowymi skrótami                                                                                                                                                                                                                                                                                                                           |
| `ScrollArea`                                      | –                      | wygaszanie maską, przewijanie po najechaniu na strzałkę                                                                                                                                                                                                                                                                                                |
| `CodeBlock`                                       | – (Shiki)              | osobne wejście `@zse-gdansk/ui/code-block`, diffy, słowa, błędy, ikony języków                                                                                                                                                                                                                                                                         |
| `Icon`                                            | –                      | owijka Hugeicons                                                                                                                                                                                                                                                                                                                                       |
| `LocaleSwitcher`, `LocaleSubmenu`                 | Menu                   | nazwy języków z `Intl.DisplayNames` (własna + w języku interfejsu), spinner do końca obietnicy `onValueChange`, flagi z `flags` (np. country-flag-icons), bez zależności od i18next; `LocaleSubmenu` to samo jako podmenu (np. w `UserMenu`) z bieżącym językiem obok etykiety, stan wczytywania przeżywa zamknięcie menu                              |

## Narzędzia

| Eksport                                         | Co robi                                                              |
| ----------------------------------------------- | -------------------------------------------------------------------- |
| `createSearch`, `fold`, `Highlight`             | wyszukiwanie z rankingiem, literówką i podświetleniem (`src/search`) |
| `formatShortcut`, `shortcutKeys`                | skróty klawiszowe pod system (⌘ / Ctrl)                              |
| `passwordScore`, `defaultRules`                 | ocena hasła, np. do walidacji w schemacie                            |
| `LocaleProvider`, `useMessages`, `pl`, `plural` | katalog tekstów i jego nadpisywanie (`docs/i18n.md`)                 |
