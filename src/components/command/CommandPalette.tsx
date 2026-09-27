"use client";

import { Autocomplete } from "@base-ui/react/autocomplete";
import { Dialog } from "@base-ui/react/dialog";
import {
    ArrowLeft01Icon,
    ArrowRight01Icon,
    Search01Icon,
} from "@hugeicons/core-free-icons";
import {
    useEffect,
    useEffectEvent,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    useSyncExternalStore,
    type KeyboardEvent,
} from "react";

import { useMessages } from "../../i18n/context";
import { Highlight } from "../../search/Highlight";
import { createSearch, type Range, type SearchKey } from "../../search/search";
import { Avatar } from "../avatar/Avatar";
import { Icon } from "../icon/Icon";
import { Kbd } from "../kbd/Kbd";
import { ScrollArea } from "../scroll-area/ScrollArea";
import { Spokes } from "../spinner/Spinner";
import {
    ROOT,
    pageFor,
    stepPage,
    useCommandState,
    type CommandPage,
} from "./context";
import { shortcutsOf } from "./keys";
import { emptySnapshot, flatten } from "./store";
import type {
    Command,
    CommandContext,
    CommandOption,
    CommandStep,
    CommandTextStep,
    CommandValues,
} from "./types";

// Wiersz listy: polecenie, opcja kroku albo zatwierdzenie tekstu.
interface Row {
    key: string;
    kind: "command" | "option" | "submit";
    title: string;
    subtitle?: string | undefined;
    icon?: Command["icon"];
    avatar?: Command["avatar"];
    shortcut?: string | undefined;
    danger?: boolean | undefined;
    disabled?: boolean | undefined;
    // Wpisany tekst nie przechodzi walidacji; komunikat w subtitle.
    invalid?: boolean;
    // Otwiera kolejną stronę: podmenu albo pierwszy krok.
    deeper?: boolean;
    ranges?: Record<string, Range[]>;
    command?: Command;
    option?: CommandOption;
}

interface RowGroup {
    value: string;
    items: Row[];
}

interface Indexed {
    command: Command;
    path: string;
}

const COMMAND_KEYS: SearchKey<Indexed>[] = [
    { name: "title", get: (entry) => entry.command.title },
    {
        name: "keywords",
        get: (entry) => entry.command.keywords?.join(" "),
        weight: 0.8,
    },
    { name: "subtitle", get: (entry) => entry.command.subtitle, weight: 0.5 },
    { name: "path", get: (entry) => entry.path, weight: 0.4 },
];

// Wyniki z serwera: bez ścieżki, bo nie leżą w drzewie poleceń.
const REMOTE_KEYS: SearchKey<Command>[] = [
    "title",
    {
        name: "keywords",
        get: (command) => command.keywords?.join(" "),
        weight: 0.8,
    },
    { name: "subtitle", get: (command) => command.subtitle, weight: 0.5 },
];

const OPTION_KEYS: SearchKey<CommandOption>[] = [
    "label",
    {
        name: "keywords",
        get: (option) => option.keywords?.join(" "),
        weight: 0.8,
    },
    { name: "subtitle", get: (option) => option.subtitle, weight: 0.5 },
];

const RESULT_LIMIT = 40;
// Polecenia bez dopasowań z przerwami (35 i mniej): „ziel” nie znajduje
// „Nauczyciele” przez rozsypane z, i, e, l. Literówka (45) zostaje.
const COMMAND_THRESHOLD = 40;
const DELAY = 150;

// Indeksy stałych list liczone raz na tablicę, a nie przy każdym znaku.
const childIndexes = new WeakMap<
    readonly Command[],
    ReturnType<typeof createSearch<Indexed>>
>();
const optionIndexes = new WeakMap<
    readonly CommandOption[],
    ReturnType<typeof createSearch<CommandOption>>
>();

function childrenSearch(children: readonly Command[]) {
    let search = childIndexes.get(children);
    if (!search) {
        search = createSearch(
            children.map((command) => ({ command, path: "" })),
            { keys: COMMAND_KEYS },
        );
        childIndexes.set(children, search);
    }
    return search;
}

function optionsSearch(options: readonly CommandOption[]) {
    let search = optionIndexes.get(options);
    if (!search) {
        search = createSearch(options, { keys: OPTION_KEYS });
        optionIndexes.set(options, search);
    }
    return search;
}

function commandRow(
    command: Command,
    group: string,
    ranges?: Record<string, Range[]>,
    path?: string,
): Row {
    return {
        key: `${group}\u0000${command.id}`,
        kind: "command",
        title: command.title,
        subtitle: command.subtitle ?? (path || undefined),
        icon: command.icon,
        avatar: command.avatar,
        shortcut: shortcutsOf(command)[0],
        danger: command.danger,
        disabled: command.disabled,
        deeper: Boolean(command.children || command.steps?.length),
        ...(ranges && { ranges }),
        command,
    };
}

function optionRow(
    option: CommandOption,
    ranges?: Record<string, Range[]>,
): Row {
    return {
        key: `option\u0000${option.value}`,
        kind: "option",
        title: option.label,
        subtitle: option.subtitle,
        icon: option.icon,
        avatar: option.avatar,
        disabled: option.disabled,
        ...(ranges && { ranges }),
        option,
    };
}

// Grupy w kolejności pierwszego wystąpienia, więc przy wyszukiwaniu
// pierwsza jest grupa z najlepszym wynikiem.
function groupRows(
    rows: readonly { group: string; row: Row; score?: number }[],
) {
    const groups = new Map<string, { items: Row[]; best: number }>();
    for (const { group, row, score = 0 } of rows) {
        const entry = groups.get(group) ?? { items: [], best: 0 };
        entry.items.push(row);
        entry.best = Math.max(entry.best, score);
        groups.set(group, entry);
    }
    // Przy wyszukiwaniu wyżej grupa z najlepszym trafieniem, także z
    // serwera: „ziel” to najpierw uczniowie, potem polecenia. Bez wyniku
    // (pusta fraza) kolejność rejestracji.
    return [...groups]
        .toSorted((a, b) => b[1].best - a[1].best)
        .map(([value, { items }]) => ({ value, items }));
}

// Podświetlenie wyników z serwera tym samym algorytmem co lokalne, ale bez
// odrzucania: serwer mógł dopasować po czymś, czego nie widać.
function highlightAll<T>(
    items: readonly T[],
    query: string,
    keys: SearchKey<T>[],
) {
    const found = new Map(
        createSearch(items, { keys, threshold: 0 })(query).map((result) => [
            result.item,
            result,
        ]),
    );
    return items.map((item) => ({
        item,
        ranges: found.get(item)?.ranges,
        score: found.get(item)?.score ?? 0,
    }));
}

interface Remote<T> {
    // Zapytanie, dla którego są te wyniki; inne niż bieżące = wczytywanie.
    query: string;
    items: readonly T[];
    failed: boolean;
}

interface Job<T> {
    id: string;
    query: string;
    run: (signal: AbortSignal) => Promise<readonly T[]>;
}

// Kilka wyszukiwań naraz (źródła w głównej liście albo jedno podmenu).
// Poprzednie wyniki zostają do przyjścia nowych, bez mignięcia pustej listy.
function useRemote<T>(jobs: readonly Job<T>[]) {
    const [results, setResults] = useState<Record<string, Remote<T>>>({});
    const signature = jobs
        .map((job) => `${job.id}\u0000${job.query}`)
        .join("\u0001");
    const current = useEffectEvent(() => jobs);

    useEffect(() => {
        if (!signature) return;
        const list = current();
        const controller = new AbortController();
        const settle = (job: Job<T>, items: readonly T[], failed: boolean) => {
            if (controller.signal.aborted) return;
            setResults((previous) => ({
                ...previous,
                [job.id]: { query: job.query, items, failed },
            }));
        };
        // Pierwsze wczytanie podmenu bez czekania, pisanie z opóźnieniem.
        const delay = list.every((job) => job.query === "") ? 0 : DELAY;
        const timer = setTimeout(() => {
            for (const job of list)
                job.run(controller.signal).then(
                    (items) => settle(job, items, false),
                    () => settle(job, [], true),
                );
        }, delay);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [signature]);

    return jobs.map((job) => {
        const result = results[job.id];
        return {
            id: job.id,
            items: result?.items ?? [],
            pending: result?.query !== job.query,
            failed: result?.query === job.query && result.failed,
        };
    });
}

const isThenable = (value: unknown): value is PromiseLike<unknown> =>
    typeof (value as PromiseLike<unknown> | null)?.then === "function";

function textError(
    step: CommandTextStep,
    value: string,
    values: CommandValues,
    required: string,
) {
    if (!value.trim()) return step.optional ? null : required;
    return step.validate?.(value.trim(), values) ?? null;
}

// Wysokość listy płynnie za treścią, bez skoku przy filtrowaniu. Pierwszy
// pomiar bez animacji, żeby paleta nie rosła przy otwarciu.
function measure(content: HTMLDivElement | null) {
    const body =
        content?.parentElement?.closest<HTMLElement>(".zse-command-body");
    if (!content || !body) return;
    let frame = 0;
    const resize = new ResizeObserver(() => {
        body.style.setProperty(
            "--command-content",
            `${content.offsetHeight}px`,
        );
        if (!body.hasAttribute("data-ready"))
            frame = requestAnimationFrame(() =>
                body.setAttribute("data-ready", ""),
            );
    });
    resize.observe(content);
    return () => {
        cancelAnimationFrame(frame);
        resize.disconnect();
        body.removeAttribute("data-ready");
    };
}

export interface CommandPaletteProps {
    placeholder?: string;
}

export function CommandPalette({ placeholder }: CommandPaletteProps) {
    const t = useMessages();
    const {
        store,
        open,
        setOpen,
        stack,
        setStack,
        navigate,
        recent,
        remember,
    } = useCommandState();
    const { commands, sources } = useSyncExternalStore(
        store.subscribe,
        store.getSnapshot,
        emptySnapshot,
    );
    const page = stack.at(-1) ?? ROOT;
    const { query } = page;
    const trimmed = query.trim();
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    // Klucz, nie obiekt wiersza: wiersze powstają od nowa w każdym renderze,
    // a Base UI zgłasza podświetlenie przy każdej zmianie items. Ten sam
    // string nie wywołuje renderu, więc nie ma pętli.
    const [highlighted, setHighlighted] = useState<string | undefined>();
    const bodyRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const step: CommandStep | undefined =
        page.kind === "step" ? page.command.steps?.[page.index] : undefined;

    // Indeks całego drzewa stałych poleceń do wyszukiwania z głównej listy.
    const indexed = useMemo(() => {
        const entries = flatten(commands)
            .filter(({ command, parents }) =>
                [command, ...parents].every((item) => !item.hidden),
            )
            .map(({ command, parents }) => ({
                command,
                path: parents.map((parent) => parent.title).join(" › "),
                group: parents[0]?.group ?? command.group ?? t.command.commands,
            }));
        return {
            entries,
            search: createSearch(entries, {
                keys: COMMAND_KEYS,
                threshold: COMMAND_THRESHOLD,
            }),
        };
    }, [commands, t.command.commands]);

    const parent = page.kind === "list" ? page.command : null;
    const childSearch = Array.isArray(parent?.children)
        ? childrenSearch(parent.children as readonly Command[])
        : null;
    const optionSearch =
        step?.type === "choice" && Array.isArray(step.options)
            ? optionsSearch(step.options as readonly CommandOption[])
            : null;

    // Co trzeba zapytać na serwerze dla tej strony.
    const jobs: Job<Command | CommandOption>[] = [];
    if (open && page.kind === "list" && page.command === null && trimmed)
        for (const source of sources)
            if (trimmed.length >= (source.minLength ?? 2))
                jobs.push({
                    id: `source:${source.id}`,
                    query: trimmed,
                    run: (signal) => source.search(trimmed, signal),
                });
    const children = page.kind === "list" ? page.command?.children : undefined;
    if (open && typeof children === "function")
        jobs.push({
            id: `children:${page.command?.id}`,
            query: trimmed,
            run: (signal) => children(trimmed, signal),
        });
    const options = step?.type === "choice" ? step.options : undefined;
    if (open && page.kind === "step" && typeof options === "function")
        jobs.push({
            id: `step:${page.command.id}:${step?.id}`,
            query: trimmed,
            run: (signal) => options(trimmed, signal, page.values),
        });
    const remote = useRemote(jobs);
    const remoteOf = (id: string) => remote.find((result) => result.id === id);
    const searching = remote.some((result) => result.pending);
    const failed = remote.some((result) => result.failed);

    const groups: RowGroup[] = (() => {
        if (page.kind === "step" && step) {
            if (step.type === "choice") {
                const label = step.label;
                if (optionSearch)
                    return [
                        {
                            value: label,
                            items: optionSearch(query).map((result) =>
                                optionRow(result.item, result.ranges),
                            ),
                        },
                    ];
                const result = remoteOf(`step:${page.command.id}:${step.id}`);
                return [
                    {
                        value: label,
                        items: highlightAll(
                            (result?.items ?? []) as CommandOption[],
                            query,
                            OPTION_KEYS,
                        ).map(({ item, ranges }) => optionRow(item, ranges)),
                    },
                ];
            }
            const message = textError(
                step,
                query,
                page.values,
                t.command.required,
            );
            const last = page.index === (page.command.steps?.length ?? 0) - 1;
            return [
                {
                    value: step.label,
                    items: [
                        {
                            key: `submit\u0000${step.id}`,
                            kind: "submit" as const,
                            title:
                                trimmed ||
                                (step.placeholder ??
                                    t.command.typeValue(step.label)),
                            subtitle: trimmed
                                ? (message ?? undefined)
                                : undefined,
                            disabled: message !== null,
                            invalid: Boolean(trimmed && message),
                            deeper: !last,
                        },
                    ],
                },
            ];
        }

        if (page.command) {
            const group = "";
            if (childSearch)
                return [
                    {
                        value: group,
                        items: childSearch(query)
                            .filter((result) => !result.item.command.hidden)
                            .map((result) =>
                                commandRow(
                                    result.item.command,
                                    group,
                                    result.ranges,
                                ),
                            ),
                    },
                ];
            const result = remoteOf(`children:${page.command.id}`);
            return [
                {
                    value: group,
                    items: highlightAll(
                        (result?.items ?? []) as Command[],
                        query,
                        REMOTE_KEYS,
                    ).map(({ item, ranges }) =>
                        commandRow(item, group, ranges),
                    ),
                },
            ];
        }

        if (!trimmed) {
            const visible = commands.filter(
                (command) => !command.hidden && !command.searchOnly,
            );
            const recentRows = recent
                .map((id) =>
                    indexed.entries.find((entry) => entry.command.id === id),
                )
                .filter((entry) => entry !== undefined)
                .map((entry) => ({
                    group: t.command.recent,
                    row: commandRow(
                        entry.command,
                        t.command.recent,
                        undefined,
                        entry.path,
                    ),
                }));
            return groupRows([
                ...recentRows,
                ...visible.map((command) => {
                    const group = command.group ?? t.command.commands;
                    return { group, row: commandRow(command, group) };
                }),
            ]);
        }

        const local = indexed
            .search(query)
            .slice(0, RESULT_LIMIT)
            .map(({ item, ranges, score }) => ({
                group: item.group,
                row: commandRow(item.command, item.group, ranges, item.path),
                score,
            }));
        const found = sources.flatMap((source) =>
            highlightAll(
                (remoteOf(`source:${source.id}`)?.items ?? []) as Command[],
                query,
                REMOTE_KEYS,
            ).map(({ item, ranges, score }) => ({
                group: source.group,
                row: commandRow(item, source.group, ranges),
                score,
            })),
        );
        return groupRows([...local, ...found]);
    })().filter((group) => group.items.length > 0);

    const empty = groups.length === 0;
    const rows = groups.flatMap((group) => group.items);
    const current = rows.find((row) => row.key === highlighted) ?? rows[0];

    function update(next: CommandPage) {
        setStack([...stack.slice(0, -1), next]);
    }

    function push(next: CommandPage) {
        setError(null);
        setStack([...stack, next]);
    }

    function back() {
        if (stack.length <= 1) return false;
        setError(null);
        setStack(stack.slice(0, -1));
        return true;
    }

    async function execute(
        command: Command,
        values: CommandValues,
        labels: CommandValues,
    ) {
        if (command.href !== undefined) {
            remember(command.id);
            setOpen(false);
            navigate(command.href);
            return;
        }
        if (!command.perform) return;
        const context: CommandContext = { values, labels, navigate };
        setError(null);
        try {
            const result = command.perform(context);
            if (isThenable(result)) {
                setBusy(command.id);
                await result;
            }
        } catch {
            setBusy(null);
            setError(t.command.failed);
            return;
        }
        setBusy(null);
        remember(command.id);
        if (command.keepOpen) return;
        setOpen(false);
    }

    // Kolejny krok akcji albo jej wykonanie po ostatnim.
    function advance(values: CommandValues, labels: CommandValues) {
        if (page.kind !== "step") return;
        const next = stepPage(page.command, page.index + 1, values, labels);
        if (next) push(next);
        else void execute(page.command, values, labels);
    }

    function choose(row: Row) {
        if (row.disabled || busy) return;
        if (row.kind === "command" && row.command) {
            const next = pageFor(row.command);
            if (next) push(next);
            else void execute(row.command, {}, {});
            return;
        }
        if (page.kind !== "step" || !step) return;
        if (row.kind === "option" && row.option)
            advance(
                { ...page.values, [step.id]: row.option.value },
                { ...page.labels, [step.id]: row.option.label },
            );
        else if (row.kind === "submit")
            advance(
                { ...page.values, [step.id]: trimmed },
                { ...page.labels, [step.id]: trimmed },
            );
    }

    // Strzałka w prawo otwiera podmenu albo pierwszy krok, w lewo cofa.
    // Tylko z kursorem na końcu (w prawo) albo w pustym polu (w lewo), żeby
    // nie zabierać strzałek przy poprawianiu wpisanego tekstu.
    const opensDeeper = current?.kind === "command" && current.deeper === true;

    function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (busy) return;
        const input = event.currentTarget;
        const atEnd =
            input.selectionStart === input.value.length &&
            input.selectionEnd === input.value.length;
        const plain =
            !event.shiftKey &&
            !event.altKey &&
            !event.metaKey &&
            !event.ctrlKey;

        if (event.key === "Backspace" && query === "" && back())
            event.preventDefault();
        else if (event.key === "ArrowLeft" && plain && query === "" && back())
            event.preventDefault();
        else if (
            event.key === "ArrowRight" &&
            plain &&
            atEnd &&
            opensDeeper &&
            current
        ) {
            event.preventDefault();
            choose(current);
        }
    }

    // Nowa strona zaczyna od góry i wjeżdża lekko z boku: głębiej z prawej,
    // wstecz z lewej.
    const depth = stack.length;
    const previousDepth = useRef(depth);
    useLayoutEffect(() => {
        const from = previousDepth.current;
        previousDepth.current = depth;
        const viewport = bodyRef.current?.querySelector(".zse-scroll-viewport");
        if (viewport) viewport.scrollTop = 0;
        const content = bodyRef.current?.querySelector<HTMLElement>(
            ".zse-command-content",
        );
        if (from === depth || !content) return;
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const shift = depth > from ? 8 : -8;
        content.animate(
            [
                { opacity: 0, translate: `${shift}px 0` },
                { opacity: 1, translate: "0 0" },
            ],
            { duration: 160, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
        );
    }, [depth]);

    // Ścieżka nad polem: polecenie i wybrane już wartości kroków.
    const trail =
        page.kind === "list"
            ? stack.flatMap((item) =>
                  item.kind === "list" && item.command
                      ? [item.command.title]
                      : [],
              )
            : [
                  ...stack.flatMap((item) =>
                      item.kind === "list" && item.command
                          ? [item.command.title]
                          : [],
                  ),
                  page.command.title,
                  ...(page.command.steps ?? [])
                      .slice(0, page.index)
                      .map((item) => page.labels[item.id] ?? ""),
              ];

    const action = (() => {
        if (!current) return null;
        if (current.kind === "option") return t.command.pick;
        if (current.kind === "submit")
            return current.deeper ? t.command.next : t.command.save;
        if (current.deeper) return t.command.open;
        if (current.command?.href !== undefined) return t.command.go;
        return t.command.run;
    })();

    const inputPlaceholder =
        step?.placeholder ??
        (step ? t.command.typeValue(step.label) : undefined) ??
        page.command?.placeholder ??
        placeholder ??
        t.command.placeholder;

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(next, details) => {
                // Escape w podmenu cofa o stronę, na głównej liście zamyka.
                if (!next && details.reason === "escape-key" && back()) {
                    details.cancel();
                    return;
                }
                if (!next && busy) {
                    details.cancel();
                    return;
                }
                setOpen(next);
            }}
            onOpenChangeComplete={(next) => {
                if (next) return;
                setStack([ROOT]);
                setError(null);
                setBusy(null);
            }}
        >
            <Dialog.Portal>
                <Dialog.Backdrop className="zse-command-backdrop" />
                <Dialog.Viewport className="zse-command-viewport">
                    <Dialog.Popup
                        className="zse-command"
                        aria-label={t.command.label}
                        // Zawsze pole, także gdy skrót otwiera od razu krok
                        // i przycisk powrotu stoi przed nim.
                        initialFocus={inputRef}
                    >
                        <Autocomplete.Root
                            open
                            inline
                            items={groups}
                            filter={null}
                            autoHighlight="always"
                            keepHighlight
                            itemToStringValue={(row: Row) => row.title}
                            value={query}
                            onValueChange={(value, details) => {
                                if (
                                    details.reason === "input-change" ||
                                    details.reason === "input-clear"
                                )
                                    update({ ...page, query: value });
                            }}
                            onItemHighlighted={(row: Row | undefined) =>
                                setHighlighted(row?.key)
                            }
                        >
                            <div className="zse-command-header">
                                {depth > 1 ? (
                                    <button
                                        type="button"
                                        className="zse-command-back"
                                        aria-label={t.command.back}
                                        onClick={() => {
                                            back();
                                            // Przycisk znika na głównej
                                            // liście, fokus wraca do pola.
                                            inputRef.current?.focus();
                                        }}
                                    >
                                        <Icon
                                            icon={ArrowLeft01Icon}
                                            size={16}
                                        />
                                    </button>
                                ) : (
                                    <span className="zse-command-search-icon">
                                        <Icon icon={Search01Icon} size={16} />
                                    </span>
                                )}
                                {trail.length > 0 && (
                                    <ol
                                        className="zse-command-trail"
                                        aria-label={t.command.back}
                                    >
                                        {trail.map((item, index) => (
                                            // oxlint-disable-next-line react/no-array-index-key
                                            <li key={index}>{item}</li>
                                        ))}
                                    </ol>
                                )}
                                <Autocomplete.Input
                                    ref={inputRef}
                                    className="zse-command-input"
                                    aria-label={step?.label ?? t.command.search}
                                    placeholder={inputPlaceholder}
                                    readOnly={busy !== null}
                                    onKeyDown={onKeyDown}
                                    {...(step?.type !== "choice" &&
                                        step?.inputMode && {
                                            inputMode: step.inputMode,
                                        })}
                                />
                                <span
                                    className="zse-command-status"
                                    data-visible={searching || undefined}
                                >
                                    <Spokes size={16} />
                                </span>
                            </div>
                            <Dialog.Close className="zse-command-close">
                                {t.command.close}
                            </Dialog.Close>

                            <div ref={bodyRef} className="zse-command-body">
                                <ScrollArea
                                    arrows={false}
                                    className="zse-command-scroll"
                                >
                                    <div
                                        ref={measure}
                                        className="zse-command-content"
                                    >
                                        <Autocomplete.Empty>
                                            <div className="zse-command-empty">
                                                {searching
                                                    ? t.command.searching
                                                    : failed
                                                      ? t.command.searchFailed
                                                      : trimmed
                                                        ? t.command.emptyFor(
                                                              trimmed,
                                                          )
                                                        : t.command.empty}
                                            </div>
                                        </Autocomplete.Empty>
                                        <Autocomplete.List className="zse-command-list">
                                            {(group: RowGroup) => (
                                                <Autocomplete.Group
                                                    key={group.value}
                                                    items={group.items}
                                                    className="zse-command-group"
                                                >
                                                    {group.value && (
                                                        <Autocomplete.GroupLabel className="zse-command-group-label">
                                                            {group.value}
                                                        </Autocomplete.GroupLabel>
                                                    )}
                                                    <Autocomplete.Collection>
                                                        {(row: Row) => (
                                                            <CommandRow
                                                                key={row.key}
                                                                row={row}
                                                                busy={
                                                                    busy !==
                                                                        null &&
                                                                    (row.command
                                                                        ?.id ===
                                                                        busy ||
                                                                        row.kind ===
                                                                            "submit")
                                                                }
                                                                onChoose={
                                                                    choose
                                                                }
                                                            />
                                                        )}
                                                    </Autocomplete.Collection>
                                                </Autocomplete.Group>
                                            )}
                                        </Autocomplete.List>
                                    </div>
                                </ScrollArea>
                            </div>

                            <div className="zse-command-footer">
                                <span
                                    className="zse-command-footer-hint"
                                    data-error={error ? "" : undefined}
                                    role={error ? "alert" : undefined}
                                >
                                    {error ?? (
                                        <>
                                            <Kbd size="sm">{t.kbd.escape}</Kbd>
                                            {depth > 1
                                                ? t.command.back
                                                : t.command.close}
                                        </>
                                    )}
                                </span>
                                {action && !empty && (
                                    <span className="zse-command-footer-hint">
                                        {action}
                                        <Kbd shortcut="enter" size="sm" />
                                        {opensDeeper && (
                                            <Kbd
                                                shortcut="arrowright"
                                                size="sm"
                                            />
                                        )}
                                    </span>
                                )}
                            </div>
                        </Autocomplete.Root>
                    </Dialog.Popup>
                </Dialog.Viewport>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

function CommandRow({
    row,
    busy,
    onChoose,
}: {
    row: Row;
    busy: boolean;
    onChoose: (row: Row) => void;
}) {
    return (
        <Autocomplete.Item
            value={row}
            className="zse-command-item"
            disabled={row.disabled}
            data-kind={row.kind}
            data-variant={row.danger ? "danger" : undefined}
            data-invalid={row.invalid || undefined}
            onClick={() => onChoose(row)}
        >
            {row.avatar ? (
                <span className="zse-command-icon">
                    <Avatar
                        name={row.avatar.name}
                        size="xs"
                        {...(row.avatar.src !== undefined && {
                            src: row.avatar.src,
                        })}
                    />
                </span>
            ) : row.icon ? (
                <span className="zse-command-icon">
                    <Icon icon={row.icon} size={16} />
                </span>
            ) : null}
            <span className="zse-command-text">
                <span className="zse-command-title">
                    <Highlight
                        text={row.title}
                        ranges={row.ranges?.title ?? row.ranges?.label}
                    />
                </span>
                {row.subtitle && (
                    <span className="zse-command-subtitle">
                        <Highlight
                            text={row.subtitle}
                            ranges={row.ranges?.subtitle ?? row.ranges?.path}
                        />
                    </span>
                )}
            </span>
            {busy ? (
                <Spokes size={16} className="zse-command-busy" />
            ) : (
                <>
                    {row.shortcut && <Kbd shortcut={row.shortcut} size="sm" />}
                    {row.deeper && (
                        <span className="zse-command-chevron">
                            <Icon icon={ArrowRight01Icon} size={14} />
                        </span>
                    )}
                </>
            )}
        </Autocomplete.Item>
    );
}
