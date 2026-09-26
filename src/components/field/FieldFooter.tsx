import { Field } from "@base-ui/react/field";
import type { ReactNode } from "react";

import { useMessages } from "../../i18n/context";
import type { Messages } from "../../i18n/types";

type Validity = Field.Validity.State["validity"];

const KEYS = [
    "valueMissing",
    "typeMismatch",
    "patternMismatch",
    "tooShort",
    "tooLong",
    "rangeUnderflow",
    "rangeOverflow",
    "stepMismatch",
    "badInput",
] as const;

function translate(
    message: ReactNode,
    validity: Validity,
    native: string | null,
    messages: Messages["field"],
) {
    if (validity.customError || message !== native) return message;
    const key = KEYS.find((name) => validity[name]);
    return key ? messages[key] : message;
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
    const t = useMessages();
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
                                        t.field,
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
