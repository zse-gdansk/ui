import { Avatar, AvatarGroup } from "@zse-gdansk/ui";

const PEOPLE = [
    "Adamczyk Zofia",
    "Bąk Michał",
    "Czarnecka Lena",
    "Dudek Kacper",
    "Filipek Hanna",
    "Górski Jan",
    "Jankowska Maja",
    "Kaczmarek Filip",
    "Kowalczyk Oliwia",
    "Lewandowski Adam",
    "Mazur Julia",
    "Nowak Szymon",
];
const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

export function AvatarDemo() {
    return (
        <section className="badges">
            <div className="button-row">
                {PEOPLE.map((name) => (
                    <Avatar key={name} name={name} size="lg" />
                ))}
            </div>
            <div className="button-row">
                {PEOPLE.map((name) => (
                    <Avatar
                        key={name}
                        name={name}
                        size="lg"
                        fallback="initials"
                    />
                ))}
            </div>
            <div className="button-row">
                {SIZES.map((size) => (
                    <Avatar key={size} name="Nowak Szymon" size={size} />
                ))}
                {SIZES.map((size) => (
                    <Avatar
                        key={size}
                        name="Nowak Szymon"
                        size={size}
                        fallback="initials"
                    />
                ))}
                <Avatar name="Klasa 3C" shape="square" size="lg" />
                <Avatar
                    name="Zepsute zdjęcie"
                    src="https://example.invalid/avatar.png"
                    size="lg"
                    fallback="initials"
                />
            </div>
            <AvatarGroup max={5} label="Głosowało 12 osób">
                {PEOPLE.map((name) => (
                    <Avatar key={name} name={name} />
                ))}
            </AvatarGroup>
        </section>
    );
}
