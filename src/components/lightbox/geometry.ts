export interface Box {
    left: number;
    top: number;
    width: number;
    height: number;
}

export interface Point {
    x: number;
    y: number;
}

export interface ZoomState {
    zoom: number;
    pan: Point;
}

// Część pudełka, którą zdjęcie naprawdę zajmuje przy object-fit: contain.
export function containedBox(box: Box, aspect: number): Box {
    const width = Math.min(box.width, box.height * aspect);
    const height = width / aspect;
    return {
        left: box.left + (box.width - width) / 2,
        top: box.top + (box.height - height) / 2,
        width,
        height,
    };
}

// Transform i przycięcie, po których pełne zdjęcie (target, środek jako
// punkt odniesienia) wygląda jak miniatura: pokrywa ją, jest na niej
// wyśrodkowane i przycięte do niej z jej zaokrągleniem.
export function flipFrom(origin: Box, target: Box, originRadius: number) {
    const scale = Math.max(
        origin.width / target.width,
        origin.height / target.height,
    );
    const x = origin.left + origin.width / 2 - (target.left + target.width / 2);
    const y = origin.top + origin.height / 2 - (target.top + target.height / 2);
    // Przycięcie jest we własnych (nieskalowanych) współrzędnych zdjęcia.
    const insetX = Math.max(0, (target.width - origin.width / scale) / 2);
    const insetY = Math.max(0, (target.height - origin.height / scale) / 2);
    const radius = originRadius / scale;
    return {
        transform: `translate(${x}px, ${y}px) scale(${scale})`,
        clipPath: `inset(${insetY}px ${insetX}px ${insetY}px ${insetX}px round ${radius}px)`,
    };
}

// Powiększone zdjęcie zawsze pokrywa scenę: bez pustego pasa przy krawędzi,
// a na osi, na której jest mniejsze od sceny, stoi na środku.
export function clampPan(
    pan: Point,
    zoom: number,
    image: Box,
    stage: Box,
): Point {
    const limitX = Math.max(0, (image.width * zoom - stage.width) / 2);
    const limitY = Math.max(0, (image.height * zoom - stage.height) / 2);
    return {
        x: Math.min(limitX, Math.max(-limitX, pan.x)),
        y: Math.min(limitY, Math.max(-limitY, pan.y)),
    };
}

// Powiększenie wokół focus (względem środka zdjęcia przy zoom 1, w pikselach
// ekranu): punkt pod kursorem zostaje pod kursorem.
export function zoomAt(
    state: ZoomState,
    nextZoom: number,
    focus: Point,
): ZoomState {
    const ratio = nextZoom / state.zoom;
    return {
        zoom: nextZoom,
        pan: {
            x: focus.x - (focus.x - state.pan.x) * ratio,
            y: focus.y - (focus.y - state.pan.y) * ratio,
        },
    };
}

// Gdzie na ekranie jest obrazek miniatury i jakie ma zaokrąglenie. null,
// gdy miniatura jest poza ekranem: wtedy zwykłe pojawienie się.
export function measureOrigin(
    origin: HTMLElement | null | undefined,
    aspect: number,
) {
    if (!origin) return null;
    const image = origin.querySelector("img") ?? origin;
    const rect = image.getBoundingClientRect();
    if (rect.width === 0 || rect.bottom < 0 || rect.top > window.innerHeight)
        return null;
    const box: Box = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
    };
    const contain = getComputedStyle(image).objectFit === "contain";
    return {
        image,
        box: contain ? containedBox(box, aspect) : box,
        radius: contain
            ? 0
            : Number.parseFloat(getComputedStyle(origin).borderTopLeftRadius) ||
              0,
    };
}
