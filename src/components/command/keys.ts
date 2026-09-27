import { matchesShortcut, type Shortcut } from "../menu/shortcut";
import type { Command } from "./types";

// Po tylu ms bez kolejnego klawisza sekwencja przepada. Krótko, gdy samo
// „g” też jest skrótem i czeka na odpalenie; długo, gdy trzeba dokończyć,
// bo po 500 ms pokazuje się podpowiedź i ktoś musi zdążyć ją przeczytać.
// Escape, kliknięcie albo inny klawisz przerywa wcześniej.
const TIMEOUT_EXACT = 1200;
const TIMEOUT_HINT = 6000;

export const shortcutsOf = (command: Command): readonly Shortcut[] =>
    command.shortcut === undefined
        ? []
        : typeof command.shortcut === "string"
          ? [command.shortcut]
          : command.shortcut;

export const stepsOf = (shortcut: Shortcut) => shortcut.trim().split(/\s+/);

// Skrót bez Ctrl, ⌘ i Alt, np. „g u” albo „?”. Taki nie działa w polach
// tekstowych i otwartych oknach, bo tam te klawisze się pisze.
const isPlain = (step: string) =>
    !/(^|\+)(mod|ctrl|meta|cmd|alt|option)\+/i.test(step);

const MODIFIERS = new Set(["Shift", "Control", "Alt", "Meta", "CapsLock"]);

export function isTyping(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return false;
    return (
        target.isContentEditable ||
        target.closest(
            "input, textarea, select, [contenteditable]:not([contenteditable='false']), [role='menu'], [role='listbox']",
        ) !== null
    );
}

// W otwartym modalu skróty nie sięgają strony pod spodem.
export const inModal = (target: EventTarget | null) =>
    target instanceof Element &&
    target.closest("[role='dialog'], [role='alertdialog']") !== null;

interface Entry {
    command: Command;
    steps: string[];
}

export interface Pending {
    // Wciśnięte już kroki, np. ["g"].
    keys: readonly string[];
    // Co może być dalej: klawisz i polecenie.
    next: readonly { key: string; command: Command }[];
}

// Dopasowuje sekwencje klawiszy do poleceń. Pełne dopasowanie bez
// dłuższych kandydatów odpala od razu; „g” przy „g” i „g u” czeka na
// kolejny klawisz do końca czasu.
export function createSequencer(
    fire: (command: Command) => void,
    onPending: (pending: Pending | null) => void,
) {
    let position = 0;
    let candidates: Entry[] = [];
    let waiting: Command | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    function reset() {
        clearTimeout(timer);
        position = 0;
        candidates = [];
        waiting = null;
        onPending(null);
    }

    function step(event: KeyboardEvent, pool: Entry[]) {
        const typing = isTyping(event.target) || inModal(event.target);
        return pool.filter((entry) => {
            const key = entry.steps[position];
            return (
                key !== undefined &&
                !(typing && isPlain(key)) &&
                matchesShortcut(event, key)
            );
        });
    }

    return {
        reset,
        handle(event: KeyboardEvent, commands: readonly Command[]) {
            if (event.defaultPrevented || event.isComposing) return;
            if (MODIFIERS.has(event.key)) return;

            let matched = position > 0 ? step(event, candidates) : [];
            if (matched.length === 0) {
                // Zerwana sekwencja: klawisz może zaczynać nową.
                reset();
                const all = commands
                    .filter((command) => !command.disabled)
                    .flatMap((command) =>
                        shortcutsOf(command).map((shortcut) => ({
                            command,
                            steps: stepsOf(shortcut),
                        })),
                    );
                matched = step(event, all);
                if (matched.length === 0) return;
            }

            event.preventDefault();
            if (event.repeat) return;
            const done = matched.find(
                (entry) => entry.steps.length === position + 1,
            );
            const longer = matched.filter(
                (entry) => entry.steps.length > position + 1,
            );

            if (done && longer.length === 0) {
                reset();
                fire(done.command);
                return;
            }

            const keys = [...(longer[0]?.steps.slice(0, position + 1) ?? [])];
            position += 1;
            candidates = longer;
            waiting = done?.command ?? null;
            onPending({
                keys,
                next: longer.map((entry) => ({
                    key: entry.steps[position] ?? "",
                    command: entry.command,
                })),
            });
            clearTimeout(timer);
            timer = setTimeout(
                () => {
                    const command = waiting;
                    reset();
                    if (command) fire(command);
                },
                waiting ? TIMEOUT_EXACT : TIMEOUT_HINT,
            );
        },
    };
}
