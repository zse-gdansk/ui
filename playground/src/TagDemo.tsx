import { TagInput } from "@zse-gdansk/ui";

// Wystarczająco dla demo: coś@coś.coś, bez spacji.
const isEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "To nie jest adres e-mail.";

export function TagDemo() {
    return (
        <section>
            <div className="fields">
                <TagInput
                    label="Adresy rodziców"
                    placeholder="anna.nowak@example.com"
                    validate={isEmail}
                    max={5}
                    hint="Enter, przecinek albo Tab dodaje. Wklej kilka naraz, oddzielone przecinkami."
                />
                <TagInput
                    label="Przedmioty"
                    defaultValue={["Matematyka", "Fizyka", "Informatyka"]}
                    placeholder="Dodaj przedmiot"
                />
            </div>
        </section>
    );
}
