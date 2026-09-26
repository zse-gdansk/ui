"use client";

import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import {
    Children,
    type CSSProperties,
    type HTMLAttributes,
    type ReactNode,
} from "react";

import { avatarVars, initials } from "./generate";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface AvatarProps {
    // Z imienia powstają inicjały, etykieta i seed generatora.
    name?: string;
    // Stały seed zamiast imienia, np. id albo mail, żeby zmiana nazwiska
    // nie zmieniała awatara.
    seed?: string;
    src?: string | undefined;
    size?: AvatarSize;
    shape?: "circle" | "square";
    // gradient: wygenerowany obraz, initials: inicjały na tle w kolorze
    // z seeda. Obie wersje tylko wtedy, gdy nie ma zdjęcia albo się nie
    // wczytało.
    fallback?: "gradient" | "initials";
    className?: string;
}

export function Avatar({
    name,
    seed,
    src,
    size = "md",
    shape = "circle",
    fallback = "gradient",
    className,
}: AvatarProps) {
    const key = seed ?? name ?? "";

    return (
        <BaseAvatar.Root
            className={["zse-avatar", className].filter(Boolean).join(" ")}
            data-size={size}
            data-shape={shape}
            // Całość to jeden obraz z nazwą osoby, niezależnie od tego, czy
            // w środku jest zdjęcie, gradient czy inicjały.
            // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
            role="img"
            aria-label={name}
            aria-hidden={name ? undefined : true}
            style={avatarVars(key) as CSSProperties}
        >
            {src && (
                <BaseAvatar.Image
                    className="zse-avatar-image"
                    src={src}
                    alt=""
                />
            )}
            <BaseAvatar.Fallback
                className="zse-avatar-fallback"
                data-variant={fallback}
                {...(src && { delay: 300 })}
            >
                {fallback === "initials" && name
                    ? // Na 20px mieści się czytelnie tylko jedna litera.
                      [...initials(name)].slice(0, size === "xs" ? 1 : 2)
                    : null}
            </BaseAvatar.Fallback>
        </BaseAvatar.Root>
    );
}

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    // Ile pokazać, reszta jako „+N”.
    max?: number;
    size?: AvatarSize;
    // Etykieta całej grupy, np. „Głosowali: Anna, Jan i 5 innych”.
    label?: string;
}

export function AvatarGroup({
    children,
    max,
    size = "md",
    label,
    className,
    ...props
}: AvatarGroupProps) {
    const items = Children.toArray(children);
    const shown = max === undefined ? items : items.slice(0, max);
    const rest = items.length - shown.length;

    return (
        <div
            role={label ? "group" : undefined}
            aria-label={label}
            {...props}
            data-size={size}
            className={["zse-avatar-group", className]
                .filter(Boolean)
                .join(" ")}
        >
            {shown}
            {rest > 0 && (
                <span
                    className="zse-avatar zse-avatar-more"
                    data-size={size}
                    data-shape="circle"
                >
                    +{rest}
                </span>
            )}
        </div>
    );
}
