"use client";

import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { Field } from "@base-ui/react/field";
import {
    ArrowDown01Icon,
    Cancel01Icon,
    Tick02Icon,
    UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { type ReactNode, useMemo, useState } from "react";

import { useMessages } from "../../i18n/context";
import { Highlight } from "../../search/Highlight";
import { createSearch, type Range, type SearchKey } from "../../search/search";
import { useAbortableTask } from "../../utils/effects";
import { Avatar } from "../avatar/Avatar";
import { FieldFooter } from "../field/FieldFooter";
import { Icon } from "../icon/Icon";
import { ScrollArea } from "../scroll-area/ScrollArea";
import { Spokes } from "../spinner/Spinner";

export interface Person {
    value: string;
    name: string;
    // Klasa albo funkcja: „3C”, „nauczyciel matematyki”. Też przeszukiwane.
    description?: string;
    // Adres zdjęcia; bez niego awatar z generatora.
    avatar?: string;
    // Stały seed awatara, np. id, żeby zmiana nazwiska go nie zmieniała.
    seed?: string;
}

export interface PeopleGroup {
    // Trafia do wartości zamiast członków, np. "class:3C". Członków
    // rozwija aplikacja, więc uczeń dopisany później też jest w grupie.
    value: string;
    label: string;
    // Wartości osób w grupie: do licznika i żeby nie wybrać ich osobno.
    members: readonly string[];
    // Zamiast licznika „28 osób”.
    description?: string;
}

type Entry =
    | { kind: "person"; value: string; label: string; person: Person }
    | { kind: "group"; value: string; label: string; group: PeopleGroup };

interface Section {
    value: string;
    items: Entry[];
}

export interface PeoplePickerProps {
    label?: ReactNode;
    hint?: ReactNode;
    error?: string | undefined;
    size?: "sm" | "md" | "lg";
    people?: readonly Person[];
    // Klasy, zespoły, rada pedagogiczna: wybierane jednym chipem.
    groups?: readonly PeopleGroup[];
    // Wyszukiwanie na serwerze (cała szkoła) zamiast filtrowania list.
    // Wołane 200 ms po ostatnim znaku, poprzednie zapytanie dostaje abort.
    onSearch?: (
        query: string,
        signal: AbortSignal,
    ) => Promise<readonly (Person | PeopleGroup)[]>;
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (value: string[]) => void;
    // Jedna osoba, np. kto obejmuje miejsce: pole jak Select, wybrana osoba
    // z awatarem w samym polu. Wartość dalej jest listą.
    single?: boolean;
    placeholder?: string;
    emptyText?: string;
    disabled?: boolean;
    name?: string;
    id?: string;
}

const NONE: readonly never[] = [];

const toEntry = (item: Person | PeopleGroup): Entry =>
    "members" in item
        ? { kind: "group", value: item.value, label: item.label, group: item }
        : { kind: "person", value: item.value, label: item.name, person: item };

const describe = (entry: Entry) =>
    entry.kind === "person"
        ? entry.person.description
        : entry.group.description;

// Nazwa ważniejsza od opisu: „3C” w opisie przegrywa z „3C” w nazwie.
const KEYS: SearchKey<Entry>[] = [
    "label",
    { name: "description", get: describe, weight: 0.5 },
];

// Grupa obejmuje swoich członków: wybrani wcześniej osobno wypadają.
function normalize(list: readonly Entry[]) {
    const groups = list.filter((entry) => entry.kind === "group");
    return list.filter(
        (entry) =>
            entry.kind === "group" ||
            !groups.some((group) => group.group.members.includes(entry.value)),
    );
}

// Awatar 20px jak ikona w wierszu Select, więc lista zostaje tak zwarta.
function EntryVisual({ entry }: { entry: Entry }) {
    if (entry.kind === "group")
        return (
            <span className="zse-people-group-icon" aria-hidden>
                <Icon icon={UserGroupIcon} size={12} />
            </span>
        );
    return (
        <Avatar
            name={entry.person.name}
            src={entry.person.avatar}
            size="xs"
            {...(entry.person.seed !== undefined && {
                seed: entry.person.seed,
            })}
        />
    );
}

// Osoba z wybranej już grupy jest wyłączona z dopiskiem „w grupie 3C”.
function EntryItem({
    entry,
    coveredBy,
    marks,
}: {
    entry: Entry;
    coveredBy: PeopleGroup | undefined;
    marks: Record<string, Range[]> | undefined;
}) {
    const t = useMessages();
    const detail: ReactNode = coveredBy ? (
        t.peoplePicker.inGroup(coveredBy.label)
    ) : entry.kind === "group" ? (
        (entry.group.description ??
        t.peoplePicker.members(entry.group.members.length))
    ) : entry.person.description ? (
        <Highlight
            text={entry.person.description}
            ranges={marks?.description}
        />
    ) : null;

    return (
        <BaseCombobox.Item
            value={entry}
            disabled={coveredBy !== undefined}
            className="zse-select-item zse-combobox-item zse-people-item"
        >
            <EntryVisual entry={entry} />
            <span className="zse-combobox-item-text">
                <span className="zse-combobox-item-label">
                    <Highlight text={entry.label} ranges={marks?.label} />
                </span>
                {detail != null && (
                    <span className="zse-combobox-item-description">
                        {detail}
                    </span>
                )}
            </span>
            <BaseCombobox.ItemIndicator className="zse-select-item-indicator">
                <Icon icon={Tick02Icon} />
            </BaseCombobox.ItemIndicator>
        </BaseCombobox.Item>
    );
}

export function PeoplePicker({
    label,
    hint,
    error,
    size = "md",
    people = NONE,
    groups = NONE,
    onSearch,
    value,
    defaultValue,
    onValueChange,
    single = false,
    placeholder,
    emptyText,
    disabled = false,
    name,
    id,
}: PeoplePickerProps) {
    const t = useMessages();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Entry[]>([]);
    const [pending, setPending] = useState(false);
    const [searchError, setSearchError] = useState(false);
    // Wybrane z wyników serwera, które zniknęły z listy po nowym szukaniu.
    const [picked, setPicked] = useState(() => new Map<string, Entry>());
    const [selected, setSelected] = useState<string[]>(
        () => value ?? defaultValue ?? [],
    );

    const trimmed = query.trim();
    const found = onSearch && trimmed ? results : [];

    const local = useMemo(
        () => [...groups.map(toEntry), ...people.map(toEntry)],
        [groups, people],
    );
    const find = (key: string): Entry =>
        local.find((entry) => entry.value === key) ??
        found.find((entry) => entry.value === key) ??
        picked.get(key) ?? {
            kind: "person",
            value: key,
            label: key,
            person: { value: key, name: key },
        };

    const values = value ?? selected;
    const current = values.map(find);
    const chosenGroups = current.flatMap((entry) =>
        entry.kind === "group" ? [entry.group] : [],
    );
    const coveredBy = (key: string) =>
        chosenGroups.find((group) => group.members.includes(key));

    function change(next: Entry[]) {
        const list = normalize(single ? next.slice(-1) : next);
        if (single) setOpen(false);
        setPicked((prev) => {
            const map = new Map(prev);
            for (const entry of list) map.set(entry.value, entry);
            return map;
        });
        const nextValues = list.map((entry) => entry.value);
        if (value === undefined) setSelected(nextValues);
        onValueChange?.(nextValues);
    }

    function type(text: string, reason: string) {
        if (reason !== "input-change" && reason !== "input-clear") return;
        setQuery(text);
        if (onSearch) setPending(text.trim() !== "");
    }

    useAbortableTask(
        onSearch && trimmed ? trimmed : null,
        async (signal) => {
            if (!onSearch) return;
            try {
                const list = await onSearch(trimmed, signal);
                if (signal.aborted) return;
                setResults(list.map(toEntry));
                setSearchError(false);
            } catch {
                if (signal.aborted) return;
                setSearchError(true);
            }
            setPending(false);
        },
        200,
    );

    // Lokalnie silnik filtruje i układa od najlepszego dopasowania; wyniki
    // z serwera zostają w jego kolejności, silnik daje im podświetlenie.
    const source = onSearch ? found : local;
    const engine = useMemo(
        () => createSearch(source, { keys: KEYS }),
        [source],
    );
    const ranked = trimmed ? engine(query) : null;
    const ranges = new Map<string, Record<string, Range[]>>(
        ranked?.map((result) => [result.item.value, result.ranges]),
    );

    const shown: Entry[] = onSearch
        ? [
              ...found,
              ...current.filter(
                  (entry) =>
                      !found.some((result) => result.value === entry.value),
              ),
          ]
        : ranked
          ? ranked.map((result) => result.item)
          : local;

    const sections: Section[] = [
        {
            value: t.peoplePicker.groups,
            items: shown.filter((entry) => entry.kind === "group"),
        },
        {
            value: t.peoplePicker.people,
            items: shown.filter((entry) => entry.kind === "person"),
        },
    ].filter((section) => section.items.length > 0);

    const status = !onSearch
        ? null
        : pending
          ? "searching"
          : searchError
            ? "error"
            : !trimmed && current.length === 0
              ? "idle"
              : null;

    const rootProps = {
        open,
        onOpenChange: setOpen,
        disabled,
        onInputValueChange: (next: string, details: { reason: string }) =>
            type(next, details.reason),
        onOpenChangeComplete: (isOpen: boolean) => {
            if (!isOpen) setQuery("");
        },
        itemToStringLabel: (entry: Entry) => entry.label,
        itemToStringValue: (entry: Entry) => entry.value,
        isItemEqualToValue: (a: Entry, b: Entry) => a.value === b.value,
        filter: null,
        ...(name !== undefined && { name }),
    };

    const trigger = (
        <BaseCombobox.Trigger
            className="zse-combobox-button zse-combobox-trigger"
            aria-label={t.combobox.showList}
        >
            <Icon icon={ArrowDown01Icon} />
        </BaseCombobox.Trigger>
    );

    const popup = (
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
                                <Spokes
                                    size={14}
                                    className="zse-combobox-spinner"
                                />
                                {t.combobox.searching}
                            </>
                        )}
                        {status === "error" && t.combobox.searchFailed}
                        {status === "idle" && t.combobox.startTyping}
                    </BaseCombobox.Status>
                    <ScrollArea maxHeight="min(var(--available-height), 20rem)">
                        <BaseCombobox.Empty className="zse-combobox-empty">
                            {status === null &&
                                (trimmed
                                    ? emptyText
                                        ? `${emptyText}: ${trimmed}`
                                        : t.combobox.emptyFor(trimmed)
                                    : (emptyText ?? t.combobox.empty))}
                        </BaseCombobox.Empty>
                        <BaseCombobox.List className="zse-combobox-list">
                            {(section: Section) => (
                                <BaseCombobox.Group
                                    key={section.value}
                                    items={section.items}
                                    className="zse-people-section"
                                >
                                    <BaseCombobox.GroupLabel className="zse-people-section-label">
                                        {section.value}
                                    </BaseCombobox.GroupLabel>
                                    <BaseCombobox.Collection>
                                        {(entry: Entry) => (
                                            <EntryItem
                                                key={entry.value}
                                                entry={entry}
                                                coveredBy={
                                                    entry.kind === "person"
                                                        ? coveredBy(entry.value)
                                                        : undefined
                                                }
                                                marks={ranges.get(entry.value)}
                                            />
                                        )}
                                    </BaseCombobox.Collection>
                                </BaseCombobox.Group>
                            )}
                        </BaseCombobox.List>
                    </ScrollArea>
                </BaseCombobox.Popup>
            </BaseCombobox.Positioner>
        </BaseCombobox.Portal>
    );

    return (
        <Field.Root
            className="zse-input zse-combobox zse-people"
            data-size={size}
            disabled={disabled}
            {...(error && { invalid: true })}
            {...(name !== undefined && { name })}
        >
            {label != null && label !== false && (
                <Field.Label className="zse-input-label">{label}</Field.Label>
            )}

            {single ? (
                <BaseCombobox.Root<Entry>
                    items={sections}
                    value={current[0] ?? null}
                    onValueChange={(entry) => change(entry ? [entry] : [])}
                    {...rootProps}
                >
                    <BaseCombobox.InputGroup className="zse-input-control zse-combobox-group">
                        {current[0] && (
                            <span className="zse-people-lead">
                                <EntryVisual entry={current[0]} />
                            </span>
                        )}
                        <BaseCombobox.Input
                            className="zse-combobox-input"
                            data-lead={current[0] ? "" : undefined}
                            {...(id !== undefined && { id })}
                            {...(placeholder !== undefined && { placeholder })}
                        />
                        <span className="zse-combobox-actions">{trigger}</span>
                    </BaseCombobox.InputGroup>
                    {popup}
                </BaseCombobox.Root>
            ) : (
                <BaseCombobox.Root<Entry, true>
                    items={sections}
                    multiple
                    value={current}
                    onValueChange={(next) => change(next)}
                    {...rootProps}
                >
                    <BaseCombobox.InputGroup
                        className="zse-input-control zse-combobox-group"
                        data-multiple
                    >
                        <BaseCombobox.Chips className="zse-combobox-chips">
                            {current.map((entry) => (
                                <BaseCombobox.Chip
                                    key={entry.value}
                                    className="zse-combobox-chip zse-people-chip"
                                    aria-label={
                                        entry.kind === "group"
                                            ? t.peoplePicker.groupChip(
                                                  entry.label,
                                                  entry.group.members.length,
                                              )
                                            : entry.label
                                    }
                                >
                                    <EntryVisual entry={entry} />
                                    <span className="zse-combobox-chip-label">
                                        {entry.label}
                                    </span>
                                    {entry.kind === "group" && (
                                        <span
                                            className="zse-people-chip-count"
                                            aria-hidden
                                        >
                                            {entry.group.members.length}
                                        </span>
                                    )}
                                    <BaseCombobox.ChipRemove
                                        className="zse-combobox-chip-remove"
                                        aria-label={t.common.remove(
                                            entry.label,
                                        )}
                                    >
                                        <Icon icon={Cancel01Icon} size={12} />
                                    </BaseCombobox.ChipRemove>
                                </BaseCombobox.Chip>
                            ))}
                            <BaseCombobox.Input
                                className="zse-combobox-input"
                                {...(id !== undefined && { id })}
                                {...(placeholder !== undefined &&
                                    current.length === 0 && { placeholder })}
                            />
                        </BaseCombobox.Chips>
                        <span className="zse-combobox-actions">{trigger}</span>
                    </BaseCombobox.InputGroup>
                    {popup}
                </BaseCombobox.Root>
            )}

            <FieldFooter error={error} hint={hint} />
        </Field.Root>
    );
}
