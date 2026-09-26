export type PageItem = number | "start-gap" | "end-gap";

const span = (from: number, to: number) =>
    Array.from({ length: Math.max(to - from + 1, 0) }, (_, i) => from + i);

// Zawsze ta sama liczba pozycji (poza bardzo krótkimi listami), więc
// przyciski nie przeskakują przy przechodzeniu między stronami.
// siblings: ile stron obok bieżącej, boundaries: ile na każdym końcu.
export function pageRange(
    page: number,
    count: number,
    siblings = 1,
    boundaries = 1,
): PageItem[] {
    const slots = siblings * 2 + 3 + boundaries * 2;
    if (slots >= count) return span(1, count);

    const left = Math.max(page - siblings, boundaries + 1);
    const right = Math.min(page + siblings, count - boundaries);
    // Przerwa tylko wtedy, gdy ukrywa co najmniej dwie strony. Jedną
    // lepiej pokazać, niż zastąpić ją wielokropkiem tej samej szerokości.
    const startGap = left > boundaries + 2;
    const endGap = right < count - boundaries - 1;

    const head = span(1, boundaries);
    const tail = span(count - boundaries + 1, count);
    const inner = slots - boundaries * 2 - 1;

    if (!startGap && endGap)
        return [...span(1, boundaries + inner), "end-gap", ...tail];
    if (startGap && !endGap)
        return [
            ...head,
            "start-gap",
            ...span(count - boundaries - inner + 1, count),
        ];
    return [...head, "start-gap", ...span(left, right), "end-gap", ...tail];
}
