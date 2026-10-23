import {
    Button,
    FormSubmit,
    Input,
    Modal,
    ModalClose,
    Textarea,
    confirm,
    toast,
} from "@zse-gdansk/ui";
import { useState } from "react";
import { z } from "zod";

const schema = z.object({
    title: z.string().trim().min(3, "Co najmniej 3 znaki"),
    description: z.string().optional(),
});

const wait = (ms: number) => new Promise((done) => setTimeout(done, ms));

export function ModalDemo() {
    const [open, setOpen] = useState(false);

    return (
        <section className="button-row">
            <Button variant="outline" onClick={() => setOpen(true)}>
                Nowa sprawa (formularz)
            </Button>
            <Modal
                open={open}
                onOpenChange={setOpen}
                title="Nowa sprawa"
                description="Sprawa trafi do porządku obrad bieżącej sesji."
                form={{
                    schema,
                    onSubmit: async (values) => {
                        await wait(900);
                        if (values.title.toLowerCase() === "zajęte")
                            return {
                                errors: { title: "Taka sprawa już jest" },
                            };
                        toast.success("Dodano sprawę");
                        setOpen(false);
                    },
                }}
                footer={
                    <>
                        <ModalClose render={<Button variant="ghost" />}>
                            Anuluj
                        </ModalClose>
                        <FormSubmit pendingLabel="Dodawanie…">
                            Dodaj sprawę
                        </FormSubmit>
                    </>
                }
            >
                <Input name="title" label="Tytuł" autoComplete="off" required />
                <Textarea name="description" label="Opis" />
            </Modal>

            <Modal
                trigger={<Button variant="outline">Okna zagnieżdżone</Button>}
                title="Uczestnicy sesji"
                size="lg"
                footer={
                    <ModalClose render={<Button variant="ghost" />}>
                        Zamknij
                    </ModalClose>
                }
            >
                <p className="zse-modal-description">
                    Drugie okno otwiera się nad tym, a to cofa się pod spód.
                </p>
                <div className="button-row">
                    <Modal
                        trigger={
                            <Button variant="outline">Dodaj gościa</Button>
                        }
                        title="Dodaj gościa"
                        size="sm"
                        footer={
                            <>
                                <ModalClose render={<Button variant="ghost" />}>
                                    Anuluj
                                </ModalClose>
                                <ModalClose render={<Button />}>
                                    Dodaj
                                </ModalClose>
                            </>
                        }
                    >
                        <Input name="guest" label="Imię i nazwisko" />
                    </Modal>
                    <Button
                        variant="danger"
                        onClick={() =>
                            void confirm({
                                title: "Usunąć wszystkich gości?",
                                description: "Lista gości tej sesji zniknie.",
                                confirmLabel: "Usuń",
                                danger: true,
                            })
                        }
                    >
                        confirm() nad oknem
                    </Button>
                </div>
            </Modal>

            <Modal
                trigger={<Button variant="outline">Ładowanie</Button>}
                title="Edycja sesji"
                loading
            />
        </section>
    );
}
