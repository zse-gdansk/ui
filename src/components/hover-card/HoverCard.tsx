"use client";

import { PreviewCard } from "@base-ui/react/preview-card";
import {
    useState,
    type CSSProperties,
    type ReactElement,
    type ReactNode,
} from "react";

import { useMessages } from "../../i18n/context";
import { useAbortableTask } from "../../utils/effects";
import { Avatar } from "../avatar/Avatar";
import { Skeleton, SkeletonText } from "../skeleton/Skeleton";

export interface HoverCardProps {
    // Tekst linku, np. imię i nazwisko.
    children: ReactNode;
    href?: string;
    // Link routera zamiast <a>, np. <Link href="/uczniowie/12" />.
    render?: ReactElement<Record<string, unknown>>;
    // Treść karty albo funkcja, która ją wczyta przy pierwszym otwarciu
    // (np. profil z API); wynik zostaje na kolejne otwarcia.
    content: ReactNode | ((signal: AbortSignal) => Promise<ReactNode>);
    side?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";
    width?: CSSProperties["width"];
    // Opóźnienie otwarcia w ms, żeby przesunięcie kursora przez tekst nie
    // otwierało kart.
    delay?: number;
    className?: string;
}

// Podgląd po najechaniu na link, np. mini-profil osoby albo szczegóły
// wydarzenia. Tylko dodatek dla myszy: do treści karty nie wchodzi się
// klawiaturą, dotykiem ani czytnikiem, więc nie ma w niej przycisków ani
// niczego, czego nie ma na stronie pod linkiem.
export function HoverCard({
    children,
    href,
    render,
    content,
    side = "top",
    align = "center",
    width = 280,
    delay = 400,
    className,
}: HoverCardProps) {
    const t = useMessages();
    const lazy = typeof content === "function";
    const [open, setOpen] = useState(false);
    const [loaded, setLoaded] = useState<
        { node: ReactNode } | { failed: true } | null
    >(null);

    // Wczytanie przy pierwszym otwarciu; zamknięcie w trakcie przerywa.
    useAbortableTask(
        lazy && open && !loaded ? "load" : null,
        async (signal) => {
            if (typeof content !== "function") return;
            try {
                const node = await content(signal);
                if (!signal.aborted) setLoaded({ node });
            } catch {
                if (!signal.aborted) setLoaded({ failed: true });
            }
        },
    );

    const body = !lazy ? (
        content
    ) : loaded && "node" in loaded ? (
        loaded.node
    ) : loaded ? (
        <p className="zse-hovercard-failed">{t.hoverCard.failed}</p>
    ) : (
        <div className="zse-hovercard-loading" aria-hidden>
            <Skeleton shape="circle" width={40} height={40} />
            <SkeletonText lines={2} />
        </div>
    );

    return (
        <PreviewCard.Root onOpenChange={setOpen}>
            <PreviewCard.Trigger
                className={["zse-hovercard-trigger", className]
                    .filter(Boolean)
                    .join(" ")}
                delay={delay}
                closeDelay={150}
                {...(href !== undefined && { href })}
                {...(render && { render })}
            >
                {children}
            </PreviewCard.Trigger>
            <PreviewCard.Portal>
                <PreviewCard.Positioner
                    className="zse-hovercard-positioner"
                    side={side}
                    align={align}
                    sideOffset={8}
                    collisionPadding={12}
                >
                    <PreviewCard.Popup
                        className="zse-hovercard"
                        style={{ width }}
                    >
                        {body}
                    </PreviewCard.Popup>
                </PreviewCard.Positioner>
            </PreviewCard.Portal>
        </PreviewCard.Root>
    );
}

export interface ProfilePreviewProps {
    name: string;
    avatar?: string;
    // Rola albo klasa pod imieniem, np. „Uczennica 3C” albo „Nauczyciel fizyki”.
    subtitle?: ReactNode;
    // Znacznik w linii roli, np. <Badge>Kandydatka</Badge>.
    badge?: ReactNode;
    // Kilka krótkich faktów: etykieta i wartość.
    details?: readonly { label: string; value: ReactNode }[];
}

// Gotowa treść karty osoby: awatar, imię, rola i kilka faktów.
export function ProfilePreview({
    name,
    avatar,
    subtitle,
    badge,
    details,
}: ProfilePreviewProps) {
    return (
        <div className="zse-profile-preview">
            <div className="zse-profile-preview-head">
                <Avatar
                    name={name}
                    size="lg"
                    {...(avatar !== undefined && { src: avatar })}
                />
                <div className="zse-profile-preview-name">
                    <span className="zse-profile-preview-title">{name}</span>
                    {/* Znacznik w linii roli: imię zostaje w jednej linii. */}
                    {(subtitle != null || badge != null) && (
                        <span className="zse-profile-preview-subtitle">
                            {subtitle != null && <span>{subtitle}</span>}
                            {badge}
                        </span>
                    )}
                </div>
            </div>
            {details && details.length > 0 && (
                <dl className="zse-profile-preview-details">
                    {details.map((detail) => (
                        <div key={detail.label}>
                            <dt>{detail.label}</dt>
                            <dd>{detail.value}</dd>
                        </div>
                    ))}
                </dl>
            )}
        </div>
    );
}
