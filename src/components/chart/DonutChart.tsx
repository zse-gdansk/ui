"use client";

import { useMessages } from "../../i18n/context";
import { useChartFormat } from "./BarChart";
import { Chart, type ChartProps } from "./Chart";
import { DataTable, tipHtml, tooltipBase, type Format } from "./parts";
import { divergingColors, resolveColor } from "./theme";

export interface DonutSlice {
    label: string;
    value: number;
    // Własny kolor kawałka: CSS albo token, np. "var(--color-success-solid)".
    color?: string;
}

export interface DonutChartProps extends Omit<
    ChartProps,
    "option" | "table" | "center" | "empty" | "footer"
> {
    // Kawałki w stałej kolejności; najwyżej kilka, resztę złóż w „Inne”.
    data: readonly DonutSlice[];
    format?: Format;
    // Podpis pod sumą na środku; domyślnie „Razem”.
    totalLabel?: string;
    // categorical: kolory serii; diverging: skala z biegunami dla odpowiedzi
    // od najbardziej pozytywnej do najbardziej negatywnej (Tak, Raczej tak,
    // Nie wiem, Raczej nie, Nie).
    palette?: "categorical" | "diverging";
}

// Udział części w całości, np. odpowiedzi w ankiecie. Kawałki rozdziela
// 2px tła, suma na środku, legenda zawsze (tożsamość nie tylko kolorem).
export function DonutChart({
    data,
    format,
    totalLabel,
    palette = "categorical",
    ...props
}: DonutChartProps) {
    const t = useMessages();
    const valueFormat = useChartFormat(format);
    const total = data.reduce((sum, slice) => sum + slice.value, 0);
    const percent = new Intl.NumberFormat(t.locale, {
        style: "percent",
        maximumFractionDigits: 1,
    });

    const option: ChartProps["option"] = (theme) => {
        const base =
            palette === "diverging"
                ? divergingColors(theme, data.length)
                : theme.series;
        const colors = data.map((slice, index) =>
            slice.color ? resolveColor(slice.color) : base[index % base.length],
        );
        return {
            color: colors,
            legend: {
                show: true,
                bottom: 0,
                left: "center",
                icon: "roundRect",
                itemWidth: 10,
                itemHeight: 10,
                itemGap: 16,
                textStyle: { color: theme.textSecondary, fontSize: 12 },
            },
            tooltip: {
                ...tooltipBase,
                trigger: "item",
                formatter: (params: unknown) => {
                    const item = params as {
                        color: string;
                        name: string;
                        value: number;
                    };
                    return tipHtml(item.name, [
                        {
                            color: item.color,
                            name: total
                                ? percent.format(item.value / total)
                                : "",
                            value: valueFormat(item.value),
                            kind: "bar",
                        },
                    ]);
                },
            },
            series: [
                {
                    type: "pie" as const,
                    radius: ["62%", "82%"],
                    center: ["50%", "44%"],
                    padAngle: 2,
                    itemStyle: { borderRadius: 4 },
                    label: { show: false },
                    labelLine: { show: false },
                    emphasis: { scale: true, scaleSize: 4 },
                    data: data.map((slice) => ({
                        name: slice.label,
                        value: slice.value,
                    })),
                },
            ],
        };
    };

    return (
        <Chart
            {...props}
            option={option}
            empty={data.length === 0 || total === 0}
            center={
                <>
                    <span className="zse-chart-total">
                        {valueFormat(total)}
                    </span>
                    <span className="zse-chart-total-label">
                        {totalLabel ?? t.chart.total}
                    </span>
                </>
            }
            table={
                <DataTable
                    head={["", valueFormat(total)]}
                    rows={data.map((slice) => [
                        slice.label,
                        `${valueFormat(slice.value)} (${percent.format(
                            total ? slice.value / total : 0,
                        )})`,
                    ])}
                />
            }
        />
    );
}
