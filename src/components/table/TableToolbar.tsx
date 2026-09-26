"use client";

import {
    ArrowDown01Icon,
    Cancel01Icon,
    Search01Icon,
} from "@hugeicons/core-free-icons";
import { useLayoutEffect, useRef, type ReactNode } from "react";

import { useMessages } from "../../i18n/context";
import type { Messages } from "../../i18n/types";
import { Button } from "../button/Button";
import { Icon } from "../icon/Icon";
import { Input } from "../input/Input";
import {
    Menu,
    MenuCheckboxItem,
    MenuGroup,
    MenuItem,
    MenuSeparator,
} from "../menu/Menu";
import type { TableFilterFacet, TableSelectionSummary } from "./use-table";

export interface TableToolbarProps {
    query?: string;
    onQueryChange?: (query: string) => void;
    // Bez wyszukiwarki, gdy false.
    searchable?: boolean;
    searchPlaceholder?: string;
    // Nazwa pola dla czytników, gdy placeholder nie wystarcza.
    searchLabel?: string;
    filters?: readonly TableFilterFacet[];
    isFiltered?: boolean;
    onClear?: () => void;
    // Liczba pasujących wierszy, ogłaszana czytnikom po zmianie filtrów.
    total?: number;
    // Akcje po prawej, np. eksport albo „Dodaj ucznia”.
    children?: ReactNode;
    // Z zaznaczonymi wierszami pasek zamienia się w pasek akcji zbiorczych.
    selection?: TableSelectionSummary;
    // Akcje na zaznaczonych, np. „Przenieś” i „Usuń”.
    bulkActions?: ReactNode;
    // Teksty zaznaczania odmienione pod dane, np. dla uczniów
    // selectAll: (_, n) => `Zaznacz wszystkich (${n})`.
    selectionLabels?: Partial<
        Pick<Messages["table"], "selected" | "selectAll" | "allSelected">
    >;
}

const NO_FILTERS: readonly TableFilterFacet[] = [];

function FilterMenu({ facet }: { facet: TableFilterFacet }) {
    const t = useMessages();
    const count = facet.selected.length;
    const toggle = (value: string, checked: boolean) =>
        facet.onChange(
            checked
                ? [...facet.selected, value]
                : facet.selected.filter((item) => item !== value),
        );

    return (
        <Menu
            align="start"
            trigger={
                <Button
                    variant="outline"
                    size="sm"
                    icon={ArrowDown01Icon}
                    iconPosition="right"
                    className="zse-table-filter"
                    data-active={count > 0 || undefined}
                >
                    {facet.label}
                    {count > 0 && (
                        <span className="zse-table-filter-count">{count}</span>
                    )}
                </Button>
            }
        >
            <MenuGroup label={facet.label}>
                {facet.options.length === 0 && (
                    <MenuItem disabled>{t.table.filterNoOptions}</MenuItem>
                )}
                {facet.options.map((option) => (
                    <MenuCheckboxItem
                        key={option.value}
                        checked={facet.selected.includes(option.value)}
                        onCheckedChange={(checked) =>
                            toggle(option.value, checked)
                        }
                        disabled={
                            option.count === 0 &&
                            !facet.selected.includes(option.value)
                        }
                        {...(option.count !== undefined && {
                            suffix: option.count,
                        })}
                    >
                        {option.label ?? option.value}
                    </MenuCheckboxItem>
                ))}
            </MenuGroup>
            {count > 0 && (
                <>
                    <MenuSeparator />
                    <MenuItem onClick={() => facet.onChange([])}>
                        {t.common.clear}
                    </MenuItem>
                </>
            )}
        </Menu>
    );
}

// Pasek nad tabelą: wyszukiwanie, filtry z licznikami i czyszczenie.
// Propsy najwygodniej wziąć z useTable: {...table.toolbarProps}.
export function TableToolbar({
    query = "",
    onQueryChange,
    searchable = true,
    searchPlaceholder,
    searchLabel,
    filters = NO_FILTERS,
    isFiltered = false,
    onClear,
    total,
    children,
    selection,
    bulkActions,
    selectionLabels,
}: TableToolbarProps) {
    const t = useMessages();
    const number = new Intl.NumberFormat(t.locale);
    const count = selection?.count ?? 0;
    const labels = { ...t.table, ...selectionLabels };
    const selectedText = selection?.allSelected
        ? labels.allSelected(count, number.format(count))
        : labels.selected(count, number.format(count));
    const selecting = count > 0;
    const rootRef = useRef<HTMLDivElement>(null);
    const bulkRef = useRef<HTMLDivElement>(null);

    // Znikający pasek akcji nie zabiera fokusu w próżnię: wraca na pasek,
    // skąd Tab prowadzi dalej.
    useLayoutEffect(() => {
        if (!selecting && bulkRef.current?.contains(document.activeElement))
            rootRef.current?.focus();
    }, [selecting]);

    const status = selecting
        ? selectedText
        : isFiltered && total !== undefined
          ? t.table.results(total, number.format(total))
          : "";

    return (
        <div
            ref={rootRef}
            className="zse-table-toolbar"
            data-selecting={selecting || undefined}
            tabIndex={-1}
        >
            <div className="zse-table-toolbar-main" inert={selecting}>
                <div className="zse-table-toolbar-filters">
                    {searchable && onQueryChange && (
                        <Input
                            size="sm"
                            leftIcon={Search01Icon}
                            className="zse-table-search"
                            placeholder={searchPlaceholder ?? t.table.search}
                            aria-label={
                                searchLabel ??
                                searchPlaceholder ??
                                t.table.search
                            }
                            value={query}
                            onChange={(event) =>
                                onQueryChange(event.target.value)
                            }
                            onKeyDown={(event) => {
                                if (event.key === "Escape" && query) {
                                    event.stopPropagation();
                                    onQueryChange("");
                                }
                            }}
                        />
                    )}
                    {filters.map((facet) => (
                        <FilterMenu key={facet.key} facet={facet} />
                    ))}
                    {isFiltered && onClear && (
                        <Button variant="ghost" size="sm" onClick={onClear}>
                            {t.table.clearFilters}
                        </Button>
                    )}
                </div>
                {children != null && (
                    <div className="zse-table-toolbar-actions">{children}</div>
                )}
            </div>
            {selection && (
                // Escape z dowolnej kontrolki w pasku czyści zaznaczenie.
                // oxlint-disable-next-line jsx-a11y/no-static-element-interactions
                <div
                    ref={bulkRef}
                    className="zse-table-bulk"
                    inert={!selecting}
                    onKeyDown={(event) => {
                        // Escape z menu w portalu też tu wypływa, a zamyka tylko menu.
                        if (
                            event.key !== "Escape" ||
                            !bulkRef.current?.contains(event.target as Node)
                        )
                            return;
                        event.stopPropagation();
                        selection.onClear();
                    }}
                >
                    <div className="zse-table-bulk-summary">
                        <button
                            type="button"
                            className="zse-table-action"
                            aria-label={t.table.clearSelection}
                            onClick={selection.onClear}
                        >
                            <Icon icon={Cancel01Icon} size={16} />
                        </button>
                        <span className="zse-table-bulk-count">
                            {selectedText}
                        </span>
                        {selection.canSelectAll && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={selection.onSelectAll}
                            >
                                {labels.selectAll(
                                    selection.total,
                                    number.format(selection.total),
                                )}
                            </Button>
                        )}
                    </div>
                    {bulkActions != null && (
                        <div className="zse-table-toolbar-actions">
                            {bulkActions}
                        </div>
                    )}
                </div>
            )}
            {(total !== undefined || selection) && (
                <output className="zse-table-sr" aria-live="polite">
                    {status}
                </output>
            )}
        </div>
    );
}
