import {
    BackupCodes,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    Modal,
    ModalClose,
    StepUpArea,
    StepUpGate,
    Text,
    confirm,
    stepUp,
    toast,
    useStepUp,
    type StepUpHandlers,
} from "@zse-gdansk/ui";
import { useState } from "react";

const wait = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));

// Prawdziwe okno klucza dostępu przeglądarki, ale bez serwera: wyzwanie jest
// losowe, a odpowiedzi nikt nie sprawdza. Na localhost zwykle nie ma klucza,
// więc zamknięcie okna prowadzi do paska kodu. Poprawny kod to 123456.
export const demoStepUp: StepUpHandlers = {
    passkey: async () => {
        await navigator.credentials.get({
            publicKey: {
                challenge: crypto.getRandomValues(new Uint8Array(32)),
                timeout: 60_000,
                userVerification: "preferred",
            },
        });
    },
    code: async (code) => {
        await wait(600);
        if (code !== "123456") throw new Error("Nieprawidłowy kod");
    },
};

function EmailForm() {
    const verify = useStepUp();
    const [saving, setSaving] = useState(false);

    return (
        <form
            className="fields"
            onSubmit={async (event) => {
                event.preventDefault();
                if (!(await verify())) return;
                setSaving(true);
                await wait(600);
                setSaving(false);
                toast.success("Zmieniono adres e-mail");
            }}
        >
            <Input
                label="Nowy adres e-mail"
                type="email"
                defaultValue="j.kowalski@zse.edu.pl"
            />
            <div className="button-row">
                <ModalClose render={<Button variant="ghost" />}>
                    Anuluj
                </ModalClose>
                <Button type="submit" loading={saving}>
                    Zapisz
                </Button>
            </div>
        </form>
    );
}

const CODES = [
    "4821-0937",
    "7730-1284",
    "5512-6093",
    "9046-3371",
    "2268-7415",
    "6193-0582",
    "3857-2640",
    "1409-8826",
    "8734-5190",
    "0627-4439",
];

export function StepUpDemo() {
    return (
        <section>
            <Text tone="secondary">
                Klucz dostępu przechodzi po chwili, poprawny kod to 123456.
                Anuluj okno klucza albo wybierz „tylko kod”, żeby zobaczyć pasek
                kodu.
            </Text>
            <div className="button-row">
                <Button
                    variant="danger"
                    onClick={(event) =>
                        void confirm({
                            title: "Usunąć konto ucznia?",
                            description: "Uczeń straci dostęp do aplikacji.",
                            confirmLabel: "Usuń",
                            pendingLabel: "Usuwanie…",
                            danger: true,
                            stepUp: true,
                            anchor: event.currentTarget,
                            onConfirm: () => wait(800),
                        })
                    }
                >
                    Usuń konto (dymek)
                </Button>
                <Button
                    variant="outline"
                    onClick={() =>
                        void confirm({
                            title: "Zresetować hasła całej klasy?",
                            description:
                                "28 uczniów dostanie e-mail z linkiem do nowego hasła.",
                            confirmLabel: "Resetuj",
                            stepUp: { methods: ["code"] },
                            onConfirm: () => wait(800),
                        })
                    }
                >
                    Reset haseł (okno, tylko kod)
                </Button>
                <Modal
                    trigger={<Button variant="outline">Zmień e-mail</Button>}
                    title="Zmień adres e-mail"
                    description="Na nowy adres wyślemy link potwierdzający."
                >
                    <StepUpArea>
                        <EmailForm />
                    </StepUpArea>
                </Modal>
                <Button
                    variant="outline"
                    onClick={async (event) => {
                        if (await stepUp({ anchor: event.currentTarget }))
                            toast.success("Potwierdzono tożsamość");
                    }}
                >
                    Samo stepUp()
                </Button>
                <Button
                    variant="ghost"
                    onClick={(event) =>
                        void stepUp({
                            anchor: event.currentTarget,
                            methods: [],
                        })
                    }
                >
                    Bez metod
                </Button>
            </div>
            <div className="cards">
                <Card>
                    <CardHeader>
                        <CardTitle>Kody zapasowe</CardTitle>
                        <CardDescription>
                            Zaloguj się nimi, gdy nie masz przy sobie telefonu
                            ani klucza dostępu.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <StepUpGate>
                            {(verified) => (
                                <BackupCodes
                                    codes={
                                        verified
                                            ? CODES
                                            : CODES.map(() => "0000-0000")
                                    }
                                    used={
                                        verified
                                            ? ["7730-1284", "2268-7415"]
                                            : []
                                    }
                                    fileTitle="Dziennik ZSE, j.kowalski@zse.edu.pl"
                                />
                            )}
                        </StepUpGate>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
