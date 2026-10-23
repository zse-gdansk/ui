"use client";

import type { ReactNode } from "react";

import { useMessages } from "../../i18n/context";
import { VoteBar } from "../vote-bar/VoteBar";
import { alignFor, formatValue, type PrintFormat } from "./format";

const cx = (...names: (string | false | undefined)[]) =>
    names.filter(Boolean).join(" ");

export interface PrintSectionProps {
    title?: ReactNode | undefined;
    // Numer przed tytułem, np. „3.” albo „§ 2”.
    number?: ReactNode | undefined;
    children: ReactNode;
    // Od nowej strony, np. załącznik.
    breakBefore?: boolean | undefined;
    // Cała sekcja na jednej stronie, jeśli się mieści (krótkie punkty).
    keepTogether?: boolean | undefined;
    level?: 2 | 3 | undefined;
}

export function PrintSection({
    title,
    number,
    children,
    breakBefore = false,
    keepTogether = false,
    level = 2,
}: PrintSectionProps) {
    const Heading = level === 2 ? "h2" : "h3";
    return (
        <section
            className="zse-print-section"
            data-break-before={breakBefore || undefined}
            data-keep={keepTogether || undefined}
        >
            {title != null && (
                <Heading className="zse-print-section-title" data-level={level}>
                    {number != null && (
                        <span className="zse-print-number">{number}</span>
                    )}
                    {title}
                </Heading>
            )}
            {children}
        </section>
    );
}

// Akapity z tekstu z API: pusta linia dzieli akapity, pojedyncza łamie wiersz.
export function PrintText({ children }: { children: ReactNode }) {
    if (typeof children !== "string")
        return <div className="zse-print-text">{children}</div>;
    return (
        <div className="zse-print-text">
            {children
                .split(/\n{2,}/)
                .filter((part) => part.trim() !== "")
                .map((part, index) => (
                    // Akapity są stałe dla danego tekstu.
                    // oxlint-disable-next-line react/no-array-index-key
                    <p key={index}>{part}</p>
                ))}
        </div>
    );
}

export function PrintList({
    items,
    ordered = false,
    start,
}: {
    items: readonly ReactNode[];
    ordered?: boolean | undefined;
    start?: number | undefined;
}) {
    const List = ordered ? "ol" : "ul";
    return (
        <List className="zse-print-list" start={start}>
            {items.map((item, index) => (
                // oxlint-disable-next-line react/no-array-index-key
                <li key={index}>{item}</li>
            ))}
        </List>
    );
}

export interface PrintMetaItem {
    label: ReactNode;
    value: ReactNode;
}

// Pary klucz: wartość, np. miejsce, prowadzący, protokolant.
export function PrintMeta({
    items,
    columns = 2,
}: {
    items: readonly PrintMetaItem[];
    columns?: 1 | 2 | 3 | undefined;
}) {
    const t = useMessages();
    return (
        <dl className="zse-print-meta" data-columns={columns}>
            {items.map((item, index) => (
                // oxlint-disable-next-line react/no-array-index-key
                <div key={index}>
                    <dt>{item.label}</dt>
                    <dd>
                        {item.value == null || item.value === ""
                            ? formatValue(null, "text", t)
                            : item.value}
                    </dd>
                </div>
            ))}
        </dl>
    );
}

export interface PrintColumn<Row = Record<string, unknown>> {
    key: string;
    label: ReactNode;
    format?: PrintFormat | undefined;
    align?: "start" | "center" | "end" | undefined;
    // Szerokość CSS, np. "12%" albo "30mm".
    width?: string | undefined;
    // Wiersz sumy: suma albo liczba wartości w kolumnie, albo stała.
    total?: "sum" | "count" | ReactNode | undefined;
    // Własna komórka (tylko w komponentach, nie z JSON-a).
    render?: (row: Row) => ReactNode | undefined;
}

export interface PrintTableProps<Row = Record<string, unknown>> {
    columns: readonly PrintColumn<Row>[];
    rows: readonly Row[];
    caption?: ReactNode | undefined;
    // Tekst przy pustej tabeli.
    empty?: ReactNode | undefined;
    // Numer porządkowy jako pierwsza kolumna.
    numbered?: boolean | undefined;
    // Naprzemienne tło wierszy przy długich tabelach.
    striped?: boolean | undefined;
}

const cell = (row: unknown, key: string) =>
    row !== null && typeof row === "object"
        ? (row as Record<string, unknown>)[key]
        : undefined;

// Nagłówek tabeli powtarza się na każdej stronie, a wiersz nie łamie się
// między stronami.
export function PrintTable<Row = Record<string, unknown>>({
    columns,
    rows,
    caption,
    empty,
    numbered = false,
    striped = false,
}: PrintTableProps<Row>) {
    const t = useMessages();
    const hasTotal = columns.some((column) => column.total !== undefined);
    const totalOf = (column: PrintColumn<Row>): ReactNode => {
        if (column.total === "sum")
            return formatValue(
                rows.reduce((sum, row) => {
                    const value = Number(cell(row, column.key));
                    return Number.isFinite(value) ? sum + value : sum;
                }, 0),
                column.format ?? "number",
                t,
            );
        if (column.total === "count")
            return formatValue(
                rows.filter((row) => cell(row, column.key) != null).length,
                "integer",
                t,
            );
        return column.total;
    };
    const span = columns.length + (numbered ? 1 : 0);

    return (
        <table className="zse-print-table" data-striped={striped || undefined}>
            {caption != null && <caption>{caption}</caption>}
            <thead>
                <tr>
                    {numbered && (
                        <th scope="col" className="zse-print-index">
                            {t.print.index}
                        </th>
                    )}
                    {columns.map((column) => (
                        <th
                            key={column.key}
                            scope="col"
                            data-align={column.align ?? alignFor(column.format)}
                            style={
                                column.width
                                    ? { width: column.width }
                                    : undefined
                            }
                        >
                            {column.label}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.length === 0 ? (
                    <tr>
                        <td colSpan={span} className="zse-print-empty">
                            {empty ?? t.print.empty}
                        </td>
                    </tr>
                ) : (
                    rows.map((row, index) => (
                        // Kolejność wierszy jest dana z góry.
                        // oxlint-disable-next-line react/no-array-index-key
                        <tr key={index}>
                            {numbered && (
                                <td className="zse-print-index">
                                    {index + 1}.
                                </td>
                            )}
                            {columns.map((column) => (
                                <td
                                    key={column.key}
                                    data-align={
                                        column.align ?? alignFor(column.format)
                                    }
                                >
                                    {column.render
                                        ? column.render(row)
                                        : formatValue(
                                              cell(row, column.key),
                                              column.format,
                                              t,
                                          )}
                                </td>
                            ))}
                        </tr>
                    ))
                )}
            </tbody>
            {hasTotal && rows.length > 0 && (
                <tfoot>
                    <tr>
                        {numbered && <td aria-hidden />}
                        {columns.map((column, index) => (
                            <td
                                key={column.key}
                                data-align={
                                    column.align ?? alignFor(column.format)
                                }
                            >
                                {column.total === undefined
                                    ? index === 0
                                        ? t.print.total
                                        : null
                                    : totalOf(column)}
                            </td>
                        ))}
                    </tr>
                </tfoot>
            )}
        </table>
    );
}

export interface PrintStat {
    label: ReactNode;
    value: ReactNode;
    hint?: ReactNode | undefined;
}

// Kafelki z liczbami, np. frekwencja, liczba uchwał.
export function PrintStats({ items }: { items: readonly PrintStat[] }) {
    return (
        <dl className="zse-print-stats">
            {items.map((item, index) => (
                // oxlint-disable-next-line react/no-array-index-key
                <div key={index}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                    {item.hint != null && (
                        <dd className="zse-print-stat-hint">{item.hint}</dd>
                    )}
                </div>
            ))}
        </dl>
    );
}

export interface PrintVoteProps {
    title?: ReactNode | undefined;
    yes: number;
    no: number;
    abstain: number;
    notCast?: number | undefined;
    required?: number | null | undefined;
    // Rozstrzygnięcie, np. „Uchwała przyjęta”.
    outcome?: ReactNode | undefined;
    // Jak wypadło: kolor rozstrzygnięcia.
    passed?: boolean | undefined;
}

export function PrintVote({
    title,
    outcome,
    passed,
    ...tally
}: PrintVoteProps) {
    return (
        <div className="zse-print-vote">
            {(title != null || outcome != null) && (
                <div className="zse-print-vote-head">
                    {title != null && (
                        <span className="zse-print-vote-title">{title}</span>
                    )}
                    {outcome != null && (
                        <span
                            className="zse-print-outcome"
                            data-passed={
                                passed === undefined
                                    ? undefined
                                    : String(passed)
                            }
                        >
                            {outcome}
                        </span>
                    )}
                </div>
            )}
            <VoteBar {...tally} />
        </div>
    );
}

export interface PrintPerson {
    name: ReactNode;
    present: boolean;
    // Np. „usprawiedliwiony”, „od pkt 3”.
    note?: ReactNode | undefined;
}

const isBlank = (value: ReactNode) =>
    value == null ||
    value === false ||
    (typeof value === "string" && value.trim() === "");

// Lista obecności z podsumowaniem i kworum.
export function PrintAttendance({
    people,
    quorum,
    columns = 2,
}: {
    people: readonly PrintPerson[];
    quorum?: number | undefined;
    columns?: 1 | 2 | 3 | undefined;
}) {
    const t = useMessages();
    const present = people.filter((person) => person.present).length;
    // Bez osób podsumowanie i kworum wprowadzałyby w błąd („0 z 0, brak
    // kworum”): to brak danych, nie posiedzenie bez kworum.
    if (people.length === 0)
        return (
            <p className="zse-print-empty-state">{t.print.attendanceEmpty}</p>
        );
    return (
        <div className="zse-print-attendance">
            <p className="zse-print-attendance-summary">
                {t.print.attendance(present, people.length)}
                {quorum !== undefined && (
                    <span data-reached={String(present >= quorum)}>
                        {present >= quorum
                            ? t.print.quorumReached(quorum)
                            : t.print.quorumMissing(quorum)}
                    </span>
                )}
            </p>
            <ol className="zse-print-people" data-columns={columns}>
                {people.map((person, index) => (
                    // oxlint-disable-next-line react/no-array-index-key
                    <li key={index} data-present={String(person.present)}>
                        <span className="zse-print-mark" aria-hidden>
                            {person.present ? "✓" : "–"}
                        </span>
                        <span>
                            {isBlank(person.name) ? (
                                <span className="zse-print-missing">
                                    {t.print.unnamed}
                                </span>
                            ) : (
                                person.name
                            )}
                            <span className="zse-print-sr">
                                {" "}
                                (
                                {person.present
                                    ? t.print.present
                                    : t.print.absent}
                                )
                            </span>
                            {person.note != null && (
                                <span className="zse-print-person-note">
                                    {" "}
                                    · {person.note}
                                </span>
                            )}
                        </span>
                    </li>
                ))}
            </ol>
        </div>
    );
}

export interface PrintSignature {
    role: ReactNode;
    name?: ReactNode | undefined;
}

// Miejsca na podpis: linia, pod nią imię i nazwisko oraz funkcja.
export function PrintSignatures({
    signatures,
}: {
    signatures: readonly PrintSignature[];
}) {
    const t = useMessages();
    return (
        <div className="zse-print-signatures">
            {signatures.map((signature, index) => (
                // oxlint-disable-next-line react/no-array-index-key
                <div key={index} className="zse-print-signature">
                    <span className="zse-print-signature-line" aria-hidden />
                    <span className="zse-print-signature-hint">
                        {t.print.signature}
                    </span>
                    {signature.name != null && (
                        <span className="zse-print-signature-name">
                            {signature.name}
                        </span>
                    )}
                    <span className="zse-print-signature-role">
                        {signature.role}
                    </span>
                </div>
            ))}
        </div>
    );
}

export function PrintNote({
    children,
    tone = "neutral",
}: {
    children: ReactNode;
    tone?: "neutral" | "warning" | undefined;
}) {
    return (
        <aside className="zse-print-note" data-tone={tone}>
            {children}
        </aside>
    );
}

export function PrintImage({
    src,
    alt,
    width,
    caption,
}: {
    src: string;
    alt: string;
    // Szerokość CSS, np. "60mm" albo "50%".
    width?: string | undefined;
    caption?: ReactNode | undefined;
}) {
    return (
        <figure className="zse-print-figure">
            <img src={src} alt={alt} style={width ? { width } : undefined} />
            {caption != null && <figcaption>{caption}</figcaption>}
        </figure>
    );
}

// Na papierze nowa strona, na ekranie przerywana linia z opisem.
export function PrintPageBreak() {
    const t = useMessages();
    return (
        <div className="zse-print-break" aria-hidden>
            <span>{t.print.pageBreak}</span>
        </div>
    );
}

export function PrintFigure({
    title,
    children,
}: {
    title?: ReactNode | undefined;
    children: ReactNode;
}) {
    return (
        <figure className={cx("zse-print-figure", "zse-print-keep")}>
            {children}
            {title != null && <figcaption>{title}</figcaption>}
        </figure>
    );
}
