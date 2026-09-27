"use client";

import { Tick02Icon } from "@hugeicons/core-free-icons";
import {
    useCallback,
    useRef,
    useState,
    type CSSProperties,
    type ReactNode,
} from "react";

import { useMessages } from "../../i18n/context";
import { useLatest, useResizeObserver } from "../../utils/effects";
import { Button } from "../button/Button";
import { Icon } from "../icon/Icon";

export interface StepperStep {
    title: string;
    description?: ReactNode;
    content: ReactNode;
    // Sprawdzenie przed przejściem dalej: false albo komunikat zatrzymuje,
    // Promise pokazuje ładowanie na przycisku. Komunikat może być elementem
    // (np. komponentem z tłumaczeniem aplikacji): wtedy po zmianie języka
    // zmienia się też widoczny błąd, a napis zostaje w dawnym języku.
    validate?: () => boolean | ReactNode | Promise<boolean | ReactNode>;
    optional?: boolean;
    // Własne wypełnienie kroku (0–1), gdy nie ma w nim zwykłych pól.
    progress?: number;
}

export interface StepperProps {
    steps: readonly StepperStep[];
    step?: number;
    defaultStep?: number;
    onStepChange?: (step: number) => void;
    // Po ostatnim kroku. Promise: ładowanie na przycisku, błąd jako komunikat.
    onComplete?: () => unknown;
    // Można skakać do przodu klikając w kroki. Domyślnie tylko do już
    // przejrzanych, żeby nie ominąć walidacji.
    linear?: boolean;
    backLabel?: string;
    nextLabel?: string;
    finishLabel?: string;
}

// Krok, na który się weszło, ma od razu kawałek paska: widać, że trwa.
const STEP_START = 0.15;

const CHOICE =
    "input[type='checkbox'], input[type='radio'], [role='checkbox'], [role='radio']";

// Czy pole jest już dobrze wypełnione. Nie wystarczy jeden znak: wartość
// musi spełniać reguły pola (required, pattern, minLength, type…) według
// validity, które niczego nie wyświetla. Kod (CodeField) liczy się po
// wpisaniu całego, wybór po zaznaczeniu. Błąd z walidacji Base UI
// (data-invalid) cofa pole.
function isComplete(field: HTMLElement) {
    if (field.hasAttribute("data-invalid")) return false;
    const code = field.querySelector(".zse-code-slots");
    if (code) return code.hasAttribute("data-complete");
    if (field.querySelector(CHOICE))
        return (
            field.querySelector("[data-checked]:not([data-parent])") !== null
        );
    const controls = [
        ...field.querySelectorAll<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >("input, textarea, select"),
    ].filter((control) => control.type !== "hidden");
    return (
        controls.length > 0 &&
        controls.every(
            (control) => control.value !== "" && control.validity.valid,
        )
    );
}

// Wypełnienie bieżącego kroku z pól w nim: wymagane liczą się w całości
// dopiero, gdy są poprawne; opcjonalne puste mają połowę (nie trzeba ich
// wypełniać), poprawne całość, błędne nic.
function measureFill(panel: HTMLElement) {
    const fields = [
        ...panel.querySelectorAll<HTMLElement>(".zse-input"),
    ].filter((field) => !field.parentElement?.closest(".zse-input"));
    if (fields.length === 0) return null;
    let score = 0;
    for (const field of fields) {
        if (isComplete(field)) {
            score += 1;
            continue;
        }
        const required = field.querySelector(
            "[required], [aria-required='true']",
        );
        const empty = !field.hasAttribute("data-filled");
        if (!required && empty) score += 0.5;
    }
    return score / fields.length;
}

// Pola, w których Enter nie oznacza wysłania.
const NOT_TEXT = new Set([
    "checkbox",
    "radio",
    "button",
    "submit",
    "reset",
    "file",
]);

// Wysokość treści mierzona i ustawiana jawnie, żeby przejście między
// krokami o różnej długości płynnie zmieniało wysokość zamiast skakać.
function useAutoHeight() {
    const outer = useRef<HTMLDivElement>(null);
    const inner = useRef<HTMLDivElement>(null);
    useResizeObserver(inner, () => {
        if (outer.current && inner.current)
            outer.current.style.height = `${inner.current.offsetHeight}px`;
    });
    return { outer, inner };
}

export function Stepper({
    steps,
    step,
    defaultStep = 0,
    onStepChange,
    onComplete,
    linear = true,
    backLabel,
    nextLabel,
    finishLabel,
}: StepperProps) {
    const t = useMessages();
    const [internal, setInternal] = useState(defaultStep);
    const current = Math.min(Math.max(step ?? internal, 0), steps.length - 1);
    // Najdalszy krok, do którego już doszliśmy: do niego można wracać.
    const [reached, setReached] = useState(current);
    const [direction, setDirection] = useState(0);
    const [busy, setBusy] = useState(false);
    // Własne błędy jako rodzaj, tłumaczone przy renderze, żeby szły za
    // zmianą języka; treść od aplikacji bez zmian.
    const [error, setError] = useState<{
        step: number;
        message: "incomplete" | "failed" | { content: ReactNode };
    } | null>(null);
    const [done, setDone] = useState(false);
    const [fill, setFill] = useState<number | null>(null);
    const { outer, inner } = useAutoHeight();

    const last = current === steps.length - 1;
    const active = steps[current];
    // Własne progress z kroku jest dokładne; zmierzone zaczyna od
    // STEP_START, żeby bieżący krok był od razu trochę zamalowany.
    const stepFill = done
        ? 1
        : (active?.progress ?? STEP_START + (1 - STEP_START) * (fill ?? 0));

    // Najnowsze next dla nasłuchu w panelu (ref callback działa raz na krok).
    const advance = useLatest(next);

    // Na żywo przy każdej zmianie w polach bieżącego kroku. Ref callback,
    // bo panel montuje się od nowa przy każdym kroku (key).
    const trackFill = useCallback(
        (panel: HTMLDivElement | null) => {
            if (!panel) return;
            const update = () => setFill(measureFill(panel));
            // Po klatce: nasłuch na panelu odpala się przed Reactem, a pola
            // z formatem (MaskedInput) układają wartość dopiero w nim.
            let frame = 0;
            const later = () => {
                cancelAnimationFrame(frame);
                frame = requestAnimationFrame(update);
            };
            update();
            const observer = new MutationObserver(update);
            observer.observe(panel, {
                subtree: true,
                attributes: true,
                attributeFilter: [
                    "data-filled",
                    "data-checked",
                    "data-complete",
                    "data-invalid",
                    "data-valid",
                ],
            });
            const submit = (event: KeyboardEvent) => {
                const target = event.target;
                if (
                    event.key !== "Enter" ||
                    event.defaultPrevented ||
                    event.isComposing ||
                    !(target instanceof HTMLInputElement) ||
                    NOT_TEXT.has(target.type) ||
                    target.closest("form")
                )
                    return;
                event.preventDefault();
                void advance.current();
            };
            panel.addEventListener("input", later);
            panel.addEventListener("keydown", submit);
            return () => {
                cancelAnimationFrame(frame);
                observer.disconnect();
                panel.removeEventListener("input", later);
                panel.removeEventListener("keydown", submit);
            };
        },
        [advance],
    );

    function go(target: number) {
        if (target === current) return;
        setDirection(target > current ? 1 : -1);
        setError(null);
        setReached((value) => Math.max(value, target));
        if (step === undefined) setInternal(target);
        onStepChange?.(target);
    }

    async function run<T>(task: () => T | Promise<T>): Promise<T> {
        setBusy(true);
        try {
            return await task();
        } finally {
            setBusy(false);
        }
    }

    async function next() {
        if (busy || !active) return;
        const verdict = active.validate ? await run(active.validate) : true;
        if (verdict !== true) {
            setError({
                step: current,
                message:
                    typeof verdict === "boolean" ||
                    verdict == null ||
                    verdict === ""
                        ? "incomplete"
                        : { content: verdict },
            });
            return;
        }
        if (!last) {
            go(current + 1);
            return;
        }
        try {
            await run(() => onComplete?.());
            setDone(true);
        } catch (reason) {
            setError({
                step: current,
                message:
                    reason instanceof Error && reason.message
                        ? { content: reason.message }
                        : "failed",
            });
        }
    }

    // Linia dochodzi do bieżącego kółka i dalej w stronę następnego,
    // o tyle, ile kroku już wypełniono.
    const progress =
        steps.length > 1
            ? Math.min(
                  (current + (last ? 0 : stepFill)) / (steps.length - 1),
                  1,
              )
            : 1;

    return (
        <div
            className="zse-stepper"
            style={
                {
                    "--progress": done ? 1 : progress,
                    "--steps": steps.length,
                } as CSSProperties
            }
        >
            <ol className="zse-stepper-steps">
                <span className="zse-stepper-line" aria-hidden />
                {steps.map((item, index) => {
                    const complete = done || index < current;
                    const state =
                        error?.step === index
                            ? "error"
                            : complete
                              ? "complete"
                              : index === current
                                ? "current"
                                : "upcoming";
                    const reachable =
                        !done &&
                        index !== current &&
                        (!linear || index <= reached);
                    return (
                        <li
                            key={item.title}
                            className="zse-stepper-step"
                            data-state={state}
                            aria-current={
                                index === current ? "step" : undefined
                            }
                        >
                            <button
                                type="button"
                                className="zse-stepper-button"
                                disabled={!reachable}
                                onClick={() => go(index)}
                            >
                                <span className="zse-stepper-dot">
                                    <span
                                        className="zse-stepper-layer"
                                        data-hidden={complete || undefined}
                                    >
                                        {state === "error" ? "!" : index + 1}
                                    </span>
                                    <span
                                        className="zse-stepper-layer"
                                        data-hidden={!complete || undefined}
                                    >
                                        <Icon
                                            icon={Tick02Icon}
                                            size={14}
                                            strokeWidth={2.5}
                                        />
                                    </span>
                                </span>
                                <span className="zse-stepper-text">
                                    <span className="zse-stepper-title">
                                        {item.title}
                                    </span>
                                    {item.optional && (
                                        <span className="zse-stepper-optional">
                                            {t.stepper.optional}
                                        </span>
                                    )}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ol>

            {/* Wąski kontener: zamiast rzędu kółek nazwa kroku i pasek. */}
            <div className="zse-stepper-compact" aria-hidden>
                <span className="zse-stepper-compact-count">
                    {t.stepper.step(current + 1, steps.length)}
                </span>
                <span className="zse-stepper-compact-title">
                    {active?.title}
                </span>
                <span className="zse-stepper-segments">
                    {steps.map((item, index) => (
                        <span
                            key={item.title}
                            style={
                                {
                                    "--fill":
                                        done || index < current
                                            ? 1
                                            : index === current
                                              ? stepFill
                                              : 0,
                                } as CSSProperties
                            }
                        />
                    ))}
                </span>
            </div>

            <div ref={outer} className="zse-stepper-viewport">
                <div ref={inner} className="zse-stepper-inner">
                    <div
                        ref={trackFill}
                        key={current}
                        className="zse-stepper-panel"
                        data-direction={direction}
                    >
                        {active?.description != null && (
                            <p className="zse-stepper-description">
                                {active.description}
                            </p>
                        )}
                        {active?.content}
                    </div>
                </div>
            </div>

            <div className="zse-stepper-footer">
                {error && (
                    <p className="zse-stepper-error" role="alert">
                        {error.message === "incomplete"
                            ? t.stepper.incomplete
                            : error.message === "failed"
                              ? t.stepper.finishFailed
                              : error.message.content}
                    </p>
                )}
                <div className="zse-stepper-actions">
                    <Button
                        variant="ghost"
                        disabled={current === 0 || busy || done}
                        onClick={() => go(current - 1)}
                    >
                        {backLabel ?? t.stepper.back}
                    </Button>
                    <Button
                        loading={busy}
                        disabled={done}
                        onClick={() => void next()}
                    >
                        {last
                            ? (finishLabel ?? t.stepper.finish)
                            : (nextLabel ?? t.stepper.next)}
                    </Button>
                </div>
            </div>
        </div>
    );
}
