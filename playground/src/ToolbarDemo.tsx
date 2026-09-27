import {
    Comment01Icon,
    Copy01Icon,
    Cursor01Icon,
    Delete02Icon,
    Download04Icon,
    EraserIcon,
    FileExportIcon,
    Image01Icon,
    LeftToRightListBulletIcon,
    LeftToRightListNumberIcon,
    Link01Icon,
    MoreHorizontalIcon,
    Move01Icon,
    PencilEdit01Icon,
    PinIcon,
    PinOffIcon,
    PrinterIcon,
    Redo02Icon,
    Share08Icon,
    TextAlignCenterIcon,
    TextAlignLeftIcon,
    TextAlignRightIcon,
    TextBoldIcon,
    TextItalicIcon,
    TextUnderlineIcon,
    Undo02Icon,
} from "@hugeicons/core-free-icons";
import {
    MenuItem,
    MenuSeparator,
    Toolbar,
    ToolbarButton,
    ToolbarGroup,
    ToolbarLink,
    ToolbarMenu,
    ToolbarSeparator,
    ToolbarSpacer,
    ToolbarToggle,
    ToolbarToggleGroup,
    toast,
} from "@zse-gdansk/ui";
import { useState } from "react";

export function ToolbarDemo() {
    const [tool, setTool] = useState(["cursor"]);

    return (
        <section className="toolbar-demo">
            <Toolbar aria-label="Formatowanie ogłoszenia" variant="outline">
                <ToolbarGroup aria-label="Historia">
                    <ToolbarButton icon={Undo02Icon} label="Cofnij" />
                    <ToolbarButton icon={Redo02Icon} label="Ponów" disabled />
                </ToolbarGroup>
                <ToolbarSeparator />
                <ToolbarToggleGroup
                    aria-label="Styl tekstu"
                    multiple
                    defaultValue={["bold"]}
                >
                    <ToolbarToggle
                        value="bold"
                        icon={TextBoldIcon}
                        label="Pogrubienie"
                    />
                    <ToolbarToggle
                        value="italic"
                        icon={TextItalicIcon}
                        label="Kursywa"
                    />
                    <ToolbarToggle
                        value="underline"
                        icon={TextUnderlineIcon}
                        label="Podkreślenie"
                    />
                </ToolbarToggleGroup>
                <ToolbarSeparator />
                <ToolbarToggleGroup
                    aria-label="Wyrównanie"
                    defaultValue={["left"]}
                >
                    <ToolbarToggle
                        value="left"
                        icon={TextAlignLeftIcon}
                        label="Do lewej"
                    />
                    <ToolbarToggle
                        value="center"
                        icon={TextAlignCenterIcon}
                        label="Do środka"
                    />
                    <ToolbarToggle
                        value="right"
                        icon={TextAlignRightIcon}
                        label="Do prawej"
                    />
                </ToolbarToggleGroup>
                <ToolbarSeparator />
                <ToolbarGroup aria-label="Wstaw">
                    <ToolbarButton
                        icon={LeftToRightListBulletIcon}
                        label="Lista punktowana"
                    />
                    <ToolbarButton
                        icon={LeftToRightListNumberIcon}
                        label="Lista numerowana"
                    />
                    <ToolbarButton icon={Link01Icon} label="Wstaw link" />
                    <ToolbarButton
                        icon={Image01Icon}
                        label="Wstaw zdjęcie"
                        tooltip="Wstaw zdjęcie (do 5 MB)"
                    />
                </ToolbarGroup>
                <ToolbarSpacer />
                <ToolbarMenu
                    icon={MoreHorizontalIcon}
                    label="Więcej"
                    align="end"
                >
                    <MenuItem icon={Copy01Icon}>Duplikuj ogłoszenie</MenuItem>
                    <MenuItem icon={PrinterIcon}>Drukuj</MenuItem>
                    <MenuSeparator />
                    <MenuItem icon={Delete02Icon} variant="danger">
                        Usuń szkic
                    </MenuItem>
                </ToolbarMenu>
            </Toolbar>

            <Toolbar aria-label="Plan lekcji klasy 3C">
                <ToolbarToggle
                    icon={PinIcon}
                    pressedIcon={PinOffIcon}
                    label="Przypnij plan"
                >
                    Przypnij
                </ToolbarToggle>
                <ToolbarMenu icon={FileExportIcon} text="Eksportuj">
                    <MenuItem icon={Download04Icon}>PDF do druku</MenuItem>
                    <MenuItem icon={Download04Icon}>Kalendarz (.ics)</MenuItem>
                </ToolbarMenu>
                <ToolbarLink icon={PrinterIcon} href="#">
                    Podgląd wydruku
                </ToolbarLink>
                <ToolbarButton
                    icon={Share08Icon}
                    onClick={() => toast("Skopiowano link do planu")}
                >
                    Udostępnij
                </ToolbarButton>
            </Toolbar>

            <div className="toolbar-demo-row">
                <Toolbar
                    aria-label="Narzędzia tablicy"
                    orientation="vertical"
                    variant="floating"
                >
                    <ToolbarToggleGroup
                        aria-label="Narzędzie"
                        value={tool}
                        // Zawsze jedno narzędzie wybrane.
                        onValueChange={(next) => next.length && setTool(next)}
                    >
                        <ToolbarToggle
                            value="cursor"
                            icon={Cursor01Icon}
                            label="Zaznaczanie"
                        />
                        <ToolbarToggle
                            value="pen"
                            icon={PencilEdit01Icon}
                            label="Pióro"
                        />
                        <ToolbarToggle
                            value="eraser"
                            icon={EraserIcon}
                            label="Gumka"
                        />
                        <ToolbarToggle
                            value="move"
                            icon={Move01Icon}
                            label="Przesuwanie"
                        />
                    </ToolbarToggleGroup>
                    <ToolbarSeparator />
                    <ToolbarButton icon={Undo02Icon} label="Cofnij" />
                </Toolbar>

                <Toolbar
                    aria-label="Zaznaczony fragment"
                    variant="floating"
                    size="sm"
                >
                    <ToolbarButton icon={Comment01Icon}>
                        Komentarz
                    </ToolbarButton>
                    <ToolbarButton icon={Copy01Icon} label="Kopiuj" />
                    <ToolbarSeparator />
                    <ToolbarButton icon={Delete02Icon} label="Usuń" />
                </Toolbar>

                <Toolbar
                    aria-label="Wyłączony pasek"
                    variant="outline"
                    disabled
                >
                    <ToolbarButton icon={Undo02Icon} label="Cofnij" />
                    <ToolbarToggle icon={TextBoldIcon} label="Pogrubienie" />
                    <ToolbarMenu icon={MoreHorizontalIcon} label="Więcej">
                        <MenuItem>Nic tu nie ma</MenuItem>
                    </ToolbarMenu>
                </Toolbar>
            </div>
        </section>
    );
}
