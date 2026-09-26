import {
    Add01Icon,
    ArrowDataTransferHorizontalIcon,
    Analytics01Icon,
    Download04Icon,
    Calendar03Icon,
    CheckListIcon,
    DashboardSquare01Icon,
    Globe02Icon,
    Home01Icon,
    BellIcon,
    Bus01Icon,
    Clock01Icon,
    Database01Icon,
    DoorIcon,
    FileImportIcon,
    LibraryIcon,
    Shield01Icon,
    TeacherIcon,
    UserMultipleIcon,
    UserSwitchIcon,
    Logout03Icon,
    PaintBoardIcon,
    Settings02Icon,
    UserIcon,
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
    AppLoader,
    AppShell,
    Badge,
    Button,
    PageHeader,
    PageTab,
    PageTabs,
    HeaderAction,
    HeaderBreadcrumbs,
    Confirmer,
    Sidebar,
    SidebarBack,
    SidebarContent,
    SidebarFooter,
    MenuItem,
    MenuRadioGroup,
    MenuRadioItem,
    MenuSeparator,
    MenuSub,
    UserMenu,
    LocaleSubmenu,
    SidebarGroup,
    SidebarHeader,
    SidebarItem,
    SidebarSub,
    Toaster,
    isActivePath,
    toast,
} from "@zse-gdansk/ui";
import { GB, PL, UA } from "country-flag-icons/react/3x2";
import { useEffect, useState, useSyncExternalStore } from "react";

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
    // Ustawienia mają własny widok panelu, z powrotem do menu głównego.
    const settings = isActivePath(pathname, "/ustawienia");

    return (
        <Sidebar>
            <SidebarHeader
                logo={<span className="demo-logo">Z</span>}
                title="Dziennik ZSE"
            />
            <SidebarContent
                view={settings ? "settings" : "main"}
                level={settings ? 1 : 0}
            >
                {settings ? (
                    <>
                        <SidebarBack href="#/">Menu główne</SidebarBack>
                        <SidebarGroup label="Ustawienia">
                            <SidebarItem
                                icon={UserIcon}
                                {...item("/ustawienia", true)}
                            >
                                Konto
                            </SidebarItem>
                            <SidebarItem
                                icon={Notification01Icon}
                                {...item("/ustawienia/powiadomienia")}
                            >
                                Powiadomienia
                            </SidebarItem>
                            <SidebarItem
                                icon={Shield01Icon}
                                {...item("/ustawienia/bezpieczenstwo")}
                            >
                                Bezpieczeństwo
                            </SidebarItem>
                        </SidebarGroup>
                        <SidebarGroup label="Szkoła">
                            <SidebarItem
                                icon={School01Icon}
                                {...item("/ustawienia/szkola")}
                            >
                                Dane szkoły
                            </SidebarItem>
                            <SidebarItem
                                icon={ArrowDataTransferHorizontalIcon}
                                {...item("/ustawienia/integracje")}
                            >
                                Integracje
                            </SidebarItem>
                        </SidebarGroup>
                    </>
                ) : (
                    <>
                        <SidebarGroup>
                            <SidebarItem icon={Home01Icon} {...item("/", true)}>
                                Start
                            </SidebarItem>
                        </SidebarGroup>
                        <SidebarGroup label="Dziennik">
                            <SidebarItem
                                icon={UserGroupIcon}
                                {...item("/uczniowie")}
                            >
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
                                    <SidebarItem
                                        key={name}
                                        {...item(`/klasy/${name}`)}
                                    >
                                        {name}
                                    </SidebarItem>
                                ))}
                            </SidebarSub>
                            <SidebarItem
                                icon={Calendar03Icon}
                                {...item("/plan")}
                            >
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
                            <SidebarItem
                                icon={VoteIcon}
                                {...item("/glosowania")}
                            >
                                Głosowania
                            </SidebarItem>
                            <SidebarItem
                                icon={Megaphone01Icon}
                                {...item("/ogloszenia")}
                            >
                                Ogłoszenia
                            </SidebarItem>
                        </SidebarGroup>
                        <SidebarGroup label="Szkoła">
                            <SidebarItem
                                icon={TeacherIcon}
                                {...item("/nauczyciele")}
                            >
                                Nauczyciele
                            </SidebarItem>
                            <SidebarItem icon={DoorIcon} {...item("/sale")}>
                                Sale
                            </SidebarItem>
                            <SidebarItem icon={BellIcon} {...item("/dzwonki")}>
                                Dzwonki
                            </SidebarItem>
                            <SidebarItem
                                icon={UserSwitchIcon}
                                badge={2}
                                {...item("/zastepstwa")}
                            >
                                Zastępstwa
                            </SidebarItem>
                            <SidebarItem
                                icon={Bus01Icon}
                                {...item("/wycieczki")}
                            >
                                Wycieczki
                            </SidebarItem>
                            <SidebarItem
                                icon={LibraryIcon}
                                {...item("/biblioteka")}
                            >
                                Biblioteka
                            </SidebarItem>
                        </SidebarGroup>
                        <SidebarGroup label="Administracja">
                            <SidebarItem
                                icon={UserMultipleIcon}
                                {...item("/uzytkownicy")}
                            >
                                Użytkownicy
                            </SidebarItem>
                            <SidebarItem
                                icon={Shield01Icon}
                                {...item("/uprawnienia")}
                            >
                                Uprawnienia
                            </SidebarItem>
                            <SidebarItem
                                icon={FileImportIcon}
                                {...item("/import")}
                            >
                                Import danych
                            </SidebarItem>
                            <SidebarItem
                                icon={Database01Icon}
                                {...item("/kopie")}
                            >
                                Kopie zapasowe
                            </SidebarItem>
                            <SidebarItem icon={Clock01Icon} {...item("/logi")}>
                                Historia zmian
                            </SidebarItem>
                        </SidebarGroup>
                        <SidebarGroup label="Inne">
                            <SidebarItem
                                icon={Settings01Icon}
                                opensView
                                {...item("/ustawienia")}
                            >
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
                    </>
                )}
            </SidebarContent>
            <SidebarFooter>
                <Account />
            </SidebarFooter>
        </Sidebar>
    );
}

function Account() {
    const theme = useTheme();
    const [language, setLanguage] = useState("pl");

    return (
        <UserMenu name="Anna Kowalska" description="Nauczycielka matematyki">
            <MenuItem icon={UserIcon} onClick={() => toast("Profil")}>
                Profil
            </MenuItem>
            <MenuItem icon={Settings02Icon} onClick={() => toast("Ustawienia")}>
                Ustawienia
            </MenuItem>
            <MenuSeparator />
            <MenuSub icon={PaintBoardIcon} label="Motyw">
                <MenuRadioGroup value={theme} onValueChange={setTheme}>
                    <MenuRadioItem value="light" closeOnClick>
                        Jasny
                    </MenuRadioItem>
                    <MenuRadioItem value="dark" closeOnClick>
                        Ciemny
                    </MenuRadioItem>
                </MenuRadioGroup>
            </MenuSub>
            <LocaleSubmenu
                locales={["pl", "en", "uk"]}
                value={language}
                flags={{ pl: PL, en: GB, uk: UA }}
                // Udaje wczytywanie tłumaczeń, żeby było widać spinner.
                onValueChange={(next) =>
                    new Promise<void>((done) =>
                        setTimeout(() => {
                            setLanguage(next);
                            done();
                        }, 700),
                    )
                }
            />
            <MenuSeparator />
            <MenuItem
                icon={Logout03Icon}
                variant="danger-hover"
                onClick={() => toast("Wylogowano")}
            >
                Wyloguj
            </MenuItem>
        </UserMenu>
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
    "/nauczyciele": "Nauczyciele",
    "/sale": "Sale",
    "/dzwonki": "Dzwonki",
    "/zastepstwa": "Zastępstwa",
    "/wycieczki": "Wycieczki",
    "/biblioteka": "Biblioteka",
    "/uzytkownicy": "Użytkownicy",
    "/uprawnienia": "Uprawnienia",
    "/import": "Import danych",
    "/kopie": "Kopie zapasowe",
    "/logi": "Historia zmian",
};

// Nazwy podstron (trzeci człon adresu i ustawienia).
const SUBPAGES: Record<string, string> = {
    punkty: "Punkty",
    frekwencja: "Frekwencja",
    plan: "Plan lekcji",
    powiadomienia: "Powiadomienia",
    bezpieczenstwo: "Bezpieczeństwo",
    szkola: "Dane szkoły",
    integracje: "Integracje",
};

function labelFor(parts: string[], index: number) {
    const part = parts[index] ?? "";
    if (index === 0) return TITLES[`/${part}`] ?? part;
    if (parts[0] === "klasy" && index === 1) return `Klasa ${part}`;
    return SUBPAGES[part] ?? part;
}

function crumbsFor(pathname: string) {
    const parts = pathname.split("/").filter(Boolean);
    return [
        { label: "Dziennik ZSE", href: "#/" },
        ...parts.map((_, index) =>
            index === parts.length - 1
                ? { label: labelFor(parts, index) }
                : {
                      label: labelFor(parts, index),
                      href: `#/${parts.slice(0, index + 1).join("/")}`,
                  },
        ),
    ];
}

function pageTitle(pathname: string) {
    const parts = pathname.split("/").filter(Boolean);
    // Podstrony klasy mają tytuł klasy, a podstronę pokazują zakładki.
    if (parts[0] === "klasy" && parts[1]) return `Klasa ${parts[1]}`;
    if (parts.length === 0) return "Start";
    return labelFor(parts, parts.length - 1);
}

// Zakładki klasy pod nagłówkiem: każda to osobny adres.
function ClassTabs({ pathname }: { pathname: string }) {
    const [, section, name] = pathname.split("/");
    if (section !== "klasy" || !name) return null;
    const base = `/klasy/${name}`;
    const tab = (href: string, exact = false) => ({
        href: `#${href}`,
        active: isActivePath(pathname, href, { exact }),
    });

    return (
        <PageTabs label={`Widoki klasy ${name}`}>
            <PageTab {...tab(base, true)}>Uczniowie</PageTab>
            <PageTab {...tab(`${base}/punkty`)}>Punkty</PageTab>
            <PageTab {...tab(`${base}/frekwencja`)} badge={3}>
                Frekwencja
            </PageTab>
            <PageTab {...tab(`${base}/plan`)}>Plan lekcji</PageTab>
        </PageTabs>
    );
}

// Motyw z atrybutu na <html>, wspólny dla paska i menu konta.
const subscribeTheme = (onChange: () => void) => {
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
};
const readTheme = () => document.documentElement.dataset.theme ?? "light";
const setTheme = (theme: string) =>
    document.documentElement.setAttribute("data-theme", theme);

function useTheme() {
    return useSyncExternalStore(subscribeTheme, readTheme);
}

function Header() {
    const theme = useTheme();
    const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

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
                        priority="secondary"
                    />
                    <HeaderAction
                        icon={DashboardSquare01Icon}
                        label="Wszystkie komponenty"
                        href="/"
                        priority="secondary"
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

// ?loader=slow: wczytywanie się nie kończy (dopisek po 8 s),
// ?loader=error: błąd z ponowieniem.
const LOADER_MODE = new URLSearchParams(location.search).get("loader");

export function LayoutDemo() {
    const pathname = useSyncExternalStore(subscribeHash, readHash);
    const [status, setStatus] = useState<"loading" | "ready" | "error">(
        "loading",
    );
    const [attempt, setAttempt] = useState(0);

    // Udaje wczytywanie sesji i uprawnień przy wejściu do panelu.
    useEffect(() => {
        if (LOADER_MODE === "slow") return;
        const timer = setTimeout(
            () =>
                setStatus(
                    LOADER_MODE === "error" && attempt === 0
                        ? "error"
                        : "ready",
                ),
            1500,
        );
        return () => clearTimeout(timer);
    }, [attempt]);

    return (
        <AppLoader
            loading={status === "loading"}
            error={status === "error"}
            label="Wczytywanie dziennika"
            onRetry={() => {
                setStatus("loading");
                setAttempt((value) => value + 1);
            }}
        >
            <AppShell
                sidebar={<Nav pathname={pathname} />}
                header={<Header />}
                cookie={COOKIE}
                defaultCollapsed={savedCollapsed}
            >
                <HeaderBreadcrumbs items={crumbsFor(pathname)} />
                <div className="demo-page">
                    <PageHeader
                        title={pageTitle(pathname)}
                        description="Zwiń panel przyciskiem obok nazwy albo ⌘B / Ctrl+B."
                        meta={
                            <>
                                <Badge tone="success" size="sm">
                                    64 uczniów
                                </Badge>
                                <span>Rok szkolny 2026/27</span>
                            </>
                        }
                        actions={
                            <>
                                <Button
                                    variant="outline"
                                    icon={Download04Icon}
                                    onClick={() => toast("Eksport do CSV")}
                                >
                                    Eksport
                                </Button>
                                <Button
                                    icon={Add01Icon}
                                    onClick={() => toast("Nowy uczeń")}
                                >
                                    Dodaj ucznia
                                </Button>
                            </>
                        }
                    />
                    <ClassTabs pathname={pathname} />
                    <TableDemo />
                    <TableDemo />
                </div>
                <Toaster />
                <Confirmer />
            </AppShell>
        </AppLoader>
    );
}
