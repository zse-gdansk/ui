import { BarChart, HeatmapChart, LineChart, PieChart } from "echarts/charts";
import type {
    BarSeriesOption,
    HeatmapSeriesOption,
    LineSeriesOption,
    PieSeriesOption,
} from "echarts/charts";
import {
    AriaComponent,
    GridComponent,
    LegendComponent,
    TooltipComponent,
    VisualMapContinuousComponent,
} from "echarts/components";
import type {
    AriaComponentOption,
    GridComponentOption,
    LegendComponentOption,
    TooltipComponentOption,
    VisualMapComponentOption,
} from "echarts/components";
import { init, use, type ComposeOption } from "echarts/core";
import { LabelLayout } from "echarts/features";
import { CanvasRenderer, SVGRenderer } from "echarts/renderers";

export type ChartOption = ComposeOption<
    | BarSeriesOption
    | HeatmapSeriesOption
    | LineSeriesOption
    | PieSeriesOption
    | AriaComponentOption
    | GridComponentOption
    | LegendComponentOption
    | TooltipComponentOption
    | VisualMapComponentOption
>;

export function initChart(element: HTMLElement, renderer: "canvas" | "svg") {
    use([
        BarChart,
        HeatmapChart,
        LineChart,
        PieChart,
        AriaComponent,
        GridComponent,
        LegendComponent,
        TooltipComponent,
        VisualMapContinuousComponent,
        LabelLayout,
        CanvasRenderer,
        SVGRenderer,
    ]);
    return init(element, null, { renderer });
}
