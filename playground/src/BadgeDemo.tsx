import {
    Clock01Icon,
    SchoolIcon,
    Tick02Icon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@zse-gdansk/ui";

const TONES = ["neutral", "accent", "success", "warning", "danger"] as const;
const LABELS = {
    neutral: "Szkic",
    accent: "Nowe",
    success: "Oddane",
    warning: "Spóźnione",
    danger: "Brak pracy",
};
const VARIANTS = ["soft", "outline", "solid"] as const;

export function BadgeDemo() {
    return (
        <section className="badges">
            {VARIANTS.map((variant) => (
                <div key={variant} className="button-row">
                    {TONES.map((tone) => (
                        <Badge key={tone} tone={tone} variant={variant}>
                            {LABELS[tone]}
                        </Badge>
                    ))}
                </div>
            ))}
            <div className="button-row">
                <Badge tone="success" dot="pulse">
                    Głosowanie trwa
                </Badge>
                <Badge dot>Zakończone</Badge>
                <Badge tone="success" icon={Tick02Icon}>
                    Sprawdzone
                </Badge>
                <Badge tone="warning" icon={Clock01Icon}>
                    Do 15:00
                </Badge>
                <Badge variant="outline" icon={SchoolIcon}>
                    3C
                </Badge>
                <Badge tone="danger" variant="solid" size="sm">
                    3
                </Badge>
                <Badge tone="accent" variant="solid" size="sm">
                    12
                </Badge>
                <Badge
                    tone="accent"
                    render={<a href="#informatyka">Informatyka</a>}
                />
            </div>
            <span id="informatyka" hidden>
                Informatyka
            </span>
        </section>
    );
}
