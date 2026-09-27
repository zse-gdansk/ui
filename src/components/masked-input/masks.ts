// Gotowe maski dla MaskedInput.

const DIGIT = "9";
const isDigit = (char: string) => char >= "0" && char <= "9";

// Maska o stałym wzorze: „9” to cyfra, każdy inny znak to separator na
// swoim miejscu, np. createMask("99-999") dla kodu pocztowego albo
// createMask("99.99.9999") dla daty. Separator można wpisać ręcznie albo
// pominąć: cyfra na jego miejscu dopisuje go sama.
export function createMask(template: string) {
    const separators = [...new Set(template.replaceAll(DIGIT, ""))].join("");

    return {
        separators,
        inputMode: "numeric" as const,
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

// Rok wydania zaczyna się od 19 albo 20: „2”, „20”, „202”, „2023”.
const YEAR_PREFIX = /^(1(9\d{0,2})?|2(0\d{0,2})?)$/;
const MAX_NUMBER = 4;
const YEAR = 4;

// Dopisuje do roku tylko cyfry, które dalej mogą dać poprawny rok.
function takeYear(digits: string) {
    let year = "";
    for (const digit of digits) {
        if (year.length === YEAR || !YEAR_PREFIX.test(year + digit)) break;
        year += digit;
    }
    return year;
}

// Gdzie kończy się numer, gdy nie było ukośnika: najdłuższy numer, po
// którym reszta może być początkiem roku. „24320” → 243 (bo „0” nie
// zaczyna roku), „12342” → 1234.
function inferSplit(digits: string) {
    if (digits.length <= MAX_NUMBER) return null;
    for (let split = MAX_NUMBER; split >= 1; split--) {
        const rest = digits.slice(split);
        if (rest.length <= YEAR && YEAR_PREFIX.test(rest)) return split;
    }
    return null;
}

const join = (number: string, year: string) =>
    year ? `${number}/${year}` : number;

// Numer legitymacji szkolnej: numer i rok wydania, np. 123/2023.
export const studentIdMask = {
    pattern: String.raw`\d{1,4}/(19|20)\d{2}`,
    inputMode: "numeric" as const,

    // Ukośnik pojawia się sam, gdy wiadomo, gdzie się kończy numer.
    // Spacja, myślnik albo kropka od razu ustalają podział.
    format(input: string, previous: string) {
        const separator = input.search(/[^\d]/);
        const digits = input.replace(/\D/g, "");
        const typed = input.length > previous.length;

        if (separator !== -1) {
            const number = input
                .slice(0, separator)
                .replace(/\D/g, "")
                .slice(0, MAX_NUMBER);
            if (!number) return "";
            const year = takeYear(digits.slice(number.length));
            // Ukośnik bez roku zostaje tylko zaraz po wpisaniu; przy
            // cofaniu znika razem z ostatnią cyfrą roku.
            if (!year) return typed ? `${number}/` : number;
            return join(number, year);
        }

        const split = inferSplit(digits);
        if (split === null) return digits.slice(0, MAX_NUMBER);
        return join(digits.slice(0, split), takeYear(digits.slice(split)));
    },

    // Po wyjściu z pola: gdy rok jest niepełny, a inny podział daje pełny
    // („520/20” → „5/2020”), bierze ten.
    finalize(value: string) {
        const digits = value.replace(/\D/g, "");
        const [, year = ""] = value.split("/");
        if (year.length === YEAR) return value;
        for (let split = MAX_NUMBER; split >= 1; split--) {
            const rest = digits.slice(split);
            if (rest.length === YEAR && takeYear(rest) === rest)
                return join(digits.slice(0, split), rest);
        }
        return value;
    },

    isValid(value: string) {
        return new RegExp(`^${studentIdMask.pattern}$`).test(value);
    },
};
