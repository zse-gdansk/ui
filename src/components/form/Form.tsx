"use client";

import { Fieldset as BaseFieldset } from "@base-ui/react/fieldset";
import { Form as BaseForm } from "@base-ui/react/form";
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ComponentProps,
    type ReactNode,
} from "react";

import { useMessages } from "../../i18n/context";
import { Alert } from "../alert/Alert";
import { Button } from "../button/Button";
import { FormContext, useFormState } from "./context";
import type {
    InferOutput,
    StandardIssue,
    StandardSchemaV1,
} from "./standard-schema";

export type FormErrors = Record<string, string | string[]>;

// Co może zwrócić onSubmit: błędy pól z serwera („login zajęty”) i/lub
// komunikat dla całego formularza.
export interface FormResult {
    errors?: FormErrors;
    message?: string;
}

type Values<Schema> = [Schema] extends [StandardSchemaV1]
    ? InferOutput<Schema>
    : Record<string, unknown>;

export interface FormProps<
    Schema extends StandardSchemaV1 | undefined = undefined,
> extends Omit<ComponentProps<"form">, "onSubmit" | "children"> {
    // Zod 4, Valibot, ArkType… Sprawdzany przed onSubmit, błędy trafiają
    // pod pola po nazwie (name). onSubmit dostaje już wynik schematu.
    schema?: Schema;
    onSubmit: (
        values: Values<Schema>,
    ) => void | FormResult | Promise<void | FormResult>;
    // Kiedy sprawdzać: po wysłaniu (a potem przy każdej zmianie), przy
    // wyjściu z pola albo na bieżąco.
    validationMode?: "onSubmit" | "onBlur" | "onChange";
    // Pytanie przeglądarki przy zamykaniu karty z niezapisanymi zmianami.
    warnOnLeave?: boolean;
    children: ReactNode;
}

// Ścieżka błędu schematu jako nazwa pola: ["adres", "miasto"] → "adres.miasto".
function issueName(issue: StandardIssue) {
    return (issue.path ?? [])
        .map((part) =>
            typeof part === "object" && part !== null && "key" in part
                ? String(part.key)
                : String(part),
        )
        .join(".");
}

function toErrors(issues: readonly StandardIssue[]) {
    const errors: Record<string, string[]> = {};
    for (const issue of issues) {
        const name = issueName(issue);
        (errors[name] ??= []).push(issue.message);
    }
    return errors;
}

// Po nieudanym wysłaniu fokus i przewinięcie do pierwszego błędnego pola,
// zamiast zostawiać użytkownika przy przycisku bez wskazówki.
function focusFirstError(form: HTMLFormElement | null) {
    requestAnimationFrame(() => {
        const field = form?.querySelector<HTMLElement>(
            "[data-invalid] :is(input:not([type=hidden]), textarea, button, [tabindex='0'])",
        );
        field?.focus({ preventScroll: true });
        field?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
}

export function Form<Schema extends StandardSchemaV1 | undefined = undefined>({
    schema,
    onSubmit,
    validationMode = "onSubmit",
    warnOnLeave = false,
    className,
    children,
    ...props
}: FormProps<Schema>) {
    const t = useMessages();
    const formRef = useRef<HTMLFormElement>(null);
    const [errors, setErrors] = useState<FormErrors>({});
    const [message, setMessage] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [dirty, setDirty] = useState(false);
    const extras = useRef(new Map<string, () => unknown>());
    const register = useCallback((name: string, read: () => unknown) => {
        extras.current.set(name, read);
        return () => {
            if (extras.current.get(name) === read) extras.current.delete(name);
        };
    }, []);
    const state = useMemo(
        () => ({ submitting, register }),
        [submitting, register],
    );

    useEffect(() => {
        if (!warnOnLeave || !dirty) return;
        const warn = (event: BeforeUnloadEvent) => event.preventDefault();
        window.addEventListener("beforeunload", warn);
        return () => window.removeEventListener("beforeunload", warn);
    }, [warnOnLeave, dirty]);

    async function submit(raw: Record<string, unknown>) {
        // Drugie kliknięcie w trakcie wysyłania nic nie robi.
        if (submitting) return;
        setMessage(null);

        // Daty, pliki i inne wartości spoza Field.Control (context.ts).
        const all: Record<string, unknown> = { ...raw };
        for (const [name, read] of extras.current) all[name] = read();
        let values: unknown = all;
        if (schema) {
            const result = await schema["~standard"].validate(all);
            if (result.issues) {
                setErrors(toErrors(result.issues));
                focusFirstError(formRef.current);
                return;
            }
            values = result.value;
        }

        setErrors({});
        setSubmitting(true);
        try {
            const result = await onSubmit(values as Values<Schema>);
            if (result?.errors && Object.keys(result.errors).length > 0) {
                setErrors(result.errors);
                focusFirstError(formRef.current);
            }
            if (result?.message) setMessage(result.message);
            if (!result?.errors) setDirty(false);
        } catch (reason) {
            setMessage(
                reason instanceof Error && reason.message
                    ? reason.message
                    : t.form.submitFailed,
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <FormContext value={state}>
            <BaseForm
                ref={formRef}
                {...props}
                className={["zse-form", className].filter(Boolean).join(" ")}
                errors={errors}
                validationMode={validationMode}
                aria-busy={submitting || undefined}
                onInput={() => setDirty(true)}
                onFormSubmit={(raw) => void submit(raw)}
            >
                {message && (
                    <Alert variant="danger" onDismiss={() => setMessage(null)}>
                        {message}
                    </Alert>
                )}
                {children}
            </BaseForm>
        </FormContext>
    );
}

export interface FormSubmitProps extends Omit<
    ComponentProps<typeof Button>,
    "type"
> {
    // Tekst w trakcie wysyłania, np. „Zapisywanie…”. Domyślnie ten sam.
    pendingLabel?: ReactNode;
}

// Przycisk wysyłania: w trakcie spinner i blokada podwójnego kliknięcia.
export function FormSubmit({
    children,
    pendingLabel,
    ...props
}: FormSubmitProps) {
    const { submitting } = useFormState();
    return (
        <Button {...props} type="submit" loading={submitting}>
            {submitting && pendingLabel ? pendingLabel : children}
        </Button>
    );
}

export interface FieldsetProps {
    legend: ReactNode;
    description?: ReactNode;
    disabled?: boolean;
    children: ReactNode;
    className?: string;
}

// Grupa pól z nagłówkiem, np. „Dane ucznia”, „Adres”. disabled blokuje
// wszystkie pola w środku.
export function Fieldset({
    legend,
    description,
    disabled = false,
    children,
    className,
}: FieldsetProps) {
    return (
        <BaseFieldset.Root
            className={["zse-fieldset", className].filter(Boolean).join(" ")}
            disabled={disabled}
        >
            <BaseFieldset.Legend className="zse-fieldset-legend">
                {legend}
            </BaseFieldset.Legend>
            {description != null && (
                <p className="zse-fieldset-description">{description}</p>
            )}
            <div className="zse-fieldset-fields">{children}</div>
        </BaseFieldset.Root>
    );
}

// Pola obok siebie, na wąskim ekranie jedno pod drugim.
export function FormRow({ children }: { children: ReactNode }) {
    return <div className="zse-form-row">{children}</div>;
}
