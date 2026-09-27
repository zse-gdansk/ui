"use client";

import {
    useImperativeHandle,
    useRef,
    useState,
    type KeyboardEvent,
    type PointerEvent,
    type Ref,
} from "react";

import { useMessages } from "../../i18n/context";
import { useEventListener, useResizeObserver } from "../../utils/effects";

export interface CropHandle {
    // Przycięty obraz w rozmiarze wyjściowym.
    toBlob: (size: { width: number; height: number }) => Promise<Blob | null>;
}

export interface ImageCropperProps {
    src: string;
    // Szerokość do wysokości kadru, np. 1 do awatara, 35 / 45 do legitymacji.
    aspect: number;
    // Koło tylko dla oka (awatar); wynik zawsze prostokątny.
    shape?: "rect" | "circle";
    // Powiększenie od dopasowania (1) do maxZoom.
    zoom: number;
    onZoomChange: (zoom: number) => void;
    maxZoom?: number;
    handleRef?: Ref<CropHandle>;
}

interface View {
    // Skala obrazu (px ekranu na px obrazu) i lewy górny róg względem kadru.
    scale: number;
    x: number;
    y: number;
}

// Kadrowanie: obraz zawsze pokrywa kadr, przeciąganie przesuwa, kółko,
// szczypanie i suwak (zoom) powiększają wokół punktu, strzałki i +/−
// działają z klawiatury. Przy przeciąganiu siatka trójpodziału.
export function ImageCropper({
    src,
    aspect,
    shape = "rect",
    zoom,
    onZoomChange,
    maxZoom = 4,
    handleRef,
}: ImageCropperProps) {
    const t = useMessages();
    const frameRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const [natural, setNatural] = useState<{ w: number; h: number } | null>(
        null,
    );
    const [frame, setFrame] = useState({ w: 0, h: 0 });
    const [view, setView] = useState<View | null>(null);
    const [dragging, setDragging] = useState(false);
    const pointers = useRef(new Map<number, { x: number; y: number }>());
    const pinch = useRef<{ distance: number; zoom: number } | null>(null);

    useResizeObserver(frameRef, () => {
        const element = frameRef.current;
        if (element)
            setFrame({ w: element.clientWidth, h: element.clientHeight });
    });

    const cover =
        natural && frame.w
            ? Math.max(frame.w / natural.w, frame.h / natural.h)
            : 1;

    // Obraz nie odsłania tła kadru: róg w granicach, skala nie mniejsza
    // niż dopasowanie.
    function clamp(next: View): View {
        if (!natural) return next;
        const scale = Math.max(next.scale, cover);
        return {
            scale,
            x: Math.min(0, Math.max(frame.w - natural.w * scale, next.x)),
            y: Math.min(0, Math.max(frame.h - natural.h * scale, next.y)),
        };
    }

    // Widok z bieżącym zoomem: pierwszy raz na środku, potem wokół punktu.
    const current: View | null = natural
        ? (view ??
          clamp({
              scale: cover * zoom,
              x: (frame.w - natural.w * cover * zoom) / 2,
              y: (frame.h - natural.h * cover * zoom) / 2,
          }))
        : null;
    const shownView =
        current && Math.abs(current.scale - cover * zoom) > 1e-6
            ? zoomAround(current, cover * zoom, frame.w / 2, frame.h / 2)
            : current;

    function zoomAround(base: View, scale: number, px: number, py: number) {
        const ratio = scale / base.scale;
        return clamp({
            scale,
            x: px - (px - base.x) * ratio,
            y: py - (py - base.y) * ratio,
        });
    }

    function setZoom(next: number, px = frame.w / 2, py = frame.h / 2) {
        const value = Math.min(Math.max(next, 1), maxZoom);
        if (shownView) setView(zoomAround(shownView, cover * value, px, py));
        onZoomChange(value);
    }

    useImperativeHandle(handleRef, () => ({
        async toBlob({ width, height }) {
            const image = imageRef.current;
            if (!image || !shownView) return null;
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext("2d");
            if (!context) return null;
            context.imageSmoothingQuality = "high";
            context.drawImage(
                image,
                -shownView.x / shownView.scale,
                -shownView.y / shownView.scale,
                frame.w / shownView.scale,
                frame.h / shownView.scale,
                0,
                0,
                width,
                height,
            );
            return new Promise((resolve) =>
                canvas.toBlob(resolve, "image/jpeg", 0.9),
            );
        },
    }));

    function onPointerDown(event: PointerEvent<HTMLDivElement>) {
        event.currentTarget.setPointerCapture(event.pointerId);
        pointers.current.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
        });
        if (pointers.current.size === 2) {
            const [a, b] = [...pointers.current.values()];
            pinch.current = {
                distance: Math.hypot(
                    (a?.x ?? 0) - (b?.x ?? 0),
                    (a?.y ?? 0) - (b?.y ?? 0),
                ),
                zoom,
            };
        }
        setDragging(true);
    }

    function onPointerMove(event: PointerEvent<HTMLDivElement>) {
        const previous = pointers.current.get(event.pointerId);
        if (!previous || !shownView) return;
        pointers.current.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
        });
        if (pointers.current.size === 2 && pinch.current) {
            // Szczypanie: powiększenie wokół środka między palcami.
            const [a, b] = [...pointers.current.values()];
            const distance = Math.hypot(
                (a?.x ?? 0) - (b?.x ?? 0),
                (a?.y ?? 0) - (b?.y ?? 0),
            );
            const box = event.currentTarget.getBoundingClientRect();
            setZoom(
                pinch.current.zoom * (distance / pinch.current.distance),
                ((a?.x ?? 0) + (b?.x ?? 0)) / 2 - box.left,
                ((a?.y ?? 0) + (b?.y ?? 0)) / 2 - box.top,
            );
            return;
        }
        setView(
            clamp({
                ...shownView,
                x: shownView.x + event.clientX - previous.x,
                y: shownView.y + event.clientY - previous.y,
            }),
        );
    }

    function onPointerUp(event: PointerEvent<HTMLDivElement>) {
        pointers.current.delete(event.pointerId);
        if (pointers.current.size < 2) pinch.current = null;
        if (pointers.current.size === 0) setDragging(false);
    }

    // Kółko myszy i gest na gładziku; nasłuch nie pasywny, żeby strona się
    // przy tym nie przewijała.
    useEventListener<WheelEvent>(
        frameRef,
        "wheel",
        (event) => {
            event.preventDefault();
            const box = frameRef.current?.getBoundingClientRect();
            setZoom(
                zoom * Math.exp(-event.deltaY * 0.002),
                event.clientX - (box?.left ?? 0),
                event.clientY - (box?.top ?? 0),
            );
        },
        { passive: false },
    );

    function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (!shownView) return;
        const step = event.shiftKey ? 40 : 10;
        const moves: Record<string, [number, number]> = {
            ArrowLeft: [step, 0],
            ArrowRight: [-step, 0],
            ArrowUp: [0, step],
            ArrowDown: [0, -step],
        };
        const move = moves[event.key];
        if (move) {
            event.preventDefault();
            setView(
                clamp({
                    ...shownView,
                    x: shownView.x + move[0],
                    y: shownView.y + move[1],
                }),
            );
        } else if (event.key === "+" || event.key === "=") {
            event.preventDefault();
            setZoom(zoom * 1.1);
        } else if (event.key === "-") {
            event.preventDefault();
            setZoom(zoom / 1.1);
        }
    }

    return (
        // Własny widżet z klawiaturą i gestami: role="application" przekazuje
        // mu klawisze strzałek, opis sterowania jest w aria-label.
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <div
            ref={frameRef}
            className="zse-cropper"
            data-shape={shape}
            data-dragging={dragging || undefined}
            style={{ aspectRatio: String(aspect) }}
            role="application"
            aria-label={t.photo.frame}
            // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
        >
            <img
                ref={imageRef}
                src={src}
                alt=""
                className="zse-cropper-image"
                draggable={false}
                onLoad={(event) => {
                    setNatural({
                        w: event.currentTarget.naturalWidth,
                        h: event.currentTarget.naturalHeight,
                    });
                    setView(null);
                }}
                style={
                    shownView && natural
                        ? {
                              width: natural.w,
                              height: natural.h,
                              transform: `translate(${shownView.x}px, ${shownView.y}px) scale(${shownView.scale})`,
                          }
                        : { opacity: 0 }
                }
            />
            <div className="zse-cropper-mask" aria-hidden />
            <div className="zse-cropper-grid" aria-hidden />
        </div>
    );
}
