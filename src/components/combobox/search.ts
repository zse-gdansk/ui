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

export function matchRange(text: string, query: string) {
    const needle = fold(query.trim());
    if (!needle) return null;
    const chars = Array.from(text);
    const index = chars.map(foldChar).join("").indexOf(needle);
    if (index === -1) return null;
    const start = chars.slice(0, index).join("").length;
    const end =
        start + chars.slice(index, index + needle.length).join("").length;
    return [start, end] as const;
}
