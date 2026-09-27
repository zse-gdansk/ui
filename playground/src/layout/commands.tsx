import {
    Add01Icon,
    Analytics01Icon,
    Award01Icon,
    BellIcon,
    Bus01Icon,
    Calendar03Icon,
    CheckListIcon,
    Clock01Icon,
    ComputerIcon,
    Database01Icon,
    DoorIcon,
    Download04Icon,
    FileImportIcon,
    Home01Icon,
    LibraryIcon,
    Logout03Icon,
    Megaphone01Icon,
    Moon02Icon,
    NoteEditIcon,
    PaintBoardIcon,
    Refresh01Icon,
    School01Icon,
    Settings01Icon,
    Shield01Icon,
    SidebarLeftIcon,
    Sun03Icon,
    TeacherIcon,
    TranslateIcon,
    UserGroupIcon,
    UserMultipleIcon,
    VoteIcon,
} from "@hugeicons/core-free-icons";
import {
    createSearch,
    toast,
    useAppShell,
    useCommandSource,
    useCommands,
    type Command,
    type CommandOption,
} from "@zse-gdansk/ui";
import { useMemo } from "react";

import { STUDENTS } from "../TableDemo";

const CLASSES = ["1A", "1B", "2A", "2C", "3C", "4B"];

const wait = (ms: number, signal?: AbortSignal) =>
    new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, ms);
        signal?.addEventListener("abort", () => {
            clearTimeout(timer);
            reject(signal.reason);
        });
    });

const findStudents = createSearch(STUDENTS, { keys: ["name", "className"] });

// Udaje API: wyszukiwanie uczniów na serwerze z opóźnieniem sieci.
async function searchStudents(query: string, signal: AbortSignal) {
    await wait(300, signal);
    const results = query.trim()
        ? findStudents(query).map((result) => result.item)
        : STUDENTS;
    return results.slice(0, 8);
}

const studentOption = (student: (typeof STUDENTS)[number]): CommandOption => ({
    value: String(student.id),
    label: student.name,
    subtitle: student.className,
    avatar: { name: student.name },
});

const pickStudent = {
    id: "student",
    type: "choice",
    label: "Uczeń",
    placeholder: "Szukaj ucznia…",
    options: async (query: string, signal: AbortSignal) =>
        (await searchStudents(query, signal)).map(studentOption),
} as const;

const setTheme = (theme: string) =>
    document.documentElement.setAttribute("data-theme", theme);

const page = (
    id: string,
    title: string,
    icon: NonNullable<Command["icon"]>,
    href: string,
    extra: Partial<Command> = {},
): Command => ({
    id: `nav.${id}`,
    title,
    icon,
    href: `#${href}`,
    group: "Przejdź do",
    ...extra,
});

let syncs = 0;

// Polecenia całej aplikacji; strony dokładają swoje przez useCommands.
const APP_COMMANDS: Command[] = [
    page("start", "Start", Home01Icon, "/", { shortcut: "g h" }),
    page("students", "Uczniowie", UserGroupIcon, "/uczniowie", {
        shortcut: "g u",
    }),
    page("points", "Punkty", Award01Icon, "/punkty", { shortcut: "g p" }),
    {
        id: "nav.classes",
        title: "Klasy",
        icon: School01Icon,
        group: "Przejdź do",
        shortcut: "g k",
        placeholder: "Szukaj klasy…",
        children: CLASSES.map((name) => ({
            id: `nav.class.${name}`,
            title: `Klasa ${name}`,
            keywords: [name],
            href: `#/klasy/${name}`,
        })),
    },
    page("plan", "Plan lekcji", Calendar03Icon, "/plan", { shortcut: "g l" }),
    page("stats", "Statystyki", Analytics01Icon, "/statystyki"),
    page("votes", "Głosowania", VoteIcon, "/glosowania", { shortcut: "g g" }),
    page("news", "Ogłoszenia", Megaphone01Icon, "/ogloszenia", {
        shortcut: "g o",
    }),
    page("teachers", "Nauczyciele", TeacherIcon, "/nauczyciele", {
        shortcut: "g n",
    }),
    // Rzadziej używane: tylko w wynikach, pusta lista zostaje krótka.
    ...(
        [
            ["rooms", "Sale", DoorIcon, "/sale"],
            ["bells", "Dzwonki", BellIcon, "/dzwonki"],
            ["subs", "Zastępstwa", CheckListIcon, "/zastepstwa"],
            ["trips", "Wycieczki", Bus01Icon, "/wycieczki"],
            ["library", "Biblioteka", LibraryIcon, "/biblioteka"],
            ["users", "Użytkownicy", UserMultipleIcon, "/uzytkownicy"],
            ["roles", "Uprawnienia", Shield01Icon, "/uprawnienia"],
            ["import", "Import danych", FileImportIcon, "/import"],
            ["backups", "Kopie zapasowe", Database01Icon, "/kopie"],
            ["log", "Historia zmian", Clock01Icon, "/logi"],
        ] as const
    ).map(([id, title, icon, href]) =>
        page(id, title, icon, href, { searchOnly: true }),
    ),

    {
        id: "action.note",
        title: "Dodaj uwagę",
        icon: NoteEditIcon,
        group: "Akcje",
        keywords: ["zachowanie", "pochwała"],
        shortcut: "n",
        steps: [
            pickStudent,
            {
                id: "text",
                label: "Treść uwagi",
                placeholder: "Np. pomoc przy organizacji apelu",
                validate: (value) =>
                    value.length < 5 ? "Co najmniej 5 znaków" : null,
            },
        ],
        perform: async ({ labels }) => {
            await wait(700);
            toast.success(`Dodano uwagę: ${labels.student}`);
        },
    },
    {
        id: "action.points",
        title: "Przyznaj punkty",
        icon: Award01Icon,
        group: "Akcje",
        keywords: ["zachowanie", "plus", "minus"],
        steps: [
            pickStudent,
            {
                id: "reason",
                type: "choice",
                label: "Powód",
                options: [
                    { value: "contest", label: "Konkurs", subtitle: "+20" },
                    { value: "help", label: "Pomoc w szkole", subtitle: "+10" },
                    {
                        value: "volunteer",
                        label: "Wolontariat",
                        subtitle: "+15",
                    },
                    { value: "late", label: "Spóźnienia", subtitle: "−5" },
                ],
            },
            {
                id: "points",
                label: "Liczba punktów",
                inputMode: "numeric",
                defaultValue: ({ reason }) =>
                    ({
                        contest: "20",
                        help: "10",
                        volunteer: "15",
                        late: "-5",
                    })[reason ?? ""] ?? "",
                validate: (value) =>
                    /^[+-−]?\d+$/.test(value) &&
                    Math.abs(Number(value.replace("−", "-"))) <= 50
                        ? null
                        : "Liczba od −50 do 50",
            },
        ],
        perform: async ({ labels, values }) => {
            await wait(500);
            toast.success(`${labels.student}: ${values.points} pkt`);
        },
    },
    {
        id: "action.announce",
        title: "Nowe ogłoszenie",
        icon: Megaphone01Icon,
        group: "Akcje",
        steps: [{ id: "title", label: "Tytuł ogłoszenia" }],
        perform: ({ values }) => {
            toast.success(`Opublikowano: ${values.title}`);
        },
    },
    {
        id: "action.sync",
        title: "Synchronizuj z e-dziennikiem",
        icon: Refresh01Icon,
        group: "Akcje",
        // Co drugi raz błąd: paleta zostaje otwarta z komunikatem.
        perform: async () => {
            await wait(1200);
            syncs += 1;
            if (syncs % 2 === 1) throw new Error("Brak połączenia");
            toast.success("Zsynchronizowano");
        },
    },

    {
        id: "settings.theme",
        title: "Motyw",
        icon: PaintBoardIcon,
        group: "Ustawienia",
        children: [
            {
                id: "settings.theme.light",
                title: "Jasny",
                icon: Sun03Icon,
                keywords: ["light", "dzień"],
                perform: () => setTheme("light"),
            },
            {
                id: "settings.theme.dark",
                title: "Ciemny",
                icon: Moon02Icon,
                keywords: ["dark", "noc"],
                perform: () => setTheme("dark"),
            },
            {
                id: "settings.theme.system",
                title: "Systemowy",
                icon: ComputerIcon,
                perform: () =>
                    setTheme(
                        matchMedia("(prefers-color-scheme: dark)").matches
                            ? "dark"
                            : "light",
                    ),
            },
        ],
    },
    {
        id: "settings.language",
        title: "Język",
        icon: TranslateIcon,
        group: "Ustawienia",
        children: [
            ["pl", "Polski"],
            ["en", "English"],
            ["uk", "Українська"],
        ].map(([code, title]) => ({
            id: `settings.language.${code}`,
            title: title ?? "",
            perform: () => toast(`Język: ${title}`),
        })),
    },
    {
        id: "settings.all",
        title: "Ustawienia",
        icon: Settings01Icon,
        group: "Ustawienia",
        href: "#/ustawienia",
        shortcut: "g s",
    },
    {
        id: "account.logout",
        title: "Wyloguj",
        icon: Logout03Icon,
        group: "Ustawienia",
        danger: true,
        perform: () => toast("Wylogowano"),
    },
];

// Polecenia z dostępem do szkieletu, więc rejestrowane w <AppShell>.
export function AppCommands() {
    const shell = useAppShell();
    const commands = useMemo<Command[]>(
        () => [
            ...APP_COMMANDS,
            {
                id: "view.sidebar",
                title: shell.collapsed ? "Rozwiń panel" : "Zwiń panel",
                icon: SidebarLeftIcon,
                group: "Ustawienia",
                // Skrót obsługuje AppShell, tu tylko go widać.
                shortcut: "mod+b",
                keywords: ["sidebar", "menu"],
                perform: shell.toggle,
            },
        ],
        [shell.collapsed, shell.toggle],
    );
    useCommands(commands);

    useCommandSource({
        id: "students",
        group: "Uczniowie",
        search: async (query, signal) =>
            (await searchStudents(query, signal)).map((student) => ({
                id: `student.${student.id}`,
                title: student.name,
                subtitle: student.className,
                avatar: { name: student.name },
                href: `#/uczniowie/${student.id}`,
            })),
    });

    return null;
}

// Polecenia jednej strony: są w palecie tylko, gdy strona jest otwarta.
const STUDENTS_PAGE: Command[] = [
    {
        id: "page.students.add",
        title: "Dodaj ucznia",
        icon: Add01Icon,
        group: "Ta strona",
        shortcut: "c u",
        perform: () => toast("Nowy uczeń"),
    },
    {
        id: "page.students.export",
        title: "Eksportuj listę do CSV",
        icon: Download04Icon,
        group: "Ta strona",
        perform: () => toast("Eksport do CSV"),
    },
];

export function StudentsPageCommands() {
    useCommands(STUDENTS_PAGE);
    return null;
}
