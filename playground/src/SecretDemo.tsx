import { SecretField } from "@zse-gdansk/ui";

// Udaje pobranie tokenu z serwera dopiero przy „Pokaż” albo „Kopiuj”.
const fetchToken = () =>
    new Promise<string>((resolve) =>
        setTimeout(() => resolve("zse_tok_7Kq2mV9xR4tLw8Np3Bz69f3a"), 700),
    );

export function SecretDemo() {
    return (
        <section>
            <div className="fields">
                <SecretField
                    label="Klucz API dziennika"
                    value="demo_live_51HdZs8Kq2mV9xR4tLw8Np3Bzabcdxyzxyzefg"
                    hint="Nie udostępniaj go nikomu. Chowa się po 30 s."
                />
                <SecretField label="PIN do drukarki" value="4821" size="sm" />
                <SecretField
                    label="Token integracji"
                    value={fetchToken}
                    preview="9f3a"
                    hint="Pobierany z serwera dopiero przy pokazaniu albo kopiowaniu"
                />
            </div>
        </section>
    );
}
