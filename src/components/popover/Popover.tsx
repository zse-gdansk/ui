"use client";

import { Popover as BasePopover } from "@base-ui/react/popover";
import type { CSSProperties, ReactElement, ReactNode } from "react";

import { CloseButton } from "../close-button/CloseButton";

type Side = "top" | "bottom" | "left" | "right";
type Align = "start" | "center" | "end";

export interface PopoverProps {
    trigger: ReactElement<Record<string, unknown>>;
    title?: ReactNode;
    description?: ReactNode;
    children?: ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    side?: Side;
    align?: Align;
    // Strzałka wskazująca wyzwalacz.
    arrow?: boolean;
    // X w rogu. Poza nim zamyka Escape i klik obok.
    closable?: boolean;
    // Otwiera się po najechaniu, np. podgląd ucznia. Na dotyku po tapnięciu.
    openOnHover?: boolean;
    width?: CSSProperties["width"];
    closeLabel?: string;
}

export function Popover({
    trigger,
    title,
    description,
    children,
    open,
    onOpenChange,
    side = "bottom",
    align = "center",
    arrow = false,
    closable = false,
    openOnHover = false,
    width,
    closeLabel,
}: PopoverProps) {
    const hasHeader = title != null || closable;

    return (
        <BasePopover.Root
            {...(open !== undefined && { open })}
            {...(onOpenChange && {
                onOpenChange: (next: boolean) => onOpenChange(next),
            })}
        >
            <BasePopover.Trigger
                render={trigger}
                openOnHover={openOnHover}
                {...(openOnHover && { delay: 300, closeDelay: 150 })}
            />
            <BasePopover.Portal>
                <BasePopover.Positioner
                    className="zse-popover-positioner"
                    side={side}
                    align={align}
                    sideOffset={arrow ? 10 : 6}
                    collisionPadding={8}
                >
                    <BasePopover.Popup
                        className="zse-popover"
                        style={width === undefined ? undefined : { width }}
                    >
                        {arrow && (
                            <BasePopover.Arrow className="zse-popover-arrow" />
                        )}
                        {hasHeader && (
                            <div className="zse-popover-header">
                                {title != null && (
                                    <BasePopover.Title className="zse-popover-title">
                                        {title}
                                    </BasePopover.Title>
                                )}
                                {closable && (
                                    <BasePopover.Close
                                        render={
                                            <CloseButton label={closeLabel} />
                                        }
                                    />
                                )}
                            </div>
                        )}
                        {description != null && (
                            <BasePopover.Description className="zse-popover-description">
                                {description}
                            </BasePopover.Description>
                        )}
                        {children != null && (
                            <div className="zse-popover-body">{children}</div>
                        )}
                    </BasePopover.Popup>
                </BasePopover.Positioner>
            </BasePopover.Portal>
        </BasePopover.Root>
    );
}

export const PopoverClose = BasePopover.Close;
