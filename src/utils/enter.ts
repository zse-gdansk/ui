let pageReady = false;
if (typeof window !== "undefined") {
    if (document.readyState === "complete") pageReady = true;
    else
        window.addEventListener(
            "load",
            () => {
                pageReady = true;
            },
            { once: true },
        );
}

export function markEnter(element: HTMLElement | null) {
    if (element && pageReady) element.dataset.enter = "";
}
