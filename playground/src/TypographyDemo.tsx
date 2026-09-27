import {
    Card,
    CardContent,
    Code,
    Heading,
    Prose,
    Strong,
    Text,
} from "@zse-gdansk/ui";

// Tak treść przychodzi z edytora albo z markdownu. Tutaj stała z kodu;
// HTML od użytkowników trzeba najpierw wyczyścić (np. DOMPurify).
const ANNOUNCEMENT = `
<h2>Wycieczka do Torunia</h2>
<p>Wyjazd <strong>14 października o 7:30</strong> sprzed głównego wejścia. Zgody zbiera wychowawca, wzór jest w <a href="#dokumenty">zakładce Dokumenty</a>.</p>
<h3>Co zabrać</h3>
<ul>
  <li>legitymację szkolną,</li>
  <li>prowiant na cały dzień.</li>
</ul>
<ul>
  <li><input type="checkbox" checked disabled> Zgoda rodzica</li>
  <li><input type="checkbox" disabled> Wpłata 75 zł</li>
</ul>
<p>Listę eksportuje polecenie <code>bun run export --klasa 3C</code>.</p>
`;

export function TypographyDemo() {
    return (
        <section className="typography-demo">
            <div className="typography-demo-pair">
                <Card>
                    <CardContent className="typography-demo-stack">
                        <Text size="sm" tone="secondary">
                            Złożone z komponentów
                        </Text>
                        <Heading level={2}>Wycieczka do Torunia</Heading>
                        <Text>
                            Wyjazd <Strong>14 października o 7:30</Strong>{" "}
                            sprzed głównego wejścia. Zgody zbiera wychowawca.
                        </Text>
                        <Heading level={3}>Co zabrać</Heading>
                        <Text>
                            Listę eksportuje polecenie{" "}
                            <Code>bun run export --klasa 3C</Code>.
                        </Text>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="typography-demo-stack">
                        <Text size="sm" tone="secondary">
                            Ten sam wygląd z HTML-a w Prose
                        </Text>
                        <Prose
                            // Stała z kodu, nie od użytkownika.
                            dangerouslySetInnerHTML={{ __html: ANNOUNCEMENT }}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="typography-demo-stack">
                <Heading level={1}>Nagłówek strony (h1, lg)</Heading>
                <Heading level={2}>Tytuł sekcji (h2, md)</Heading>
                <Heading level={3}>Tytuł bloku (h3, sm)</Heading>
                <Heading level={2} size="xl">
                    Duży nagłówek (h2 z size=xl)
                </Heading>
                <Text size="lg">Wstęp pod nagłówkiem, 16px.</Text>
                <Text>Treść, 14px.</Text>
                <Text size="sm" tone="secondary">
                    Podpis albo licznik, 12px, szary.
                </Text>
                <Text tone="secondary">
                    Wypisano <Strong>Annę Nowak</Strong> z koła robotyki.
                </Text>
                <div className="button-row">
                    <Text render={<span />} tone="accent" weight="medium">
                        accent
                    </Text>
                    <Text render={<span />} tone="success">
                        success
                    </Text>
                    <Text render={<span />} tone="warning">
                        warning
                    </Text>
                    <Text render={<span />} tone="danger">
                        danger
                    </Text>
                    <Text render={<span />} tabular>
                        Oddane: 1 111 / 8 888
                    </Text>
                </div>
                <div className="typography-demo-narrow">
                    <Text truncate>
                        Regulamin wycieczki szkolnej do Torunia dla klas
                        trzecich, wersja z 12 września 2026
                    </Text>
                    <Text truncate={2} tone="secondary">
                        Uczniowie poruszają się w grupach pod opieką nauczycieli
                        i nie oddalają się bez zgody opiekuna. Zbiórka po każdym
                        punkcie programu przy autokarze.
                    </Text>
                </div>
            </div>
        </section>
    );
}
