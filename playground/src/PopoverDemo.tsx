import {
    Copy01Icon,
    Delete02Icon,
    Download04Icon,
    FolderTransferIcon,
    InformationCircleIcon,
    PencilEdit02Icon,
} from "@hugeicons/core-free-icons";
import {
    Avatar,
    Badge,
    Button,
    Checkbox,
    ContextMenu,
    Icon,
    MenuCheckboxItem,
    MenuItem,
    MenuSeparator,
    MenuSub,
    Popover,
    PopoverClose,
    toast,
} from "@zse-gdansk/ui";

export function PopoverDemo() {
    return (
        <section className="badges">
            <ContextMenu
                trigger={
                    <div className="context-area">
                        <strong>Sprawdzian z fizyki</strong>
                        <span>
                            Kliknij prawym przyciskiem, a na telefonie
                            przytrzymaj palec
                        </span>
                    </div>
                }
            >
                <MenuItem
                    icon={PencilEdit02Icon}
                    shortcut="mod+e"
                    onClick={() => toast.info("Edycja")}
                >
                    Edytuj
                </MenuItem>
                <MenuItem icon={Copy01Icon} shortcut="mod+d">
                    Duplikuj
                </MenuItem>
                <MenuSub label="Przenieś do klasy" icon={FolderTransferIcon}>
                    <MenuItem>3C</MenuItem>
                    <MenuItem>3K</MenuItem>
                    <MenuItem>4E</MenuItem>
                </MenuSub>
                <MenuItem icon={Download04Icon}>Eksportuj do PDF</MenuItem>
                <MenuSeparator />
                <MenuCheckboxItem defaultChecked>
                    Widoczny dla uczniów
                </MenuCheckboxItem>
                <MenuSeparator />
                <MenuItem
                    icon={Delete02Icon}
                    variant="danger"
                    onClick={() => toast.error("Usunięto sprawdzian")}
                >
                    Usuń
                </MenuItem>
            </ContextMenu>

            <div className="button-row">
                <Popover
                    trigger={<Button variant="outline">Filtry</Button>}
                    title="Pokaż prace"
                    align="start"
                    closable
                >
                    <div className="sheet-stack">
                        <Checkbox label="Oddane" defaultChecked />
                        <Checkbox label="Spóźnione" defaultChecked />
                        <Checkbox label="Bez oceny" />
                        <PopoverClose render={<Button size="sm" />}>
                            Zastosuj
                        </PopoverClose>
                    </div>
                </Popover>

                <Popover
                    trigger={
                        <button
                            type="button"
                            className="info"
                            aria-label="Jak liczona jest frekwencja"
                        >
                            <Icon icon={InformationCircleIcon} />
                        </button>
                    }
                    title="Frekwencja"
                    description="Liczymy tylko głosy oddane do piątku, 15:00. Uczniowie z nieobecnością usprawiedliwioną nie wchodzą do mianownika."
                    arrow
                    width="18rem"
                />

                <Popover
                    openOnHover
                    arrow
                    side="top"
                    trigger={
                        <button type="button" className="popover-person">
                            <Avatar name="Nowak Szymon" size="sm" />
                            Nowak Szymon
                        </button>
                    }
                >
                    <div className="popover-profile">
                        <Avatar name="Nowak Szymon" size="lg" />
                        <div>
                            <strong>Nowak Szymon</strong>
                            <div className="popover-muted">3C, numer 14</div>
                        </div>
                    </div>
                    <div className="button-row">
                        <Badge tone="success" dot>
                            7 z 8 oddanych
                        </Badge>
                        <Badge tone="warning">1 spóźnione</Badge>
                    </div>
                </Popover>
            </div>
        </section>
    );
}
