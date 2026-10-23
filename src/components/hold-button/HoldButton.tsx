"use client";

import { Tick02Icon } from "@hugeicons/core-free-icons";
import {
    useRef,
    useState,
    type CSSProperties,
    type KeyboardEvent,
    type ReactNode,
} from "react";

import { useMessages } from "../../i18n/context";
import { useMountEffect } from "../../utils/effects";
import { Button, type ButtonProps } from "../button/Button";
import { confirm } from "../confirm/confirm";
import { Icon } from "../icon/Icon";
import { Spokes } from "../spinner/Spinner";

const HINT_MS = 1500;
// Jak długo ptaszek zostaje po udanej akcji.
const DONE_MS = 1200;
const isHoldKey = (event: KeyboardEvent) =>
    event.key === " " || event.key === "Enter";

export interface HoldButtonProps extends Omit<
    ButtonProps,
    "onClick" | "loading" | "children"
> {
    children: ReactNode;
    // Po pełnym przytrzymaniu albo potwierdzeniu w oknie. Z obietnicą
    // przycisk czeka ze spinnerem.
    onConfirm: () => unknown;
    // Jak długo trzymać, w ms.
    duration?: number;
    // Okno dla czytnika ekranu, który aktywuje przycisk bez naciśnięcia.
    // Domyślnie tytułem jest napis przycisku.
    confirmTitle?: ReactNode;
    confirmDescription?: ReactNode;
}

// Przytrzymaj, żeby potwierdzić: nieodwracalna akcja powtarzana często
// (zamknięcie głosowania), szybsza niż okno, a odporna na przypadkowe
// kliknięcie. Wypełnienie rośnie liniowo przez duration, po puszczeniu
// szybko wraca. Spacja i Enter trzymane działają tak samo.
export function HoldButton({
    children,
    onConfirm,
    duration = 1500,
    confirmTitle,
    confirmDescription,
    variant = "danger",
    disabled = false,
    className,
    style,
    ...props
}: HoldButtonProps) {
    const t = useMessages();
    const [holding, setHolding] = useState(false);
    const [hint, setHint] = useState(false);
    const [pending, setPending] = useState(false);
    const [done, setDone] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const hintTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const doneTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

    useMountEffect(() => () => {
        clearTimeout(timer.current);
        clearTimeout(hintTimer.current);
        clearTimeout(doneTimer.current);
    });

    // Bez disabled w trakcie: przycisk nie szarzeje i nie traci fokusu,
    // a kolejne przytrzymanie blokuje start().
    async function run() {
        setPending(true);
        try {
            await onConfirm();
            setDone(true);
            doneTimer.current = setTimeout(() => setDone(false), DONE_MS);
        } catch {
            // Błąd pokazuje wołający (toast, komunikat); przycisk wraca.
        } finally {
            setPending(false);
        }
    }

    function start() {
        if (disabled || pending || done || timer.current) return;
        clearTimeout(hintTimer.current);
        setHint(false);
        setHolding(true);
        timer.current = setTimeout(() => {
            timer.current = undefined;
            setHolding(false);
            void run();
        }, duration);
    }

    // Puszczone przed czasem: wypełnienie wraca, a napis podpowiada.
    function cancel() {
        if (!timer.current) return;
        clearTimeout(timer.current);
        timer.current = undefined;
        setHolding(false);
        setHint(true);
        hintTimer.current = setTimeout(() => setHint(false), HINT_MS);
    }

    return (
        <Button
            {...props}
            variant={variant}
            disabled={disabled}
            // Własne wciśnięcie: wbudowane scale z :active znikałoby
            // skokiem, gdy akcja rusza.
            static
            aria-busy={pending || undefined}
            className={["zse-hold", className].filter(Boolean).join(" ")}
            style={
                {
                    ...(typeof style === "object" && style),
                    "--hold-duration": `${duration}ms`,
                } as CSSProperties
            }
            data-holding={holding || undefined}
            data-state={done ? "done" : pending ? "pending" : undefined}
            onPointerDown={(event) => {
                if (event.button === 0) start();
            }}
            onPointerUp={cancel}
            onPointerLeave={cancel}
            onPointerCancel={cancel}
            // Długie przytrzymanie palcem otwierałoby menu kontekstowe.
            onContextMenu={(event) => event.preventDefault()}
            onKeyDown={(event) => {
                if (!isHoldKey(event)) return;
                // Bez tego Enter od razu klika.
                event.preventDefault();
                if (!event.repeat) start();
            }}
            onKeyUp={(event) => {
                if (!isHoldKey(event)) return;
                // Spacja klika przy puszczeniu.
                event.preventDefault();
                cancel();
            }}
            onClick={(event) => {
                // Kliknięcie bez naciśnięcia (detail 0) to czytnik ekranu
                // albo sterowanie głosem: zamiast przytrzymania okno.
                if (event.detail !== 0 || pending || done) return;
                void confirm({
                    title: confirmTitle ?? children,
                    ...(confirmDescription != null && {
                        description: confirmDescription,
                    }),
                    danger: variant === "danger",
                    onConfirm,
                });
            }}
        >
            <span className="zse-hold-fill" aria-hidden />
            {/* Napis, podpowiedź, spinner i ptaszek w jednej komórce:
                szerokość nie zmienia się w żadnym stanie. */}
            <span className="zse-hold-label">
                <span data-hidden={hint || pending || done || undefined}>
                    {children}
                </span>
                <span
                    data-hidden={!hint || pending || done || undefined}
                    aria-hidden
                >
                    {t.hold.hint}
                </span>
                <span
                    className="zse-hold-status"
                    data-hidden={!pending || undefined}
                    aria-hidden
                >
                    <Spokes />
                </span>
                <span
                    className="zse-hold-status"
                    data-hidden={!done || undefined}
                    aria-hidden
                >
                    <Icon icon={Tick02Icon} />
                </span>
            </span>
        </Button>
    );
}
