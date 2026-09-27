import type { Command, CommandSource } from "./types";

export interface CommandSnapshot {
    commands: readonly Command[];
    sources: readonly CommandSource[];
}

// Rejestr poleceń jednej aplikacji: każdy komponent dokłada swoje
// (useCommands) i zabiera je przy odmontowaniu.
export function createCommandStore() {
    const commands = new Map<symbol, readonly Command[]>();
    const sources = new Map<symbol, CommandSource>();
    const listeners = new Set<() => void>();
    let snapshot: CommandSnapshot = { commands: [], sources: [] };

    function emit() {
        // Ten sam id później zarejestrowany wygrywa, np. strona nadpisuje
        // polecenie z layoutu.
        const byId = new Map<string, Command>();
        for (const list of commands.values())
            for (const command of list) {
                byId.delete(command.id);
                byId.set(command.id, command);
            }
        snapshot = {
            commands: [...byId.values()],
            sources: [...sources.values()],
        };
        for (const listener of listeners) listener();
    }

    return {
        subscribe(listener: () => void) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        getSnapshot: () => snapshot,
        setCommands(owner: symbol, list: readonly Command[] | null) {
            if (list) commands.set(owner, list);
            else commands.delete(owner);
            emit();
        },
        setSource(owner: symbol, source: CommandSource | null) {
            if (source) sources.set(owner, source);
            else sources.delete(owner);
            emit();
        },
    };
}

export type CommandStore = ReturnType<typeof createCommandStore>;

const EMPTY: CommandSnapshot = { commands: [], sources: [] };
export const emptySnapshot = () => EMPTY;

// Polecenia ze stałych podmenu też są szukane z głównej listy, np.
// „ciemny” znajduje Motyw › Ciemny.
export function flatten(
    commands: readonly Command[],
    parents: readonly Command[] = [],
): { command: Command; parents: readonly Command[] }[] {
    return commands.flatMap((command) => [
        { command, parents },
        ...(Array.isArray(command.children)
            ? flatten(command.children as readonly Command[], [
                  ...parents,
                  command,
              ])
            : []),
    ]);
}
