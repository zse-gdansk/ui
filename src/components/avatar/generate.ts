// Deterministyczny wygląd awatara z imienia albo maila: ten sam seed daje
// zawsze ten sam obraz, na każdym urządzeniu i bez zapytań do serwera.

// FNV-1a, 32 bity.
function hash(text: string) {
    let h = 0x811c9dc5;
    for (const char of text) {
        h ^= char.codePointAt(0) ?? 0;
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
}

// mulberry32: z jednego hasha kolejne liczby 0–1.
function random(seed: number) {
    let state = seed;
    return () => {
        state = (state + 0x6d2b79f5) | 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function normalizeSeed(seed: string) {
    return seed.trim().toLocaleLowerCase("pl");
}

export function avatarVars(seed: string) {
    const next = random(hash(normalizeSeed(seed)));
    const hue = Math.floor(next() * 360);
    const spread = 25 + next() * 45;
    const point = () => `${Math.round(next() * 100)}%`;
    return {
        "--avatar-hue": hue,
        "--avatar-hue-2": Math.round(hue + spread),
        "--avatar-hue-3": Math.round(hue - spread * 0.8),
        "--avatar-x1": point(),
        "--avatar-y1": point(),
        "--avatar-x2": point(),
        "--avatar-y2": point(),
        "--avatar-x3": point(),
        "--avatar-y3": point(),
        "--avatar-angle": `${Math.round(next() * 360)}deg`,
    };
}

export function initials(name: string) {
    const words = name
        .replace(/@.*$/, "")
        .split(/[\s._-]+/)
        .filter(Boolean);
    const letters =
        words.length > 1
            ? [words[0], words.at(-1)].map((word) => [...(word ?? "")][0])
            : [[...(words[0] ?? "")][0]];
    return letters.join("").toLocaleUpperCase("pl");
}
