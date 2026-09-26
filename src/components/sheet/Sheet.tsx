"use client";

import { Drawer } from "@base-ui/react/drawer";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { useSyncExternalStore, type ReactElement, type ReactNode } from "react";

import { Icon } from "../icon/Icon";

type Side = "right" | "left" | "bottom";

export interface SheetProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: ReactElement<Record<string, unknown>>;
    title: ReactNode;
    description?: ReactNode;
    children?: ReactNode;
    footer?: ReactNode;
    // auto: od dołu na telefonie, z prawej od 640px.
    side?: Side | "auto";
    size?: "sm" | "md" | "lg";
    // Tylko od dołu: otwiera się do połowy ekranu, przeciągnięcie w górę
    // rozwija na całą wysokość, w dół zwija i zamyka.
    expandable?: boolean;
    // Własne wysokości zamiast expandable: 0–1 to część ekranu, liczba > 1
    // albo "px"/"rem" to wysokość. Pierwsza jest startowa.
    snapPoints?: Drawer.Root.SnapPoint[];
    closeLabel?: string;
}

const SWIPE = { right: "right", left: "left", bottom: "down" } as const;
const EXPANDABLE: Drawer.Root.SnapPoint[] = [0.5, 1];

const WIDE = "(min-width: 640px)";
function subscribe(onChange: () => void) {
    const query = matchMedia(WIDE);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
}
const useWide = () =>
    useSyncExternalStore(
        subscribe,
        () => matchMedia(WIDE).matches,
        () => false,
    );

export function Sheet({
    open,
    onOpenChange,
    trigger,
    title,
    description,
    children,
    footer,
    side = "right",
    size = "md",
    closeLabel = "Zamknij",
    expandable = false,
    snapPoints,
}: SheetProps) {
    const wide = useWide();
    const resolved: Side = side === "auto" ? (wide ? "right" : "bottom") : side;
    const snaps =
        resolved === "bottom"
            ? (snapPoints ?? (expandable ? EXPANDABLE : undefined))
            : undefined;

    return (
        <Drawer.Root
            swipeDirection={SWIPE[resolved]}
            {...(snaps && { snapPoints: snaps })}
            {...(open !== undefined && { open })}
            {...(onOpenChange && {
                onOpenChange: (next: boolean) => onOpenChange(next),
            })}
        >
            {trigger && <Drawer.Trigger render={trigger} />}
            <Drawer.Portal>
                <Drawer.Backdrop className="zse-sheet-backdrop" />
                <Drawer.Viewport
                    className="zse-sheet-viewport"
                    data-side={resolved}
                >
                    <Drawer.Popup
                        className="zse-sheet"
                        data-side={resolved}
                        data-size={size}
                        data-snap={snaps ? "" : undefined}
                    >
                        {resolved === "bottom" && (
                            <span className="zse-sheet-handle" aria-hidden />
                        )}
                        <div className="zse-sheet-header">
                            <div className="zse-sheet-heading">
                                <Drawer.Title className="zse-sheet-title">
                                    {title}
                                </Drawer.Title>
                                {description && (
                                    <Drawer.Description className="zse-sheet-description">
                                        {description}
                                    </Drawer.Description>
                                )}
                            </div>
                            {/* Od dołu zamyka się przeciągnięciem albo tapnięciem
                                w tło, więc X jest schowany. Zostaje dla czytnika
                                ekranu i klawiatury, bo gestu nie da się wykonać
                                z VoiceOverem ani Tabem. */}
                            <Drawer.Close
                                className="zse-modal-close"
                                data-hidden={
                                    resolved === "bottom" ? "" : undefined
                                }
                                aria-label={closeLabel}
                            >
                                <Icon icon={Cancel01Icon} size={14} />
                            </Drawer.Close>
                        </div>
                        <Drawer.Content className="zse-sheet-body">
                            {children}
                        </Drawer.Content>
                        {footer && (
                            <div className="zse-sheet-footer">{footer}</div>
                        )}
                    </Drawer.Popup>
                </Drawer.Viewport>
            </Drawer.Portal>
        </Drawer.Root>
    );
}

export const SheetClose = Drawer.Close;
