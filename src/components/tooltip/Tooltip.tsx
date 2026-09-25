"use client";

import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import {
    type PointerEvent,
    type ReactElement,
    type ReactNode,
    useRef,
    useState,
} from "react";

export interface TooltipProps {
    content: ReactNode;
    children: ReactElement<Record<string, unknown>>;
    side?: "top" | "bottom" | "left" | "right";
    delay?: number;
    disabled?: boolean;
}

export function Tooltip({
    content,
    children,
    side = "top",
    delay,
    disabled,
}: TooltipProps) {
    const [open, setOpen] = useState(false);
    const touch = useRef(false);

    // Na dotyku nie ma hovera: tapnięcie przełącza tooltip, zamyka go tap
    // obok albo Escape. Zdarzenia triggera (press, focus i emulowany po
    // tapnięciu hover) Base UI zamykałby od razu, więc są pomijane.
    function trackPointer(event: PointerEvent) {
        touch.current = event.pointerType === "touch";
    }

    return (
        <BaseTooltip.Root
            open={open}
            disabled={disabled}
            onOpenChange={(next, details) => {
                if (touch.current && details.reason.startsWith("trigger")) {
                    return;
                }
                setOpen(next);
            }}
        >
            <BaseTooltip.Trigger
                render={children}
                delay={delay}
                onPointerEnter={trackPointer}
                onPointerDown={(event) => {
                    trackPointer(event);
                    if (touch.current) setOpen((value) => !value);
                }}
            />
            <BaseTooltip.Portal>
                <BaseTooltip.Positioner
                    className="zse-tooltip-positioner"
                    side={side}
                    sideOffset={8}
                    collisionPadding={16}
                >
                    <BaseTooltip.Popup className="zse-tooltip">
                        {content}
                    </BaseTooltip.Popup>
                </BaseTooltip.Positioner>
            </BaseTooltip.Portal>
        </BaseTooltip.Root>
    );
}

export const TooltipProvider = BaseTooltip.Provider;
