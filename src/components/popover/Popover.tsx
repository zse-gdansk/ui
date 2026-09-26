"use client";

import { Popover as BasePopover } from "@base-ui/react/popover";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import type { CSSProperties, ReactElement, ReactNode } from "react";

import { useMessages } from "../../i18n/context";
import { Icon } from "../icon/Icon";

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
    const t = useMessages();
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
                                        className="zse-modal-close"
                                        aria-label={
                                            closeLabel ?? t.common.close
                                        }
                                    >
                                        <Icon icon={Cancel01Icon} size={14} />
                                    </BasePopover.Close>
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
