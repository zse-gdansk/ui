"use client";

import type { CSSProperties } from "react";

import { useMessages } from "../../i18n/context";
import { useChartFormat } from "./BarChart";
import { Chart, type ChartProps } from "./Chart";
import {
    DataTable,
    categoryAxis,
    tipHtml,
    toNumber,
    tooltipBase,
    type Format,
} from "./parts";
import { mix, readableOn, resolveColor } from "./theme";

type Category = string | number;

export interface HeatmapChartProps<Row> extends Omit<
    ChartProps,
    "option" | "table" | "center" | "empty" | "footer"
> {
    // Jedna komórka na wiersz danych, np. { day: "Pn", lesson: 3, value: 92 }.
    data: readonly Row[];
    // Kolumny, np. lekcja.
    x: keyof Row & string;
    // Wiersze, np. dzień tygodnia.
    y: keyof Row & string;
    value: keyof Row & string;
    // Kolejność kolumn i wierszy; bez nich jak w danych. Komórka bez wiersza
    // danych jest pusta (np. piątek bez 9. lekcji).
    xCategories?: readonly Category[];
    yCategories?: readonly Category[];
    format?: Format;
    formatX?: (value: Category) => string;
    formatY?: (value: Category) => string;
    // Tytuł tooltipa komórki, np. „Wtorek, 3. lekcja”; domyślnie
    // „wiersz · kolumna” z formatY i formatX.
    tooltipTitle?: (x: Category, y: Category) => string;
    // Nagłówek kolumny wierszy w tabeli danych (np. „Dzień”) i nazwa
    // wartości w tooltipie (np. „frekwencja”).
    yLabel?: string;
    valueLabel?: string;
    // Zakres skali; domyślnie najmniejsza i największa wartość w danych.
    min?: number;
    max?: number;
    // high: ciemniej = więcej (np. nieobecności); low: ciemniej = mniej
    // (frekwencja: od razu widać słabe lekcje).
    emphasize?: "high" | "low";
    // Jeden odcień skali: CSS albo token.
    color?: string;
    // Wartości w komórkach; wyłącz przy małych komórkach.
    labels?: boolean;
}

const LIGHT = 0.1;

// Wartość na siatce dwóch kategorii, np. frekwencja: dni × lekcje. Jeden
// odcień od jasnego do mocnego, 2px tła między komórkami, puste komórki
// wyszarzone, legenda skali pod spodem.
export function HeatmapChart<Row>({
    data,
    x,
    y,
    value,
    xCategories,
    yCategories,
    format,
    formatX = String,
    formatY = String,
    tooltipTitle,
    yLabel,
    valueLabel,
    min,
    max,
    emphasize = "high",
    color = "var(--chart-positive-strong)",
    labels = true,
    height,
    ...props
}: HeatmapChartProps<Row>) {
    const t = useMessages();
    const valueFormat = useChartFormat(format);
    const unique = (key: keyof Row & string) => [
        ...new Set(data.map((row) => row[key] as unknown as Category)),
    ];
    const columns = xCategories ?? unique(x);
    const rows = yCategories ?? unique(y);
    const cells = new Map<string, number | null>();
    for (const row of data)
        cells.set(
            `${String(row[x])}\u0000${String(row[y])}`,
            toNumber(row[value]),
        );
    const valueAt = (column: Category, row: Category) =>
        cells.get(`${String(column)}\u0000${String(row)}`) ?? null;
    const values = [...cells.values()].filter(
        (item): item is number => item !== null,
    );
    const low = min ?? Math.min(...values);
    const high = max ?? Math.max(...values);
    const position = (item: number) => {
        const share = high === low ? 1 : (item - low) / (high - low);
        const clamped = Math.min(1, Math.max(0, share));
        return emphasize === "low" ? 1 - clamped : clamped;
    };

    const option: ChartProps["option"] = (theme) => {
        const strong = resolveColor(color);
        const light = mix(theme.surface, strong, LIGHT);
        const fill = (item: number | null) =>
            item === null ? theme.surface : mix(light, strong, position(item));
        return {
            grid: { top: 4, right: 4, bottom: 4, left: 4, containLabel: true },
            // ECharts rysuje heatmapę tylko z visualMap. Ukryty, na gotowym
            // położeniu komórki, z tymi samymi krańcami co legenda pod
            // wykresem.
            visualMap: {
                show: false,
                type: "continuous" as const,
                seriesIndex: 0,
                dimension: 2,
                min: 0,
                max: 1,
                inRange: { color: [light, strong] },
            },
            tooltip: {
                ...tooltipBase,
                trigger: "item",
                formatter: (params: unknown) => {
                    const { value: cell } = params as {
                        value: [number, number, number | null];
                    };
                    const column = columns[cell[0]] ?? "";
                    const row = rows[cell[1]] ?? "";
                    const item = valueAt(column, row);
                    const title = tooltipTitle
                        ? tooltipTitle(column, row)
                        : `${formatY(row)} · ${formatX(column)}`;
                    return tipHtml(title, [
                        {
                            color: fill(item),
                            name: valueLabel ?? "",
                            value:
                                item === null
                                    ? t.chart.noValue
                                    : valueFormat(item),
                            kind: "bar",
                        },
                    ]);
                },
            },
            xAxis: {
                ...categoryAxis(theme, columns.map(formatX)),
                position: "top" as const,
                axisLine: { show: false },
            },
            yAxis: {
                ...categoryAxis(theme, rows.map(formatY)),
                inverse: true,
                axisLine: { show: false },
            },
            series: [
                {
                    type: "heatmap" as const,
                    // Pusta komórka (brak lekcji) nie jest rysowana: zostaje
                    // tło, nie najniższa wartość na skali. W tabeli „–”.
                    data: rows.flatMap((row, rowIndex) =>
                        columns.flatMap((column, columnIndex) => {
                            const item = valueAt(column, row);
                            if (item === null) return [];
                            const background = fill(item);
                            return {
                                // Trzeci wymiar to położenie na skali (0–1)
                                // dla visualMap.
                                value: [columnIndex, rowIndex, position(item)],
                                label: {
                                    color: readableOn(background, theme),
                                    formatter: () =>
                                        item === null ? "" : valueFormat(item),
                                },
                            };
                        }),
                    ),
                    itemStyle: {
                        borderColor: theme.surface,
                        borderWidth: 2,
                        borderRadius: 6,
                    },
                    label: { show: labels, fontSize: 11 },
                    // Bez podświetlenia: rozjaśniało komórkę i gubiło jej
                    // wartość na skali. Wskazaną opisuje tooltip.
                    emphasis: { disabled: true },
                },
            ],
        };
    };

    return (
        <Chart
            {...props}
            // Wysokość z liczby wierszy: 40px na wiersz i oś u góry.
            height={height ?? rows.length * 40 + 32}
            option={option}
            empty={data.length === 0 || values.length === 0}
            footer={
                <div
                    // Pasek zawsze od jasnego do mocnego; przy low to mocne
                    // jest przy najmniejszej wartości, więc zamieniają się
                    // podpisy, nie kolory.
                    className="zse-chart-scale"
                    style={{ "--scale-color": color } as CSSProperties}
                >
                    <span>{valueFormat(emphasize === "low" ? high : low)}</span>
                    <span className="zse-chart-scale-bar" />
                    <span>{valueFormat(emphasize === "low" ? low : high)}</span>
                </div>
            }
            table={
                <DataTable
                    head={[yLabel ?? String(y), ...columns.map(formatX)]}
                    rows={rows.map((row) =>
                        [formatY(row)].concat(
                            columns.map((column) => {
                                const item = valueAt(column, row);
                                return item === null ? "–" : valueFormat(item);
                            }),
                        ),
                    )}
                />
            }
        />
    );
}
