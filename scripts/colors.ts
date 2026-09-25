import { clampChroma, type Oklch, wcagContrast } from "culori";

type Theme = "light" | "dark";

const ACCENTS = {
    blue: { hue: 255, solid: 0.58 },
    green: { hue: 150, solid: 0.62 },
    orange: { hue: 55, solid: 0.7 },
    red: { hue: 25, solid: 0.58 },
    violet: { hue: 295, solid: 0.56 },
} as const;

const DEFAULT_ACCENT = "blue";

const LIGHTNESS: Record<Theme, number[]> = {
    light: [
        0.993, 0.982, 0.962, 0.938, 0.914, 0.882, 0.835, 0.74, 0, 0, 0.5, 0.25,
    ],
    dark: [
        0.17, 0.2, 0.235, 0.265, 0.295, 0.335, 0.395, 0.49, 0, 0, 0.78, 0.95,
    ],
};

const CHROMA: Record<Theme, number[]> = {
    light: [0.45, 0.65, 0.75, 0.8, 0.82, 0.82, 0.8, 0.8, 1, 1, 0.9, 0.6],
    dark: [
        0.35, 0.45, 0.55, 0.62, 0.68, 0.72, 0.76, 0.8, 0.95, 0.95, 0.8, 0.35,
    ],
};

const ENVELOPE: Record<Theme, number[]> = {
    light: [0.04, 0.09, 0.17, 0.26, 0.35, 0.45, 0.58, 0.8, 1, 1, 0.9, 0.5],
    dark: [0.12, 0.17, 0.25, 0.31, 0.38, 0.45, 0.57, 0.75, 1, 1, 0.75, 0.2],
};

const TEXT_CONTRAST = { 11: 4.5, 12: 7 } as const;

const GRAY_SOLID = 0.6;
const HOVER_SHIFT = 0.04;

function color(l: number, c: number, h: number): Oklch {
    return clampChroma({ mode: "oklch", l, c, h }, "oklch");
}

// Przesuwa jasność, aż para osiągnie docelowy kontrast.
function reach(step: Oklch, other: Oklch, target: number, direction: -1 | 1) {
    let next = step;
    while (
        wcagContrast(next, other) < target &&
        next.l > 0.05 &&
        next.l < 0.99
    ) {
        next = color(next.l + direction * 0.005, next.c, next.h ?? 0);
    }
    return next;
}

function ramp(theme: Theme, hue: number, solid: number | null) {
    const lightness = [...LIGHTNESS[theme]];
    lightness[8] = lightness[9] = solid ?? GRAY_SOLID;
    // Szary zostaje na chromie 0.
    const peak = solid === null ? 0 : color(solid, 0.4, hue).c;
    const steps = lightness.map((l, i) => {
        const c = color(l, 0.4, hue).c * (CHROMA[theme][i] ?? 0);
        const cap = peak * (ENVELOPE[theme][i] ?? 0);
        return color(l, Math.min(c, cap), solid === null ? 0 : hue);
    });
    for (const [index, target] of Object.entries(TEXT_CONTRAST)) {
        const i = Number(index) - 1;
        steps[i] = reach(
            steps[i]!,
            steps[2]!,
            target,
            theme === "light" ? -1 : 1,
        );
    }
    return steps;
}

const format = (c: Oklch) =>
    `oklch(${(c.l * 100).toFixed(1)}% ${c.c.toFixed(3)} ${c.c < 0.0005 ? 0 : Math.round(c.h ?? 0)})`;

const WHITE: Oklch = { mode: "oklch", l: 1, c: 0, h: 0 };
const INK = ramp("light", 0, null)[11]!;

const report: string[] = [];
const ratio = (a: Oklch, b: Oklch) => wcagContrast(a, b).toFixed(2);

function block(theme: Theme) {
    const ramps: [string, Oklch[]][] = [["gray", ramp(theme, 0, null)]];
    for (const [name, { hue, solid }] of Object.entries(ACCENTS)) {
        ramps.push([name, ramp(theme, hue, solid)]);
    }
    const lines: string[] = [];
    for (const [name, steps] of ramps) {
        // Tekst na wypełnieniu: biały albo prawie czarny, co da lepszy
        // kontrast. Hover idzie w kierunku rampy (jaśniej w ciemnym motywie),
        // a oba kroki przesuwają się razem, aż bliższy tekstowi ma 4.5:1.
        const useWhite =
            wcagContrast(WHITE, steps[8]!) >= wcagContrast(INK, steps[8]!);
        const text = useWhite ? WHITE : INK;
        const away = useWhite ? -1 : 1;
        const hover = theme === "light" ? -HOVER_SHIFT : HOVER_SHIFT;
        let fill = steps[8]!;
        const pair = (f: Oklch) =>
            [f, color(f.l + hover, f.c, f.h ?? 0)] as const;
        while (
            Math.min(...pair(fill).map((f) => wcagContrast(text, f))) < 4.5
        ) {
            fill = color(fill.l + away * 0.005, fill.c, fill.h ?? 0);
        }
        [steps[8], steps[9]] = pair(fill);

        steps.forEach((step, i) =>
            lines.push(`    --${name}-${i + 1}: ${format(step)};`),
        );
        lines.push(`    --${name}-contrast: ${format(text)};`, "");

        report.push(
            [
                theme.padEnd(5),
                name.padEnd(6),
                `11/3 ${ratio(steps[10]!, steps[2]!)}`,
                `12/3 ${ratio(steps[11]!, steps[2]!)}`,
                `text/9 ${ratio(text, steps[8]!)}`,
                `text/10 ${ratio(text, steps[9]!)}`,
            ].join("  "),
        );
    }
    return lines.join("\n").trimEnd();
}

const accents = Object.keys(ACCENTS)
    .map((name) => {
        const selector =
            name === DEFAULT_ACCENT
                ? `:root,\n[data-accent="${name}"]`
                : `[data-accent="${name}"]`;
        const steps = Array.from(
            { length: 12 },
            (_, i) => `    --accent-${i + 1}: var(--${name}-${i + 1});`,
        );
        steps.push(`    --accent-contrast: var(--${name}-contrast);`);
        return `${selector} {\n${steps.join("\n")}\n}`;
    })
    .join("\n\n");

const css = `/* Wygenerowane przez scripts/colors.ts (bun run colors), nie edytować. */
:root,
[data-theme="light"] {
    color-scheme: light;
${block("light")}
}

[data-theme="dark"] {
    color-scheme: dark;
${block("dark")}
}

${accents}
`;

await Bun.write(new URL("../src/styles/colors.css", import.meta.url), css);
console.log(report.join("\n"));
