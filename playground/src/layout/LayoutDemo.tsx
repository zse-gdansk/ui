import {
    Analytics01Icon,
    Calendar03Icon,
    CheckListIcon,
    Globe02Icon,
    Home01Icon,
    Megaphone01Icon,
    School01Icon,
    Settings01Icon,
    UserGroupIcon,
    VoteIcon,
} from "@hugeicons/core-free-icons";
import {
    AppShell,
    AppShellTrigger,
    Confirmer,
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarItem,
    SidebarSub,
    Toaster,
    isActivePath,
} from "@zse-gdansk/ui";
import { useState } from "react";

import { TableDemo } from "../TableDemo";

const COOKIE = "zse-sidebar";

// W Next.js to samo czyta serwer: (await cookies()).get(COOKIE).
const savedCollapsed = document.cookie
    .split("; ")
    .some((entry) => entry === `${COOKIE}=1`);

const CLASSES = ["1A", "1B", "2A", "2C", "3C", "4B"];

// Adres udawany stanem; w aplikacji to usePathname() z routera.
function Nav({
    pathname,
    navigate,
}: {
    pathname: string;
    navigate: (path: string) => void;
}) {
    const item = (href: string, exact = false) => ({
        href: `#${href}`,
        active: isActivePath(pathname, href, { exact }),
        onClick: () => navigate(href),
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
                        href="https://zse.edu.pl"
                        external
                    >
                        Strona szkoły
                    </SidebarItem>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
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
        <>
            <AppShellTrigger />
            <span className="demo-header-title">Uczniowie</span>
            <div className="demo-header-actions">
                <button type="button" onClick={toggleTheme}>
                    Motyw: {theme}
                </button>
                <a href="/">Komponenty</a>
            </div>
        </>
    );
}

export function LayoutDemo() {
    const [pathname, setPathname] = useState("/uczniowie");

    return (
        <AppShell
            sidebar={<Nav pathname={pathname} navigate={setPathname} />}
            header={<Header />}
            cookie={COOKIE}
            defaultCollapsed={savedCollapsed}
        >
            <div className="demo-page">
                <p className="demo-lead">
                    Zwiń panel przyciskiem albo ⌘B / Ctrl+B. Poniżej 768px panel
                    wysuwa się z lewej. Zwinięcie zostaje w cookie, więc
                    przeżywa odświeżenie.
                </p>
                <TableDemo />
                <TableDemo />
            </div>
            <Toaster />
            <Confirmer />
        </AppShell>
    );
}
