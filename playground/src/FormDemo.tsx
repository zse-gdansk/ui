import {
    Card,
    CardContent,
    Checkbox,
    DatePicker,
    Fieldset,
    FileUpload,
    Form,
    FormRow,
    FormSubmit,
    Input,
    NumberField,
    Radio,
    RadioGroup,
    Select,
    Textarea,
    toast,
} from "@zse-gdansk/ui";
import { z } from "zod";

const schema = z.object({
    imie: z.string().trim().min(2, "Imię musi mieć co najmniej 2 znaki"),
    nazwisko: z
        .string()
        .trim()
        .min(2, "Nazwisko musi mieć co najmniej 2 znaki"),
    email: z.email("Wpisz adres e-mail, np. jan.kowalski@zse.edu.pl"),
    klasa: z.string({ error: "Wybierz klasę" }),
    punkty: z
        .number({ error: "Wpisz liczbę punktów" })
        .min(0, "Punkty nie mogą być ujemne")
        .max(50, "Maksymalnie 50 punktów"),
    kandydat: z.string({ error: "Wybierz kandydata" }),
    uwagi: z.string().max(300).optional(),
    termin: z.date({ error: "Wybierz termin rozmowy" }),
    zalacznik: z.array(z.instanceof(File)).min(1, "Dodaj zdjęcie legitymacji"),
    regulamin: z.literal(true, {
        error: "Zaakceptuj regulamin, żeby wysłać zgłoszenie",
    }),
});

// Udawany serwer: 1 s, zajęty adres wraca jako błąd pola.
async function send(values: z.infer<typeof schema>) {
    await new Promise((done) => setTimeout(done, 1000));
    if (values.email === "zajety@zse.edu.pl")
        return { errors: { email: "Ten adres jest już zarejestrowany" } };
    toast.success(`Zapisano zgłoszenie: ${values.imie} ${values.nazwisko}`);
}

export function FormDemo() {
    return (
        <Card className="form-demo">
            <CardContent>
                <Form schema={schema} onSubmit={send} warnOnLeave>
                    <Fieldset
                        legend="Dane ucznia"
                        description="Na podstawie tych danych wychowawca potwierdzi zgłoszenie."
                    >
                        <FormRow>
                            <Input name="imie" label="Imię" required />
                            <Input name="nazwisko" label="Nazwisko" required />
                        </FormRow>
                        <Input
                            name="email"
                            label="E-mail"
                            type="email"
                            autoComplete="email"
                            hint="Adres zajety@zse.edu.pl pokaże błąd z serwera"
                        />
                        <FormRow>
                            <Select
                                name="klasa"
                                label="Klasa"
                                placeholder="Wybierz"
                                options={[
                                    { value: "3c", label: "3C" },
                                    { value: "3k", label: "3K" },
                                    { value: "4e", label: "4E" },
                                ]}
                            />
                            <NumberField
                                name="punkty"
                                label="Punkty z rekrutacji"
                                min={0}
                                max={50}
                                suffix="/ 50"
                            />
                        </FormRow>
                    </Fieldset>

                    <Fieldset legend="Głosowanie">
                        <RadioGroup name="kandydat" label="Kandydat">
                            <Radio value="anna" label="Anna Kowalska" />
                            <Radio value="jan" label="Jan Nowak" />
                        </RadioGroup>
                        <Textarea
                            name="uwagi"
                            label="Uwagi"
                            placeholder="Opcjonalnie"
                            maxLength={300}
                        />
                        <DatePicker
                            name="termin"
                            label="Termin rozmowy"
                            min={new Date()}
                        />
                        <FileUpload
                            name="zalacznik"
                            label="Zdjęcie legitymacji"
                            accept="image/*"
                            multiple={false}
                        />
                        <Checkbox
                            name="regulamin"
                            label="Akceptuję regulamin głosowania"
                        />
                    </Fieldset>

                    <div className="button-row">
                        <FormSubmit pendingLabel="Wysyłanie…">
                            Wyślij zgłoszenie
                        </FormSubmit>
                    </div>
                </Form>
            </CardContent>
        </Card>
    );
}
