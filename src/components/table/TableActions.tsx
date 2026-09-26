"use client";

import { MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import type { ReactNode } from "react";

import { useMessages } from "../../i18n/context";
import { Icon, type IconGlyph } from "../icon/Icon";
import { Menu } from "../menu/Menu";
import { Tooltip } from "../tooltip/Tooltip";

export interface TableQuickAction {
    icon: IconGlyph;
    // Nazwa dla czytników i treść tooltipa, np. „Edytuj”.
    label: string;
    onClick: () => void;
    variant?: "default" | "danger";
    disabled?: boolean;
}

export interface TableActionsProps {
    // Akcje w menu „⋯”: MenuItem, MenuSeparator, MenuSub…
    children?: ReactNode;
    // Najczęstsze akcje jako ikony obok menu, np. edycja.
    quick?: readonly TableQuickAction[];
    // Nazwa przycisku menu z kontekstem wiersza, np. „Akcje: Anna Nowak”.
    // Bez niej czytnik słyszy w każdym wierszu to samo „Więcej akcji”.
    label?: string;
    // Przyciski widać dopiero po najechaniu na wiersz albo fokusie w nim.
    // Na dotyku są zawsze widoczne.
    revealOnHover?: boolean;
    // Kolumna przyklejona do prawej krawędzi przy przewijaniu w poziomie.
    sticky?: boolean;
}

const NO_ACTIONS: readonly TableQuickAction[] = [];

// Komórka z akcjami wiersza, zwykle ostatnia. Kliknięcie w nią nie wywołuje
// onClick wiersza, więc wiersz może jednocześnie otwierać szczegóły.
export function TableActions({
    children,
    quick = NO_ACTIONS,
    label,
    revealOnHover = false,
    sticky = false,
}: TableActionsProps) {
    const t = useMessages();

    return (
        // Wyłapuje kliknięcia przed onClick wiersza, sama nie jest kontrolką.
        // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
        <td
            className="zse-table-cell zse-table-actions"
            data-sticky={sticky ? "right" : undefined}
            data-reveal={revealOnHover || undefined}
            onClick={(event) => event.stopPropagation()}
        >
            <div className="zse-table-actions-row">
                {quick.map((action) => (
                    <Tooltip key={action.label} content={action.label}>
                        <button
                            type="button"
                            className="zse-table-action"
                            aria-label={action.label}
                            data-variant={action.variant}
                            disabled={action.disabled}
                            onClick={action.onClick}
                        >
                            <Icon icon={action.icon} size={16} />
                        </button>
                    </Tooltip>
                ))}
                {children != null && (
                    <Menu
                        align="end"
                        trigger={
                            <button
                                type="button"
                                className="zse-table-action"
                                aria-label={label ?? t.table.moreActions}
                            >
                                <Icon icon={MoreHorizontalIcon} size={16} />
                            </button>
                        }
                    >
                        {children}
                    </Menu>
                )}
            </div>
        </td>
    );
}

export interface TableActionsHeadProps {
    sticky?: boolean;
    // Inny tekst nagłówka niż „Akcje”.
    children?: ReactNode;
}

// Nagłówek kolumny akcji. Tekst jest widoczny, bo przy revealOnHover
// kolumna bez niego wygląda na pustą.
export function TableActionsHead({
    sticky = false,
    children,
}: TableActionsHeadProps) {
    const t = useMessages();

    return (
        <th
            scope="col"
            className="zse-table-head zse-table-actions"
            data-sticky={sticky ? "right" : undefined}
        >
            {children ?? t.table.actions}
        </th>
    );
}
