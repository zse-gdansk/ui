import { ErrorPage, SegmentedControl, toast } from "@zse-gdansk/ui";
import { useState } from "react";

const KINDS = [
    { value: "not-found", label: "404" },
    { value: "forbidden", label: "403" },
    { value: "error", label: "500" },
    { value: "maintenance", label: "Przerwa" },
    { value: "offline", label: "Offline" },
] as const;

type Kind = (typeof KINDS)[number]["value"];

// Koniec przerwy w demo: za dwie godziny od wejścia na stronę.
const BACK_AT = new Date(Date.now() + 2 * 60 * 60 * 1000);

export function ErrorsDemo() {
    const [kind, setKind] = useState<Kind>("forbidden");

    return (
        <section className="errors-demo">
            <SegmentedControl
                aria-label="Rodzaj strony"
                size="sm"
                value={kind}
                onValueChange={(next) => setKind(next as Kind)}
                options={[...KINDS]}
            />
            <div className="errors-demo-frame">
                <ErrorPage
                    kind={kind}
                    account="Jan Kowalski (uczeń)"
                    onSwitchAccount={() => toast("Wylogowano")}
                    onRetry={() => toast("Ponawianie…")}
                    {...(kind === "error" && { errorId: "a3f9c2e1" })}
                    endsAt={BACK_AT}
                    homeHref="#"
                />
            </div>
        </section>
    );
}
