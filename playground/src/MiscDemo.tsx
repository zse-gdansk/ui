import { Button, Kbd, Separator, Spinner } from "@zse-gdansk/ui";

export function MiscDemo() {
    return (
        <section className="badges">
            <p className="misc-text">
                Wyszukaj ucznia <Kbd shortcut="mod+k" />, zapisz punkty{" "}
                <Kbd shortcut="mod+s" size="sm" />, zamknij okno <Kbd>Esc</Kbd>,
                wpisz maksimum <Kbd>M</Kbd>.
            </p>

            <div className="button-row">
                <Spinner size="sm" />
                <Spinner />
                <Spinner size="lg" label="Wczytywanie ocen" />
                <span className="misc-accent">
                    <Spinner />
                </span>
                <Spinner delay={600} label="Pojawia się po 0,6 s" />
            </div>

            <div className="misc-login">
                <Button variant="outline">Zaloguj przez Microsoft</Button>
                <Separator label="lub" />
                <Button variant="ghost">Zaloguj kodem z kartki</Button>
            </div>

            <div className="button-row misc-toolbar">
                <span>Klasa 3C</span>
                <Separator orientation="vertical" />
                <span>28 uczniów</span>
                <Separator orientation="vertical" />
                <span>Średnia 3,8</span>
            </div>
            <Separator />
        </section>
    );
}
