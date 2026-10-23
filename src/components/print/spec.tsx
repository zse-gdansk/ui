"use client";

import type { ReactNode } from "react";

import {
    PrintAttendance,
    PrintImage,
    PrintList,
    PrintMeta,
    PrintNote,
    PrintPageBreak,
    PrintSection,
    PrintSignatures,
    PrintStats,
    PrintTable,
    PrintText,
    type PrintPerson,
    type PrintSignature,
    type PrintStat,
    type PrintVoteProps,
    PrintVote,
} from "./blocks";
import type { PrintFormat } from "./format";
import { PrintDocument, type PrintPageSize } from "./PrintDocument";

// Dokument opisany danymi, np. raport z API. Same wartości JSON: bez
// elementów i funkcji, więc backend może go zbudować i przysłać.
export interface PrintSpec {
    document?: PrintSpecDocument;
    blocks: readonly PrintBlock[];
}

export interface PrintSpecDocument {
    size?: PrintPageSize;
    orientation?: "portrait" | "landscape";
    margin?: string;
    // Adres obrazka.
    logo?: string;
    organization?: string;
    organizationDetail?: string;
    place?: string;
    reference?: string;
    title?: string;
    subtitle?: string;
    runningHeader?: string;
    runningFooter?: string;
    pageNumbers?: boolean | "page" | "pageOf";
    watermark?: boolean | string;
}

type Scalar = string | number | boolean | null;

export type PrintBlock =
    | {
          type: "section";
          title?: string;
          number?: string;
          breakBefore?: boolean;
          keepTogether?: boolean;
          blocks: readonly PrintBlock[];
      }
    | { type: "heading"; text: string; level?: 2 | 3 }
    | { type: "text"; text: string }
    | {
          type: "list";
          items: readonly string[];
          ordered?: boolean;
          start?: number;
      }
    | {
          type: "meta";
          items: readonly { label: string; value: Scalar }[];
          columns?: 1 | 2 | 3;
      }
    | {
          type: "table";
          columns: readonly {
              key: string;
              label: string;
              format?: PrintFormat;
              align?: "start" | "center" | "end";
              width?: string;
              total?: "sum" | "count" | string | number;
          }[];
          rows: readonly Record<string, Scalar>[];
          caption?: string;
          empty?: string;
          numbered?: boolean;
          striped?: boolean;
      }
    | {
          type: "stats";
          items: readonly { label: string; value: Scalar; hint?: string }[];
      }
    | ({ type: "vote"; title?: string; outcome?: string } & Omit<
          PrintVoteProps,
          "title" | "outcome"
      >)
    | {
          type: "attendance";
          people: readonly { name: string; present: boolean; note?: string }[];
          quorum?: number;
          columns?: 1 | 2 | 3;
      }
    | {
          type: "signatures";
          signatures: readonly { role: string; name?: string }[];
      }
    | { type: "note"; text: string; tone?: "neutral" | "warning" }
    | {
          type: "image";
          src: string;
          alt: string;
          width?: string;
          caption?: string;
      }
    | { type: "pageBreak" }
    // Klocki spoza biblioteki (wykres, QR, własne) przez renderers.
    | { type: "chart" | "qr" | (string & {}); [key: string]: unknown };

// Renderer klocka: dostaje cały obiekt z JSON-a i funkcję do zagnieżdżeń.
export type PrintRenderer = (
    block: Record<string, unknown> & { type: string },
    render: (blocks: readonly PrintBlock[]) => ReactNode,
) => ReactNode;

export interface PrintFromSpecProps {
    spec: PrintSpec;
    // Własne typy klocków albo podmiana wbudowanych, np. { chart:
    // PrintChart, qr: PrintQR } z @zse-gdansk/ui/charts i /qr.
    renderers?: Record<string, PrintRenderer>;
    // Nieznany typ: domyślnie pominięty z ostrzeżeniem w konsoli, żeby
    // nowy klocek z API nie psuł starszego frontu.
    onUnknown?: (block: { type: string }) => ReactNode;
}

function builtin(
    block: PrintBlock,
    render: (blocks: readonly PrintBlock[]) => ReactNode,
): ReactNode | undefined {
    switch (block.type) {
        case "section": {
            const b = block as Extract<PrintBlock, { type: "section" }>;
            return (
                <PrintSection
                    title={b.title}
                    number={b.number}
                    breakBefore={b.breakBefore}
                    keepTogether={b.keepTogether}
                >
                    {render(b.blocks)}
                </PrintSection>
            );
        }
        case "heading": {
            const b = block as Extract<PrintBlock, { type: "heading" }>;
            return (
                <PrintSection title={b.text} level={b.level ?? 2}>
                    {null}
                </PrintSection>
            );
        }
        case "text":
            return <PrintText>{(block as { text: string }).text}</PrintText>;
        case "list": {
            const b = block as Extract<PrintBlock, { type: "list" }>;
            return (
                <PrintList
                    items={b.items}
                    ordered={b.ordered}
                    start={b.start}
                />
            );
        }
        case "meta": {
            const b = block as Extract<PrintBlock, { type: "meta" }>;
            return (
                <PrintMeta
                    items={b.items.map((item) => ({
                        label: item.label,
                        value: item.value === null ? null : String(item.value),
                    }))}
                    columns={b.columns}
                />
            );
        }
        case "table": {
            const b = block as Extract<PrintBlock, { type: "table" }>;
            return (
                <PrintTable
                    columns={b.columns}
                    rows={b.rows}
                    caption={b.caption}
                    empty={b.empty}
                    numbered={b.numbered}
                    striped={b.striped}
                />
            );
        }
        case "stats": {
            const b = block as Extract<PrintBlock, { type: "stats" }>;
            return (
                <PrintStats
                    items={b.items.map((item): PrintStat => ({
                        label: item.label,
                        value: item.value === null ? "–" : String(item.value),
                        hint: item.hint,
                    }))}
                />
            );
        }
        case "vote": {
            const { type: _, ...props } = block as Extract<
                PrintBlock,
                { type: "vote" }
            >;
            return <PrintVote {...props} />;
        }
        case "attendance": {
            const b = block as Extract<PrintBlock, { type: "attendance" }>;
            return (
                <PrintAttendance
                    people={b.people as readonly PrintPerson[]}
                    quorum={b.quorum}
                    columns={b.columns}
                />
            );
        }
        case "signatures":
            return (
                <PrintSignatures
                    signatures={
                        (block as { signatures: readonly PrintSignature[] })
                            .signatures
                    }
                />
            );
        case "note": {
            const b = block as Extract<PrintBlock, { type: "note" }>;
            return <PrintNote tone={b.tone}>{b.text}</PrintNote>;
        }
        case "image": {
            const b = block as Extract<PrintBlock, { type: "image" }>;
            return (
                <PrintImage
                    src={b.src}
                    alt={b.alt}
                    width={b.width}
                    caption={b.caption}
                />
            );
        }
        case "pageBreak":
            return <PrintPageBreak />;
        default:
            return undefined;
    }
}

const NO_RENDERERS: Record<string, PrintRenderer> = {};

// Ten sam dokument co z komponentów, złożony z opisu.
export function PrintFromSpec({
    spec,
    renderers = NO_RENDERERS,
    onUnknown,
}: PrintFromSpecProps) {
    const render = (blocks: readonly PrintBlock[]): ReactNode =>
        blocks.map((block, index) => {
            const custom = renderers[block.type];
            const node = custom
                ? custom(
                      block as Record<string, unknown> & { type: string },
                      render,
                  )
                : builtin(block, render);
            if (node === undefined) {
                console.warn(`PrintFromSpec: nieznany klocek "${block.type}"`);
                return onUnknown ? (
                    // oxlint-disable-next-line react/no-array-index-key
                    <PrintKey key={index}>{onUnknown(block)}</PrintKey>
                ) : null;
            }
            // Kolejność klocków jest dana z góry.
            // oxlint-disable-next-line react/no-array-index-key
            return <PrintKey key={index}>{node}</PrintKey>;
        });

    const doc = spec.document ?? {};
    return <PrintDocument {...doc}>{render(spec.blocks)}</PrintDocument>;
}

const PrintKey = ({ children }: { children: ReactNode }) => <>{children}</>;
