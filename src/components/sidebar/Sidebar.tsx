"use client";

import { Collapsible } from "@base-ui/react/collapsible";
import { useRender } from "@base-ui/react/use-render";
import {
    ArrowDown01Icon,
    ArrowLeft01Icon,
    ArrowRight01Icon,
    LinkSquare02Icon,
    PanelLeftCloseIcon,
    PanelLeftOpenIcon,
} from "@hugeicons/core-free-icons";
import {
    createContext,
    useContext,
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
    type ReactElement,
    type ReactNode,
} from "react";

import { useMessages } from "../../i18n/context";
import { AppShellContext, SHORTCUT } from "../app-shell/AppShell";
import { Icon, type IconGlyph } from "../icon/Icon";
import { Menu, MenuGroup, MenuItem } from "../menu/Menu";
import { formatShortcut } from "../menu/shortcut";
import { ScrollArea } from "../scroll-area/ScrollArea";
import { Tooltip, TooltipProvider } from "../tooltip/Tooltip";

const cx = (...names: (string | false | undefined)[]) =>
    names.filter(Boolean).join(" ");

// Panel zwinięty do ikon. W wysuwanym panelu na telefonie zawsze pełny.
function useRail() {
    const shell = useContext(AppShellContext);
    return {
        rail: Boolean(shell?.collapsed && !shell.inDrawer),
        shell,
    };
}

const InSidebarContext = createContext(false);

export function useSidebarPlacement() {
    const { rail } = useRail();
    return { inSidebar: useContext(InSidebarContext), rail };
}

const BackContext = createContext(false);

// Pozycje w bocznym menu zwiniętego podmenu renderują się jako MenuItem.
const InMenuContext = createContext(false);

const cleanPath = (path: string) => path.replace(/\/+$/, "") || "/";

export function isActivePath(
    pathname: string,
    href: string,
    { exact = false }: { exact?: boolean } = {},
) {
    const path = cleanPath(pathname);
    const target = cleanPath(href);
    if (path === target) return true;
    return !exact && target !== "/" && path.startsWith(`${target}/`);
}

export interface SidebarProps {
    children: ReactNode;
    className?: string;
}

export function Sidebar({ children, className }: SidebarProps) {
    const { rail, shell } = useRail();

    return (
        // Pierwszy tooltip z opóźnieniem, kolejne od razu przy przesuwaniu
        // po ikonach.
        <TooltipProvider delay={300} closeDelay={0}>
            <div
                className={cx("zse-sidebar", className)}
                data-collapsed={rail || undefined}
                data-drawer={shell?.inDrawer || undefined}
                onPointerLeave={(event) =>
                    event.currentTarget.removeAttribute("data-hold")
                }
            >
                <InSidebarContext value>{children}</InSidebarContext>
            </div>
        </TooltipProvider>
    );
}

export interface SidebarHeaderProps {
    // Mały znak, widoczny też po zwinięciu, np. <img> 32×32 albo link z nim.
    logo: ReactNode;
    // Nazwa albo logotyp obok znaku.
    title?: ReactNode;
}

// Znak, nazwa i przycisk zwijania. Po zwinięciu najechanie na panel
// zamienia znak w przycisk rozwijania.
export function SidebarHeader({ logo, title }: SidebarHeaderProps) {
    const t = useMessages();
    const { rail, shell } = useRail();
    const toggleable = Boolean(shell && !shell.inDrawer);
    const keys = formatShortcut(SHORTCUT, undefined, t.kbd);
    const hint = (label: string) => (
        <>
            {label}
            <kbd className="zse-shell-kbd">{keys}</kbd>
        </>
    );

    return (
        <div className="zse-sidebar-header">
            <span className="zse-sidebar-mark">
                <span className="zse-sidebar-logo">{logo}</span>
                {toggleable && (
                    <Tooltip
                        content={hint(t.appShell.expand)}
                        side="right"
                        disabled={!rail}
                    >
                        <button
                            type="button"
                            className="zse-sidebar-expand"
                            aria-label={t.appShell.expand}
                            aria-controls={shell?.sidebarId}
                            aria-expanded={false}
                            inert={!rail}
                            onClick={() => shell?.setCollapsed(false)}
                        >
                            <Icon icon={PanelLeftCloseIcon} size={18} />
                        </button>
                    </Tooltip>
                )}
            </span>
            {title != null && (
                <span className="zse-sidebar-title">{title}</span>
            )}
            {toggleable && (
                <Tooltip content={hint(t.appShell.collapse)} side="bottom">
                    <button
                        type="button"
                        className="zse-sidebar-collapse"
                        aria-label={t.appShell.collapse}
                        aria-controls={shell?.sidebarId}
                        aria-expanded
                        inert={rail}
                        onClick={(event) => {
                            event.currentTarget
                                .closest(".zse-sidebar")
                                ?.setAttribute("data-hold", "");
                            shell?.setCollapsed(true);
                        }}
                    >
                        <Icon icon={PanelLeftOpenIcon} size={18} />
                    </button>
                </Tooltip>
            )}
        </div>
    );
}

export interface SidebarContentProps {
    children: ReactNode;
    label?: string;
    // Klucz widoku panelu, np. "main" albo "settings". Zmiana podmienia
    // treść z przejściem w bok.
    view?: string;
    // Głębokość widoku: głębiej wjeżdża z prawej, płycej z lewej.
    level?: number;
}

// Czas przejścia widoków, jak w sidebar.css; zapas na brak animationend.
const VIEW_SWAP = 220;

type Direction = "forward" | "back";

// Środek panelu, przewija się niezależnie od strony. Z view działa jak
// nawigacja podstron: wejście w sekcję (np. ustawienia) podmienia treść,
// stara wyjeżdża w bok razem z wjazdem nowej.
export function SidebarContent({
    children,
    label,
    view = "main",
    level = 0,
}: SidebarContentProps) {
    const t = useMessages();
    const navRef = useRef<HTMLElement>(null);
    const lastViewRef = useRef(view);
    // Treść widoku z chwili wejścia: po zmianie widoku zostaje jako
    // wychodząca kopia do końca animacji.
    const [shown, setShown] = useState({ view, level, children });
    const [leaving, setLeaving] = useState<{
        key: string;
        children: ReactNode;
        direction: Direction;
    } | null>(null);

    if (view !== shown.view) {
        setLeaving({
            key: shown.view,
            children: shown.children,
            direction: level >= shown.level ? "forward" : "back",
        });
        setShown({ view, level, children });
    }

    useEffect(() => {
        if (!leaving) return;
        const timer = setTimeout(() => setLeaving(null), VIEW_SWAP + 80);
        return () => clearTimeout(timer);
    }, [leaving]);

    useLayoutEffect(() => {
        const nav = navRef.current;
        const viewport = nav?.closest<HTMLElement>(".zse-scroll-viewport");
        if (!viewport) return;
        // Nowy widok zaczyna od góry.
        if (lastViewRef.current !== view) {
            lastViewRef.current = view;
            viewport.scrollTop = 0;
        }
        const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
        if (!active) return;
        const bounds = viewport.getBoundingClientRect();
        const item = active.getBoundingClientRect();
        const fade =
            parseFloat(getComputedStyle(viewport).scrollPaddingTop) || 0;
        if (
            item.top >= bounds.top + fade &&
            item.bottom <= bounds.bottom - fade
        )
            return;
        viewport.scrollTop +=
            item.top - bounds.top - (bounds.height - item.height) / 2;
    });

    return (
        <ScrollArea className="zse-sidebar-content" arrows={false}>
            <div className="zse-sidebar-views">
                {leaving && (
                    <nav
                        key={`leaving-${leaving.key}`}
                        className="zse-sidebar-nav"
                        data-leaving={leaving.direction}
                        inert
                        aria-hidden
                        onAnimationEnd={(event) => {
                            if (event.target === event.currentTarget)
                                setLeaving(null);
                        }}
                    >
                        {leaving.children}
                    </nav>
                )}
                <nav
                    key={view}
                    ref={navRef}
                    className="zse-sidebar-nav"
                    data-entering={leaving?.direction}
                    aria-label={label ?? t.appShell.navigation}
                >
                    {children}
                </nav>
            </div>
        </ScrollArea>
    );
}

export type SidebarBackProps = Omit<SidebarItemProps, "icon" | "badge">;

// Powrót z widoku podstrony, np. „Wszystkie klasy”, na górze panelu. Po
// zwinięciu sama strzałka z tooltipem.
export function SidebarBack(props: SidebarBackProps) {
    return (
        <SidebarGroup>
            <BackContext value>
                <SidebarItem icon={ArrowLeft01Icon} opensView {...props} />
            </BackContext>
        </SidebarGroup>
    );
}

export function SidebarFooter({ children }: { children: ReactNode }) {
    return <div className="zse-sidebar-footer">{children}</div>;
}

export interface SidebarGroupProps {
    // Po zwinięciu w tym samym wierszu zostaje kreska, więc lista nie
    // przeskakuje w pionie.
    label?: ReactNode;
    children: ReactNode;
}

export function SidebarGroup({ label, children }: SidebarGroupProps) {
    const id = useId();
    return (
        <div className="zse-sidebar-group">
            {label != null && (
                <div className="zse-sidebar-group-label" id={id}>
                    <span>{label}</span>
                </div>
            )}
            <ul
                className="zse-sidebar-list"
                aria-labelledby={label != null ? id : undefined}
            >
                {children}
            </ul>
        </div>
    );
}

export interface SidebarItemProps {
    icon?: IconGlyph;
    // Etykieta; po zwinięciu także treść tooltipa.
    children: ReactNode;
    // Bieżąca strona, np. isActivePath(pathname, "/uczniowie").
    active?: boolean;
    href?: string;
    // Link z routera zamiast <a>, np. <Link href="/uczniowie" />.
    render?: ReactElement<Record<string, unknown>>;
    onClick?: () => void;
    // Liczba na końcu, np. nowe zgłoszenia. Po zwinięciu kropka na ikonie.
    badge?: ReactNode;
    // Prowadzi do innego widoku panelu (np. „Ustawienia” z własnym menu):
    // na telefonie wysuwany panel zostaje otwarty i pokazuje nowe menu.
    opensView?: boolean;
    // Otwiera się w nowej karcie, z ikoną przy najechaniu.
    external?: boolean;
    disabled?: boolean;
}

export function SidebarItem({
    icon,
    children,
    active = false,
    href,
    render,
    onClick,
    badge,
    opensView = false,
    external = false,
    disabled = false,
}: SidebarItemProps) {
    const { rail } = useRail();
    const inMenu = useContext(InMenuContext);
    const back = useContext(BackContext);
    const hint = external
        ? LinkSquare02Icon
        : opensView && !back
          ? ArrowRight01Icon
          : null;
    const link = href !== undefined || render !== undefined;

    const element = useRender({
        render,
        defaultTagName: link ? "a" : "button",
        props: {
            className: "zse-sidebar-item",
            "data-active": active || undefined,
            "data-opens-view": opensView || undefined,
            "aria-current": active ? ("page" as const) : undefined,
            "aria-disabled": disabled || undefined,
            ...(!link && { type: "button" as const }),
            ...(href !== undefined && { href }),
            ...(external && { target: "_blank", rel: "noopener noreferrer" }),
            onClick: (event: { preventDefault: () => void }) => {
                if (disabled) {
                    event.preventDefault();
                    return;
                }
                onClick?.();
            },
            children: (
                <>
                    <span
                        className="zse-sidebar-icon"
                        data-dot={badge != null || undefined}
                    >
                        {icon && (
                            <Icon
                                icon={icon}
                                size={18}
                                className="zse-sidebar-glyph"
                            />
                        )}
                        {icon && hint && (
                            <Icon
                                icon={hint}
                                size={18}
                                className="zse-sidebar-glyph-alt"
                            />
                        )}
                    </span>
                    <span className="zse-sidebar-label">{children}</span>
                    {badge != null && (
                        <span className="zse-sidebar-badge">{badge}</span>
                    )}
                    {hint && (
                        <Icon
                            icon={hint}
                            size={12}
                            className="zse-sidebar-external"
                        />
                    )}
                </>
            ),
        },
    });

    if (inMenu)
        return (
            <MenuItem
                disabled={disabled}
                {...(icon && { icon })}
                {...(href !== undefined && { href })}
                {...(render && { render })}
                {...(onClick && { onClick })}
            >
                {children}
            </MenuItem>
        );

    return (
        <li className="zse-sidebar-row">
            <Tooltip content={children} side="right" disabled={!rail}>
                {element as ReactElement<Record<string, unknown>>}
            </Tooltip>
        </li>
    );
}

export interface SidebarSubProps {
    icon?: IconGlyph;
    label: ReactNode;
    // SidebarItem bez ikon, np. klasy.
    children: ReactNode;
    // Któraś pozycja w środku jest bieżącą stroną.
    active?: boolean;
    // Domyślnie otwarte, gdy active.
    defaultOpen?: boolean;
}

// Pozycja z podmenu. Rozwinięty panel otwiera je w miejscu, zwinięty
// jako menu obok ikony, bo w 56 pikselach lista się nie zmieści.
export function SidebarSub({
    icon,
    label,
    children,
    active = false,
    defaultOpen,
}: SidebarSubProps) {
    const { rail } = useRail();
    // Stan przeżywa zwinięcie i rozwinięcie panelu.
    const [open, setOpen] = useState(defaultOpen ?? active);

    const face = (
        <>
            <span className="zse-sidebar-icon">
                {icon && <Icon icon={icon} size={18} />}
            </span>
            <span className="zse-sidebar-label">{label}</span>
            <Icon
                icon={ArrowDown01Icon}
                size={14}
                className="zse-sidebar-chevron"
            />
        </>
    );

    return (
        <li className="zse-sidebar-row">
            <Collapsible.Root open={open && !rail} onOpenChange={setOpen}>
                {rail ? (
                    <Menu
                        side="right"
                        align="start"
                        trigger={
                            <button
                                type="button"
                                className="zse-sidebar-item"
                                data-active={active || undefined}
                            >
                                {face}
                            </button>
                        }
                    >
                        <MenuGroup label={label}>
                            <InMenuContext value>{children}</InMenuContext>
                        </MenuGroup>
                    </Menu>
                ) : (
                    <Collapsible.Trigger
                        className="zse-sidebar-item zse-sidebar-sub-trigger"
                        data-active={(active && !open) || undefined}
                    >
                        {face}
                    </Collapsible.Trigger>
                )}
                <Collapsible.Panel className="zse-sidebar-sub-panel">
                    <ul className="zse-sidebar-list">{children}</ul>
                </Collapsible.Panel>
            </Collapsible.Root>
        </li>
    );
}
