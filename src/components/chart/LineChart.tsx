"use client";

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
    valueAxis,
} from "./parts";

export interface LineChartProps<Row> extends CartesianChartProps<Row> {
    // Wypełnienie pod linią, 10% koloru serii.
    area?: boolean;
    // Łagodna krzywa zamiast prostych odcinków; nie przestrzela wartości.
    curve?: boolean;
}

export function LineChart<Row>({
    data,
    x,
    series,
    format,
    formatX,
    xLabel,
    area = false,
    curve = false,
    ...props
}: LineChartProps<Row>) {
    const valueFormat = useChartFormat(format);
    const categories = data.map((row) =>
        formatX ? formatX(row[x]) : String(row[x]),
    );
    const names = series.map((item) => item.label);

    const option: ChartProps["option"] = (theme) => ({
        color: theme.series,
        grid: grid(names.length > 1),
        legend: legend(theme, names, "line"),
        tooltip: {
            ...tooltipBase,
            trigger: "axis",
            axisPointer: {
                type: "line",
                lineStyle: { color: theme.border, width: 1, type: "solid" },
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
                        kind: "line",
                    })),
                );
            },
        },
        xAxis: { ...categoryAxis(theme, categories), boundaryGap: false },
        yAxis: valueAxis(theme, valueFormat, area),
        series: series.map((item) => ({
            type: "line" as const,
            name: item.label,
            data: data.map((row) => toNumber(row[item.key])),
            smooth: curve,
            smoothMonotone: "x" as const,
            lineStyle: {
                width: 2,
                cap: "round" as const,
                join: "round" as const,
            },
            symbol: "circle",
            symbolSize: 8,
            // Pojedynczy punkt bez linii musi być widoczny od razu.
            showSymbol: data.length === 1,
            itemStyle: { borderColor: theme.surface, borderWidth: 2 },
            emphasis: { focus: "none" as const, scale: false },
            ...(area && { areaStyle: { opacity: 0.1 } }),
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
