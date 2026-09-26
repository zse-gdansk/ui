import { Home01Icon } from "@hugeicons/core-free-icons";
import { Breadcrumbs, Label } from "@zse-gdansk/ui";

const PATH = [
    { label: "Start", href: "#", icon: Home01Icon },
    { label: "Klasy", href: "#klasy" },
    { label: "3C", href: "#3c" },
    { label: "Fizyka", href: "#fizyka" },
    { label: "Sprawdziany", href: "#sprawdziany" },
    { label: "Sprawdzian z optyki i fal elektromagnetycznych" },
];

export function BreadcrumbsDemo() {
    return (
        <section className="badges">
            <Breadcrumbs items={PATH} />
            <div className="crumbs-narrow">
                <Breadcrumbs items={PATH} />
            </div>
            <div className="crumbs-tiny">
                <Breadcrumbs items={PATH} />
            </div>
            <Breadcrumbs
                items={[
                    { label: "Start", href: "#", icon: Home01Icon },
                    { label: "Głosowanie" },
                ]}
            />
            <div className="button-row">
                <Label htmlFor="demo-name" required>
                    Imię i nazwisko
                </Label>
                <Label htmlFor="demo-phone" optional>
                    Telefon rodzica
                </Label>
            </div>
        </section>
    );
}
