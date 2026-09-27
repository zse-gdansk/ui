import { Banner } from "@zse-gdansk/ui";

export function BannerDemo() {
    return (
        <section className="banner-demo">
            <Banner tone="success">
                Wyniki matur próbnych są już w dzienniku.
            </Banner>
            <Banner
                tone="warning"
                action={<a href="https://zse.edu.gdansk.pl/pl">Szczegóły</a>}
            >
                W piątek lekcje skrócone do 30 minut.
            </Banner>
            <Banner tone="danger" dismissible={false}>
                Przerwa techniczna dziennika w sobotę od 22:00 do 2:00.
            </Banner>
            <Banner tone="neutral">
                Dzień otwarty szkoły: 14 marca, 10:00–14:00.
            </Banner>
        </section>
    );
}
