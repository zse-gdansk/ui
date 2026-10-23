"use client";

import type { ReactNode } from "react";

import { PrintFigure } from "../print/blocks";
import type { PrintRenderer } from "../print/spec";
import { BarChart, type ChartSeries } from "./BarChart";
import { DonutChart, type DonutSlice } from "./DonutChart";
import { LineChart } from "./LineChart";

type Row = Record<string, string | number | null>;

export interface PrintChartProps {
    kind: "bar" | "line" | "donut";
    // Podpis pod wykresem i nazwa dla czytnika.
    title: string;
    // bar i line: wiersze z kolumną x i seriami; donut: kawałki.
    data: readonly Row[] | readonly DonutSlice[];
    x?: string;
    series?: readonly { key: string; label: string }[];
    horizontal?: boolean;
    stacked?: boolean;
    // Wysokość w jednostkach CSS, np. "60mm".
    height?: string;
    // Faktura zamiast samego koloru: czytelne na czarno-białej drukarce.
    texture?: boolean;
}

const NO_SERIES: PrintChartProps["series"] = [];

// Wykres w dokumencie: SVG (ostry na papierze), szerokość z kartki.
export function PrintChart({
    kind,
    title,
    data,
    x = "label",
    series = NO_SERIES,
    horizontal = false,
    stacked = false,
    height = "60mm",
    texture = false,
}: PrintChartProps) {
    let chart: ReactNode;
    if (kind === "donut")
        chart = (
            <DonutChart
                label={title}
                data={data as readonly DonutSlice[]}
                height={height}
                renderer="svg"
                texture={texture}
            />
        );
    else {
        const props = {
            label: title,
            data: data as readonly Row[],
            x,
            series: series as readonly ChartSeries<Row>[],
            height,
            renderer: "svg" as const,
            texture,
        };
        chart =
            kind === "line" ? (
                <LineChart {...props} />
            ) : (
                <BarChart
                    {...props}
                    horizontal={horizontal}
                    stacked={stacked}
                />
            );
    }
    return (
        <PrintFigure title={title}>
            <div className="zse-print-chart">{chart}</div>
        </PrintFigure>
    );
}

// Dla PrintFromSpec: renderers={{ chart: printChartBlock }}.
export const printChartBlock: PrintRenderer = (block) => (
    <PrintChart {...(block as unknown as PrintChartProps)} />
);
