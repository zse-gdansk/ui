"use client";

import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { Field } from "@base-ui/react/field";
import {
    ArrowDown01Icon,
    Cancel01Icon,
    LoaderCircleIcon,
    Tick02Icon,
} from "@hugeicons/core-free-icons";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { Highlight } from "../../search/Highlight";
import { createSearch, type SearchKey } from "../../search/search";
import { Icon } from "../icon/Icon";
import { ScrollArea } from "../scroll-area/ScrollArea";

export interface ComboboxOption {
    value: string;
    label: string;
    // Druga linia pod etykietą, też przeszukiwana.
    description?: string;
    disabled?: boolean;
}

interface ComboboxBaseProps {
    label?: ReactNode;
    hint?: ReactNode;
    error?: string | undefined;
    size?: "sm" | "md" | "lg";
    options?: readonly ComboboxOption[];
    // Wyszukiwanie po stronie serwera zamiast filtrowania options. Wołane
    // 200ms po ostatnim znaku, poprzednie zapytanie dostaje abort.
    onSearch?: (
        query: string,
        signal: AbortSignal,
    ) => Promise<ComboboxOption[]>;
    placeholder?: string;
    emptyText?: string;
    disabled?: boolean;
    name?: string;
    id?: string;
}

interface SingleProps extends ComboboxBaseProps {
    multiple?: false;
    value?: string | null;
    defaultValue?: string | null;
    onValueChange?: (value: string | null) => void;
}

interface MultipleProps extends ComboboxBaseProps {
    multiple: true;
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (value: string[]) => void;
}

export type ComboboxProps = SingleProps | MultipleProps;

// Nazwa ważniejsza od opisu: „3C” w opisie przegrywa z „3C” w nazwie.
const KEYS: SearchKey<ComboboxOption>[] = [
    "label",
    { name: "description", get: (option) => option.description, weight: 0.5 },
];

export function Combobox(props: ComboboxProps) {
    const {
        label,
        hint,
        error,
        size = "md",
        options = [],
        onSearch,
        placeholder,
        emptyText = "Brak wyników",
        disabled = false,
        name,
        id,
    } = props;
    const multiple = props.multiple === true;

    const [query, setQuery] = useState("");
    const [results, setResults] = useState<ComboboxOption[]>([]);
    const [pending, setPending] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [picked, setPicked] = useState(
        () => new Map<string, ComboboxOption>(),
    );

    const trimmed = query.trim();
    const found = onSearch && trimmed ? results : [];
    const toOption = (value: string): ComboboxOption =>
        options.find((option) => option.value === value) ??
        found.find((option) => option.value === value) ??
        picked.get(value) ?? { value, label: value };

    const [selected, setSelected] = useState<string[]>(() => {
        const initial = props.value ?? props.defaultValue ?? null;
        return initial === null
            ? []
            : Array.isArray(initial)
              ? initial
              : [initial];
    });

    const values = (() => {
        if (props.value === undefined) return selected;
        if (props.value === null) return [];
        return Array.isArray(props.value) ? props.value : [props.value];
    })();
    const current = values.map(toOption);

    function change(next: ComboboxOption | ComboboxOption[] | null) {
        const list = next === null ? [] : Array.isArray(next) ? next : [next];
        setPicked((prev) => {
            const map = new Map(prev);
            for (const option of list) map.set(option.value, option);
            return map;
        });
        const nextValues = list.map((option) => option.value);
        if (props.value === undefined) setSelected(nextValues);
        if (props.multiple === true) props.onValueChange?.(nextValues);
        else props.onValueChange?.(nextValues[0] ?? null);
    }

    function type(next: string, reason: string) {
        if (reason !== "input-change" && reason !== "input-clear") return;
        setQuery(next);
        if (onSearch) setPending(next.trim() !== "");
    }

    useEffect(() => {
        if (!onSearch || !trimmed) return;
        const controller = new AbortController();
        const timer = setTimeout(() => {
            onSearch(trimmed, controller.signal).then(
                (list) => {
                    if (controller.signal.aborted) return;
                    setResults(list);
                    setSearchError(null);
                    setPending(false);
                },
                () => {
                    if (controller.signal.aborted) return;
                    setSearchError("Nie udało się wyszukać");
                    setPending(false);
                },
            );
        }, 200);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [trimmed, onSearch]);

    const search = !multiple && current[0]?.label === query ? "" : query;

    // Lokalnie silnik filtruje i układa od najlepszego dopasowania. Wyniki
    // z serwera zostają w jego kolejności, silnik daje im tylko podświetlenie.
    const source = onSearch ? found : options;
    const engine = useMemo(
        () => createSearch(source, { keys: KEYS }),
        [source],
    );
    const ranked = search.trim() ? engine(search) : null;
    const ranges = new Map(
        ranked?.map((result) => [result.item.value, result.ranges]),
    );

    const items = onSearch
        ? [
              ...found,
              ...current.filter(
                  (option) =>
                      !found.some((result) => result.value === option.value),
              ),
          ]
        : ranked
          ? ranked.map((result) => result.item)
          : [...options];

    const status = !onSearch
        ? null
        : pending
          ? "searching"
          : searchError
            ? "error"
            : !trimmed && current.length === 0
              ? "idle"
              : null;

    const trigger = (
        <BaseCombobox.Trigger
            className="zse-combobox-button zse-combobox-trigger"
            aria-label="Pokaż listę"
        >
            <Icon icon={ArrowDown01Icon} />
        </BaseCombobox.Trigger>
    );

    const input = (
        <BaseCombobox.Input
            className="zse-combobox-input"
            {...(id !== undefined && { id })}
            {...(placeholder !== undefined &&
                (!multiple || current.length === 0) && { placeholder })}
        />
    );

    return (
        <Field.Root
            className="zse-input zse-combobox"
            data-size={size}
            disabled={disabled}
            invalid={Boolean(error)}
        >
            {label != null && label !== false && (
                <Field.Label className="zse-input-label">{label}</Field.Label>
            )}

            <BaseCombobox.Root<ComboboxOption, boolean>
                items={items}
                multiple={multiple}
                disabled={disabled}
                value={multiple ? current : (current[0] ?? null)}
                onValueChange={(next) =>
                    change(next as ComboboxOption | ComboboxOption[] | null)
                }
                onInputValueChange={(next, details) =>
                    type(next, details.reason)
                }
                onOpenChangeComplete={(next) => {
                    if (!next) setQuery("");
                }}
                itemToStringLabel={(option) => option.label}
                itemToStringValue={(option) => option.value}
                isItemEqualToValue={(a, b) => a.value === b.value}
                filter={null}
                {...(name !== undefined && { name })}
            >
                <BaseCombobox.InputGroup
                    className="zse-input-control zse-combobox-group"
                    data-multiple={multiple || undefined}
                >
                    {multiple ? (
                        <BaseCombobox.Chips className="zse-combobox-chips">
                            {current.map((option) => (
                                <BaseCombobox.Chip
                                    key={option.value}
                                    className="zse-combobox-chip"
                                    aria-label={option.label}
                                >
                                    <span className="zse-combobox-chip-label">
                                        {option.label}
                                    </span>
                                    <BaseCombobox.ChipRemove
                                        className="zse-combobox-chip-remove"
                                        aria-label={`Usuń ${option.label}`}
                                    >
                                        <Icon icon={Cancel01Icon} size={12} />
                                    </BaseCombobox.ChipRemove>
                                </BaseCombobox.Chip>
                            ))}
                            {input}
                        </BaseCombobox.Chips>
                    ) : (
                        input
                    )}
                    <span className="zse-combobox-actions">
                        {!multiple && (
                            <BaseCombobox.Clear
                                className="zse-combobox-button zse-combobox-clear"
                                aria-label="Wyczyść"
                                keepMounted
                            >
                                <Icon icon={Cancel01Icon} size={14} />
                            </BaseCombobox.Clear>
                        )}
                        {trigger}
                    </span>
                </BaseCombobox.InputGroup>

                <BaseCombobox.Portal>
                    <BaseCombobox.Positioner
                        className="zse-select-positioner"
                        sideOffset={6}
                    >
                        <BaseCombobox.Popup
                            className="zse-select-popup zse-combobox-popup"
                            aria-busy={pending || undefined}
                        >
                            <BaseCombobox.Status className="zse-combobox-status">
                                {status === "searching" && (
                                    <>
                                        <Icon
                                            icon={LoaderCircleIcon}
                                            size={14}
                                            className="zse-combobox-spinner"
                                        />
                                        Szukanie…
                                    </>
                                )}
                                {status === "error" && searchError}
                                {status === "idle" &&
                                    "Zacznij pisać, żeby wyszukać"}
                            </BaseCombobox.Status>
                            <ScrollArea maxHeight="min(var(--available-height), 18rem)">
                                <BaseCombobox.Empty className="zse-combobox-empty">
                                    {status === null &&
                                        (search.trim()
                                            ? `${emptyText} dla „${search.trim()}”`
                                            : emptyText)}
                                </BaseCombobox.Empty>
                                <BaseCombobox.List className="zse-combobox-list">
                                    {(option: ComboboxOption) => (
                                        <BaseCombobox.Item
                                            key={option.value}
                                            value={option}
                                            disabled={option.disabled}
                                            className="zse-select-item zse-combobox-item"
                                        >
                                            <span className="zse-combobox-item-text">
                                                <span className="zse-combobox-item-label">
                                                    <Highlight
                                                        text={option.label}
                                                        ranges={
                                                            ranges.get(
                                                                option.value,
                                                            )?.label
                                                        }
                                                    />
                                                </span>
                                                {option.description && (
                                                    <span className="zse-combobox-item-description">
                                                        <Highlight
                                                            text={
                                                                option.description
                                                            }
                                                            ranges={
                                                                ranges.get(
                                                                    option.value,
                                                                )?.description
                                                            }
                                                        />
                                                    </span>
                                                )}
                                            </span>
                                            <BaseCombobox.ItemIndicator className="zse-select-item-indicator">
                                                <Icon icon={Tick02Icon} />
                                            </BaseCombobox.ItemIndicator>
                                        </BaseCombobox.Item>
                                    )}
                                </BaseCombobox.List>
                            </ScrollArea>
                        </BaseCombobox.Popup>
                    </BaseCombobox.Positioner>
                </BaseCombobox.Portal>
            </BaseCombobox.Root>

            {error ? (
                <Field.Error className="zse-input-hint" match>
                    {error}
                </Field.Error>
            ) : (
                hint != null &&
                hint !== false && (
                    <Field.Description className="zse-input-hint">
                        {hint}
                    </Field.Description>
                )
            )}
        </Field.Root>
    );
}
