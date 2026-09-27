"use client";

import {
    useEffect,
    useEffectEvent,
    useLayoutEffect,
    useRef,
    useState,
    useSyncExternalStore,
    type ReactNode,
} from "react";

import { useMessages } from "../../i18n/context";
import { Kbd } from "../kbd/Kbd";
import { matchesShortcut, type Shortcut } from "../menu/shortcut";
import { toast } from "../toast/toast";
import { CommandPalette } from "./CommandPalette";
import {
    CommandStateContext,
    ROOT,
    pageFor,
    useCommandState,
    type CommandPage,
    type CommandState,
} from "./context";
import { createSequencer, type Pending } from "./keys";
import { createCommandStore, emptySnapshot, flatten } from "./store";
import type { Command, CommandContext, CommandSource } from "./types";

export interface CommandProviderProps {
    children: ReactNode;
    // Przejście pod href polecenia, np. router.push z Next.js.
    navigate?: (href: string) => void;
    // Otwiera i zamyka paletę; false bez skrótu.
    shortcut?: Shortcut | false;
    // Klucz localStorage ostatnio użytych poleceń; false bez pamiętania.
    recent?: string | false;
    placeholder?: string;
}

const RECENT_LIMIT = 5;

function readRecent(key: string | false) {
    if (!key) return [];
    try {
        const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
        return Array.isArray(parsed)
            ? parsed.filter((id): id is string => typeof id === "string")
            : [];
    } catch {
        return [];
    }
}

const defaultNavigate = (href: string) => location.assign(href);

// Paleta poleceń (⌘K) i skróty klawiszowe całej aplikacji. Polecenia
// rejestrują komponenty przez useCommands, więc strona dokłada swoje na
// czas, gdy jest otwarta.
export function CommandProvider({
    children,
    navigate = defaultNavigate,
    shortcut = "mod+k",
    recent: recentKey = "zse-command-recent",
    placeholder,
}: CommandProviderProps) {
    const t = useMessages();
    const [store] = useState(createCommandStore);
    const [open, setOpen] = useState(false);
    const [stack, setStack] = useState<readonly CommandPage[]>([ROOT]);
    // Paleta z listą rysuje się dopiero po otwarciu, więc odczyt przy
    // pierwszym renderze nie rozjedzie się z HTML-em z serwera.
    const [recent, setRecent] = useState<readonly string[]>(() =>
        readRecent(recentKey),
    );
    const [pending, setPending] = useState<Pending | null>(null);
    const { commands } = useSyncExternalStore(
        store.subscribe,
        store.getSnapshot,
        emptySnapshot,
    );

    function remember(id: string) {
        setRecent((previous) => {
            const next = [id, ...previous.filter((item) => item !== id)].slice(
                0,
                RECENT_LIMIT,
            );
            if (recentKey)
                try {
                    localStorage.setItem(recentKey, JSON.stringify(next));
                } catch {
                    // Bez pamięci (tryb prywatny) paleta działa dalej.
                }
            return next;
        });
    }

    // Skrót polecenia: podmenu i kroki otwierają paletę na tej stronie,
    // reszta działa od razu.
    const fire = useEffectEvent((command: Command) => {
        const page = pageFor(command);
        if (page) {
            setStack([ROOT, page]);
            setOpen(true);
            return;
        }
        if (command.href !== undefined) {
            navigate(command.href);
            return;
        }
        const context: CommandContext = { values: {}, labels: {}, navigate };
        Promise.resolve(command.perform?.(context)).catch(() =>
            toast.error(t.command.failed),
        );
    });

    const onKeyDown = useEffectEvent(
        (
            event: KeyboardEvent,
            sequencer: ReturnType<typeof createSequencer>,
        ) => {
            if (
                shortcut &&
                !event.defaultPrevented &&
                matchesShortcut(event, shortcut)
            ) {
                event.preventDefault();
                sequencer.reset();
                if (event.repeat) return;
                if (!open) setStack([ROOT]);
                setOpen(!open);
                return;
            }
            if (open) return;
            sequencer.handle(
                event,
                flatten(commands).map((entry) => entry.command),
            );
        },
    );

    useEffect(() => {
        const sequencer = createSequencer(fire, setPending);
        const listener = (event: KeyboardEvent) => onKeyDown(event, sequencer);
        // Kliknięcie gdziekolwiek albo wyjście z okna przerywa sekwencję.
        const cancel = () => sequencer.reset();
        window.addEventListener("keydown", listener);
        window.addEventListener("pointerdown", cancel);
        window.addEventListener("blur", cancel);
        return () => {
            window.removeEventListener("keydown", listener);
            window.removeEventListener("pointerdown", cancel);
            window.removeEventListener("blur", cancel);
            sequencer.reset();
        };
    }, []);

    const state: CommandState = {
        store,
        open,
        setOpen,
        stack,
        setStack,
        navigate,
        recent,
        remember,
    };

    return (
        <CommandStateContext value={state}>
            {children}
            <CommandPalette
                {...(placeholder !== undefined && { placeholder })}
            />
            <SequenceHint pending={pending} />
        </CommandStateContext>
    );
}

// Po pierwszym klawiszu sekwencji, gdy ktoś się zawaha: co może być dalej.
// Stale w drzewie, żeby gasło płynnie z ostatnią treścią.
function SequenceHint({ pending }: { pending: Pending | null }) {
    const t = useMessages();
    const [last, setLast] = useState(pending);
    if (pending && pending !== last) setLast(pending);
    const shown = pending ?? last;

    return (
        <output
            className="zse-command-hint"
            data-visible={pending ? "" : undefined}
            aria-live="polite"
        >
            {shown && (
                <>
                    <Kbd shortcut={shown.keys.join(" ")} size="sm" />
                    <span className="zse-command-hint-label">
                        {t.command.sequence}
                    </span>
                    <ul className="zse-command-hint-list">
                        {shown.next.slice(0, 6).map(({ key, command }) => (
                            <li key={`${command.id}-${key}`}>
                                <Kbd shortcut={key} size="sm" />
                                {command.title}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </output>
    );
}

export interface CommandPaletteControls {
    isOpen: boolean;
    // Bez id: główna lista; z id: od razu podmenu albo krok polecenia.
    open: (id?: string) => void;
    close: () => void;
    toggle: () => void;
}

export function useCommandPalette(): CommandPaletteControls {
    const { open, setOpen, setStack, store } = useCommandState();
    return {
        isOpen: open,
        open(id) {
            const command =
                id === undefined
                    ? undefined
                    : flatten(store.getSnapshot().commands).find(
                          (entry) => entry.command.id === id,
                      )?.command;
            const page = command ? pageFor(command) : null;
            setStack(page ? [ROOT, page] : [ROOT]);
            setOpen(true);
        },
        close: () => setOpen(false),
        toggle() {
            if (!open) setStack([ROOT]);
            setOpen(!open);
        },
    };
}

// Rejestruje polecenia na czas życia komponentu. Tablicę trzymaj stałą
// (poza komponentem albo w useMemo), bo każda nowa to ponowna rejestracja.
export function useCommands(commands: readonly Command[]) {
    const { store } = useCommandState();
    const [owner] = useState(() => Symbol("commands"));
    useEffect(
        () => store.setCommands(owner, commands),
        [store, owner, commands],
    );
    useEffect(() => () => store.setCommands(owner, null), [store, owner]);
}

// Wyniki z serwera w głównej liście, np. uczniowie po nazwisku. search może
// być nową funkcją przy każdym renderze; źródło rejestruje się ponownie
// tylko ze zmianą id, grupy albo progu.
export function useCommandSource(source: CommandSource) {
    const { store } = useCommandState();
    const [owner] = useState(() => Symbol("source"));
    const latest = useRef(source);
    useLayoutEffect(() => {
        latest.current = source;
    });
    const { id, group, minLength } = source;
    useEffect(
        () =>
            store.setSource(owner, {
                id,
                group,
                ...(minLength !== undefined && { minLength }),
                search: (query, signal) => latest.current.search(query, signal),
            }),
        [store, owner, id, group, minLength],
    );
    useEffect(() => () => store.setSource(owner, null), [store, owner]);
}
