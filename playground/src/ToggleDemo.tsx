import {
    Notification01Icon,
    NotificationOff01Icon,
    PinIcon,
    PinOffIcon,
    TextAlignCenterIcon,
    TextAlignLeftIcon,
    TextAlignRightIcon,
    TextBoldIcon,
    TextItalicIcon,
    TextUnderlineIcon,
    ViewIcon,
    ViewOffIcon,
} from "@hugeicons/core-free-icons";
import { Separator, Toggle, ToggleGroup } from "@zse-gdansk/ui";

export function ToggleDemo() {
    return (
        <section className="badges">
            <div className="button-row misc-toolbar">
                <ToggleGroup
                    aria-label="Formatowanie"
                    multiple
                    variant="outline"
                    size="sm"
                    defaultValue={["bold"]}
                    items={[
                        {
                            value: "bold",
                            icon: TextBoldIcon,
                            "aria-label": "Pogrubienie",
                        },
                        {
                            value: "italic",
                            icon: TextItalicIcon,
                            "aria-label": "Kursywa",
                        },
                        {
                            value: "underline",
                            icon: TextUnderlineIcon,
                            "aria-label": "Podkreślenie",
                        },
                    ]}
                />
                <Separator orientation="vertical" />
                <ToggleGroup
                    aria-label="Wyrównanie"
                    size="sm"
                    defaultValue={["left"]}
                    items={[
                        {
                            value: "left",
                            icon: TextAlignLeftIcon,
                            "aria-label": "Do lewej",
                        },
                        {
                            value: "center",
                            icon: TextAlignCenterIcon,
                            "aria-label": "Do środka",
                        },
                        {
                            value: "right",
                            icon: TextAlignRightIcon,
                            "aria-label": "Do prawej",
                        },
                    ]}
                />
            </div>
            <div className="button-row">
                <Toggle
                    icon={PinIcon}
                    pressedIcon={PinOffIcon}
                    aria-label="Przypnij sprawdzian"
                />
                <Toggle
                    icon={ViewIcon}
                    pressedIcon={ViewOffIcon}
                    variant="outline"
                >
                    Ukryj oceny
                </Toggle>
                <Toggle
                    icon={Notification01Icon}
                    pressedIcon={NotificationOff01Icon}
                    defaultPressed
                >
                    Wycisz powiadomienia
                </Toggle>
                <Toggle variant="outline" disabled>
                    Zablokowany
                </Toggle>
            </div>
        </section>
    );
}
