"use client";

import {
    ArrowUpDownIcon,
    SortByDown02Icon,
    SortByUp02Icon,
} from "@hugeicons/core-free-icons";
import {
    useState,
    type CSSProperties,
    type HTMLAttributes,
    type KeyboardEvent,
    type ReactNode,
    type TdHTMLAttributes,
    type ThHTMLAttributes,
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
    // Co drugi wiersz z innym tłem, łatwiej prowadzić wzrok w szerokiej siatce.
    striped?: boolean;
}

// Atrybut na jednym nagłówku naraz.
function marker(attribute: string) {
    let current: Element | null = null;
    return (head: Element | null) => {
        if (head === current) return;
        current?.removeAttribute(attribute);
        head?.setAttribute(attribute, "");
        current = head;
    };
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

        // Komórka, do której przechodzi fokus, nie chowa się pod
        // przyklejonym nagłówkiem, stopką ani kolumną.
        const width = (selector: string) =>
            [...scroller.querySelectorAll(selector)].reduce(
                (sum, cell) => sum + cell.getBoundingClientRect().width,
                0,
            );
        const height = (selector: string) =>
            scroller.querySelector(selector)?.getBoundingClientRect().height ??
            0;
        Object.assign(scroller.style, {
            scrollPaddingTop: `${height("thead")}px`,
            scrollPaddingBottom: `${height("tfoot")}px`,
            scrollPaddingInlineStart: `${width('thead tr > [data-sticky="left"]')}px`,
            scrollPaddingInlineEnd: `${width('thead tr > [data-sticky="right"]')}px`,
        });
    };

    // Nagłówek kolumny pod kursorem albo z fokusem, razem z wierszem daje
    // krzyżyk.
    const headOf = (target: EventTarget | null) => {
        const cell =
            target instanceof Element ? target.closest("tbody td") : null;
        return cell instanceof HTMLTableCellElement
            ? scroller.querySelector(
                  `thead tr > :nth-child(${cell.cellIndex + 1})`,
              )
            : null;
    };
    const markHover = marker("data-column-hover");
    const markFocus = marker("data-column-focus");
    const hover = (event: PointerEvent) => markHover(headOf(event.target));
    const leave = () => markHover(null);
    const focusIn = (event: FocusEvent) => markFocus(headOf(event.target));
    const focusOut = (event: FocusEvent) =>
        markFocus(headOf(event.relatedTarget));

    update();
    const observer = new ResizeObserver(update);
    observer.observe(scroller);
    if (scroller.firstElementChild)
        observer.observe(scroller.firstElementChild);
    scroller.addEventListener("scroll", update, { passive: true });
    scroller.addEventListener("pointerover", hover);
    scroller.addEventListener("pointerleave", leave);
    scroller.addEventListener("focusin", focusIn);
    scroller.addEventListener("focusout", focusOut);
    return () => {
        observer.disconnect();
        scroller.removeEventListener("scroll", update);
        scroller.removeEventListener("pointerover", hover);
        scroller.removeEventListener("pointerleave", leave);
        scroller.removeEventListener("focusin", focusIn);
        scroller.removeEventListener("focusout", focusOut);
    };
}

export function Table({
    label,
    maxHeight,
    size = "md",
    striped = false,
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
                data-striped={striped || undefined}
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

export interface TableNumberCellProps extends Omit<
    TdHTMLAttributes<HTMLTableCellElement>,
    "children" | "onChange"
> {
    value: number | null;
    // Wywoływane przy zatwierdzeniu: Enter, wyjście z komórki, M.
    onValueChange: (value: number | null) => void;
    // Np. "Zadanie 3, Nowak Szymon", pole nie ma widocznej etykiety.
    label: string;
    min?: number;
    max?: number;
    disabled?: boolean;
}

const NUMBER_FORMAT = new Intl.NumberFormat("pl-PL", {
    maximumFractionDigits: 2,
    useGrouping: false,
});

// "" to brak wartości, przecinek i kropka jako separator.
function parsePoints(text: string) {
    if (text.trim() === "") return null;
    return Number(text.replace(",", "."));
}

// Przejście do komórki z polem w sąsiednim wierszu albo kolumnie. Po DOM,
// więc działa po sortowaniu i z dowolnymi kolumnami pomiędzy.
function moveFocus(input: HTMLInputElement, rows: number, columns: number) {
    const cell = input.closest("td");
    const row = cell?.parentElement;
    if (!cell || !(row instanceof HTMLTableRowElement)) return false;
    const target =
        rows > 0
            ? row.nextElementSibling
            : rows < 0
              ? row.previousElementSibling
              : row;
    if (!(target instanceof HTMLTableRowElement)) return false;
    const next = target.cells[cell.cellIndex + columns]?.querySelector("input");
    if (!next) return false;
    next.focus();
    return true;
}

// Komórka z punktami do wpisania, obsługiwana jak arkusz: strzałki
// i Enter przechodzą między komórkami, Escape cofa, M wpisuje maksimum.
export function TableNumberCell({
    value,
    onValueChange,
    label,
    min = 0,
    max,
    disabled = false,
    className,
    ...props
}: TableNumberCellProps) {
    // Tekst w trakcie edycji; null, gdy komórka pokazuje wartość.
    const [draft, setDraft] = useState<string | null>(null);
    const text = draft ?? (value === null ? "" : NUMBER_FORMAT.format(value));
    const parsed = parsePoints(text);
    const invalid =
        parsed !== null &&
        (Number.isNaN(parsed) ||
            parsed < min ||
            (max !== undefined && parsed > max));

    function commit() {
        if (draft === null) return;
        setDraft(null);
        const next = parsePoints(draft);
        if (next !== null && Number.isNaN(next)) return;
        const clamped =
            next === null
                ? null
                : Math.min(Math.max(next, min), max ?? Infinity);
        if (clamped !== value) onValueChange(clamped);
    }

    function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        const input = event.currentTarget;
        const { selectionStart, selectionEnd } = input;
        const length = input.value.length;
        const all = selectionStart === 0 && selectionEnd === length;
        const go = (rows: number, columns: number) => {
            if (moveFocus(input, rows, columns)) event.preventDefault();
        };

        switch (event.key) {
            case "ArrowUp":
                go(-1, 0);
                break;
            case "ArrowDown":
                go(1, 0);
                break;
            case "ArrowLeft":
                if (all || (selectionStart === 0 && selectionEnd === 0))
                    go(0, -1);
                break;
            case "ArrowRight":
                if (all || selectionStart === length) go(0, 1);
                break;
            case "Enter":
                event.preventDefault();
                // Przejście robi blur, a blur zatwierdza.
                if (!moveFocus(input, event.shiftKey ? -1 : 1, 0)) {
                    commit();
                    input.select();
                }
                break;
            case "Escape":
                if (draft === null) break;
                event.preventDefault();
                setDraft(null);
                requestAnimationFrame(() => input.select());
                break;
            case "m":
            case "M":
                if (max === undefined || event.metaKey || event.ctrlKey) break;
                event.preventDefault();
                setDraft(null);
                if (value !== max) onValueChange(max);
                requestAnimationFrame(() => input.select());
                break;
        }
    }

    return (
        <td
            {...props}
            data-numeric=""
            className={cx("zse-table-cell", "zse-table-input-cell", className)}
        >
            <input
                className="zse-table-input"
                type="text"
                inputMode="decimal"
                enterKeyHint="next"
                autoComplete="off"
                aria-label={label}
                aria-invalid={invalid || undefined}
                placeholder="–"
                disabled={disabled}
                value={text}
                onChange={(event) => {
                    const next = event.target.value;
                    if (/^\d*([.,]\d{0,2})?$/.test(next)) setDraft(next);
                }}
                onFocus={(event) => event.target.select()}
                onBlur={commit}
                onKeyDown={onKeyDown}
            />
        </td>
    );
}
