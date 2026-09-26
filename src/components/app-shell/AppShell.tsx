"use client";

import { Drawer } from "@base-ui/react/drawer";
import { SidebarLeftIcon } from "@hugeicons/core-free-icons";
import {
    createContext,
    useContext,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";

import { useMessages } from "../../i18n/context";
import { Icon } from "../icon/Icon";
import { matchesShortcut } from "../menu/shortcut";

// Od tej szerokości panel stoi obok treści, poniżej wysuwa się z lewej.
// Ta sama wartość co w app-shell.css.
const DESKTOP = "(min-width: 768px)";
export const SHORTCUT = "mod+b";

export interface AppShellState {
    // Panel zwinięty do ikon (na desktopie).
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    // Panel wysunięty na telefonie.
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
    // Przycisk panelu: na desktopie zwija, na telefonie wysuwa.
    toggle: () => void;
    // Treść jest w wysuwanym panelu, a nie obok strony. Komponenty panelu
    // pokazują się wtedy w pełnej wersji, nawet gdy desktop jest zwinięty.
    inDrawer: boolean;
    sidebarId: string;
}

export const AppShellContext = createContext<AppShellState | null>(null);

// Stan szkieletu dla części panelu i własnych przycisków.
export function useAppShell() {
    const state = useContext(AppShellContext);
    if (!state) throw new Error("useAppShell() działa tylko w <AppShell>.");
    return state;
}

export interface AppShellProps {
    // Treść panelu bocznego, np. <Sidebar>. Ta sama na desktopie i telefonie.
    sidebar?: ReactNode;
    // Pasek nad treścią, na prawo od panelu.
    header?: ReactNode;
    children: ReactNode;
    collapsed?: boolean;
    defaultCollapsed?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
    // Nazwa cookie, w którym szkielet sam zapisuje zwinięcie. Serwer czyta je
    // i podaje jako defaultCollapsed, więc pierwszy render ma już dobrą
    // szerokość (Next.js: cookies() w layoucie).
    cookie?: string;
    // Nazwa panelu dla czytników, domyślnie „Panel boczny”.
    sidebarLabel?: string;
    // false wyłącza ⌘B / Ctrl+B.
    shortcut?: boolean;
}

export function AppShell({
    sidebar,
    header,
    children,
    collapsed: controlled,
    defaultCollapsed = false,
    onCollapsedChange,
    cookie,
    sidebarLabel,
    shortcut = true,
}: AppShellProps) {
    const t = useMessages();
    const sidebarId = useId();
    const mainId = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const [inner, setInner] = useState(defaultCollapsed);
    const [mobileOpen, setMobileOpen] = useState(false);
    const collapsed = controlled ?? inner;

    const hasSidebar = sidebar != null;
    const hasHeader = header != null;

    const state = useMemo<AppShellState>(() => {
        const setCollapsed = (next: boolean) => {
            if (controlled === undefined) setInner(next);
            onCollapsedChange?.(next);
            if (cookie)
                document.cookie = `${encodeURIComponent(cookie)}=${next ? 1 : 0}; path=/; max-age=31536000; samesite=lax`;
        };
        return {
            collapsed,
            setCollapsed,
            mobileOpen,
            setMobileOpen,
            toggle: () => {
                if (matchMedia(DESKTOP).matches) setCollapsed(!collapsed);
                else setMobileOpen(!mobileOpen);
            },
            inDrawer: false,
            sidebarId,
        };
    }, [
        collapsed,
        controlled,
        mobileOpen,
        onCollapsedChange,
        cookie,
        sidebarId,
    ]);
    const drawerState = useMemo(() => ({ ...state, inDrawer: true }), [state]);

    // Skrót z klawiatury przełącza bez animacji: powtarzany często, animacja
    // tylko by opóźniała.
    const latest = useRef(state.toggle);
    useEffect(() => {
        latest.current = state.toggle;
    });
    useEffect(() => {
        if (!shortcut || !hasSidebar) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.repeat || !matchesShortcut(event, SHORTCUT)) return;
            const target = event.target;
            if (target instanceof HTMLElement && target.isContentEditable)
                return;
            event.preventDefault();
            const root = rootRef.current;
            root?.setAttribute("data-instant", "");
            latest.current();
            requestAnimationFrame(() =>
                requestAnimationFrame(() =>
                    root?.removeAttribute("data-instant"),
                ),
            );
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [shortcut, hasSidebar]);

    // Kreska pod paskiem, gdy treść jest przewinięta. Atrybut zamiast
    // stanu, żeby przewijanie nie renderowało strony.
    const headerRef = useRef<HTMLElement>(null);
    const mainRef = useRef<HTMLElement>(null);
    useEffect(() => {
        const bar = headerRef.current;
        const main = mainRef.current;
        if (!hasHeader || !bar || !main) return;
        const update = () =>
            bar.toggleAttribute("data-scrolled", main.scrollTop > 0);
        update();
        main.addEventListener("scroll", update, { passive: true });
        return () => main.removeEventListener("scroll", update);
    }, [hasHeader]);

    // Po poszerzeniu okna wysunięty panel nie ma już sensu.
    useEffect(() => {
        if (!mobileOpen) return;
        const query = matchMedia(DESKTOP);
        const close = () => {
            if (query.matches) setMobileOpen(false);
        };
        query.addEventListener("change", close);
        return () => query.removeEventListener("change", close);
    }, [mobileOpen]);

    return (
        <AppShellContext value={state}>
            <div
                ref={rootRef}
                className="zse-shell"
                data-collapsed={collapsed || undefined}
                data-sidebar={sidebar ? "" : undefined}
            >
                <a className="zse-shell-skip" href={`#${mainId}`}>
                    {t.appShell.skip}
                </a>
                {sidebar != null && (
                    <aside
                        id={sidebarId}
                        className="zse-shell-sidebar"
                        aria-label={sidebarLabel ?? t.appShell.sidebar}
                        data-collapsed={collapsed || undefined}
                    >
                        {sidebar}
                    </aside>
                )}
                <div className="zse-shell-body">
                    {header != null && (
                        <header ref={headerRef} className="zse-shell-header">
                            {header}
                        </header>
                    )}
                    <main
                        ref={mainRef}
                        id={mainId}
                        className="zse-shell-main"
                        tabIndex={-1}
                    >
                        {children}
                    </main>
                </div>
            </div>

            {sidebar != null && (
                <Drawer.Root
                    open={mobileOpen}
                    onOpenChange={(open) => setMobileOpen(open)}
                    swipeDirection="left"
                >
                    <Drawer.Portal>
                        <Drawer.Backdrop className="zse-sheet-backdrop" />
                        <Drawer.Viewport
                            className="zse-sheet-viewport"
                            data-side="left"
                        >
                            <Drawer.Popup
                                className="zse-sheet zse-shell-drawer"
                                data-side="left"
                                data-size="sm"
                                // Wybór pozycji w panelu to przejście na inną
                                // stronę, więc panel się chowa.
                                onClick={(event) => {
                                    if (
                                        event.target instanceof Element &&
                                        event.target.closest("a[href]")
                                    )
                                        setMobileOpen(false);
                                }}
                            >
                                <Drawer.Title className="zse-shell-sr">
                                    {sidebarLabel ?? t.appShell.sidebar}
                                </Drawer.Title>
                                <AppShellContext value={drawerState}>
                                    {sidebar}
                                </AppShellContext>
                            </Drawer.Popup>
                        </Drawer.Viewport>
                    </Drawer.Portal>
                </Drawer.Root>
            )}
        </AppShellContext>
    );
}

export interface AppShellTriggerProps {
    className?: string;
}

// Przycisk menu do paska nad treścią, tylko na telefonie: wysuwa panel.
// Na desktopie panel zwija się przyciskiem w SidebarHeader albo ⌘B.
export function AppShellTrigger({ className }: AppShellTriggerProps) {
    const t = useMessages();
    const { mobileOpen, setMobileOpen } = useAppShell();

    return (
        <button
            type="button"
            className={["zse-shell-trigger", className]
                .filter(Boolean)
                .join(" ")}
            aria-label={t.appShell.openMenu}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
        >
            <Icon icon={SidebarLeftIcon} size={18} />
        </button>
    );
}
