import type { PointerEvent as ReactPointerEvent } from "react";

export function markPress(event: ReactPointerEvent<HTMLElement>) {
    if (event.button !== 0) return;

    const trigger = event.currentTarget;
    // Drugie wciśnięcie zamyka listę. Poświatę trzyma wtedy data-popup-open,
    // a nowy znacznik zostałby po zamknięciu i zgasił powracający fokus.
    if (isOpen(trigger) || trigger.hasAttribute("data-pressing")) return;

    trigger.setAttribute("data-pressing", "");

    const controller = new AbortController();
    const { signal } = controller;
    const clear = () => {
        trigger.removeAttribute("data-pressing");
        controller.abort();
    };

    const isOutside = (next: EventTarget | null) =>
        !(next instanceof Node && trigger.contains(next));

    trigger.addEventListener(
        "focusout",
        (focusEvent: FocusEvent) => {
            if (!isOutside(focusEvent.relatedTarget)) return;
            clear();
        },
        { signal },
    );
    document.addEventListener(
        "focusin",
        (focusEvent) => {
            if (isOutside(focusEvent.target)) clear();
        },
        { signal },
    );

    const endPress = (up: PointerEvent) => {
        // Puszczenie na polu otwiera listę chwilę później. Znacznik zostaje,
        // aż lista przejmie fokus.
        if (!isOutside(up.target)) return;
        const settle = () => {
            if (signal.aborted || isOpen(trigger)) return;
            if (!isOutside(document.activeElement)) clear();
        };
        settle();
        requestAnimationFrame(settle);
    };

    document.addEventListener("pointerup", endPress, { signal });
    document.addEventListener("pointercancel", endPress, { signal });
}

function isOpen(trigger: HTMLElement) {
    return (
        trigger.getAttribute("aria-expanded") === "true" ||
        trigger.hasAttribute("data-popup-open")
    );
}
