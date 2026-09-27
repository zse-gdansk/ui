export interface ChartTheme {
    series: string[];
    // Skala z biegunami: [mocny, jasny] po każdej stronie i szary środek.
    positive: [string, string];
    negative: [string, string];
    neutral: string;
    text: string;
    textSecondary: string;
    border: string;
    borderSubtle: string;
    surface: string;
    fontFamily: string;
}

let probe: CanvasRenderingContext2D | null = null;

// Dowolny kolor CSS (oklch, color-mix…) jako rgba() przez jeden piksel.
function toRgb(color: string) {
    probe ??= document.createElement("canvas").getContext("2d", {
        willReadFrequently: true,
    });
    if (!probe || !color) return color;
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = "#000";
    probe.fillStyle = color;
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;
    return `rgba(${r}, ${g}, ${b}, ${Math.round(((a ?? 255) / 255) * 100) / 100})`;
}

export function readTheme(element: HTMLElement): ChartTheme {
    const style = getComputedStyle(element);
    const token = (name: string) => toRgb(style.getPropertyValue(name).trim());
    return {
        series: Array.from({ length: 8 }, (_, index) =>
            token(`--chart-${index + 1}`),
        ),
        positive: [
            token("--chart-positive-strong"),
            token("--chart-positive-light"),
        ],
        negative: [
            token("--chart-negative-strong"),
            token("--chart-negative-light"),
        ],
        neutral: token("--chart-neutral"),
        text: token("--color-text"),
        textSecondary: token("--color-text-secondary"),
        border: token("--color-border"),
        borderSubtle: token("--color-border-subtle"),
        surface: token("--color-bg-surface"),
        fontFamily: style.fontFamily,
    };
}

// Kolor podany przez aplikację: CSS albo token (var(--color-success-solid)),
// którego canvas sam nie rozwiąże.
export function resolveColor(color: string) {
    const match = /^var\((--[\w-]+)\)$/.exec(color.trim());
    const value = match?.[1]
        ? getComputedStyle(document.documentElement)
              .getPropertyValue(match[1])
              .trim()
        : color;
    return toRgb(value);
}

const channels = (rgba: string) =>
    (rgba.match(/[\d.]+/g) ?? []).map(Number) as number[];

// Krok między dwoma kolorami rgba(), t od 0 do 1.
export function mix(from: string, to: string, t: number) {
    const a = channels(from);
    const b = channels(to);
    const at = (index: number) =>
        (a[index] ?? 0) + ((b[index] ?? 0) - (a[index] ?? 0)) * t;
    return `rgba(${Math.round(at(0))}, ${Math.round(at(1))}, ${Math.round(at(2))}, ${at(3)})`;
}

const linear = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

// Luminancja względna WCAG z rgba().
function luminance(rgba: string) {
    const [r = 0, g = 0, b = 0] = channels(rgba);
    return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

const contrast = (a: string, b: string) => {
    const [light, dark] = [luminance(a), luminance(b)].toSorted(
        (x, y) => y - x,
    );
    return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
};

// Kolor etykiety na wypełnieniu: biały albo tekst motywu, co ma większy
// kontrast. Na jasnym segmencie ciemny tekst, na mocnym biały.
export function readableOn(fill: string, theme: ChartTheme) {
    const white = "rgba(255, 255, 255, 1)";
    return contrast(fill, white) >= contrast(fill, theme.text)
        ? white
        : theme.text;
}

// Kolory dla wartości od najbardziej pozytywnej do najbardziej negatywnej:
// mocny na krańcach, jasny przy środku, przy nieparzystej liczbie szary
// środek.
export function divergingColors(theme: ChartTheme, count: number) {
    const side = Math.floor(count / 2);
    const arm = ([strong, light]: [string, string]) =>
        Array.from({ length: side }, (_, index) =>
            side === 1 ? strong : mix(strong, light, index / (side - 1)),
        );
    return [
        ...arm(theme.positive),
        ...(count % 2 ? [theme.neutral] : []),
        ...arm(theme.negative).toReversed(),
    ];
}
