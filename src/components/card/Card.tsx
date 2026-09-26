"use client";

import { useRender } from "@base-ui/react/use-render";
import type { JSX } from "react";

const cx = (...names: (string | undefined)[]) =>
    names.filter(Boolean).join(" ");

export interface CardProps extends useRender.ComponentProps<"div"> {
    variant?: "outline" | "elevated" | "subtle";
}

export function Card({
    render,
    variant = "outline",
    className,
    ...props
}: CardProps) {
    return useRender({
        render,
        defaultTagName: "div",
        props: {
            ...props,
            "data-variant": variant,
            className: cx("zse-card", className),
        },
    });
}

function part<Tag extends keyof JSX.IntrinsicElements>(tag: Tag, base: string) {
    return function CardPart({
        render,
        className,
        ...props
    }: useRender.ComponentProps<Tag> & { className?: string }) {
        return useRender({
            render,
            defaultTagName: tag,
            props: { ...props, className: cx(base, className) },
        });
    };
}

export const CardHeader = part("div", "zse-card-header");
export const CardTitle = part("h3", "zse-card-title");
export const CardDescription = part("p", "zse-card-description");
export const CardContent = part("div", "zse-card-content");
export const CardFooter = part("div", "zse-card-footer");
