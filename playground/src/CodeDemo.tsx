import { CodeField, toast } from "@zse-gdansk/ui";

// Udawana weryfikacja: 800ms, poprawny kod to 123456.
function verify(code: string) {
    return new Promise<void>((resolve, reject) =>
        setTimeout(() => {
            if (code === "123456") {
                toast.success("Kod poprawny, możesz głosować");
                resolve();
            } else reject(new Error("Nieprawidłowy kod, spróbuj ponownie"));
        }, 800),
    );
}

export function CodeDemo() {
    return (
        <section className="fields">
            <CodeField
                label="Kod do głosowania"
                hint="6 cyfr z kartki od wychowawcy. Poprawny w demo: 123456"
                groups={[3, 3]}
                onComplete={verify}
            />
            <CodeField
                label="Kod klasy"
                type="alphanumeric"
                length={6}
                groups={[3, 3]}
                size="sm"
                hint="Litery i cyfry, wielkość liter bez znaczenia"
            />
            <CodeField label="PIN" length={4} mask size="lg" />
            <CodeField
                label="Kod wygasł"
                length={6}
                disabled
                defaultValue="482"
            />
        </section>
    );
}
