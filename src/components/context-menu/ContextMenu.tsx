"use client";

import { ContextMenu as BaseContextMenu } from "@base-ui/react/context-menu";
import type { ReactElement, ReactNode } from "react";

export interface ContextMenuProps {
    // Obszar, na którym działa prawy przycisk, a na dotyku przytrzymanie
    // palcem (Base UI: 500ms, ruch palca anuluje). Np. wiersz albo
    // komórka tabeli: element zostaje sobą, bez dodatkowego diva.
    trigger: ReactElement<Record<string, unknown>>;
    // Te same części co w Menu: MenuItem, MenuSub, MenuSeparator…
    children: ReactNode;
    onOpenChange?: (open: boolean) => void;
}

// Na telefonie drgnięcie przy otwarciu, jak przy przytrzymaniu w systemie.
function vibrate() {
    if (matchMedia("(pointer: coarse)").matches) navigator.vibrate?.(10);
}

export function ContextMenu({
    trigger,
    children,
    onOpenChange,
}: ContextMenuProps) {
    return (
        <BaseContextMenu.Root
            onOpenChange={(next) => {
                if (next) vibrate();
                onOpenChange?.(next);
            }}
        >
            <BaseContextMenu.Trigger
                render={trigger}
                className="zse-context-trigger"
            />
            <BaseContextMenu.Portal>
                <BaseContextMenu.Positioner className="zse-menu-positioner">
                    <BaseContextMenu.Popup className="zse-menu">
                        {children}
                    </BaseContextMenu.Popup>
                </BaseContextMenu.Positioner>
            </BaseContextMenu.Portal>
        </BaseContextMenu.Root>
    );
}
