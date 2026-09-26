"use client";

import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

type Animation = "shimmer" | "pulse" | false;

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
    shape?: "rect" | "circle" | "line";
    width?: CSSProperties["width"];
    height?: CSSProperties["height"];
    radius?: CSSProperties["borderRadius"];
    animation?: Animation;
    // Z children: szkielet ma dokładnie ich rozmiar, a po loading={false}
    // w tym miejscu pojawia się treść, bez przeskoku layoutu.
    loading?: boolean;
    children?: ReactNode;
}

const cx = (...names: (string | undefined)[]) =>
    names.filter(Boolean).join(" ");

export function Skeleton({
    shape = "rect",
    width,
    height,
    radius,
    animation = "shimmer",
    loading = true,
    className,
    style,
    children,
    ...props
}: SkeletonProps) {
    if (!loading) return <>{children}</>;
    const wraps = children != null;

    return (
        <span
            aria-hidden
            {...props}
            inert={wraps || undefined}
            data-shape={shape}
            data-animation={animation || undefined}
            data-wrap={wraps || undefined}
            className={cx("zse-skeleton", className)}
            style={{ width, height, borderRadius: radius, ...style }}
        >
            {children}
        </span>
    );
}

const WIDTHS = ["100%", "96%", "99%", "92%", "97%"];

export interface SkeletonTextProps extends HTMLAttributes<HTMLSpanElement> {
    lines?: number;
    animation?: Animation;
}

export function SkeletonText({
    lines = 3,
    animation = "shimmer",
    className,
    ...props
}: SkeletonTextProps) {
    return (
        <span
            aria-hidden
            {...props}
            className={cx("zse-skeleton-text", className)}
        >
            {Array.from({ length: lines }, (_, i) => (
                <Skeleton
                    // Linie są stałe, nie zmieniają kolejności.
                    // oxlint-disable-next-line react/no-array-index-key
                    key={i}
                    shape="line"
                    animation={animation}
                    width={
                        i === lines - 1 && lines > 1
                            ? "62%"
                            : WIDTHS[i % WIDTHS.length]
                    }
                />
            ))}
        </span>
    );
}
