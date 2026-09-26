import { Globe02Icon, Mail01Icon } from "@hugeicons/core-free-icons";
import { InputGroup } from "@zse-gdansk/ui";

const TAKEN = new Set(["samorzad", "szkola", "3c", "admin"]);

// Udawane API: 700ms, zajęte nazwy z listy.
function checkName(name: string, signal: AbortSignal) {
    return new Promise<true | string>((resolve, reject) => {
        const timer = setTimeout(() => {
            if (!/^[a-z0-9-]+$/.test(name))
                resolve("Tylko małe litery, cyfry i myślnik");
            else if (TAKEN.has(name)) resolve(`Adres ${name} jest już zajęty`);
            else resolve(true);
        }, 700);
        signal.addEventListener("abort", () => {
            clearTimeout(timer);
            reject(new DOMException("aborted", "AbortError"));
        });
    });
}

export function InputGroupDemo() {
    return (
        <section className="fields">
            <InputGroup
                label="Adres strony klasy"
                suffix=".zse.edu.pl"
                placeholder="twoja-klasa"
                check={checkName}
                successHint="Adres jest wolny"
                hint="Spróbuj: samorzad, 3c albo coś swojego"
                autoComplete="off"
                spellCheck={false}
            />
            <InputGroup
                label="E-mail szkolny"
                icon={Mail01Icon}
                suffix="@zse.edu.pl"
                placeholder="jan.kowalski"
            />
            <InputGroup
                label="Strona"
                icon={Globe02Icon}
                prefix="https://"
                status="success"
                defaultValue="zse.edu.pl"
                size="sm"
            />
        </section>
    );
}
