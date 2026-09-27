import type { IconGlyph } from "../icon/Icon";
import type { Shortcut } from "../menu/shortcut";

// Wartości kroków akcji po ich id, np. { student: "u-12", text: "…" }.
export type CommandValues = Record<string, string>;

export interface CommandContext {
    values: CommandValues;
    // Etykiety wybranych opcji, np. { student: "Jan Kowalski" }, do toastu.
    labels: CommandValues;
    navigate: (href: string) => void;
}

// Wyniki wyszukiwania na serwerze. Wołane z opóźnieniem po ostatnim znaku,
// poprzednie zapytanie dostaje abort.
export type CommandSearch<T> = (
    query: string,
    signal: AbortSignal,
) => Promise<readonly T[]>;

export interface CommandOption {
    value: string;
    label: string;
    subtitle?: string;
    icon?: IconGlyph;
    avatar?: { name: string; src?: string };
    keywords?: readonly string[];
    disabled?: boolean;
}

interface StepBase {
    // Klucz w values.
    id: string;
    // Nazwa kroku w ścieżce nad polem, np. „Uczeń”.
    label: string;
    placeholder?: string;
}

export interface CommandTextStep extends StepBase {
    type?: "text";
    defaultValue?: string | ((values: CommandValues) => string);
    // Komunikat błędu albo nic, gdy wartość jest dobra.
    validate?: (
        value: string,
        values: CommandValues,
    ) => string | null | undefined;
    optional?: boolean;
    inputMode?: "text" | "numeric" | "decimal" | "email" | "url" | "tel";
}

export interface CommandChoiceStep extends StepBase {
    type: "choice";
    // Stała lista (filtrowana w palecie) albo wyszukiwanie na serwerze.
    options:
        | readonly CommandOption[]
        | ((
              query: string,
              signal: AbortSignal,
              values: CommandValues,
          ) => Promise<readonly CommandOption[]>);
}

export type CommandStep = CommandTextStep | CommandChoiceStep;

export interface Command {
    // Unikalne w całej aplikacji; po nim pamiętane są ostatnio użyte.
    id: string;
    title: string;
    // Dopisek po prawej, np. klasa ucznia albo „Strona”.
    subtitle?: string;
    // Nagłówek grupy na liście; kolejność grup jak kolejność rejestracji.
    group?: string;
    icon?: IconGlyph;
    avatar?: { name: string; src?: string };
    // Dodatkowe słowa do wyszukiwania, np. ["dark", "noc"] przy motywie.
    keywords?: readonly string[];
    // "g u" to sekwencja (najpierw G, potem U), "mod+shift+p" to akord.
    // Kilka skrótów w tablicy; na liście widać pierwszy.
    shortcut?: Shortcut | readonly Shortcut[];
    disabled?: boolean;
    // Tylko pod skrótem albo w wynikach wyszukiwania, bez pozycji na
    // pustej liście.
    hidden?: boolean;
    searchOnly?: boolean;
    danger?: boolean;

    // Co robi wybór, jedno z trzech:
    // przejście pod adres (navigate z CommandProvider),
    href?: string;
    // podmenu: stała lista albo wyszukiwanie,
    children?: readonly Command[] | CommandSearch<Command>;
    // akcja, po krokach steps z wartościami. Promise trzyma paletę otwartą
    // ze wskaźnikiem, błąd zostawia ją z komunikatem.
    perform?: (context: CommandContext) => unknown;
    steps?: readonly CommandStep[];
    // Paleta zostaje otwarta po akcji, np. przełącznik.
    keepOpen?: boolean;
    // Placeholder pola w podmenu.
    placeholder?: string;
}

// Źródło wyników przy wpisywaniu w głównej liście, np. uczniowie z API.
export interface CommandSource {
    id: string;
    group: string;
    search: CommandSearch<Command>;
    // Od ilu znaków pytać serwer.
    minLength?: number;
}
