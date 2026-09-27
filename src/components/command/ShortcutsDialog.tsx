"use client";

import { Fragment, useSyncExternalStore } from "react";

import { useMessages } from "../../i18n/context";
import { Kbd } from "../kbd/Kbd";
import type { Shortcut } from "../menu/shortcut";
import { Modal } from "../modal/Modal";
import { ScrollArea } from "../scroll-area/ScrollArea";
import { useCommandState } from "./context";
import { shortcutsOf } from "./keys";
import { emptySnapshot, flatten } from "./store";

export interface ShortcutsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // Skrót palety (⌘K), pokazywany na górze razem z samym oknem.
    palette: Shortcut | false;
}

interface Entry {
    key: string;
    title: string;
    shortcuts: readonly Shortcut[];
}

// Wszystkie skróty z rejestru poleceń, w grupach jak w palecie. Lista buduje
// się sama, więc skrót dodany w useCommands od razu tu jest.
export function ShortcutsDialog({
    open,
    onOpenChange,
    palette,
}: ShortcutsDialogProps) {
    const t = useMessages();
    const { store } = useCommandState();
    const { commands } = useSyncExternalStore(
        store.subscribe,
        store.getSnapshot,
        emptySnapshot,
    );

    const groups = new Map<string, Entry[]>();
    if (palette)
        groups.set(t.command.help, [
            { key: "palette", title: t.command.label, shortcuts: [palette] },
        ]);
    for (const { command, parents } of flatten(commands)) {
        const shortcuts = shortcutsOf(command);
        if (shortcuts.length === 0 || command.disabled) continue;
        const group = parents[0]?.group ?? command.group ?? t.command.commands;
        const list = groups.get(group) ?? [];
        list.push({
            key: command.id,
            title: [
                ...parents.map((parent) => parent.title),
                command.title,
            ].join(" › "),
            shortcuts,
        });
        groups.set(group, list);
    }

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title={t.command.shortcuts}
            description={t.command.shortcutsHint}
        >
            <ScrollArea
                maxHeight="min(60dvh, 28rem)"
                arrows={false}
                className="zse-shortcuts-scroll"
            >
                <div className="zse-shortcuts">
                    {[...groups].map(([name, entries]) => (
                        <section key={name} className="zse-shortcuts-group">
                            <h3 className="zse-shortcuts-label">{name}</h3>
                            <dl className="zse-shortcuts-list">
                                {entries.map((entry) => (
                                    <div
                                        key={entry.key}
                                        className="zse-shortcuts-row"
                                    >
                                        <dt>{entry.title}</dt>
                                        <dd>
                                            {entry.shortcuts.map(
                                                (shortcut, index) => (
                                                    <Fragment key={shortcut}>
                                                        {index > 0 && (
                                                            <span className="zse-shortcuts-or">
                                                                {t.command.or}
                                                            </span>
                                                        )}
                                                        <Kbd
                                                            shortcut={shortcut}
                                                            size="sm"
                                                        />
                                                    </Fragment>
                                                ),
                                            )}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </section>
                    ))}
                </div>
            </ScrollArea>
        </Modal>
    );
}
