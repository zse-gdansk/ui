"use client";

import {
    ArrowUpDownIcon,
    SortByDown02Icon,
    SortByUp02Icon,
} from "@hugeicons/core-free-icons";
import type {
    CSSProperties,
    HTMLAttributes,
    ReactNode,
    TdHTMLAttributes,
    ThHTMLAttributes,
} from "react";

import { Icon } from "../icon/Icon";

const cx = (...names: (string | false | undefined)[]) =>
    names.filter(Boolean).join(" ");

type Sticky = "left" | "right";

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
    // Etykieta przewijanego obszaru dla czytników ekranu.
    label: string;
    // Z wysokością przewija się też w pionie i nagłówek się przykleja.
    maxHeight?: CSSProperties["maxHeight"];
    size?: "sm" | "md";
}

// Znaczniki krawędzi na kontenerze, cienie przy przyklejonych częściach
// pokazują się tylko wtedy, gdy coś jest pod nimi. Bez stanu Reacta, żeby
// przewijanie nie renderowało tabeli.
function trackScroll(scroller: HTMLElement | null) {
    if (!scroller) return;
    const update = () => {
        const x = Math.abs(scroller.scrollLeft);
        const maxX = scroller.scrollWidth - scroller.clientWidth;
        const maxY = scroller.scrollHeight - scroller.clientHeight;
        scroller.toggleAttribute("data-scroll-top", scroller.scrollTop > 0);
        scroller.toggleAttribute(
            "data-scroll-bottom",
            scroller.scrollTop < maxY - 1,
        );
        scroller.toggleAttribute("data-scroll-left", x > 0);
        scroller.toggleAttribute("data-scroll-right", x < maxX - 1);
    };

    // Nagłówek kolumny pod kursorem, razem z hoverem wiersza daje krzyżyk.
    let hovered: Element | null = null;
    const hover = (event: PointerEvent) => {
        const cell = (event.target as Element).closest("tbody td");
        const index =
            cell instanceof HTMLTableCellElement ? cell.cellIndex : -1;
        const head =
            index === -1
                ? null
                : scroller.querySelector(`thead tr > :nth-child(${index + 1})`);
        if (head === hovered) return;
        hovered?.removeAttribute("data-column-hover");
        head?.setAttribute("data-column-hover", "");
        hovered = head;
    };
    const leave = () => {
        hovered?.removeAttribute("data-column-hover");
        hovered = null;
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(scroller);
    if (scroller.firstElementChild)
        observer.observe(scroller.firstElementChild);
    scroller.addEventListener("scroll", update, { passive: true });
    scroller.addEventListener("pointerover", hover);
    scroller.addEventListener("pointerleave", leave);
    return () => {
        observer.disconnect();
        scroller.removeEventListener("scroll", update);
        scroller.removeEventListener("pointerover", hover);
        scroller.removeEventListener("pointerleave", leave);
    };
}

export function Table({
    label,
    maxHeight,
    size = "md",
    className,
    ...props
}: TableProps) {
    return (
        <section
            ref={trackScroll}
            className="zse-table-scroller"
            aria-label={label}
            // Przewijany obszar musi dać się przewinąć z klawiatury (axe:
            // scrollable-region-focusable), stąd tabIndex na sekcji.
            // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
            style={{ maxHeight }}
        >
            <table
                {...props}
                data-size={size}
                className={cx("zse-table", className)}
            />
        </section>
    );
}

export function TableHeader({
    className,
    ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
    return <thead {...props} className={cx("zse-table-header", className)} />;
}

export function TableBody({
    className,
    ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
    return <tbody {...props} className={cx("zse-table-body", className)} />;
}

export function TableFooter({
    className,
    ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
    return <tfoot {...props} className={cx("zse-table-footer", className)} />;
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
    selected?: boolean;
}

export function TableRow({ selected, className, ...props }: TableRowProps) {
    return (
        <tr
            {...props}
            data-selected={selected || undefined}
            aria-selected={selected}
            className={cx("zse-table-row", className)}
        />
    );
}

interface CellOptions {
    sticky?: Sticky | undefined;
    // Odstęp od krawędzi, gdy przyklejonych kolumn jest kilka.
    stickyOffset?: number | undefined;
    numeric?: boolean | undefined;
}

function cellProps(
    base: string,
    { sticky, stickyOffset, numeric }: CellOptions,
    className: string | undefined,
    style: CSSProperties | undefined,
) {
    return {
        "data-sticky": sticky,
        "data-numeric": numeric || undefined,
        className: cx(base, className),
        style:
            sticky && stickyOffset !== undefined
                ? {
                      ...style,
                      [sticky === "left"
                          ? "insetInlineStart"
                          : "insetInlineEnd"]: stickyOffset,
                  }
                : style,
    };
}

export interface TableHeadProps
    extends ThHTMLAttributes<HTMLTableCellElement>, CellOptions {
    sort?: "asc" | "desc" | false;
    // Z onSort nagłówek jest przyciskiem sortowania.
    onSort?: () => void;
}

export function TableHead({
    sticky,
    stickyOffset,
    numeric,
    sort,
    onSort,
    className,
    style,
    children,
    ...props
}: TableHeadProps) {
    const content: ReactNode = onSort ? (
        <button type="button" className="zse-table-sort" onClick={onSort}>
            {children}
            <Icon
                icon={
                    sort === "asc"
                        ? SortByUp02Icon
                        : sort === "desc"
                          ? SortByDown02Icon
                          : ArrowUpDownIcon
                }
                size={14}
                className="zse-table-sort-icon"
                data-active={sort ? "" : undefined}
            />
        </button>
    ) : (
        children
    );

    return (
        <th
            scope="col"
            {...props}
            data-sortable={onSort ? "" : undefined}
            aria-sort={
                sort === "asc"
                    ? "ascending"
                    : sort === "desc"
                      ? "descending"
                      : undefined
            }
            {...cellProps(
                "zse-table-head",
                { sticky, stickyOffset, numeric },
                className,
                style,
            )}
        >
            {content}
        </th>
    );
}

export interface TableCellProps
    extends TdHTMLAttributes<HTMLTableCellElement>, CellOptions {}

export function TableCell({
    sticky,
    stickyOffset,
    numeric,
    className,
    style,
    ...props
}: TableCellProps) {
    return (
        <td
            {...props}
            {...cellProps(
                "zse-table-cell",
                { sticky, stickyOffset, numeric },
                className,
                style,
            )}
        />
    );
}

export function TableEmpty({
    colSpan,
    children,
}: {
    colSpan: number;
    children: ReactNode;
}) {
    return (
        <tr>
            <td colSpan={colSpan} className="zse-table-empty">
                {children}
            </td>
        </tr>
    );
}
