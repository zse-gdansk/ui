import { Alert, Button } from "@zse-gdansk/ui";
import { useState } from "react";

export function AlertDemo() {
    const [notice, setNotice] = useState(true);
    const [error, setError] = useState(false);

    return (
        <section className="alerts">
            <Alert title="Głosowanie trwa do piątku, 15:00">
                Możesz zmienić głos do końca głosowania. Liczy się ostatni.
            </Alert>
            <Alert variant="success" title="Wysłano 28 ocen do dziennika" />
            <Alert
                variant="warning"
                title="Termin oddania minął wczoraj"
                actions={
                    <>
                        <Button size="sm" variant="outline">
                            Oddaj mimo to
                        </Button>
                        <Button size="sm" variant="ghost">
                            Napisz do nauczyciela
                        </Button>
                    </>
                }
            >
                Praca oddana teraz zostanie oznaczona jako spóźniona.
            </Alert>
            <Alert variant="danger">
                Nie udało się zapisać punktów.{" "}
                <a href="#retry">Spróbuj ponownie</a>
            </Alert>
            {notice && (
                <Alert
                    title="Nowy wygląd tabeli punktów"
                    onDismiss={() => setNotice(false)}
                >
                    Strzałki przechodzą między komórkami, M wpisuje maksimum.
                </Alert>
            )}
            <div className="button-row">
                <Button variant="outline" onClick={() => setError((v) => !v)}>
                    {error ? "Ukryj błąd" : "Pokaż błąd formularza"}
                </Button>
                {!notice && (
                    <Button variant="ghost" onClick={() => setNotice(true)}>
                        Przywróć zamknięty
                    </Button>
                )}
            </div>
            {error && (
                <Alert
                    variant="danger"
                    title="Formularz ma 2 błędy"
                    onDismiss={() => setError(false)}
                >
                    Uzupełnij tytuł zadania i termin oddania.
                </Alert>
            )}
        </section>
    );
}
