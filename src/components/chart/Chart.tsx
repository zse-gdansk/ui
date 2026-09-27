"use client";

import { ChartLineData01Icon } from "@hugeicons/core-free-icons";
import type { EChartsType } from "echarts/core";
import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type CSSProperties,
    type ReactNode,
} from "react";

import { useMessages } from "../../i18n/context";
import { EmptyState } from "../empty-state/EmptyState";
import { Skeleton } from "../skeleton/Skeleton";
import { initChart, type ChartOption } from "./echarts";
import { readTheme, type ChartTheme } from "./theme";

export interface ChartProps {
    // Opcje ECharts z motywu (kolory z tokenów), wywoływane przy zmianie
    // danych i motywu. Własny wykres dowolnego typu w stylu biblioteki.
    option: (theme: ChartTheme) => ChartOption;
    // Nazwa wykresu dla czytnika i podpis tabeli danych.
    label: string;
    height?: CSSProperties["height"];
    // canvas: szybszy przy dużych danych; svg: ostry przy druku i zoomie.
    renderer?: "canvas" | "svg";
    // Pierwsze wczytanie: szkielet; odświeżanie: poprzedni wykres
    // przygaszony, bez skoku układu.
    loading?: boolean;
    empty?: boolean;
    // Wiersze tabeli danych dla czytnika (thead i tbody), zawsze w DOM.
    table?: ReactNode;
    // Faktura zamiast samego koloru, np. do druku albo dla daltonistów.
    texture?: boolean;
    // Treść na środku wykresu, np. suma w donucie.
    center?: ReactNode;
    className?: string;
}

// Rdzeń wykresów: ECharts w motywie biblioteki, z tabelą dla czytnika,
// pustym stanem, szkieletem i ograniczonym ruchem. Gotowe wykresy (BarChart,
// LineChart, DonutChart) to nakładki na niego.
export function Chart({
    option,
    label,
    height = 280,
    renderer = "canvas",
    loading = false,
    empty = false,
    table,
    texture = false,
    center,
    className,
}: ChartProps) {
    const t = useMessages();
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<EChartsType | null>(null);
    const [theme, setTheme] = useState<ChartTheme | null>(null);
    // Czy wykres już coś narysował: wtedy wczytywanie go przygasza zamiast
    // zastępować szkieletem.
    const [drawn, setDrawn] = useState(false);
    // Ostatnio narysowane opcje: przebudowa tylko przy innych danych albo
    // motywie, nie przy każdym renderze rodzica (bez powtórnej animacji).
    const lastRef = useRef("");

    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const chart = initChart(container, renderer);
        chartRef.current = chart;
        setTheme(readTheme(container));

        const resize = new ResizeObserver(() => chart.resize());
        resize.observe(container);
        // Motyw i akcent to atrybuty na <html>.
        const themes = new MutationObserver(() =>
            setTheme(readTheme(container)),
        );
        themes.observe(document.documentElement, { attributes: true });

        return () => {
            resize.disconnect();
            themes.disconnect();
            chart.dispose();
            chartRef.current = null;
        };
    }, [renderer]);

    useEffect(() => {
        const chart = chartRef.current;
        if (!chart || !theme || empty) return;
        const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
        const built = option(theme);
        const signature = JSON.stringify([built, texture, reduced]);
        if (signature === lastRef.current) return;
        lastRef.current = signature;
        chart.setOption(
            {
                animation: !reduced,
                animationDuration: 500,
                animationEasing: "cubicOut",
                textStyle: { fontFamily: theme.fontFamily },
                aria: {
                    enabled: true,
                    // Opis daje tabela danych, nie generowany tekst ECharts.
                    label: { enabled: false },
                    decal: { show: texture },
                },
                ...built,
            },
            { notMerge: true },
        );
        setDrawn(true);
    }, [option, theme, empty, texture]);

    const showSkeleton = loading && !drawn;

    return (
        <figure
            className={["zse-chart", className].filter(Boolean).join(" ")}
            data-loading={(loading && drawn) || undefined}
            aria-busy={loading || undefined}
        >
            <div
                ref={containerRef}
                className="zse-chart-canvas"
                style={{ height }}
                // Rysunek bez treści dla czytnika: dane podaje tabela z podpisem.
                aria-hidden
                data-hidden={showSkeleton || empty || undefined}
            />
            {center != null && !empty && !showSkeleton && (
                <div className="zse-chart-center">{center}</div>
            )}
            {showSkeleton && (
                <Skeleton
                    className="zse-chart-skeleton"
                    radius="var(--radius-md)"
                />
            )}
            {empty && !loading && (
                <div className="zse-chart-empty">
                    <EmptyState
                        size="sm"
                        icon={ChartLineData01Icon}
                        title={t.chart.empty}
                    />
                </div>
            )}
            {table != null && !empty && (
                <table className="zse-chart-table">
                    <caption>{label}</caption>
                    {table}
                </table>
            )}
        </figure>
    );
}
