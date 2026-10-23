# Formularze

## Form

`Form` opakowuje `Form` z Base UI i dodaje:

- **Walidację przez Standard Schema** (`schema`): działa z Zodem 4, Valibotem, ArkType. Typy interfejsu są skopiowane w `src/components/form/standard-schema.ts`, biblioteka nie zależy od żadnej z tych paczek. `onSubmit` dostaje wynik schematu z pełnymi typami.
- **Błędy pod polami po `name`**, także zagnieżdżone (`adres.miasto`).
- **Błędy z serwera:** `onSubmit` zwraca `{ errors: { pole: "komunikat" } }` albo `{ message }`; `message` może być elementem z tłumaczeniem (zmiana języka, patrz `i18n.md`). Rzucony `Error` pokazuje `Alert` nad formularzem.
- **Fokus i przewinięcie do pierwszego błędnego pola** po nieudanym wysłaniu.
- **Blokadę podwójnego wysłania** i spinner w `FormSubmit`.
- **`warnOnLeave`:** pytanie przy zamykaniu karty z niezapisanymi zmianami.
- **`onDirtyChange`:** pierwsza zmiana w polach (`true`) i udane wysłanie (`false`), np. dla własnego pytania o porzucenie zmian.
- **`showMessage={false}` i `<FormMessage />`:** komunikat nad polami w miejscu wybranym przez układ (tak robi `Modal`, który stawia go w przewijanej treści).

Po pierwszym wysłaniu pola sprawdzają się przy każdej zmianie (tryb `onSubmit` z Base UI), więc błąd znika zaraz po poprawieniu.

## Jak pole trafia do formularza

Base UI zbiera wartości tylko z natywnych kontrolek pól (`Field.Control`), jako tekst, i dopasowuje błędy po `name` na `Field.Root`. Dlatego każde pole:

1. przekazuje `name` do `Field.Root`,
2. ustawia `invalid` tylko gdy ma własny błąd: `{...(error && { invalid: true })}`. `invalid={false}` wymusza stan „poprawne” i zasłania błędy formularza,
3. renderuje `FieldFooter`, który pokazuje błąd z propa albo z walidacji.

Wartości, które nie są tekstem (data, zakres dat, pliki), komponent rejestruje sam:

```tsx
import { useFormValue } from "../form/context";

useFormValue(name, value); // Date, { from, to }, File[]…
```

`Form` dokłada je do wartości przed schematem, więc schemat dostaje prawdziwe typy (`z.date()`, `z.array(z.instanceof(File))`). Wartość inna niż na starcie (porównana po zawartości, więc nowa tablica z tymi samymi plikami to nie zmiana) oznacza też formularz jako zmieniony.

## Niezapisane zmiany

`Form` uznaje formularz za zmieniony po pierwszej zmianie w dowolnym polu:

- tekst: zdarzenie `input`,
- Select, Combobox, NumberField, Checkbox, Radio, Slider i inne pola w `Field.Root`: atrybut `data-dirty`, który `Field` z Base UI stawia na zmienionym polu (te kontrolki nie wysyłają `input`),
- Switch i SegmentedControl (bez `Field.Root`): wołają `markDirty()` same,
- wartości z `useFormValue`: zmiana względem wartości startowej.

Własna kontrolka, która nie pasuje do żadnego z tych przypadków, woła `markDirty()` z `useFormState()` przy zmianie wartości. Udane wysłanie (bez `errors`) zeruje stan.

Z tego korzystają `warnOnLeave`, `onDirtyChange` i pytanie „Odrzucić zmiany?” w `Modal`.

## Formularz w oknie

```tsx
<Modal
    open={open}
    onOpenChange={setOpen}
    title="Nowa sprawa"
    form={{
        schema,
        onSubmit: async (values) => {
            await save(values);
            setOpen(false); // wprost, bez pytania o porzucenie zmian
        },
    }}
    footer={
        <>
            <ModalClose render={<Button variant="ghost" />}>Anuluj</ModalClose>
            <FormSubmit pendingLabel="Zapisywanie…">Zapisz</FormSubmit>
        </>
    }
>
    <Input name="title" label="Tytuł" required />
</Modal>
```

`Modal` obejmuje treść i stopkę formularzem, blokuje zamykanie w trakcie wysyłania i pyta o porzucenie zmian. Bez `form="id"`, ręcznego `pending` w `onOpenChange` ani własnego `<Form>` w środku.

## Komunikaty

`FieldFooter` zamienia komunikaty przeglądarki z ograniczeń HTML (`required`, `type`, `min`, `max`, `pattern`…) na polskie, bo przeglądarka pisze w swoim języku („Please fill out this field.”). Komunikaty ze schematu, serwera i `validate` zostają bez zmian. Konkretne teksty („Wpisz adres e-mail, np. …”) zapisuj w schemacie.

Pole wymagane dostaje gwiazdkę przy etykiecie automatycznie (CSS `:has([required])`).

## Grupowanie

- `Fieldset`: grupa z nagłówkiem i opisem, `disabled` blokuje wszystkie pola w środku.
- `FormRow`: pola obok siebie, na wąskim ekranie jedno pod drugim (siatka `auto-fit`).
