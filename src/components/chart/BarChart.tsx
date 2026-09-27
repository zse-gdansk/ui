"use client";

import { useMemo } from "react";

import { useMessages } from "../../i18n/context";
import { Chart, type ChartProps } from "./Chart";
import {
    DataTable,
    categoryAxis,
    grid,
    legend,
    tipHtml,
    toNumber,
    tooltipBase,
    valueAxis,
    type Format,
} from "./parts";

export interface ChartSeries<Row> {
    key: keyof Row & string;
    label: string;
}

export interface CartesianChartProps<Row> extends Omit<
    ChartProps,
    "option" | "table" | "center" | "empty" | "footer"
> {
    data: readonly Row[];
    // Kolumna z kategorią albo czasem, np. "month".
    x: keyof Row & string;
    // Serie w stałej kolejności: kolor idzie za serią, nie za pozycją.
    series: readonly ChartSeries<Row>[];
    // Wartości na osi, w tooltipie i tabeli; domyślnie Intl w języku.
    format?: Format;
    // Etykieta kategorii, np. data jako „wrz”.
    formatX?: (value: Row[keyof Row & string]) => string;
    // Nagłówek kolumny kategorii w tabeli danych, np. „Miesiąc”.
    xLabel?: string;
}

export interface BarChartProps<Row> extends CartesianChartProps<Row> {
    // Słupki poziome, np. wyniki głosowania z długimi nazwami.
    horizontal?: boolean;
    // Serie jedna na drugiej zamiast obok siebie.
    stacked?: boolean;
}

export function useChartFormat(format: Format | undefined) {
    const t = useMessages();
    return useMemo(() => {
        if (format) return format;
        const number = new Intl.NumberFormat(t.locale);
        return (value: number) => number.format(value);
    }, [format, t.locale]);
}

// Słupki: cienkie (najwyżej 24px), zaokrąglony koniec danych, prosty przy
// osi; w stosie segmenty rozdziela 2px tła.
export function BarChart<Row>({
    data,
    x,
    series,
    format,
    formatX,
    xLabel,
    horizontal = false,
    stacked = false,
    ...props
}: BarChartProps<Row>) {
    const valueFormat = useChartFormat(format);
    const categories = data.map((row) =>
        formatX ? formatX(row[x]) : String(row[x]),
    );
    const names = series.map((item) => item.label);
    const radius = horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0];

    const option: ChartProps["option"] = (theme) => ({
        color: theme.series,
        grid: grid(names.length > 1),
        legend: legend(theme, names, "roundRect"),
        tooltip: {
            ...tooltipBase,
            trigger: "axis",
            axisPointer: {
                type: "shadow",
                shadowStyle: { color: theme.borderSubtle, opacity: 0.4 },
            },
            formatter: (params: unknown) => {
                const list = params as {
                    axisValueLabel: string;
                    color: string;
                    seriesName: string;
                    value: number | null;
                }[];
                return tipHtml(
                    list[0]?.axisValueLabel ?? "",
                    list.map((item) => ({
                        color: item.color,
                        name: item.seriesName,
                        value:
                            item.value === null ? "–" : valueFormat(item.value),
                        kind: "bar",
                    })),
                );
            },
        },
        xAxis: horizontal
            ? valueAxis(theme, valueFormat)
            : categoryAxis(theme, categories),
        yAxis: horizontal
            ? { ...categoryAxis(theme, categories), inverse: true }
            : valueAxis(theme, valueFormat),
        series: series.map((item, index) => ({
            type: "bar" as const,
            name: item.label,
            data: data.map((row) => toNumber(row[item.key])),
            barMaxWidth: 24,
            barGap: "20%",
            ...(stacked && { stack: "total" }),
            itemStyle: {
                // W stosie zaokrąglony tylko ostatni segment.
                borderRadius: stacked && index < series.length - 1 ? 0 : radius,
                ...(stacked && { borderColor: theme.surface, borderWidth: 1 }),
            },
            emphasis: { itemStyle: { opacity: 0.85 } },
        })),
    });

    return (
        <Chart
            {...props}
            option={option}
            empty={data.length === 0}
            table={
                <DataTable
                    head={[xLabel ?? String(x), ...names]}
                    rows={data.map((row, index) => [
                        categories[index] ?? "",
                        ...series.map((item) => {
                            const value = toNumber(row[item.key]);
                            return value === null ? "–" : valueFormat(value);
                        }),
                    ])}
                />
            }
        />
    );
}
