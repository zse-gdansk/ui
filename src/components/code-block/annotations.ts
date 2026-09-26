// Adnotacje w kodzie jak na blogu, w komentarzu na końcu linii:
//   const a = 1; // [!code ++]        dodana linia
//   const b = 2; // [!code --]        usunięta linia
//   const c = 3; // [!code highlight] wyróżniona linia
//   // [!code word:oddane]            słowo zaznaczone w całym bloku
// Działa z komentarzami //, #, --, /* */ i <!-- -->.
//
// Błąd jak w twoslash, linią pod błędnym kodem: daszki wskazują fragment,
// za nimi komunikat (najlepiej prawdziwy z kompilatora):
//   setTheme("sepia");
//   //       ^^^^^^^ Argument of type '"sepia"' is not assignable…

export interface CodeError {
    // Numer linii od 1 i zakres znaków w niej.
    line: number;
    start: number;
    end: number;
    message: string;
}

export interface Marks {
    highlight: ReadonlySet<number>;
    added: ReadonlySet<number>;
    removed: ReadonlySet<number>;
    words: readonly string[];
    errors: readonly CodeError[];
}

const NOTATION =
    /\s*(?:\/\/|#|--|\/\*|<!--)\s*\[!code (\+\+|--|highlight|hl|word:([^\]]+))\]\s*(?:\*\/|-->)?\s*$/;

const ERROR = /^\s*(?:\/\/|#|--)\s*(\^+)(?:\s+(.*))?$/;

export function parseAnnotations(code: string) {
    const highlight = new Set<number>();
    const added = new Set<number>();
    const removed = new Set<number>();
    const words: string[] = [];
    const errors: CodeError[] = [];
    const lines: string[] = [];

    for (const raw of code.split("\n")) {
        const error = ERROR.exec(raw);
        const target = lines.at(-1);
        if (error?.[1] && target !== undefined) {
            const start = raw.indexOf("^");
            const end = Math.min(start + error[1].length, target.length);
            if (start < end) {
                errors.push({
                    line: lines.length,
                    start,
                    end,
                    message: error[2]?.trim() ?? "",
                });
                continue;
            }
        }

        const match = NOTATION.exec(raw);
        if (!match) {
            lines.push(raw);
            continue;
        }
        const [, kind, word] = match;
        const rest = raw.slice(0, match.index);
        // Linia z samą adnotacją słowa znika z kodu.
        if (word) {
            words.push(word.trim());
            if (rest.trim() === "") continue;
        }
        lines.push(rest);
        const number = lines.length;
        if (kind === "++") added.add(number);
        else if (kind === "--") removed.add(number);
        else if (kind === "highlight" || kind === "hl") highlight.add(number);
    }
    return {
        source: lines.join("\n"),
        highlight,
        added,
        removed,
        words,
        errors,
    };
}

// Klasy linii wspólne dla Shiki i zwykłego tekstu przed jego załadowaniem.
export function lineClasses(line: number, marks: Marks) {
    return [
        marks.highlight.has(line) && "highlighted",
        marks.added.has(line) && "diff add",
        marks.removed.has(line) && "diff remove",
    ].filter(Boolean) as string[];
}

// Całe słowo, także z polskimi literami (\b ich nie zna).
function wordRanges(source: string, words: readonly string[]) {
    const ranges: [number, number][] = [];
    for (const word of new Set(words)) {
        const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const pattern = new RegExp(
            `(?<![\\p{L}\\p{N}_$])${escaped}(?![\\p{L}\\p{N}_$])`,
            "gu",
        );
        for (const match of source.matchAll(pattern))
            ranges.push([match.index, match.index + word.length]);
    }
    return ranges;
}

export interface Decoration {
    start: number;
    end: number;
    className: string;
}

// Zaznaczenia w kodzie jako zakresy w całym tekście: błędy i słowa.
// Nachodzących na siebie Shiki nie przyjmuje, więc błąd wygrywa ze
// słowem, a z dwóch słów zostaje pierwsze.
export function decorations(source: string, marks: Marks): Decoration[] {
    const starts = [0];
    for (const line of source.split("\n"))
        starts.push((starts.at(-1) ?? 0) + line.length + 1);

    const all: Decoration[] = [
        ...marks.errors.map((error) => ({
            start: (starts[error.line - 1] ?? 0) + error.start,
            end: (starts[error.line - 1] ?? 0) + error.end,
            className: "zse-code-error",
        })),
        ...wordRanges(source, marks.words).map(([start, end]) => ({
            start,
            end,
            className: "zse-code-word",
        })),
    ];
    const kept: Decoration[] = [];
    for (const item of all)
        if (
            kept.every(
                (other) => item.end <= other.start || item.start >= other.end,
            )
        )
            kept.push(item);
    return kept.toSorted((a, b) => a.start - b.start);
}

// Linia z komunikatem: wcięta do miejsca błędu (najwyżej do połowy), żeby
// było widać, czego dotyczy. Klasa „line”, żeby zachowała się jak kod.
export function errorLine(error: CodeError) {
    return {
        className: "line zse-code-error-message",
        style: `--error-indent: ${error.start}ch`,
    };
}
