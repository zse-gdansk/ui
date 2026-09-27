let overlay: boolean | undefined;

function overlayScrollbars() {
    if (overlay !== undefined) return overlay;
    // Na dotyku pasek jest cienki i widać go tylko w trakcie przewijania;
    // miejsce na niego tylko zjadałoby szerokość.
    if (!matchMedia("(pointer: fine)").matches) return (overlay = false);
    const probe = document.createElement("div");
    probe.style.cssText =
        "position:absolute;top:-9999px;width:100px;height:100px;overflow:scroll;scrollbar-width:thin";
    document.body.append(probe);
    overlay = probe.offsetWidth - probe.clientWidth === 0;
    probe.remove();
    return overlay;
}

export function markGutters(target: Element, scroller: HTMLElement) {
    const on = overlayScrollbars();
    target.toggleAttribute(
        "data-gutter-y",
        on && scroller.scrollHeight > scroller.clientHeight + 1,
    );
    target.toggleAttribute(
        "data-gutter-x",
        on && scroller.scrollWidth > scroller.clientWidth + 1,
    );
}

// Jako ref callback: śledzi element i jego dzieci, sprząta przy odpięciu.
export function watchGutters(element: HTMLElement | null) {
    if (!element) return;
    const update = () => markGutters(element, element);
    const resize = new ResizeObserver(update);
    const watch = () => {
        resize.disconnect();
        resize.observe(element);
        for (const child of element.children) resize.observe(child);
        update();
    };
    const mutations = new MutationObserver(watch);
    mutations.observe(element, { childList: true });
    watch();
    return () => {
        resize.disconnect();
        mutations.disconnect();
    };
}
