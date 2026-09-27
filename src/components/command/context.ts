"use client";

import { createContext, useContext } from "react";

import type { CommandStore } from "./store";
import type { Command, CommandValues } from "./types";

export type CommandPage =
    | { kind: "list"; command: Command | null; query: string }
    | {
          kind: "step";
          command: Command;
          index: number;
          values: CommandValues;
          labels: CommandValues;
          query: string;
      };

export const ROOT: CommandPage = { kind: "list", command: null, query: "" };

export interface CommandState {
    store: CommandStore;
    open: boolean;
    setOpen: (open: boolean) => void;
    // Ścieżka stron od głównej listy; ostatnia jest widoczna.
    stack: readonly CommandPage[];
    setStack: (stack: readonly CommandPage[]) => void;
    navigate: (href: string) => void;
    recent: readonly string[];
    remember: (id: string) => void;
}

export const CommandStateContext = createContext<CommandState | null>(null);

export function useCommandState() {
    const state = useContext(CommandStateContext);
    if (!state)
        throw new Error("Paleta poleceń wymaga <CommandProvider> wyżej.");
    return state;
}

// Strona kroku akcji; tekst zaczyna od defaultValue z poprzednich wartości.
export function stepPage(
    command: Command,
    index: number,
    values: CommandValues,
    labels: CommandValues,
): CommandPage | null {
    const step = command.steps?.[index];
    if (!step) return null;
    const query =
        step.type === "choice"
            ? ""
            : typeof step.defaultValue === "function"
              ? step.defaultValue(values)
              : (step.defaultValue ?? "");
    return { kind: "step", command, index, values, labels, query };
}

// Strona, od której zaczyna się polecenie: podmenu albo pierwszy krok.
// Bez strony (null) polecenie wykonuje się od razu.
export function pageFor(command: Command): CommandPage | null {
    if (command.children) return { kind: "list", command, query: "" };
    return stepPage(command, 0, {}, {});
}
