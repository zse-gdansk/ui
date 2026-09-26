import {
    ArrowDown01Icon,
    Copy01Icon,
    Delete02Icon,
    Download04Icon,
    FolderTransferIcon,
    PencilEdit02Icon,
    Share08Icon,
} from "@hugeicons/core-free-icons";
import {
    Button,
    Menu,
    MenuCheckboxItem,
    MenuGroup,
    MenuItem,
    MenuRadioGroup,
    MenuRadioItem,
    MenuSeparator,
    MenuSub,
    toast,
} from "@zse-gdansk/ui";
import { useState } from "react";

const CLASSES = {
    "Technikum informatyk": ["1K", "2K", "3K", "4K"],
    "Technikum elektryk": ["1E", "2E", "3E"],
};

export function MenuDemo() {
    const [sort, setSort] = useState("nazwisko");
    const [showAverage, setShowAverage] = useState(true);

    return (
        <section className="button-row">
            <Menu
                trigger={
                    <Button
                        variant="outline"
                        icon={ArrowDown01Icon}
                        iconPosition="right"
                    >
                        Sprawdzian
                    </Button>
                }
            >
                <MenuItem
                    icon={PencilEdit02Icon}
                    shortcut="mod+e"
                    onClick={() => toast.info("Edycja sprawdzianu")}
                >
                    Edytuj
                </MenuItem>
                <MenuItem
                    icon={Copy01Icon}
                    shortcut="mod+d"
                    onClick={() => toast.success("Zduplikowano sprawdzian")}
                >
                    Duplikuj
                </MenuItem>
                <MenuSub label="Przenieś do klasy" icon={FolderTransferIcon}>
                    {Object.entries(CLASSES).map(([profile, classes]) => (
                        <MenuSub key={profile} label={profile}>
                            {classes.map((name) => (
                                <MenuItem
                                    key={name}
                                    onClick={() =>
                                        toast.success(`Przeniesiono do ${name}`)
                                    }
                                >
                                    {name}
                                </MenuItem>
                            ))}
                        </MenuSub>
                    ))}
                </MenuSub>
                <MenuSub label="Eksportuj" icon={Download04Icon}>
                    <MenuItem>PDF</MenuItem>
                    <MenuItem>Arkusz (.xlsx)</MenuItem>
                    <MenuItem disabled>Librus (wkrótce)</MenuItem>
                </MenuSub>
                <MenuItem icon={Share08Icon} href="#udostepnij">
                    Udostępnij link
                </MenuItem>
                <MenuSeparator />
                <MenuItem
                    icon={Delete02Icon}
                    variant="danger"
                    shortcut="mod+backspace"
                    onClick={() =>
                        toast.undo("Usunięto sprawdzian", {
                            onUndo: () => toast.info("Przywrócono"),
                        })
                    }
                >
                    Usuń
                </MenuItem>
            </Menu>

            <Menu trigger={<Button variant="ghost">Widok</Button>} align="end">
                <MenuGroup label="Sortuj według">
                    <MenuRadioGroup value={sort} onValueChange={setSort}>
                        <MenuRadioItem value="nazwisko">Nazwiska</MenuRadioItem>
                        <MenuRadioItem value="suma">Sumy punktów</MenuRadioItem>
                        <MenuRadioItem value="ocena">Oceny</MenuRadioItem>
                    </MenuRadioGroup>
                </MenuGroup>
                <MenuSeparator />
                <MenuCheckboxItem
                    checked={showAverage}
                    onCheckedChange={setShowAverage}
                    shortcut="mod+shift+a"
                >
                    Pokaż średnie
                </MenuCheckboxItem>
                <MenuCheckboxItem defaultChecked={false}>
                    Kompaktowe wiersze
                </MenuCheckboxItem>
            </Menu>
        </section>
    );
}
