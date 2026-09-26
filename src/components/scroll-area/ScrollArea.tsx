"use client";

import {
    ArrowDown01Icon,
    ArrowLeft01Icon,
    ArrowRight01Icon,
    ArrowUp01Icon,
} from "@hugeicons/core-free-icons";
import type { CSSProperties, HTMLAttributes, PointerEvent } from "react";

import { Icon } from "../icon/Icon";

type Axis = "vertical" | "horizontal" | "both";
type Edge = "top" | "bottom" | "left" | "right";

const ICONS = {
    top: ArrowUp01Icon,
    bottom: ArrowDown01Icon,
    left: ArrowLeft01Icon,
    right: ArrowRight01Icon,
} as const;

const DIRECTIONS: Record<Edge, readonly [number, number]> = {
    top: [0, -1],
    bottom: [0, 1],
    left: [-1, 0],
    right: [1, 0],
};

const EDGES: Record<Axis, Edge[]> = {
    vertical: ["top", "bottom"],
    horizontal: ["left", "right"],
    both: ["top", "bottom", "left", "right"],
};

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
    axis?: Axis;
    maxHeight?: CSSProperties["maxHeight"];
    // Strzałki na krawędziach, po najechaniu myszą przewijają.
    arrows?: boolean;
    viewportClassName?: string;
}

function track(viewport: HTMLDivElement | null) {
    const root = viewport?.parentElement;
    if (!viewport || !root) return;
    const update = () => {
        const { scrollTop, scrollLeft, scrollHeight, scrollWidth } = viewport;
        const x = Math.abs(scrollLeft);
        root.toggleAttribute("data-scroll-top", scrollTop > 0.5);
        root.toggleAttribute(
            "data-scroll-bottom",
            Math.ceil(scrollTop) + viewport.clientHeight < scrollHeight - 0.5,
        );
        root.toggleAttribute("data-scroll-left", x > 0.5);
        root.toggleAttribute(
            "data-scroll-right",
            Math.ceil(x) + viewport.clientWidth < scrollWidth - 0.5,
        );
    };
    const resize = new ResizeObserver(update);
    const watch = () => {
        resize.disconnect();
        resize.observe(viewport);
        for (const child of viewport.children) resize.observe(child);
        update();
    };
    const mutations = new MutationObserver(watch);
    mutations.observe(viewport, { childList: true, subtree: true });
    watch();
    viewport.addEventListener("scroll", update, { passive: true });
    return () => {
        resize.disconnect();
        mutations.disconnect();
        viewport.removeEventListener("scroll", update);
    };
}

// Przewijanie, dopóki kursor jest nad strzałką. Przyspiesza przez pierwsze
// pół sekundy, żeby krótki najazd przesuwał o kawałek, a dłuższy szybko.
function autoScroll(event: PointerEvent<HTMLSpanElement>, edge: Edge) {
    if (event.pointerType !== "mouse") return;
    const cue = event.currentTarget;
    const viewport = cue.parentElement?.querySelector<HTMLElement>(
        ".zse-scroll-viewport",
    );
    if (!viewport) return;
    const [dx, dy] = DIRECTIONS[edge];
    const start = performance.now();
    let last = start;
    let frame = requestAnimationFrame(function step(now) {
        const speed = 0.25 + Math.min((now - start) / 500, 1) * 0.75;
        viewport.scrollBy(dx * speed * (now - last), dy * speed * (now - last));
        last = now;
        frame = requestAnimationFrame(step);
    });
    cue.addEventListener("pointerleave", () => cancelAnimationFrame(frame), {
        once: true,
    });
}

export function ScrollArea({
    axis = "vertical",
    maxHeight,
    arrows = true,
    viewportClassName,
    className,
    children,
    ...props
}: ScrollAreaProps) {
    return (
        <div
            {...props}
            data-axis={axis}
            className={["zse-scroll", className].filter(Boolean).join(" ")}
        >
            <div
                ref={track}
                className={["zse-scroll-viewport", viewportClassName]
                    .filter(Boolean)
                    .join(" ")}
                style={maxHeight === undefined ? undefined : { maxHeight }}
            >
                {children}
            </div>
            {arrows &&
                EDGES[axis].map((edge) => (
                    <span
                        key={edge}
                        className="zse-scroll-arrow"
                        data-edge={edge}
                        aria-hidden
                        onPointerEnter={(event) => autoScroll(event, edge)}
                    >
                        <Icon icon={ICONS[edge]} size={14} />
                    </span>
                ))}
        </div>
    );
}
