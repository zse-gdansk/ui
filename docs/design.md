# Wytyczne projektowe

Jak ma wyglądać i zachowywać się każdy komponent tej biblioteki i każdy ekran z niej zbudowany. Charakter biblioteki opisuje [principles.md](principles.md), wartości ruchu [motion.md](motion.md), kolory i cienie [tokens.md](tokens.md). Tu są reguły ich użycia, każda z krótkim identyfikatorem do przywołania w przeglądzie kodu i z parą przykładów: tak i nie.

## Spis

- [Typografia](#typografia): `body-size`, `sentence-case`, `no-tracking`, `weight-scale`, `state-weight`, `mono-in-text`, `tabular-numbers`
- [Odstępy i kształt](#odstępy-i-kształt): `grouped-text`, `optical-padding`, `nested-radius`, `icon-first-line`, `touch-target`
- [Powierzchnie](#powierzchnie): `floating-surface`, `flat-cards`, `scroll-edges`, `color-meaning`
- [Ruch i stany](#ruch-i-stany): `hover-instant`, `hover-media`, `press-scale`, `no-layout-shift`, `stable-collapse`, `mounted-dialogs`
- [Tekst](#tekst): `messages`, `plural`

## Typografia

### `body-size` Treść ma 14px

Tekst treści, przyciski, dane w tabelach i pozostałe kontrolki: `0.875rem`. Większe stopnie tylko dla nagłówków. Pomocnicze podpisy, liczniki i etykiety grup: `0.75rem`.

Wyjątek: pola formularzy mają `1rem` poniżej 640px. iOS przybliża stronę przy fokusie w polu z tekstem mniejszym niż 16px. Wyłącza to tylko `maximum-scale=1` w viewport, a to na Androidzie blokuje przybliżanie palcami (WCAG 1.4.4), więc tego nie robimy.

**Tak**

```css
.zse-sidebar-item {
    font-size: 0.875rem;
}
```

**Nie**

```css
.zse-sidebar-item {
    font-size: 1rem;
}
```

### `sentence-case` Nagłówki zdaniowo

Wielka litera tylko na początku i w nazwach własnych. Bez wersalików przez `text-transform`.

**Tak**

```tsx
<Modal title="Usunąć zaznaczonych uczniów?" />
<SidebarHeader title="Dziennik ZSE" />
```

**Nie**

```tsx
<Modal title="Usunąć Zaznaczonych Uczniów?" />
```

```css
.zse-sidebar-group-label {
    text-transform: uppercase;
}
```

### `no-tracking` Nie zmieniamy odstępów między literami

Font aplikacji sam dobiera tracking (Inter przez oś rozmiaru optycznego, SF przez tabele Apple). Ręczne `letter-spacing` psuje to przy każdym innym foncie. Jedyny wyjątek: krótkie teksty wersalikami, jak kody języków („PL”) i klawisze skrótów, mogą mieć `0.02em`.

**Tak**

```css
.zse-modal-title {
    font-size: 1rem;
    font-weight: 500;
}
```

**Nie**

```css
.zse-modal-title {
    font-size: 1rem;
    letter-spacing: -0.01em;
}
```

### `weight-scale` Bez 700

Nagłówki `600`, wyróżnienie w tekście i tytuły mniejszych bloków `500`. `700` zostaje tylko w kodzie (podświetlanie składni).

**Tak**

```css
.zse-sidebar-title {
    font-weight: 600;
}
```

**Nie**

```css
.zse-sidebar-title {
    font-weight: 700;
}
```

### `state-weight` Stan nie zmienia grubości

Aktywny, wybrany ani bieżący element nie jest grubszy niż w spoczynku. Grubszy font poszerza tekst, więc przy każdym przełączeniu etykieta optycznie drga. Wyróżnienie: kolor tekstu, tło, znacznik. Stałe pogrubienia (tytuł, dzisiejszy dzień jako znacznik) są w porządku, bo się nie przełączają.

**Tak**

```css
.zse-crumb[aria-current] {
    color: var(--color-text);
}
```

**Nie**

```css
.zse-crumb[aria-current] {
    color: var(--color-text);
    font-weight: 500;
}
```

### `mono-in-text` Kod w tekście o stopień mniejszy

Monospace wśród zwykłego tekstu wygląda na większy. `0.9em` i `var(--font-mono)`.

**Tak**

```tsx
<p className="prose">
    Wpisz <code>NEXT_PUBLIC_API</code> w pliku .env.
</p>
```

```css
.prose code {
    font-family: var(--font-mono);
    font-size: 0.9em;
}
```

**Nie**

```css
.prose code {
    font-family: var(--font-mono);
}
```

### `tabular-numbers` Zmieniające się liczby mają stałą szerokość

Liczniki, punkty, procenty, godziny, daty w siatce: `font-variant-numeric: tabular-nums`. Bez tego „11” jest węższe niż „88” i kolumna albo licznik drga.

**Tak**

```css
.zse-sidebar-badge {
    font-variant-numeric: tabular-nums;
}
```

**Nie**: licznik bez `tabular-nums`, który zmienia szerokość przy każdej zmianie wartości.

## Odstępy i kształt

### `grouped-text` Powiązany tekst bliżej

Tytuł i opis są bliżej siebie niż blok, do którego należą, i niż akcje pod nim.

**Tak**

```css
.zse-modal {
    gap: 16px;
}

.zse-modal-heading {
    gap: 4px;
}
```

**Nie**: jeden `gap` dla tytułu, opisu i przycisków.

### `optical-padding` W pionie ciaśniej niż w poziomie

Tekst ma własną interlinię, która dokłada odstęp nad i pod nim. Padding w pionie jest więc mniejszy niż w poziomie, żeby optycznie wyszło równo.

**Tak**

```css
.zse-modal {
    padding: 20px 20px 16px;
}
```

**Nie**

```css
.zse-modal {
    padding: 20px;
}
```

### `nested-radius` Promienie współśrodkowe

Gdy dwie krawędzie są od siebie o 8px albo mniej: promień zewnętrzny = wewnętrzny + odstęp.

**Tak**

```css
.zse-segmented {
    padding: var(--segmented-pad);
    border-radius: var(--radius-md);
}

.zse-segmented-thumb {
    border-radius: calc(var(--radius-md) - var(--segmented-pad));
}
```

**Nie**: ten sam `--radius-md` na kontenerze i elemencie w środku.

### `icon-first-line` Ikona na wysokości pierwszej linii

Ikona obok tekstu, który może się zawinąć (alert, toast, lista), stoi przy pierwszej linii, nie na środku całego bloku. Kontener ikony ma wysokość jednej linii tekstu.

**Tak**

```css
.zse-alert-icon {
    display: flex;
    align-items: center;
    height: 1lh;
}
```

**Nie**: ikona wyśrodkowana względem całego bloku (`align-items: center` na wierszu z tekstem wielolinijkowym).

### `touch-target` Pole dotyku około 40px

Mały element (checkbox 16–18px, ikona 16px) dostaje większe pole kliknięcia przez `::before` z ujemnym `inset` albo przez klikalną całą komórkę, a nie przez powiększenie samego elementu.

**Tak**

```css
.zse-checkbox-root::before {
    content: "";
    position: absolute;
    inset: -4px;
}
```

**Nie**: checkbox 28px tylko po to, żeby dało się w niego trafić palcem.

## Powierzchnie

### `floating-surface` Cień z obrysem zamiast ramki z cieniem

Pływająca powierzchnia (menu, popover, tooltip, toast) ma jeden token cienia, który zawiera obrys `0 0 0 1px var(--color-border-subtle)`. Ramka `border` razem z cieniem daje podwójną, rozmytą krawędź. Ramka zostaje tam, gdzie oznacza strukturę albo stan: separator, pole formularza, zaznaczenie.

**Tak**

```css
.zse-menu {
    box-shadow: var(--shadow-popover);
}
```

**Nie**

```css
.zse-menu {
    border: 1px solid var(--color-border-subtle);
    box-shadow: var(--shadow-popover);
}
```

### `flat-cards` Karta nie leży w karcie

Blok w karcie oddziela się odstępem, separatorem albo nagłówkiem, nie drugą ramką i cieniem.

**Tak**

```tsx
<Card>
    <CardTitle>Wyniki klasy 3C</CardTitle>
    <Separator />
    <StatGroup>…</StatGroup>
</Card>
```

**Nie**

```tsx
<Card>
    <Card variant="elevated">…</Card>
</Card>
```

### `scroll-edges` Kreska przy przyklejonych częściach tylko nad treścią

Przyklejony nagłówek tabeli, pasek aplikacji albo kolumna dostają kreskę i cień dopiero wtedy, gdy coś jest pod nimi (atrybut `data-scroll-*` z listenera, nie stan Reacta). W spoczynku stoją bez ramki. Stała ramka odcinałaby pasek od treści także wtedy, gdy nic pod nim nie ma.

**Tak**

```css
.zse-shell-header[data-scrolled] {
    border-bottom-color: var(--color-border-subtle);
}
```

**Nie**: stała ramka pod paskiem albo przełączanie jej przez `useState` przy przewijaniu.

### `color-meaning` Kolor zawsze coś znaczy

Akcent to „interaktywne albo wybrane”, zielony sukces, pomarańczowy ostrzeżenie, czerwony błąd lub akcja nieodwracalna. Kolor nie jest jedynym nośnikiem znaczenia: obok jest ikona, tekst albo kształt. Tylko tokeny semantyczne, mieszanie przez `color-mix(in oklab, …)`.

**Tak**

```css
.zse-table-action[data-variant="danger"]:hover {
    color: var(--color-danger-text);
}
```

**Nie**

```css
.zse-table-action:hover {
    color: var(--red-11);
}
```

## Ruch i stany

### `hover-instant` Hover bez przejść koloru

Tło, kolor tekstu, ramka i obrys zmieniają się przy najechaniu od razu. Przejście przy szybkim ruchu kursorem po liście zostaje w tyle i wygląda na zacięcie. Przejście koloru jest dozwolone tylko dla zmian stanu, których hover nie wywołuje: kreska przy przewijaniu, wypełnienie paska postępu, spełniona reguła hasła, ramka otwartego elementu akordeonu. Naciśnięcie i ruch (`scale`, `translate`, `opacity`) dalej mają swoje przejścia.

**Tak**

```css
.zse-sidebar-item {
    transition: scale 160ms var(--ease-out);
}

@media (hover: hover) {
    .zse-sidebar-item:hover {
        background: var(--color-bg-hover);
    }
}
```

**Nie**

```css
.zse-sidebar-item {
    transition: background-color 150ms ease;
}
```

### `hover-media` Hover tylko tam, gdzie jest kursor

Każdy styl `:hover` w `@media (hover: hover)`. Na dotyku stan zostawałby po tapnięciu.

**Tak**

```css
@media (hover: hover) {
    .zse-header-action:hover {
        background: var(--color-bg-hover);
    }
}
```

**Nie**: `:hover` poza zapytaniem o hover.

### `press-scale` Naciśnięcie zmniejsza element

`scale: 0.96` na `:active`, przejście `160ms var(--ease-out)`. Małe elementy w siatce `0.94`. Szerokie wiersze (pozycja w rozwiniętym panelu) `0.98`, bo 4% szerokości to już widoczny skok. W `prefers-reduced-motion` bez skali.

**Tak**

```css
.zse-header-action:active {
    scale: 0.96;
}
```

**Nie**: `scale: 0.9` albo naciśnięcie przez przyciemnienie tła.

### `no-layout-shift` Zmiana stanu nie przesuwa sąsiadów

Ładowanie, błąd, zaznaczenie, rozwinięcie, podmiana tekstu: albo płynnie, albo w stałym miejscu. Warstwy w jednej komórce siatki (`grid-area: 1 / 1`), zarezerwowana wysokość wiersza, napisy trzymające szerokość dłuższego. Pasek akcji zbiorczych leży w tym samym miejscu co pasek filtrów, kreska grupy w zwiniętym panelu w tym samym wierszu co etykieta.

**Tak**

```css
.zse-table-toolbar-main,
.zse-table-bulk {
    grid-area: 1 / 1;
}
```

**Nie**: `{selected > 0 ? <BulkBar /> : <Toolbar />}` z różną wysokością obu pasków.

### `stable-collapse` Treść nie przelewa się w trakcie zwijania

Przy animowanej szerokości albo wysokości treść w środku nie zmienia układu klatka po klatce. Albo ma stały rozmiar i jest ucinana krawędzią, albo nie zawija się (`white-space: nowrap`) i gaśnie. Ikony w panelu stoją w stałej kolumnie, etykiety przycina krawędź.

**Tak**

```css
.zse-sidebar-item {
    overflow: hidden;
    white-space: nowrap;
}
```

**Nie**: etykieta renderowana warunkowo (`{!collapsed && label}`), która znika w pierwszej klatce albo zawija się w wąskim panelu.

### `mounted-dialogs` Okna zawsze w drzewie

Modal, sheet, confirm i popover są stale w drzewie i sterowane `open`. Warunkowe renderowanie odbiera animację zamknięcia. Treść ostatniego pytania zostaje w oknie do końca wyjścia.

**Tak**

```tsx
<Modal open={open} onOpenChange={setOpen} title="Edytuj ucznia" />
```

**Nie**

```tsx
{
    open && <Modal open title="Edytuj ucznia" />;
}
```

## Tekst

### `messages` Teksty z katalogu

Etykiety, komunikaty i `aria-label` w komponencie pochodzą z `useMessages()`. Tekst zależny od danych aplikacji (rzeczownik w „Zaznacz wszystkich (64)”) przychodzi propem, bo biblioteka go nie zna. Szczegóły w [i18n.md](i18n.md).

**Tak**

```tsx
aria-label={t.appShell.collapse}
```

**Nie**

```tsx
aria-label="Zwiń panel"
```

### `plural` Odmiana przez Intl

„1 plik, 2 pliki, 5 plików, 22 pliki”: `Intl.PluralRules(t.locale)`, nigdy `count === 1 ? … : …`. Jeśli forma zależy od rzeczownika, którego biblioteka nie zna, tekst unika odmiany („Zaznaczono: 3”) albo przychodzi z aplikacji.
