"use client";

import { Tick02Icon } from "@hugeicons/core-free-icons";
import {
    useCallback,
    useLayoutEffect,
    useRef,
    useState,
    type CSSProperties,
    type ReactNode,
} from "react";

import { useMessages } from "../../i18n/context";
import { Button } from "../button/Button";
import { Icon } from "../icon/Icon";

export interface StepperStep {
    title: string;
    description?: ReactNode;
    content: ReactNode;
    // Sprawdzenie przed przejściem dalej: false albo komunikat zatrzymuje,
    // Promise pokazuje ładowanie na przycisku.
    validate?: () => boolean | string | Promise<boolean | string>;
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

// Wypełnienie bieżącego kroku z pól w nim: wymagane liczą się w całości,
// opcjonalne od startu w połowie (krok z samym opcjonalnym polem ma pół,
// po wypełnieniu całość). Stan z data-filled, które Base UI ustawia na
// każdym Field.Root, i z zaznaczonych checkboxów.
function measureFill(panel: HTMLElement) {
    const fields = [
        ...panel.querySelectorAll<HTMLElement>(".zse-input"),
    ].filter((field) => !field.parentElement?.closest(".zse-input"));
    if (fields.length === 0) return null;
    let score = 0;
    for (const field of fields) {
        const filled =
            field.hasAttribute("data-filled") ||
            field.querySelector("[data-checked]:not([data-parent])") !== null;
        const required = field.querySelector(
            "[required], [aria-required='true']",
        );
        score += filled ? 1 : required ? 0 : 0.5;
    }
    return score / fields.length;
}

// Wysokość treści mierzona i ustawiana jawnie, żeby przejście między
// krokami o różnej długości płynnie zmieniało wysokość zamiast skakać.
function useAutoHeight() {
    const outer = useRef<HTMLDivElement>(null);
    const inner = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        const box = outer.current;
        const content = inner.current;
        if (!box || !content) return;
        const observer = new ResizeObserver(() => {
            box.style.height = `${content.offsetHeight}px`;
        });
        observer.observe(content);
        return () => observer.disconnect();
    }, []);
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
    const [error, setError] = useState<{
        step: number;
        message: string;
    } | null>(null);
    const [done, setDone] = useState(false);
    const [fill, setFill] = useState<number | null>(null);
    const { outer, inner } = useAutoHeight();

    const last = current === steps.length - 1;
    const active = steps[current];
    const stepFill = done ? 1 : (active?.progress ?? fill ?? 0);

    // Na żywo przy każdej zmianie w polach bieżącego kroku. Ref callback,
    // bo panel montuje się od nowa przy każdym kroku (key).
    const trackFill = useCallback((panel: HTMLDivElement | null) => {
        if (!panel) return;
        const update = () => setFill(measureFill(panel));
        update();
        const observer = new MutationObserver(update);
        observer.observe(panel, {
            subtree: true,
            attributes: true,
            attributeFilter: ["data-filled", "data-checked"],
        });
        panel.addEventListener("input", update);
        return () => {
            observer.disconnect();
            panel.removeEventListener("input", update);
        };
    }, []);

    function go(target: number) {
        if (target === current) return;
        setDirection(target > current ? 1 : -1);
        setError(null);
        setReached((value) => Math.max(value, target));
        if (step === undefined) setInternal(target);
        onStepChange?.(target);
    }

    async function run(task: () => unknown) {
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
                    typeof verdict === "string"
                        ? verdict
                        : t.stepper.incomplete,
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
                        ? reason.message
                        : t.stepper.finishFailed,
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
                        {error.message}
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
