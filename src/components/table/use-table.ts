"use client";

import { useMemo, useState, type ReactNode } from "react";

import { useMessages } from "../../i18n/context";
import { createSearch, type Range, type SearchKey } from "../../search/search";

export type SortDirection = "asc" | "desc";

export interface TableSort {
    key: string;
    direction: SortDirection;
}

export interface TableState {
    sort: TableSort | null;
    query: string;
    // Zaznaczone wartości filtra po jego kluczu; pusta lista to brak filtra.
    filters: Readonly<Record<string, readonly string[]>>;
    page: number;
    pageSize: number;
}

type SortValue = string | number | bigint | boolean | Date | null | undefined;

export type TableSortColumn<Row> =
    | ((row: Row) => SortValue)
    | {
          value: (row: Row) => SortValue;
          // Kierunek po pierwszym kliknięciu; dla punktów zwykle "desc".
          first?: SortDirection;
      };

export interface TableFilterOption {
    value: string;
    label?: ReactNode;
}

export interface TableFilter<Row> {
    label: string;
    // Wartość wiersza; lista, gdy wiersz ma kilka (np. przedmioty).
    value: (row: Row) => string | readonly string[] | null | undefined;
    // Bez opcji: unikalne wartości z danych, alfabetycznie.
    options?: readonly TableFilterOption[];
}

export interface UseTableOptions<Row> {
    data: readonly Row[];
    sortBy?: Readonly<Record<string, TableSortColumn<Row>>>;
    search?: readonly SearchKey<Row>[];
    filters?: Readonly<Record<string, TableFilter<Row>>>;
    initialState?: Partial<TableState>;
    // Stan kontrolowany, np. w adresie strony (?strona=2&sort=suma).
    state?: TableState;
    onStateChange?: (state: TableState) => void;
    // Sortowanie, filtry i strony robi serwer: data to już bieżąca strona,
    // a total to liczba wszystkich pasujących wierszy.
    manual?: boolean;
    total?: number;
}

export interface TableFilterFacet {
    key: string;
    label: string;
    // Liczba wierszy przy każdej opcji, z uwzględnieniem wyszukiwania
    // i pozostałych filtrów. Bez liczb w trybie manual.
    options: readonly (TableFilterOption & { count?: number })[];
    selected: readonly string[];
    onChange: (selected: readonly string[]) => void;
}

const DEFAULT_STATE: TableState = {
    sort: null,
    query: "",
    filters: {},
    page: 1,
    pageSize: 20,
};

const collators = new Map<string, Intl.Collator>();

function collator(locale: string) {
    let result = collators.get(locale);
    if (!result) {
        result = new Intl.Collator(locale, {
            numeric: true,
            sensitivity: "base",
        });
        collators.set(locale, result);
    }
    return result;
}

const isEmpty = (value: SortValue) =>
    value === null || value === undefined || value === "";

function compare(a: SortValue, b: SortValue, locale: string) {
    if (typeof a === "string" && typeof b === "string")
        return collator(locale).compare(a, b);
    const left = a instanceof Date ? a.getTime() : a;
    const right = b instanceof Date ? b.getTime() : b;
    return left! < right! ? -1 : left! > right! ? 1 : 0;
}

const valuesOf = <Row>(filter: TableFilter<Row>, row: Row) => {
    const value = filter.value(row);
    if (value === null || value === undefined) return [];
    return typeof value === "string" ? [value] : value;
};

// Stan tabeli z danymi: sortowanie, wyszukiwanie, filtry i strony w jednym
// miejscu. Zwraca wiersze bieżącej strony i propsy dla TableHead,
// TableToolbar i Pagination, więc części same się ze sobą zgadzają.
export function useTable<Row>({
    data,
    sortBy = {},
    search,
    filters = {},
    initialState,
    state: controlled,
    onStateChange,
    manual = false,
    total: manualTotal,
}: UseTableOptions<Row>) {
    const t = useMessages();
    const [inner, setInner] = useState<TableState>(() => ({
        ...DEFAULT_STATE,
        ...initialState,
    }));
    const state = controlled ?? inner;

    const update = (patch: Partial<TableState>) => {
        const next = { ...state, ...patch };
        if (!controlled) setInner(next);
        onStateChange?.(next);
    };

    // Wyszukiwanie: zbiór pasujących wierszy z wynikiem i zakresami.
    const matches = useMemo(() => {
        const query = state.query.trim();
        if (manual || !search || !query) return null;
        const results = createSearch(data, { keys: search })(query);
        return new Map(results.map((result) => [result.item, result]));
    }, [data, search, state.query, manual]);

    const filterEntries = Object.entries(filters);

    // Wiersz pasuje do filtrów, z pominięciem jednego (do liczników opcji).
    const passes = (row: Row, skip?: string) =>
        filterEntries.every(([key, filter]) => {
            if (key === skip) return true;
            const selected = state.filters[key];
            if (!selected?.length) return true;
            return valuesOf(filter, row).some((value) =>
                selected.includes(value),
            );
        });

    const searched = matches ? data.filter((row) => matches.has(row)) : data;
    const filtered = manual ? data : searched.filter((row) => passes(row));

    let sorted = filtered;
    if (!manual) {
        const column = state.sort ? sortBy[state.sort.key] : undefined;
        if (state.sort && column) {
            const get = typeof column === "function" ? column : column.value;
            const sign = state.sort.direction === "asc" ? 1 : -1;
            sorted = filtered.toSorted((a, b) => {
                const left = get(a);
                const right = get(b);
                // Puste zawsze na końcu, w obu kierunkach.
                if (isEmpty(left) || isEmpty(right))
                    return Number(isEmpty(left)) - Number(isEmpty(right));
                return sign * compare(left, right, t.locale);
            });
        } else if (matches) {
            // Bez sortowania wyniki wyszukiwania idą od najlepszego.
            sorted = filtered.toSorted(
                (a, b) =>
                    (matches.get(b)?.score ?? 0) - (matches.get(a)?.score ?? 0),
            );
        }
    }

    const total = manual ? (manualTotal ?? data.length) : sorted.length;
    const pageCount = Math.max(1, Math.ceil(total / state.pageSize));
    // Strona poza zakresem (np. po odfiltrowaniu) pokazuje ostatnią.
    const page = Math.min(Math.max(state.page, 1), pageCount);
    const rows = manual
        ? data
        : sorted.slice((page - 1) * state.pageSize, page * state.pageSize);

    const isFiltered =
        state.query.trim() !== "" ||
        Object.values(state.filters).some((values) => values.length > 0);

    const setSort = (sort: TableSort | null) => update({ sort, page: 1 });
    const setQuery = (query: string) => update({ query, page: 1 });
    const setFilter = (key: string, selected: readonly string[]) =>
        update({ filters: { ...state.filters, [key]: selected }, page: 1 });
    const clearFilters = () => update({ query: "", filters: {}, page: 1 });
    const setPage = (next: number) => update({ page: next });
    // Pierwszy widoczny wiersz zostaje na ekranie po zmianie rozmiaru strony.
    const setPageSize = (pageSize: number) =>
        update({
            pageSize,
            page: Math.floor(((page - 1) * state.pageSize) / pageSize) + 1,
        });

    // Kolejne kliknięcia: pierwszy kierunek, odwrotny, bez sortowania.
    const toggleSort = (key: string) => {
        const column = sortBy[key];
        const first =
            (typeof column === "object" && column.first) || ("asc" as const);
        const current = state.sort?.key === key ? state.sort.direction : null;
        if (!current) setSort({ key, direction: first });
        else if (current === first)
            setSort({ key, direction: first === "asc" ? "desc" : "asc" });
        else setSort(null);
    };

    const facets: TableFilterFacet[] = filterEntries.map(([key, filter]) => {
        const counts = new Map<string, number>();
        if (!manual)
            for (const row of searched)
                if (passes(row, key))
                    for (const value of valuesOf(filter, row))
                        counts.set(value, (counts.get(value) ?? 0) + 1);
        const options =
            filter.options ??
            [...new Set(data.flatMap((row) => valuesOf(filter, row)))]
                .toSorted(collator(t.locale).compare)
                .map((value) => ({ value }));
        return {
            key,
            label: filter.label,
            options: options.map((option) =>
                manual
                    ? option
                    : Object.assign({}, option, {
                          count: counts.get(option.value) ?? 0,
                      }),
            ),
            selected: state.filters[key] ?? [],
            onChange: (selected) => setFilter(key, selected),
        };
    });

    return {
        rows,
        total,
        pageCount,
        state: { ...state, page },
        isFiltered,
        setSort,
        toggleSort,
        setQuery,
        setFilter,
        clearFilters,
        setPage,
        setPageSize,
        // Zakresy dopasowania do <Highlight>, po nazwie klucza wyszukiwania.
        getRanges: (row: Row, key: string): readonly Range[] =>
            matches?.get(row)?.ranges[key] ?? [],
        // {...table.sortProps("name")} na TableHead.
        sortProps: (key: string) => ({
            sort:
                state.sort?.key === key
                    ? state.sort.direction
                    : (false as const),
            onSort: () => toggleSort(key),
        }),
        // {...table.toolbarProps} na TableToolbar.
        toolbarProps: {
            query: state.query,
            onQueryChange: setQuery,
            searchable: Boolean(search) || manual,
            filters: facets,
            isFiltered,
            onClear: clearFilters,
            total,
        },
        // {...table.paginationProps} na Pagination.
        paginationProps: {
            page,
            onPageChange: setPage,
            total,
            pageSize: state.pageSize,
            onPageSizeChange: setPageSize,
            showInfo: true,
        },
    };
}

export type UseTableResult<Row> = ReturnType<typeof useTable<Row>>;
