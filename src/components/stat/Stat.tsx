"use client";

import { useRender } from "@base-ui/react/use-render";
import {
    ArrowDownRight01Icon,
    ArrowUpRight01Icon,
    MinusSignIcon,
} from "@hugeicons/core-free-icons";
import {
    useCallback,
    useId,
    useLayoutEffect,
    useRef,
    useState,
    type CSSProperties,
    type ReactNode,
    type RefObject,
} from "react";

import { useMessages } from "../../i18n/context";
import { Icon, type IconGlyph } from "../icon/Icon";
import { Skeleton } from "../skeleton/Skeleton";

type Intent = "increase" | "decrease" | "neutral";
type Tone = "success" | "danger" | "neutral";

export interface StatProps extends Omit<
    useRender.ComponentProps<"div">,
    "children"
> {
    label: ReactNode;
    // null to brak danych, nie zero.
    value: number | null;
    // Np. { style: "percent" }, { style: "currency", currency: "PLN" }.
    format?: Intl.NumberFormatOptions;
    // Jednostka mniejszym krojem, np. „pkt”, „uczniów”.
    unit?: ReactNode;
    unitPosition?: "start" | "end";
    // Wartość z poprzedniego okresu; zmiana liczy się sama.
    previous?: number | null;
    // Albo zmiana podana wprost, w jednostkach wartości.
    delta?: number;
    // "percent" względem previous, "absolute" w formacie wartości.
    deltaFormat?: "percent" | "absolute";
    // Który kierunek jest dobry: nieobecności mają "decrease".
    intent?: Intent;
    // Np. „od zeszłego tygodnia”.
    deltaLabel?: ReactNode;
    // Prawdziwe wartości z kolejnych okresów, od najstarszej.
    trend?: readonly number[];
    icon?: IconGlyph;
    description?: ReactNode;
    size?: "sm" | "md" | "lg";
    variant?: "plain" | "outline" | "elevated" | "subtle";
    loading?: boolean;
    // Liczba dojeżdża do nowej wartości przy zmianie (nie przy pierwszym renderze).
    animate?: boolean;
}

const formats = new Map<string, Intl.NumberFormat>();

function formatter(locale: string, options: Intl.NumberFormatOptions = {}) {
    const key = `${locale}|${JSON.stringify(options)}`;
    let format = formats.get(key);
    if (!format) {
        format = new Intl.NumberFormat(locale, options);
        formats.set(key, format);
    }
    return format;
}

function toneOf(change: number, intent: Intent): Tone {
    if (change === 0 || intent === "neutral") return "neutral";
    return change > 0 === (intent === "increase") ? "success" : "danger";
}

const DURATION = 700;
// Mocny ease-out, jak --ease-out: szybki start, długie dojście.
const easeOut = (t: number) => 1 - (1 - t) ** 4;

function write(node: ChildNode, text: string) {
    node.nodeValue = text;
}

// Dojazd liczby bez renderów Reacta: klatki piszą prosto do węzła tekstu.
function useCountUp(
    ref: RefObject<HTMLSpanElement | null>,
    value: number | null,
    format: (value: number) => string,
    enabled: boolean,
) {
    const shown = useRef(value);

    useLayoutEffect(() => {
        const node = ref.current?.firstChild;
        const from = shown.current;
        const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (
            !node ||
            value === null ||
            from === null ||
            from === value ||
            !enabled ||
            reduced
        ) {
            shown.current = value;
            return;
        }

        const start = performance.now();
        let frame = 0;
        const step = (now: number) => {
            const progress = Math.min((now - start) / DURATION, 1);
            const current = from + (value - from) * easeOut(progress);
            shown.current = current;
            write(node, format(current));
            if (progress < 1) frame = requestAnimationFrame(step);
        };
        // Pierwsza klatka jeszcze przed malowaniem, bez mignięcia wartością końcową.
        write(node, format(from));
        frame = requestAnimationFrame(step);
        return () => {
            cancelAnimationFrame(frame);
            write(node, format(value));
        };
    }, [ref, value, format, enabled]);
}

type Point = readonly [number, number];

// Krzywa monotoniczna (Fritsch–Carlson): gładka, ale nie wychodzi ponad
// ani pod dane, więc szczyt na wykresie to prawdziwy szczyt.
function smoothPath(points: readonly Point[]) {
    const n = points.length;
    const slopes: number[] = [];
    for (let i = 0; i < n - 1; i++) {
        const [x0, y0] = points[i] as Point;
        const [x1, y1] = points[i + 1] as Point;
        slopes.push((y1 - y0) / (x1 - x0));
    }
    const tangents = points.map((_, i) => {
        if (i === 0) return slopes[0] ?? 0;
        if (i === n - 1) return slopes[n - 2] ?? 0;
        const before = slopes[i - 1] ?? 0;
        const after = slopes[i] ?? 0;
        // Zmiana kierunku albo płasko: styczna pozioma, bez pętli.
        if (before * after <= 0) return 0;
        return (2 * before * after) / (before + after);
    });

    let d = `M${points[0]?.[0]},${points[0]?.[1]}`;
    for (let i = 0; i < n - 1; i++) {
        const [x0, y0] = points[i] as Point;
        const [x1, y1] = points[i + 1] as Point;
        const third = (x1 - x0) / 3;
        const t0 = tangents[i] ?? 0;
        const t1 = tangents[i + 1] ?? 0;
        d += ` C${x0 + third},${y0 + t0 * third} ${x1 - third},${y1 - t1 * third} ${x1},${y1}`;
    }
    return d;
}

// Zapas na kropkę z poświatą, żeby nic nie wystawało poza pole.
const DOT = 2.5;
const PAD = DOT + 1;

function Sparkline({ values }: { values: readonly number[] }) {
    const gradient = useId();
    // Rysujemy w prawdziwych pikselach: skalowany viewBox robi z kropki
    // elipsę i spłaszcza kreskę.
    const [size, setSize] = useState<{ width: number; height: number }>();
    const observe = useCallback((svg: SVGSVGElement | null) => {
        if (!svg) return;
        const observer = new ResizeObserver(([entry]) => {
            if (!entry) return;
            const { width, height } = entry.contentRect;
            setSize((current) =>
                current?.width === width && current.height === height
                    ? current
                    : { width, height },
            );
        });
        observer.observe(svg);
        return () => observer.disconnect();
    }, []);

    if (values.length < 2) return null;

    let shapes: ReactNode = null;
    if (size && size.width > 0 && size.height > 0) {
        const { width, height } = size;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const span = max - min;
        const step = (width - PAD - 1) / (values.length - 1);
        const points = values.map((value, index): Point => [
            1 + index * step,
            span === 0
                ? height / 2
                : PAD + (1 - (value - min) / span) * (height - 2 * PAD),
        ]);
        const line = smoothPath(points);
        const first = points[0] as Point;
        const last = points.at(-1) as Point;

        shapes = (
            <>
                <path
                    className="zse-stat-trend-area"
                    d={`${line} L${last[0]},${height} L${first[0]},${height} Z`}
                    fill={`url(#${gradient})`}
                />
                <path
                    className="zse-stat-trend-line"
                    d={line}
                    pathLength={1}
                    fill="none"
                    stroke="currentColor"
                />
                <circle
                    className="zse-stat-trend-halo"
                    cx={last[0]}
                    cy={last[1]}
                    r={DOT + 3}
                    fill="currentColor"
                />
                <circle
                    className="zse-stat-trend-dot"
                    cx={last[0]}
                    cy={last[1]}
                    r={DOT}
                    fill="currentColor"
                />
            </>
        );
    }

    return (
        <svg
            ref={observe}
            className="zse-stat-trend"
            {...(size && { viewBox: `0 0 ${size.width} ${size.height}` })}
            aria-hidden
        >
            <defs>
                <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
                    <stop
                        offset="0"
                        stopColor="currentColor"
                        stopOpacity="0.18"
                    />
                    <stop offset="1" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
            </defs>
            {shapes}
        </svg>
    );
}

// Jedna liczba z kontekstem: frekwencja, średnia, oddane prace.
export function Stat({
    label,
    value,
    format,
    unit,
    unitPosition = "end",
    previous,
    delta,
    deltaFormat,
    intent = "increase",
    deltaLabel,
    trend,
    icon,
    description,
    size = "md",
    variant = "plain",
    loading = false,
    animate = true,
    render,
    className,
    ...props
}: StatProps) {
    const t = useMessages();
    const valueRef = useRef<HTMLSpanElement>(null);
    const number = formatter(t.locale, format);
    // Stała referencja, inaczej animacja zaczynałaby się od nowa przy każdym renderze.
    const formatValue = useCallback(
        (next: number) => number.format(next),
        [number],
    );

    const change =
        delta ?? (value !== null && previous != null ? value - previous : null);
    const relative =
        deltaFormat !== "absolute" &&
        previous != null &&
        previous !== 0 &&
        change !== null;
    const tone = change === null ? "neutral" : toneOf(change, intent);
    let changeText: string | null = null;
    let changeMagnitude = "";
    if (change !== null) {
        const options: Intl.NumberFormatOptions = relative
            ? { style: "percent", maximumFractionDigits: 1 }
            : { ...format };
        const amount = relative ? change / Math.abs(previous) : change;
        changeText = formatter(t.locale, {
            ...options,
            signDisplay: "exceptZero",
        })
            .format(amount)
            // Prawdziwy minus zamiast dywizu, szerokości plusa.
            .replace("-", "\u2212");
        changeMagnitude = formatter(t.locale, options).format(Math.abs(amount));
    }
    const changeSpoken =
        change === null
            ? null
            : change === 0
              ? t.stat.unchanged
              : change > 0
                ? t.stat.increase(changeMagnitude)
                : t.stat.decrease(changeMagnitude);

    useCountUp(valueRef, value, formatValue, animate && !loading);

    const unitNode = unit != null && (
        <span className="zse-stat-unit">{unit}</span>
    );

    return useRender({
        render,
        defaultTagName: "div",
        props: {
            ...props,
            "data-size": size,
            "data-variant": variant,
            "data-tone": tone,
            "aria-busy": loading || undefined,
            className: [
                "zse-stat",
                variant !== "plain" && "zse-card",
                className,
            ]
                .filter(Boolean)
                .join(" "),
            children: (
                <>
                    <div className="zse-stat-label">
                        {icon && <Icon icon={icon} size={16} />}
                        <span>{label}</span>
                    </div>

                    <div className="zse-stat-body">
                        <div className="zse-stat-main">
                            <Skeleton
                                loading={loading}
                                className="zse-stat-value-skeleton"
                            >
                                <span className="zse-stat-value">
                                    {unitPosition === "start" && unitNode}
                                    {value === null ? (
                                        <>
                                            <span
                                                className="zse-stat-number"
                                                data-empty
                                                aria-hidden
                                            >
                                                –
                                            </span>
                                            <span className="zse-stat-sr">
                                                {t.stat.noData}
                                            </span>
                                        </>
                                    ) : (
                                        <span
                                            ref={valueRef}
                                            className="zse-stat-number"
                                        >
                                            {formatValue(value)}
                                        </span>
                                    )}
                                    {unitPosition === "end" && unitNode}
                                </span>
                            </Skeleton>

                            {(changeText !== null || deltaLabel != null) && (
                                <Skeleton
                                    loading={loading}
                                    className="zse-stat-change-skeleton"
                                >
                                    <span className="zse-stat-change">
                                        {changeText !== null && (
                                            <span className="zse-stat-delta">
                                                <Icon
                                                    icon={
                                                        change === 0
                                                            ? MinusSignIcon
                                                            : (change ?? 0) > 0
                                                              ? ArrowUpRight01Icon
                                                              : ArrowDownRight01Icon
                                                    }
                                                    size={14}
                                                    strokeWidth={1.75}
                                                    aria-hidden
                                                />
                                                <span aria-hidden>
                                                    {changeText}
                                                </span>
                                                <span className="zse-stat-sr">
                                                    {changeSpoken}
                                                </span>
                                            </span>
                                        )}
                                        {deltaLabel != null && (
                                            <span className="zse-stat-delta-label">
                                                {deltaLabel}
                                            </span>
                                        )}
                                    </span>
                                </Skeleton>
                            )}
                        </div>

                        {trend && !loading && <Sparkline values={trend} />}
                    </div>

                    {description != null && (
                        <p className="zse-stat-description">{description}</p>
                    )}
                </>
            ),
        },
    });
}

export interface StatGroupProps extends useRender.ComponentProps<"div"> {
    // Najmniejsza szerokość kolumny, potem zawijanie.
    minWidth?: number;
    variant?: "plain" | "outline";
}

// Kilka statystyk w rzędzie, rozdzielonych kreską. Kolumny zawijają się
// według miejsca w kontenerze, nie szerokości ekranu.
export function StatGroup({
    minWidth = 180,
    variant = "plain",
    render,
    className,
    style,
    ...props
}: StatGroupProps) {
    return useRender({
        render,
        defaultTagName: "div",
        props: {
            ...props,
            "data-variant": variant,
            className: ["zse-stat-group", className].filter(Boolean).join(" "),
            style: { "--stat-min": `${minWidth}px`, ...style } as CSSProperties,
        },
    });
}
