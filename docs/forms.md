# Formularze

## Form

`Form` opakowuje `Form` z Base UI i dodaje:

- **Walidację przez Standard Schema** (`schema`): działa z Zodem 4, Valibotem, ArkType. Typy interfejsu są skopiowane w `src/components/form/standard-schema.ts`, biblioteka nie zależy od żadnej z tych paczek. `onSubmit` dostaje wynik schematu z pełnymi typami.
- **Błędy pod polami po `name`**, także zagnieżdżone (`adres.miasto`).
- **Błędy z serwera:** `onSubmit` zwraca `{ errors: { pole: "komunikat" } }` albo `{ message }`. Rzucony `Error` pokazuje `Alert` nad formularzem.
- **Fokus i przewinięcie do pierwszego błędnego pola** po nieudanym wysłaniu.
- **Blokadę podwójnego wysłania** i spinner w `FormSubmit`.
- **`warnOnLeave`:** pytanie przy zamykaniu karty z niezapisanymi zmianami.

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

`Form` dokłada je do wartości przed schematem, więc schemat dostaje prawdziwe typy (`z.date()`, `z.array(z.instanceof(File))`).

## Komunikaty

`FieldFooter` zamienia komunikaty przeglądarki z ograniczeń HTML (`required`, `type`, `min`, `max`, `pattern`…) na polskie, bo przeglądarka pisze w swoim języku („Please fill out this field.”). Komunikaty ze schematu, serwera i `validate` zostają bez zmian. Konkretne teksty („Wpisz adres e-mail, np. …”) zapisuj w schemacie.

Pole wymagane dostaje gwiazdkę przy etykiecie automatycznie (CSS `:has([required])`).

## Grupowanie

- `Fieldset`: grupa z nagłówkiem i opisem, `disabled` blokuje wszystkie pola w środku.
- `FormRow`: pola obok siebie, na wąskim ekranie jedno pod drugim (siatka `auto-fit`).
