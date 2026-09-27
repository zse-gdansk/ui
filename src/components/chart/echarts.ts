import { BarChart, LineChart, PieChart } from "echarts/charts";
import type {
    BarSeriesOption,
    LineSeriesOption,
    PieSeriesOption,
} from "echarts/charts";
import {
    AriaComponent,
    GridComponent,
    LegendComponent,
    TooltipComponent,
} from "echarts/components";
import type {
    AriaComponentOption,
    GridComponentOption,
    LegendComponentOption,
    TooltipComponentOption,
} from "echarts/components";
import { init, use, type ComposeOption } from "echarts/core";
import { LabelLayout } from "echarts/features";
import { CanvasRenderer, SVGRenderer } from "echarts/renderers";

export type ChartOption = ComposeOption<
    | BarSeriesOption
    | LineSeriesOption
    | PieSeriesOption
    | AriaComponentOption
    | GridComponentOption
    | LegendComponentOption
    | TooltipComponentOption
>;

export function initChart(element: HTMLElement, renderer: "canvas" | "svg") {
    use([
        BarChart,
        LineChart,
        PieChart,
        AriaComponent,
        GridComponent,
        LegendComponent,
        TooltipComponent,
        LabelLayout,
        CanvasRenderer,
        SVGRenderer,
    ]);
    return init(element, null, { renderer });
}
