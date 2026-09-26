"use client";

import { ArrowDown01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import type { ReactNode } from "react";

import { useMessages } from "../../i18n/context";
import { Button } from "../button/Button";
import { Input } from "../input/Input";
import {
    Menu,
    MenuCheckboxItem,
    MenuGroup,
    MenuItem,
    MenuSeparator,
} from "../menu/Menu";
import type { TableFilterFacet } from "./use-table";

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
}: TableToolbarProps) {
    const t = useMessages();
    const number = new Intl.NumberFormat(t.locale);

    return (
        <div className="zse-table-toolbar">
            <div className="zse-table-toolbar-filters">
                {searchable && onQueryChange && (
                    <Input
                        size="sm"
                        leftIcon={Search01Icon}
                        className="zse-table-search"
                        placeholder={searchPlaceholder ?? t.table.search}
                        aria-label={
                            searchLabel ?? searchPlaceholder ?? t.table.search
                        }
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
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
            {total !== undefined && (
                <output className="zse-table-sr" aria-live="polite">
                    {isFiltered
                        ? t.table.results(total, number.format(total))
                        : ""}
                </output>
            )}
        </div>
    );
}
