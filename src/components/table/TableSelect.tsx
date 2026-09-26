"use client";

import { useRef } from "react";

import { useMessages } from "../../i18n/context";
import { Checkbox } from "../checkbox/Checkbox";

export interface TableSelectCellProps {
    checked: boolean;
    // range: kliknięcie z Shiftem, zaznacza wszystko od poprzedniego.
    onCheckedChange: (checked: boolean, options: { range: boolean }) => void;
    // Nazwa z kontekstem wiersza, np. „Zaznacz: Anna Nowak”.
    label?: string;
    disabled?: boolean;
    // Kolumna przyklejona do lewej krawędzi przy przewijaniu w poziomie.
    sticky?: boolean;
}

// Komórka z checkboxem, zwykle pierwsza. Klika się cała komórka, a kliknięcie
// nie wywołuje onClick wiersza. Props najwygodniej wziąć z
// table.selectProps(row).
export function TableSelectCell({
    checked,
    onCheckedChange,
    label,
    disabled,
    sticky = false,
}: TableSelectCellProps) {
    const t = useMessages();
    const range = useRef(false);

    return (
        // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
        <td
            className="zse-table-cell zse-table-select"
            data-sticky={sticky ? "left" : undefined}
            onClick={(event) => event.stopPropagation()}
            onPointerDownCapture={(event) => {
                range.current = event.shiftKey;
                // Bez tego Shift zaznacza tekst między kliknięciami.
                if (event.shiftKey) event.preventDefault();
            }}
            onKeyDownCapture={(event) => {
                range.current = event.shiftKey;
            }}
        >
            {/* oxlint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label className="zse-table-select-hit">
                <Checkbox
                    checked={checked}
                    disabled={disabled}
                    aria-label={label ?? t.table.selectRow}
                    onCheckedChange={(next) => {
                        onCheckedChange(next, { range: range.current });
                        range.current = false;
                    }}
                />
            </label>
        </td>
    );
}

export interface TableSelectHeadProps {
    checked: boolean;
    indeterminate?: boolean;
    onCheckedChange: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
    sticky?: boolean;
}

// Nagłówek kolumny zaznaczania: zaznacza albo odznacza bieżącą stronę.
// Props z table.selectAllProps.
export function TableSelectHead({
    checked,
    indeterminate = false,
    onCheckedChange,
    label,
    disabled,
    sticky = false,
}: TableSelectHeadProps) {
    const t = useMessages();

    return (
        <th
            scope="col"
            className="zse-table-head zse-table-select"
            data-sticky={sticky ? "left" : undefined}
        >
            {/* oxlint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label className="zse-table-select-hit">
                <Checkbox
                    checked={checked}
                    indeterminate={indeterminate}
                    disabled={disabled}
                    aria-label={label ?? t.table.selectPage}
                    onCheckedChange={onCheckedChange}
                />
            </label>
        </th>
    );
}
