// Gotowe maski dla MaskedInput.

export interface Mask {
    // Układa wpisany tekst na bieżąco, np. dopisuje separator. Dostaje też
    // poprzednią wartość, żeby odróżnić pisanie od cofania.
    format: (input: string, previous: string) => string;
    // Poprawka po wyjściu z pola, gdy dopiero cała wartość rozstrzyga
    // zapis (np. krótszy numer przed rokiem).
    finalize?: (value: string) => string;
    // Znaki wstawiane przez format; na ekranie wchodzą z animacją.
    separators?: string;
    // Wzór dla walidacji przeglądarki (atrybut pattern).
    pattern?: string;
    inputMode?: "numeric" | "text" | "decimal" | "tel";
    isValid?: (value: string) => boolean;
}

const DIGIT = "9";
const isDigit = (char: string) => char >= "0" && char <= "9";

// Maska o stałym wzorze: „9” to cyfra, każdy inny znak to separator na
// swoim miejscu, np. createMask("99-999") dla kodu pocztowego albo
// createMask("99.99.9999") dla daty. Separator można wpisać ręcznie albo
// pominąć: cyfra na jego miejscu dopisuje go sama.
export function createMask(template: string): Mask & {
    isValid: (value: string) => boolean;
} {
    const separators = [...new Set(template.replaceAll(DIGIT, ""))].join("");

    return {
        separators,
        inputMode: "numeric",
        // Atrybut pattern działa z flagą v: escapujemy tylko znaki
        // specjalne wyrażeń („\-” byłby błędem składni).
        pattern: [...template]
            .map((char) =>
                char === DIGIT
                    ? String.raw`\d`
                    : /[.*+?^${}()|[\]\\/]/.test(char)
                      ? `\\${char}`
                      : char,
            )
            .join(""),

        format(input: string, previous: string) {
            let out = "";
            let slot = 0;
            for (const char of input) {
                if (slot >= template.length) break;
                const expected = template[slot];
                if (expected === DIGIT) {
                    if (isDigit(char)) {
                        out += char;
                        slot++;
                    }
                    continue;
                }
                // Miejsce na separator: wpisany ręcznie zostaje, cyfra
                // dopisuje go przed sobą.
                if (char === expected) {
                    out += char;
                    slot++;
                } else if (isDigit(char)) {
                    while (slot < template.length && template[slot] !== DIGIT)
                        out += template[slot++];
                    if (slot < template.length) {
                        out += char;
                        slot++;
                    }
                }
            }
            // Separator na końcu tylko zaraz po wpisaniu; przy cofaniu znika
            // razem z cyfrą za nim.
            if (input.length <= previous.length)
                while (out && separators.includes(out.at(-1) ?? ""))
                    out = out.slice(0, -1);
            return out;
        },

        isValid(value: string) {
            return (
                value.length === template.length &&
                [...template].every((char, index) =>
                    char === DIGIT
                        ? isDigit(value[index] ?? "")
                        : value[index] === char,
                )
            );
        },
    };
}

const NUMBER = 3;
const YEAR = 4;

// Numer legitymacji szkolnej: trzy cyfry i rok wydania, np. 243/2023.
export const studentIdMask: Mask & {
    pattern: string;
    isValid: (value: string) => boolean;
} = {
    pattern: String.raw`\d{3}/\d{4}`,
    separators: "/",
    inputMode: "numeric",

    // Ukośnik sam po trzeciej cyfrze. Wpisany ręcznie (albo spacja, myślnik,
    // kropka) zostaje i trzyma rok, także gdy numer jest jeszcze krótszy.
    format(input: string, previous: string) {
        const separator = input.search(/[^\d]/);
        const digits = input.replace(/\D/g, "");
        const typed = input.length > previous.length;
        const number = (
            separator === -1
                ? digits
                : input.slice(0, separator).replace(/\D/g, "")
        ).slice(0, NUMBER);
        const year = (
            separator === -1
                ? digits.slice(NUMBER)
                : input.slice(separator + 1).replace(/\D/g, "")
        ).slice(0, YEAR);

        if (!number) return "";
        // Ukośnik bez roku zostaje tylko zaraz po wpisaniu; przy cofaniu
        // znika razem z ostatnią cyfrą roku.
        const slash =
            year || (typed && (separator !== -1 || number.length === NUMBER));
        if (!slash) return number;
        return year ? `${number}/${year}` : `${number}/`;
    },

    isValid(value: string) {
        return new RegExp(`^${studentIdMask.pattern}$`).test(value);
    },
};
