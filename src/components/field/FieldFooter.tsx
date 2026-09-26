import { Field } from "@base-ui/react/field";
import type { ReactNode } from "react";

type Validity = Field.Validity.State["validity"];

const MESSAGES: [keyof Validity, string][] = [
    ["valueMissing", "To pole jest wymagane"],
    ["typeMismatch", "Nieprawidłowy format"],
    ["patternMismatch", "Nieprawidłowy format"],
    ["tooShort", "Za mało znaków"],
    ["tooLong", "Za dużo znaków"],
    ["rangeUnderflow", "Wartość jest za mała"],
    ["rangeOverflow", "Wartość jest za duża"],
    ["stepMismatch", "Nieprawidłowa wartość"],
    ["badInput", "Wpisz poprawną wartość"],
];

function translate(
    message: ReactNode,
    validity: Validity,
    native: string | null,
) {
    if (validity.customError || message !== native) return message;
    return MESSAGES.find(([key]) => validity[key])?.[1] ?? message;
}

// Stopka pola: błąd z propa error albo z walidacji (Form, schemat,
// required, błąd z serwera), a pod nim podpowiedź. Podpowiedź chowa się,
// gdy jest błąd (CSS po data-invalid), więc nie ma dwóch linii naraz.
export function FieldFooter({
    error,
    hint,
}: {
    error?: string | null | undefined;
    hint?: ReactNode;
}) {
    return (
        <>
            {error ? (
                <Field.Error className="zse-input-hint" match>
                    {error}
                </Field.Error>
            ) : (
                <Field.Validity>
                    {(state) => (
                        <Field.Error
                            className="zse-input-hint"
                            render={({ children, ...props }) => (
                                <div {...props}>
                                    {translate(
                                        children,
                                        state.validity,
                                        state.error,
                                    )}
                                </div>
                            )}
                        />
                    )}
                </Field.Validity>
            )}
            {hint != null && hint !== false && (
                <Field.Description className="zse-input-hint zse-input-description">
                    {hint}
                </Field.Description>
            )}
        </>
    );
}
