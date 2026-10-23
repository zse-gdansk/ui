"use client";

import { useCallback, useRef, useState, type PointerEvent } from "react";

import { useLatest } from "../../utils/effects";
import { clampPan, zoomAt, type Point, type ZoomState } from "./geometry";

const IDENTITY: ZoomState = { zoom: 1, pan: { x: 0, y: 0 } };
const DISMISS_DISTANCE = 110;
const DISMISS_VELOCITY = 0.6;

type Gesture =
    | { kind: "pan"; start: Point; pan: Point }
    | { kind: "swipe"; start: Point; time: number }
    | { kind: "pinch"; distance: number; mid: Point; state: ZoomState };

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const midpoint = (a: Point, b: Point) => ({
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
});

// Powiększanie i przesuwanie zdjęcia: szczypanie, ctrl/⌘ + kółko albo
// gest gładzika wokół kursora, dwuklik, przeciąganie, kółko przesuwa
// powiększone zdjęcie, a na dotyku pionowe machnięcie zamyka.
export function useLightboxZoom({
    image: getImage,
    onDismiss,
}: {
    // Funkcja, nie ref: wynik hooka czyta się w renderze.
    image: () => HTMLImageElement | null;
    onDismiss: () => void;
}) {
    const stageRef = useRef<HTMLElement | null>(null);
    const [state, setState] = useState<ZoomState>(IDENTITY);
    const [dragY, setDragY] = useState(0);
    const [gesturing, setGesturing] = useState(false);
    const pointers = useRef(new Map<number, Point>());
    const gesture = useRef<Gesture | null>(null);
    const moved = useRef(false);
    // Gesty czytają i piszą najnowszą wartość od razu; stan tylko ją rysuje.
    const stateRef = useRef(state);

    // Pudełko zdjęcia przy zoom 1 i sceny; transformy ich nie zmieniają.
    function boxes() {
        const image = getImage();
        const stage = stageRef.current;
        if (!image || !stage) return null;
        const rect = stage.getBoundingClientRect();
        return {
            imageBox: {
                left: 0,
                top: 0,
                width: image.offsetWidth,
                height: image.offsetHeight,
            },
            stageBox: {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
            },
            natural: image.naturalWidth,
        };
    }

    function maxZoom() {
        const b = boxes();
        if (!b || !b.imageBox.width) return 4;
        return Math.min(8, Math.max(3, (b.natural / b.imageBox.width) * 2));
    }

    // Pozycja kursora względem środka zdjęcia przy zoom 1.
    function focusOf(client: Point): Point {
        const image = getImage();
        if (!image) return { x: 0, y: 0 };
        const rect = image.getBoundingClientRect();
        const { pan } = stateRef.current;
        return {
            x: client.x - (rect.left + rect.width / 2 - pan.x),
            y: client.y - (rect.top + rect.height / 2 - pan.y),
        };
    }

    function commit(next: ZoomState) {
        const b = boxes();
        const zoom = Math.min(maxZoom(), Math.max(1, next.zoom));
        const pan = b
            ? clampPan(next.pan, zoom, b.imageBox, b.stageBox)
            : next.pan;
        const settled = zoom <= 1.001 ? IDENTITY : { zoom, pan };
        stateRef.current = settled;
        setState(settled);
    }

    function zoomTo(zoom: number, client?: Point) {
        const focus = client ? focusOf(client) : { x: 0, y: 0 };
        commit(zoomAt(stateRef.current, zoom, focus));
    }

    function toggleAt(client: Point) {
        if (stateRef.current.zoom > 1.01) return commit(IDENTITY);
        const b = boxes();
        const actualSize =
            b && b.imageBox.width ? b.natural / b.imageBox.width : 1;
        zoomTo(actualSize >= 1.5 ? actualSize : 2.5, client);
    }

    // Kółko wymaga nasłuchu niepasywnego, żeby nie powiększać całej strony.
    const wheel = useLatest((event: WheelEvent) => {
        const current = stateRef.current;
        if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            const next = current.zoom * Math.exp(-event.deltaY * 0.01);
            commit(
                zoomAt(
                    current,
                    next,
                    focusOf({ x: event.clientX, y: event.clientY }),
                ),
            );
        } else if (current.zoom > 1.01) {
            event.preventDefault();
            commit({
                zoom: current.zoom,
                pan: {
                    x: current.pan.x - event.deltaX,
                    y: current.pan.y - event.deltaY,
                },
            });
        } else return;
        // Za kółkiem bez opóźnienia; łagodne przejście jest dla kliknięć.
        setGesturing(true);
        clearTimeout(settle.current);
        settle.current = setTimeout(() => setGesturing(false), 120);
    });
    const settle = useRef<ReturnType<typeof setTimeout>>(undefined);

    // Jako ref callback sceny: nasłuch żyje dokładnie tyle, co scena.
    const stage = useCallback(
        (node: HTMLDivElement | null) => {
            stageRef.current = node;
            if (!node) return;
            const onWheel = (event: WheelEvent) => wheel.current(event);
            node.addEventListener("wheel", onWheel, { passive: false });
            return () => {
                node.removeEventListener("wheel", onWheel);
                clearTimeout(settle.current);
                stageRef.current = null;
            };
        },
        [wheel],
    );

    function onPointerDown(event: PointerEvent<HTMLElement>) {
        if (event.button !== 0) return;
        pointers.current.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
        });
        moved.current = false;
        const points = [...pointers.current.values()];
        if (points.length === 2 && points[0] && points[1]) {
            gesture.current = {
                kind: "pinch",
                distance: distance(points[0], points[1]),
                mid: midpoint(points[0], points[1]),
                state: stateRef.current,
            };
        } else if (stateRef.current.zoom > 1.01) {
            gesture.current = {
                kind: "pan",
                start: { x: event.clientX, y: event.clientY },
                pan: stateRef.current.pan,
            };
        } else if (event.pointerType === "touch") {
            gesture.current = {
                kind: "swipe",
                start: { x: event.clientX, y: event.clientY },
                time: event.timeStamp,
            };
        }
        if (!gesture.current) return;
        // Przechwycenie tylko dla gestu: zwykłe kliknięcie ma swój cel.
        event.currentTarget.setPointerCapture(event.pointerId);
        setGesturing(true);
    }

    function onPointerMove(event: PointerEvent<HTMLElement>) {
        if (!pointers.current.has(event.pointerId)) return;
        pointers.current.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
        });
        const g = gesture.current;
        if (!g) return;
        const points = [...pointers.current.values()];

        if (g.kind === "pinch" && points[0] && points[1]) {
            const mid = midpoint(points[0], points[1]);
            const zoomed = zoomAt(
                g.state,
                g.state.zoom * (distance(points[0], points[1]) / g.distance),
                focusOf(g.mid),
            );
            commit({
                zoom: zoomed.zoom,
                pan: {
                    x: zoomed.pan.x + mid.x - g.mid.x,
                    y: zoomed.pan.y + mid.y - g.mid.y,
                },
            });
            moved.current = true;
        } else if (g.kind === "pan") {
            const dx = event.clientX - g.start.x;
            const dy = event.clientY - g.start.y;
            if (Math.abs(dx) + Math.abs(dy) > 3) moved.current = true;
            commit({
                zoom: stateRef.current.zoom,
                pan: { x: g.pan.x + dx, y: g.pan.y + dy },
            });
        } else if (g.kind === "swipe") {
            const dy = event.clientY - g.start.y;
            if (Math.abs(dy) > 3) moved.current = true;
            setDragY(dy);
        }
    }

    function onPointerEnd(event: PointerEvent<HTMLElement>) {
        pointers.current.delete(event.pointerId);
        const g = gesture.current;
        if (g?.kind === "swipe") {
            const dy = event.clientY - g.start.y;
            const velocity =
                Math.abs(dy) / Math.max(1, event.timeStamp - g.time);
            if (
                Math.abs(dy) > DISMISS_DISTANCE ||
                (Math.abs(dy) > 24 && velocity > DISMISS_VELOCITY)
            )
                onDismiss();
            else setDragY(0);
        }
        // Po podniesieniu jednego palca ze szczypania drugi dalej przesuwa.
        const rest = [...pointers.current.values()][0];
        gesture.current =
            rest && stateRef.current.zoom > 1.01
                ? { kind: "pan", start: rest, pan: stateRef.current.pan }
                : null;
        if (!gesture.current) setGesturing(false);
    }

    return {
        zoom: state.zoom,
        pan: state.pan,
        dragY,
        gesturing,
        zoomed: state.zoom > 1.01,
        stage,
        // Ostatnia sekwencja wskaźnika się ruszyła: kliknięcie po niej to
        // nie tapnięcie.
        wasDrag: () => moved.current,
        zoomIn: () => zoomTo(stateRef.current.zoom * 1.5),
        zoomOut: () => zoomTo(stateRef.current.zoom / 1.5),
        reset: () => {
            commit(IDENTITY);
            setDragY(0);
        },
        toggleAt,
        handlers: {
            onPointerDown,
            onPointerMove,
            onPointerUp: onPointerEnd,
            onPointerCancel: onPointerEnd,
        },
    };
}
