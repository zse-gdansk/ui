import {
    Form,
    FormSubmit,
    LikertScale,
    SurveyMatrix,
    toast,
} from "@zse-gdansk/ui";

const QUESTIONS = [
    { id: "interesting", label: "Lekcje są prowadzone ciekawie" },
    { id: "grades", label: "Wiem, za co dostaję oceny" },
    { id: "safe", label: "W szkole czuję się bezpiecznie" },
    { id: "homework", label: "Mam za dużo zadań domowych" },
];

export function SurveyDemo() {
    return (
        <Form
            className="survey-demo"
            onSubmit={(values) => {
                toast.success("Dziękujemy za wypełnienie ankiety", {
                    description: JSON.stringify(values),
                });
            }}
        >
            <SurveyMatrix
                label="Oceń stwierdzenia"
                hint="Wszystkie odpowiedzi są anonimowe."
                name="lekcje"
                questions={QUESTIONS}
                scale="agreement"
                required
            />
            <LikertScale
                label="Czy lekcje zdalne były pomocne?"
                name="zdalne"
                scale="agreement"
                required
            />
            <LikertScale
                label="Jak oceniasz stołówkę?"
                name="stolowka"
                scale={{
                    min: 1,
                    max: 5,
                    minLabel: "Źle",
                    maxLabel: "Świetnie",
                }}
            />
            <LikertScale
                label="Czy polecił(a)byś naszą szkołę znajomym?"
                name="polecenie"
                scale={{
                    min: 0,
                    max: 10,
                    minLabel: "Na pewno nie",
                    maxLabel: "Na pewno tak",
                }}
            />
            <FormSubmit>Wyślij ankietę</FormSubmit>
        </Form>
    );
}
