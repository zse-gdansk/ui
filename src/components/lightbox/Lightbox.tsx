"use client";

import { Dialog } from "@base-ui/react/dialog";
import {
    Cancel01Icon,
    Download01Icon,
    SearchAddIcon,
    SearchMinusIcon,
} from "@hugeicons/core-free-icons";
import { useRef, useState, type RefObject } from "react";

import { useMessages } from "../../i18n/context";
import { useMountEffect } from "../../utils/effects";
import { Icon } from "../icon/Icon";
import { Spinner } from "../spinner/Spinner";
import { flipFrom, measureOrigin } from "./geometry";
import { useLightboxZoom } from "./useLightboxZoom";

export interface LightboxProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // Pełny plik, nie miniatura: powiększenie potrzebuje każdego piksela.
    src: string | undefined;
    // Opis zdjęcia, też tytuł na pasku i nazwa pobieranego pliku.
    alt: string;
    // Adres jeszcze się pobiera (np. podpisany link z API).
    loading?: boolean;
    // Miniatura, z której zdjęcie wyrasta i do której wraca.
    originRef?: RefObject<HTMLElement | null>;
}

const FRAME_RADIUS = 12;
// Lot z miniatury: ruch po ekranie, krzywa jak w panelach (--ease-drawer).
const MORPH = { duration: 400, easing: "cubic-bezier(0.32, 0.72, 0, 1)" };
const FADE = { duration: 200, easing: "cubic-bezier(0.23, 1, 0.32, 1)" };

const reducedMotion = () =>
    matchMedia("(prefers-reduced-motion: reduce)").matches;

// Przeglądarka zdjęcia na cały ekran: wyrasta z miniatury i do niej wraca;
// szczypanie, ctrl/⌘ + kółko, dwuklik i przyciski powiększają, przeciąganie
// przesuwa, na telefonie pionowe machnięcie zamyka. Zawsze ciemna.
export function Lightbox({
    open,
    onOpenChange,
    src,
    alt,
    loading = false,
    originRef,
}: LightboxProps) {
    const t = useMessages();
    const [size, setSize] = useState<{ width: number; height: number } | null>(
        null,
    );
    const frameRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const closing = useRef(false);
    // Wejście raz na otwarcie: kolejne rendery go nie powtarzają.
    const entered = useRef(false);
    // Pasek i tło gasną w CSS od razu, gdy zamykanie rusza.
    const [isClosing, setIsClosing] = useState(false);
    const hiddenOrigin = useRef<HTMLElement | null>(null);

    const showOrigin = () => {
        if (hiddenOrigin.current) hiddenOrigin.current.style.visibility = "";
        hiddenOrigin.current = null;
    };

    // Wyjście ze strony z otwartym podglądem nie zostawia ukrytej miniatury.
    useMountEffect(() => showOrigin);

    const {
        zoom: scale,
        pan,
        dragY,
        gesturing,
        zoomed,
        stage,
        handlers,
        wasDrag,
        zoomIn,
        zoomOut,
        reset,
        toggleAt,
    } = useLightboxZoom({
        image: () => imageRef.current,
        onDismiss: () => void close(),
    });

    async function close() {
        if (closing.current) return;
        closing.current = true;
        setIsClosing(true);
        const frame = frameRef.current;
        const aspect = size ? size.width / size.height : 1;
        const origin =
            zoomed || reducedMotion()
                ? null
                : measureOrigin(originRef?.current, aspect);

        if (frame && origin) {
            const to = flipFrom(
                origin.box,
                frame.getBoundingClientRect(),
                origin.radius,
            );
            await frame
                .animate(
                    { transform: to.transform, clipPath: to.clipPath },
                    { ...MORPH, fill: "forwards" },
                )
                .finished.catch(() => {});
        } else if (frame) {
            await frame
                .animate(
                    { opacity: 0, transform: "scale(0.96)" },
                    {
                        ...FADE,
                        duration: reducedMotion() ? 0 : FADE.duration,
                        fill: "forwards",
                    },
                )
                .finished.catch(() => {});
        }
        showOrigin();
        onOpenChange(false);
    }

    // Dopiero po zniknięciu okna: póki jest zamontowane, ref obrazka podpina
    // się przy renderze i wyzerowane entered powtórzyłoby wejście.
    function resetAfterClose() {
        showOrigin();
        reset();
        setSize(null);
        setIsClosing(false);
        entered.current = false;
        closing.current = false;
    }

    // Gdy obrazek ma piksele, a wszystkie refy są podpięte. Obrazek z pamięci
    // podręcznej jest gotowy przed ramką (dzieci podpinają się pierwsze),
    // więc wołający odkłada to o mikrozadanie.
    function tryEnter() {
        const image = imageRef.current;
        const frame = frameRef.current;
        if (!image || !frame || entered.current || closing.current) return;
        if (!image.complete || !image.naturalWidth) return;
        entered.current = true;
        frame.getAnimations().forEach((animation) => animation.cancel());
        setSize({ width: image.naturalWidth, height: image.naturalHeight });
        const reduce = reducedMotion();
        const origin = reduce
            ? null
            : measureOrigin(
                  originRef?.current,
                  image.naturalWidth / image.naturalHeight,
              );
        frame.style.opacity = "1";

        if (origin) {
            const from = flipFrom(
                origin.box,
                frame.getBoundingClientRect(),
                origin.radius,
            );
            hiddenOrigin.current = origin.image;
            origin.image.style.visibility = "hidden";
            // Bez fill: po locie ramka wraca do stylu bez transformu
            // i przycięcia, więc powiększone zdjęcie nie jest ucięte.
            frame.animate(
                {
                    transform: [from.transform, "translate(0px, 0px) scale(1)"],
                    clipPath: [
                        from.clipPath,
                        `inset(0px 0px 0px 0px round ${FRAME_RADIUS}px)`,
                    ],
                },
                MORPH,
            );
        } else {
            frame.animate(
                { opacity: [0, 1], transform: ["scale(0.96)", "scale(1)"] },
                { ...FADE, duration: reduce ? 0 : FADE.duration },
            );
        }
    }

    const imageTransform = `translate(${pan.x}px, ${pan.y}px) scale(${scale})`;

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(next) => {
                if (!next) void close();
            }}
            onOpenChangeComplete={(next) => {
                if (!next) resetAfterClose();
            }}
        >
            <Dialog.Portal>
                <Dialog.Popup
                    ref={popupRef}
                    // Fokus na samym podglądzie: bez obrysu na przycisku paska.
                    initialFocus={popupRef}
                    className="zse-lightbox"
                    data-closing={isClosing || undefined}
                    onKeyDown={(event) => {
                        if (event.key === "+" || event.key === "=") zoomIn();
                        else if (event.key === "-") zoomOut();
                        else if (event.key === "0") reset();
                    }}
                >
                    {/* Zewnętrzna warstwa się pojawia i gaśnie, wewnętrzna
                        przygasa przy machnięciu. */}
                    <div className="zse-lightbox-layer zse-lightbox-backdrop-layer">
                        <div
                            className="zse-lightbox-backdrop"
                            style={{
                                opacity:
                                    1 - Math.min(Math.abs(dragY) / 320, 0.7),
                            }}
                        />
                    </div>

                    {/* Zamykanie wskaźnikiem obok zdjęcia. Klawiatura zamyka
                        Escape'em i powiększa na oknie i pasku. */}
                    {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- klawiatura ma Escape i pasek */}
                    <div
                        ref={stage}
                        className="zse-lightbox-stage"
                        {...handlers}
                        onClick={(event) => {
                            const rect =
                                imageRef.current?.getBoundingClientRect();
                            const onImage =
                                rect &&
                                event.clientX >= rect.left &&
                                event.clientX <= rect.right &&
                                event.clientY >= rect.top &&
                                event.clientY <= rect.bottom;
                            if (!onImage && !wasDrag()) void close();
                        }}
                        onDoubleClick={(event) =>
                            toggleAt({
                                x: event.clientX,
                                y: event.clientY,
                            })
                        }
                    >
                        <div
                            className="zse-lightbox-drag"
                            data-gesturing={gesturing || undefined}
                            style={{ translate: `0 ${dragY}px` }}
                        >
                            <div
                                ref={frameRef}
                                className="zse-lightbox-frame"
                                style={{ opacity: 0 }}
                            >
                                {src && (
                                    <img
                                        ref={(image) => {
                                            imageRef.current = image;
                                            if (image) queueMicrotask(tryEnter);
                                        }}
                                        src={src}
                                        alt={alt}
                                        draggable={false}
                                        className="zse-lightbox-image"
                                        data-zoomed={zoomed || undefined}
                                        data-gesturing={gesturing || undefined}
                                        style={{ transform: imageTransform }}
                                        onLoad={tryEnter}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {(loading || (src && !size)) && (
                        <div className="zse-lightbox-loading">
                            <Spinner size="lg" delay={200} />
                        </div>
                    )}

                    <div className="zse-lightbox-bar zse-lightbox-layer">
                        <Dialog.Title className="zse-lightbox-title">
                            <span>{alt}</span>
                            {size && (
                                <span className="zse-lightbox-meta">
                                    {size.width} × {size.height}
                                </span>
                            )}
                        </Dialog.Title>
                        <div className="zse-lightbox-actions">
                            <div className="zse-lightbox-actions zse-lightbox-zoom">
                                <button
                                    type="button"
                                    className="zse-lightbox-button"
                                    aria-label={t.lightbox.zoomOut}
                                    disabled={!zoomed}
                                    onClick={zoomOut}
                                >
                                    <Icon icon={SearchMinusIcon} size={18} />
                                </button>
                                <button
                                    type="button"
                                    className="zse-lightbox-button"
                                    aria-label={t.lightbox.fit}
                                    onClick={reset}
                                >
                                    {Math.round(scale * 100)}%
                                </button>
                                <button
                                    type="button"
                                    className="zse-lightbox-button"
                                    aria-label={t.lightbox.zoomIn}
                                    onClick={zoomIn}
                                >
                                    <Icon icon={SearchAddIcon} size={18} />
                                </button>
                            </div>
                            {src && (
                                <a
                                    href={src}
                                    download={alt}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="zse-lightbox-button"
                                    aria-label={t.lightbox.download}
                                >
                                    <Icon icon={Download01Icon} size={18} />
                                </a>
                            )}
                            <button
                                type="button"
                                className="zse-lightbox-button"
                                aria-label={t.common.close}
                                onClick={() => void close()}
                            >
                                <Icon icon={Cancel01Icon} size={18} />
                            </button>
                        </div>
                    </div>
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
