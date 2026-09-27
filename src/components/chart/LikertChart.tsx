"use client";

import { useMessages } from "../../i18n/context";
import { useChartFormat, type CartesianChartProps } from "./BarChart";
import { Chart, type ChartProps } from "./Chart";
import {
    DataTable,
    categoryAxis,
    grid,
    legend,
    tipHtml,
    toNumber,
    tooltipBase,
} from "./parts";
import { divergingColors, readableOn } from "./theme";

export interface LikertChartProps<Row> extends CartesianChartProps<Row> {
    // diverging: odpowiedzi od najbardziej pozytywnej do najbardziej
    // negatywnej (Tak → Nie), niebieski i pomarańczowy z szarym środkiem;
    // categorical: odpowiedzi bez biegunów w kolorach serii.
    palette?: "diverging" | "categorical";
    // Szerokość kolumny z pytaniami; dłuższe łamią się na kolejne wiersze.
    labelWidth?: number;
    // Najmniejszy udział (w %), przy którym procent stoi na segmencie.
    minLabel?: number;
}

// Procenty całkowite, które sumują się do 100 (metoda największej reszty):
// bez „33% + 33% + 33%” pod słupkiem, który ma całą długość.
function wholePercents(values: readonly number[]) {
    const total = values.reduce((sum, value) => sum + value, 0);
    if (!total) return values.map(() => 0);
    const raw = values.map((value) => (value / total) * 100);
    const whole = raw.map(Math.floor);
    let rest = 100 - whole.reduce((sum, value) => sum + value, 0);
    const byFraction = raw
        .map((share, position) => ({
            position,
            fraction: share - Math.floor(share),
        }))
        .toSorted((a, b) => b.fraction - a.fraction);
    for (const { position } of byFraction) {
        if (rest <= 0) break;
        whole[position] = (whole[position] ?? 0) + 1;
        rest -= 1;
    }
    return whole;
}

// Odpowiedzi w skali (Likerta) jako słupek 100% na pytanie: segmenty w
// kolejności skali, procent na segmencie, gdy się mieści, liczby w
// tooltipie i tabeli.
export function LikertChart<Row>({
    data,
    x,
    series,
    format,
    formatX,
    xLabel,
    palette = "diverging",
    labelWidth = 160,
    minLabel = 8,
    height,
    ...props
}: LikertChartProps<Row>) {
    const t = useMessages();
    const count = useChartFormat(format);
    const percent = new Intl.NumberFormat(t.locale, { style: "percent" });
    const categories = data.map((row) =>
        formatX ? formatX(row[x]) : String(row[x]),
    );
    const names = series.map((item) => item.label);
    const counts = data.map((row) =>
        series.map((item) => toNumber(row[item.key]) ?? 0),
    );
    const totals = counts.map((row) =>
        row.reduce((sum, value) => sum + value, 0),
    );
    const shares = counts.map((row, index) =>
        row.map((value) =>
            (totals[index] ?? 0) ? (value / (totals[index] ?? 1)) * 100 : 0,
        ),
    );
    const whole = counts.map(wholePercents);
    // Zaokrąglone są tylko skrajne widoczne segmenty wiersza.
    const edges = counts.map((row) => ({
        first: row.findIndex((value) => value > 0),
        last: row.findLastIndex((value) => value > 0),
    }));

    const option: ChartProps["option"] = (theme) => {
        const colors =
            palette === "diverging"
                ? divergingColors(theme, series.length)
                : theme.series;
        const axis = categoryAxis(theme, categories);
        return {
            color: colors,
            grid: { ...grid(true), right: 16 },
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
                        dataIndex: number;
                        seriesIndex: number;
                        color: string;
                        seriesName: string;
                    }[];
                    const row = list[0]?.dataIndex ?? 0;
                    const total = totals[row] ?? 0;
                    return tipHtml(
                        `${categories[row] ?? ""} · ${t.chart.responses(total, count(total))}`,
                        list.map((item) => ({
                            color: item.color,
                            name: `${item.seriesName} (${count(counts[row]?.[item.seriesIndex] ?? 0)})`,
                            value: percent.format(
                                (whole[row]?.[item.seriesIndex] ?? 0) / 100,
                            ),
                            kind: "bar",
                        })),
                    );
                },
            },
            xAxis: {
                type: "value" as const,
                min: 0,
                max: 100,
                interval: 25,
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: {
                    color: theme.textSecondary,
                    fontSize: 12,
                    formatter: (value: number) => percent.format(value / 100),
                },
                splitLine: {
                    lineStyle: { color: theme.borderSubtle, width: 1 },
                },
            },
            yAxis: {
                ...axis,
                inverse: true,
                axisLine: { show: false },
                axisLabel: {
                    ...axis.axisLabel,
                    width: labelWidth,
                    overflow: "break" as const,
                    lineHeight: 16,
                },
            },
            series: series.map((item, index) => {
                const color = colors[index % colors.length] ?? theme.text;
                return {
                    type: "bar" as const,
                    name: item.label,
                    stack: "total",
                    barMaxWidth: 24,
                    data: shares.map((row, rowIndex) => {
                        const { first, last } = edges[rowIndex] ?? {
                            first: -1,
                            last: -1,
                        };
                        const start = index === first ? 4 : 0;
                        const end = index === last ? 4 : 0;
                        return {
                            value: row[index] ?? 0,
                            itemStyle: {
                                borderRadius: [start, end, end, start],
                            },
                        };
                    }),
                    // 2px tła między segmentami (po 1px z każdej strony).
                    itemStyle: { borderColor: theme.surface, borderWidth: 1 },
                    label: {
                        show: true,
                        position: "inside" as const,
                        color: readableOn(color, theme),
                        fontSize: 11,
                        formatter: (params: { dataIndex: number }) => {
                            const share =
                                shares[params.dataIndex]?.[index] ?? 0;
                            return share >= minLabel
                                ? percent.format(
                                      (whole[params.dataIndex]?.[index] ?? 0) /
                                          100,
                                  )
                                : "";
                        },
                    },
                    emphasis: { itemStyle: { opacity: 0.85 } },
                };
            }),
        };
    };

    return (
        <Chart
            {...props}
            // Wysokość z liczby pytań: 44px na wiersz, legenda i oś.
            height={height ?? Math.max(160, data.length * 44 + 64)}
            option={option}
            empty={data.length === 0 || totals.every((total) => total === 0)}
            table={
                <DataTable
                    head={[xLabel ?? String(x), ...names]}
                    rows={data.map((_, rowIndex) => [
                        categories[rowIndex] ?? "",
                        ...series.map(
                            (__, index) =>
                                `${count(counts[rowIndex]?.[index] ?? 0)} (${percent.format(
                                    (whole[rowIndex]?.[index] ?? 0) / 100,
                                )})`,
                        ),
                    ])}
                />
            }
        />
    );
}
