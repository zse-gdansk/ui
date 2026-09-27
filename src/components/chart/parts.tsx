import type { ChartTheme } from "./theme";

// Etykiety serii i kategorii to dane z aplikacji: do HTML tooltipa tylko
// po escapowaniu.
const ENTITIES: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
};
export const escapeHtml = (value: unknown) =>
    String(value).replace(/[&<>"']/g, (char) => ENTITIES[char] ?? char);

export type Format = (value: number) => string;

// Liczba z komórki danych; brak wartości to przerwa w wykresie, nie zero.
export const toNumber = (value: unknown) =>
    typeof value === "number" && Number.isFinite(value) ? value : null;

// Tooltip w stylu biblioteki: tło, cień i promień z CSS (.zse-chart-tip),
// ECharts daje tylko pozycję.
export const tooltipBase = {
    className: "zse-chart-tooltip",
    backgroundColor: "transparent",
    borderWidth: 0,
    padding: 0,
    extraCssText: "box-shadow: none;",
    confine: true,
    transitionDuration: 0.15,
} as const;

interface TipRow {
    color: string;
    name: string;
    value: string;
    kind: "line" | "bar";
}

// Wartość z przodu i mocno, nazwa serii za nią; kolor tylko na kresce.
export function tipHtml(title: string, rows: readonly TipRow[]) {
    return `<div class="zse-chart-tip">${
        title
            ? `<div class="zse-chart-tip-title">${escapeHtml(title)}</div>`
            : ""
    }${rows
        .map(
            (row) =>
                `<div class="zse-chart-tip-row"><span class="zse-chart-tip-key" data-kind="${row.kind}" style="background:${row.color}"></span><span class="zse-chart-tip-value">${escapeHtml(row.value)}</span><span class="zse-chart-tip-name">${escapeHtml(row.name)}</span></div>`,
        )
        .join("")}</div>`;
}

export function categoryAxis(theme: ChartTheme, data: string[]) {
    return {
        type: "category" as const,
        data,
        axisLine: { lineStyle: { color: theme.border } },
        axisTick: { show: false },
        axisLabel: { color: theme.textSecondary, fontSize: 12, margin: 10 },
        splitLine: { show: false },
    };
}

// fromZero: słupki i obszary zawsze od zera (długość to wartość); linia
// może dopasować się do zakresu danych, żeby zmiana była widoczna.
export function valueAxis(theme: ChartTheme, format: Format, fromZero = true) {
    return {
        type: "value" as const,
        scale: !fromZero,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
            color: theme.textSecondary,
            fontSize: 12,
            formatter: (value: number) => format(value),
        },
        // Siatka włosowa, ciągła, o krok od tła: tło dla danych, nie treść.
        splitLine: { lineStyle: { color: theme.borderSubtle, width: 1 } },
    };
}

// Legenda przy dwóch i więcej seriach; przy jednej tytuł mówi, co to jest.
export function legend(
    theme: ChartTheme,
    names: readonly string[],
    icon: "roundRect" | "line",
) {
    return {
        show: names.length > 1,
        top: 0,
        left: 0,
        icon: icon === "line" ? "rect" : "roundRect",
        itemWidth: icon === "line" ? 14 : 10,
        itemHeight: icon === "line" ? 2 : 10,
        itemGap: 16,
        // Bez pierścienia znacznika serii: zakrywał kreskę 2px w legendzie.
        itemStyle: { borderWidth: 0 },
        textStyle: { color: theme.textSecondary, fontSize: 12 },
        data: [...names],
    };
}

export const grid = (withLegend: boolean) => ({
    top: withLegend ? 36 : 12,
    right: 12,
    bottom: 4,
    left: 4,
    containLabel: true,
});

// Tabela danych dla czytnika: kolumna kategorii i po jednej na serię.
export function DataTable({
    head,
    rows,
}: {
    head: readonly string[];
    rows: readonly (readonly string[])[];
}) {
    return (
        <>
            <thead>
                <tr>
                    {head.map((cell) => (
                        <th key={cell} scope="col">
                            {cell}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row) => (
                    <tr key={row[0]}>
                        {row.map((cell, index) =>
                            index === 0 ? (
                                <th key={head[index]} scope="row">
                                    {cell}
                                </th>
                            ) : (
                                <td key={head[index]}>{cell}</td>
                            ),
                        )}
                    </tr>
                ))}
            </tbody>
        </>
    );
}
