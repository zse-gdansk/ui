import {
    Analytics01Icon,
    Calendar03Icon,
    CheckListIcon,
    DashboardSquare01Icon,
    Globe02Icon,
    Home01Icon,
    Megaphone01Icon,
    Moon02Icon,
    Notification01Icon,
    Search01Icon,
    Sun03Icon,
    School01Icon,
    Settings01Icon,
    UserGroupIcon,
    VoteIcon,
} from "@hugeicons/core-free-icons";
import {
    AppHeader,
    AppShell,
    HeaderAction,
    HeaderBreadcrumbs,
    Confirmer,
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarItem,
    SidebarSub,
    Toaster,
    isActivePath,
    toast,
} from "@zse-gdansk/ui";
import { useState, useSyncExternalStore } from "react";

import { TableDemo } from "../TableDemo";

const COOKIE = "zse-sidebar";

// W Next.js to samo czyta serwer: (await cookies()).get(COOKIE).
const savedCollapsed = document.cookie
    .split("; ")
    .some((entry) => entry === `${COOKIE}=1`);

const CLASSES = ["1A", "1B", "2A", "2C", "3C", "4B"];

// Adres z hasha; w aplikacji to usePathname() z routera.
function Nav({ pathname }: { pathname: string }) {
    const item = (href: string, exact = false) => ({
        href: `#${href}`,
        active: isActivePath(pathname, href, { exact }),
    });

    return (
        <Sidebar>
            <SidebarHeader
                logo={<span className="demo-logo">Z</span>}
                title="Dziennik ZSE"
            />
            <SidebarContent>
                <SidebarGroup>
                    <SidebarItem icon={Home01Icon} {...item("/", true)}>
                        Start
                    </SidebarItem>
                </SidebarGroup>
                <SidebarGroup label="Dziennik">
                    <SidebarItem icon={UserGroupIcon} {...item("/uczniowie")}>
                        Uczniowie
                    </SidebarItem>
                    <SidebarItem
                        icon={CheckListIcon}
                        badge={3}
                        {...item("/punkty")}
                    >
                        Punkty
                    </SidebarItem>
                    <SidebarSub
                        icon={School01Icon}
                        label="Klasy"
                        active={isActivePath(pathname, "/klasy")}
                    >
                        {CLASSES.map((name) => (
                            <SidebarItem key={name} {...item(`/klasy/${name}`)}>
                                {name}
                            </SidebarItem>
                        ))}
                    </SidebarSub>
                    <SidebarItem icon={Calendar03Icon} {...item("/plan")}>
                        Plan lekcji
                    </SidebarItem>
                    <SidebarItem
                        icon={Analytics01Icon}
                        {...item("/statystyki")}
                    >
                        Statystyki
                    </SidebarItem>
                </SidebarGroup>
                <SidebarGroup label="Samorząd">
                    <SidebarItem icon={VoteIcon} {...item("/glosowania")}>
                        Głosowania
                    </SidebarItem>
                    <SidebarItem
                        icon={Megaphone01Icon}
                        {...item("/ogloszenia")}
                    >
                        Ogłoszenia
                    </SidebarItem>
                </SidebarGroup>
                <SidebarGroup label="Inne">
                    <SidebarItem icon={Settings01Icon} {...item("/ustawienia")}>
                        Ustawienia
                    </SidebarItem>
                    <SidebarItem
                        icon={Globe02Icon}
                        href="https://zse.edu.gdansk.pl/pl"
                        external
                    >
                        Strona szkoły
                    </SidebarItem>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}

// Nazwy sekcji z „adresu”; w aplikacji strona zna je sama, np. ucznia z bazy.
const TITLES: Record<string, string> = {
    "/": "Start",
    "/uczniowie": "Uczniowie",
    "/punkty": "Punkty",
    "/klasy": "Klasy",
    "/plan": "Plan lekcji",
    "/statystyki": "Statystyki",
    "/glosowania": "Głosowania",
    "/ogloszenia": "Ogłoszenia",
    "/ustawienia": "Ustawienia",
};

function crumbsFor(pathname: string) {
    const [, section = "", detail] = pathname.split("/");
    const items = [{ label: "Dziennik ZSE", href: "#/" }];
    if (section) {
        const label = TITLES[`/${section}`] ?? section;
        items.push(
            detail ? { label, href: `#/${section}` } : { label, href: "" },
        );
    }
    if (detail) items.push({ label: `Klasa ${detail}`, href: "" });
    return items.map(({ label, href }) => (href ? { label, href } : { label }));
}

function Header() {
    const [theme, setTheme] = useState(
        () => document.documentElement.dataset.theme ?? "light",
    );
    const toggleTheme = () => {
        const next = theme === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", next);
        setTheme(next);
    };

    return (
        <AppHeader
            title="Dziennik ZSE"
            actions={
                <>
                    <HeaderAction
                        icon={Search01Icon}
                        label="Szukaj"
                        shortcut="mod+k"
                        onClick={() => toast("Paleta poleceń będzie później")}
                    />
                    <HeaderAction
                        icon={Notification01Icon}
                        label="Powiadomienia"
                        badge
                        onClick={() => toast("3 nowe zgłoszenia")}
                    />
                    <HeaderAction
                        icon={theme === "light" ? Moon02Icon : Sun03Icon}
                        label={
                            theme === "light" ? "Ciemny motyw" : "Jasny motyw"
                        }
                        onClick={toggleTheme}
                    />
                    <HeaderAction
                        icon={DashboardSquare01Icon}
                        label="Wszystkie komponenty"
                        href="/"
                    />
                </>
            }
        />
    );
}

const subscribeHash = (onChange: () => void) => {
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
};
const readHash = () => location.hash.slice(1) || "/uczniowie";

export function LayoutDemo() {
    const pathname = useSyncExternalStore(subscribeHash, readHash);

    return (
        <AppShell
            sidebar={<Nav pathname={pathname} />}
            header={<Header />}
            cookie={COOKIE}
            defaultCollapsed={savedCollapsed}
        >
            <HeaderBreadcrumbs items={crumbsFor(pathname)} />
            <div className="demo-page">
                <p className="demo-lead">
                    Zwiń panel przyciskiem obok nazwy albo ⌘B / Ctrl+B. Breadcrumbs
                    podaje strona przez HeaderBreadcrumbs, a trafiają do paska.
                    Poniżej 768px panel wysuwa się z lewej. Zwinięcie zostaje w
                    cookie, więc przeżywa odświeżenie.
                </p>
                <TableDemo />
                <TableDemo />
            </div>
            <Toaster />
            <Confirmer />
        </AppShell>
    );
}
