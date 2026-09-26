"use client";

import { useRender } from "@base-ui/react/use-render";

export interface ContainerProps extends useRender.ComponentProps<"div"> {
    size?: "sm" | "md" | "lg" | "xl";
}

export function Container({
    render,
    size = "lg",
    className,
    ...props
}: ContainerProps) {
    return useRender({
        render,
        defaultTagName: "div",
        props: {
            ...props,
            "data-size": size,
            className: ["zse-container", className].filter(Boolean).join(" "),
        },
    });
}
