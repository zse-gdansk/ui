// Adnotacje w kodzie jak na blogu, w komentarzu na końcu linii:
//   const a = 1; // [!code ++]        dodana linia
//   const b = 2; // [!code --]        usunięta linia
//   const c = 3; // [!code highlight] wyróżniona linia
//   // [!code word:oddane]            słowo zaznaczone w całym bloku
// Działa z komentarzami //, #, --, /* */ i <!-- -->.

export interface Marks {
    highlight: ReadonlySet<number>;
    added: ReadonlySet<number>;
    removed: ReadonlySet<number>;
    words: readonly string[];
}

const NOTATION =
    /\s*(?:\/\/|#|--|\/\*|<!--)\s*\[!code (\+\+|--|highlight|hl|word:([^\]]+))\]\s*(?:\*\/|-->)?\s*$/;

export function parseAnnotations(code: string) {
    const highlight = new Set<number>();
    const added = new Set<number>();
    const removed = new Set<number>();
    const words: string[] = [];
    const lines: string[] = [];

    for (const raw of code.split("\n")) {
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
    return { source: lines.join("\n"), highlight, added, removed, words };
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
export function wordRanges(source: string, words: readonly string[]) {
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
    // Nachodzące na siebie zakresy (słowo w słowie) Shiki odrzuca.
    const sorted = ranges.toSorted((a, b) => a[0] - b[0]);
    const kept: [number, number][] = [];
    for (const range of sorted)
        if (!kept.length || range[0] >= (kept.at(-1)?.[1] ?? 0))
            kept.push(range);
    return kept;
}
