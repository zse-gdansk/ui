import { Link } from "@zse-gdansk/ui";

export function LinkDemo() {
    return (
        <section className="link-demo">
            <p>
                Wyniki są w <Link href="#oceny">dzienniku ocen</Link>, a
                regulamin głosowania w{" "}
                <Link href="#regulamin" variant="accent">
                    zakładce Samorząd
                </Link>
                . Szczegóły egzaminu zawodowego podaje{" "}
                <Link href="https://cke.gov.pl/egzamin-zawodowy/" confirm>
                    Centralna Komisja Egzaminacyjna
                </Link>
                .
            </p>
            <nav className="button-row">
                <Link href="#plan" variant="plain">
                    Plan lekcji
                </Link>
                <Link href="#kontakt" variant="plain">
                    Kontakt
                </Link>
                <Link
                    href="https://zse.edu.gdansk.pl"
                    variant="plain"
                    confirm={{ trusted: ["zse.edu.gdansk.pl"] }}
                >
                    Strona szkoły
                </Link>
            </nav>
        </section>
    );
}
