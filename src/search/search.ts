// Wyszukiwanie po listach: bez polskich znaków i wielkości liter,
// z rankingiem i jedną literówką. Indeks liczony raz na listę.

export type Range = readonly [start: number, end: number];

export type SearchKey<T> =
    | (keyof T & string)
    | {
          name: string;
          get: (item: T) => string | null | undefined;
          // Mnożnik wyniku, np. 0.5 dla opisu obok nazwy.
          weight?: number;
      };

export interface SearchOptions<T> {
    keys: readonly SearchKey<T>[];
    // Najsłabsze dopasowanie, które jeszcze się liczy (0–100).
    threshold?: number;
}

export interface SearchResult<T> {
    item: T;
    score: number;
    // Zakresy w oryginalnym tekście, po nazwie klucza, do podświetlenia.
    ranges: Record<string, Range[]>;
}

const EXTRA: Record<string, string> = { ł: "l", Ł: "l" };

function foldChar(char: string) {
    return (
        EXTRA[char] ??
        char.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().charAt(0)
    );
}

export function fold(text: string) {
    return Array.from(text, foldChar).join("");
}

const SEPARATOR = /[\s\-_.,/()[\]:;'"„”]/;

interface Indexed {
    folded: string;
    // Początek i koniec każdego znaku złożonego tekstu w oryginale (UTF-16).
    starts: number[];
    ends: number[];
    words: Set<number>;
}

function index(text: string): Indexed {
    let folded = "";
    const starts: number[] = [];
    const ends: number[] = [];
    let position = 0;
    for (const char of text) {
        folded += foldChar(char);
        starts.push(position);
        position += char.length;
        ends.push(position);
    }
    const words = new Set<number>();
    for (let i = 0; i < folded.length; i += 1) {
        const char = folded.charAt(i);
        if (SEPARATOR.test(char)) continue;
        if (i === 0 || SEPARATOR.test(folded.charAt(i - 1))) words.add(i);
    }
    return { folded, starts, ends, words };
}

// Odległość Damerau-Levenshteina, przerwana, gdy przekroczy 1.
function withinOneEdit(a: string, b: string) {
    if (Math.abs(a.length - b.length) > 1) return false;
    let i = 0;
    let j = 0;
    let edits = 0;
    while (i < a.length && j < b.length) {
        if (a[i] === b[j]) {
            i += 1;
            j += 1;
            continue;
        }
        edits += 1;
        if (edits > 1) return false;
        if (a[i] === b[j + 1] && a[i + 1] === b[j]) {
            i += 2;
            j += 2;
        } else if (a.length > b.length) i += 1;
        else if (b.length > a.length) j += 1;
        else {
            i += 1;
            j += 1;
        }
    }
    return edits + (a.length - i) + (b.length - j) <= 1;
}

interface TermMatch {
    score: number;
    ranges: Range[];
}

function matchTerm(term: string, text: Indexed): TermMatch | null {
    const { folded, words } = text;
    const toRange = (from: number, to: number): Range => [
        text.starts[from] ?? 0,
        text.ends[to - 1] ?? 0,
    ];

    // Dosłownie: całe słowo > początek słowa > środek. Wcześniej = lepiej.
    let best: TermMatch | null = null;
    for (
        let at = folded.indexOf(term);
        at !== -1;
        at = folded.indexOf(term, at + 1)
    ) {
        const end = at + term.length;
        const wordStart = words.has(at);
        const wholeWord =
            wordStart &&
            (end === folded.length || SEPARATOR.test(folded.charAt(end)));
        const score =
            (wholeWord ? 100 : wordStart ? 85 : 60) - Math.min(at, 20) * 0.25;
        if (!best || score > best.score)
            best = { score, ranges: [toRange(at, end)] };
    }
    if (best) return best;

    // Literówka: słowo różni się o jedną zmianę (od 4 znaków). Pierwsza
    // litera musi się zgadzać, tam prawie nikt się nie myli.
    if (term.length >= 4)
        for (const start of words) {
            for (const length of [
                term.length,
                term.length - 1,
                term.length + 1,
            ]) {
                const piece = folded.slice(start, start + length);
                if (
                    piece.length === length &&
                    piece.charAt(0) === term.charAt(0) &&
                    withinOneEdit(term, piece)
                )
                    return {
                        score: 45,
                        ranges: [toRange(start, start + length)],
                    };
            }
        }

    // Z przerwami: litery po kolei, blisko siebie, np. „jkow” → „Jan Kowalski”.
    if (term.length >= 3) {
        const positions: number[] = [];
        let from = folded.indexOf(term.charAt(0));
        while (from !== -1) {
            positions.length = 0;
            let cursor = from;
            for (const char of term) {
                cursor = folded.indexOf(char, cursor);
                if (cursor === -1) break;
                positions.push(cursor);
                cursor += 1;
            }
            if (positions.length === term.length) {
                const span = (positions.at(-1) ?? 0) - from + 1;
                if (span <= term.length * 2 + 2)
                    return {
                        score: 35 - (span - term.length) * 2,
                        ranges: positions.map((at) => toRange(at, at + 1)),
                    };
            }
            from = folded.indexOf(term.charAt(0), from + 1);
        }
    }
    return null;
}

// Sąsiadujące zakresy łączone w jeden, żeby <mark> nie był poszatkowany.
function merge(ranges: Range[]) {
    const sorted = ranges.toSorted((a, b) => a[0] - b[0]);
    const out: [number, number][] = [];
    for (const [start, end] of sorted) {
        const last = out.at(-1);
        if (last && start <= last[1]) last[1] = Math.max(last[1], end);
        else out.push([start, end]);
    }
    return out as Range[];
}

export function createSearch<T>(
    items: readonly T[],
    { keys, threshold = 20 }: SearchOptions<T>,
) {
    const fields = keys.map((key) =>
        typeof key === "string"
            ? {
                  name: key,
                  weight: 1,
                  get: (item: T) => item[key] as unknown as string | undefined,
              }
            : { weight: 1, ...key },
    );
    const indexed = items.map((item) =>
        fields.map((field) => {
            const value = field.get(item);
            return typeof value === "string" && value ? index(value) : null;
        }),
    );

    return function search(query: string): SearchResult<T>[] {
        const terms = fold(query).split(/\s+/).filter(Boolean);
        if (terms.length === 0)
            return items.map((item) => ({ item, score: 0, ranges: {} }));

        const results: (SearchResult<T> & { order: number })[] = [];
        items.forEach((item, order) => {
            const texts = indexed[order] ?? [];
            let total = 0;
            const ranges: Record<string, Range[]> = {};
            // Każde słowo zapytania musi pasować w którymś polu.
            for (const term of terms) {
                let best: {
                    score: number;
                    field: number;
                    match: TermMatch;
                } | null = null;
                for (const [field, text] of texts.entries()) {
                    if (!text) continue;
                    const match = matchTerm(term, text);
                    if (!match) continue;
                    const score = match.score * (fields[field]?.weight ?? 1);
                    if (!best || score > best.score)
                        best = { score, field, match };
                }
                if (!best || best.match.score < threshold) return;
                total += best.score;
                const name = fields[best.field]?.name ?? "";
                ranges[name] = [...(ranges[name] ?? []), ...best.match.ranges];
            }
            for (const name of Object.keys(ranges))
                ranges[name] = merge(ranges[name] ?? []);
            results.push({ item, score: total / terms.length, ranges, order });
        });

        return results
            .toSorted((a, b) => b.score - a.score || a.order - b.order)
            .map(({ item, score, ranges }) => ({ item, score, ranges }));
    };
}
