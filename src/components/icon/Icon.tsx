import { HugeiconsIcon } from "@hugeicons/react";
import type { ComponentProps } from "react";

export type IconProps = ComponentProps<typeof HugeiconsIcon>;
export type IconGlyph = IconProps["icon"];

export function Icon({
    size = 16,
    color = "currentColor",
    strokeWidth = 2,
    ...rest
}: IconProps) {
    return (
        <HugeiconsIcon
            size={size}
            color={color}
            strokeWidth={strokeWidth}
            {...rest}
        />
    );
}
