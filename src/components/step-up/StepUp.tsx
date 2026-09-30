"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Popover } from "@base-ui/react/popover";
import { Key01Icon } from "@hugeicons/core-free-icons";
import {
    createContext,
    use,
    useId,
    useRef,
    useState,
    type ReactNode,
} from "react";

import { useMessages } from "../../i18n/context";
import { useExternalEffect } from "../../utils/effects";
import { Button } from "../button/Button";
import { CodeField } from "../code-field/CodeField";
import {
    isPasskeyCancel,
    isRecentlyVerified,
    markVerified,
    passkeySupported,
    registerStepUpHost,
    stepUp,
    type StepUpHandlers,
    type StepUpMethod,
    type StepUpOptions,
    type StepUpRequest,
} from "./step-up";

const Handlers = createContext<StepUpHandlers | null>(null);

// verified: potwierdzone, ale widok zostaje, dopóki wołający nie zwolni
// go przez release() (np. okno zamyka się prosto z widoku).
export type StepUpStatus = "idle" | "verifying" | "verified";

interface Flow {
    status: StepUpStatus;
    methods: readonly StepUpMethod[];
    notice: ReactNode;
    passkeyPending: boolean;
    // Nowy widok przy każdym wejściu: puste pola, fokus na pierwszym.
    round: number;
    verify: (
        options?: StepUpOptions,
        settings?: { hold?: boolean },
    ) => Promise<boolean>;
    release: () => void;
    startPasskey: () => void;
    submitCode: (code: string) => Promise<void>;
    back: () => void;
}

const FlowContext = createContext<Flow | null>(null);

const CODE_LENGTH = 6;

function useStepUpFlow(): Flow {
    const t = useMessages();
    const handlers = use(Handlers);
    const [status, setStatus] = useState<StepUpStatus>("idle");
    const [methods, setMethods] = useState<readonly StepUpMethod[]>([]);
    const [notice, setNotice] = useState<ReactNode>(null);
    const [passkeyPending, setPasskeyPending] = useState(false);
    const [round, setRound] = useState(0);
    const settle = useRef<((ok: boolean) => void) | null>(null);
    const trigger = useRef<HTMLElement | null>(null);
    const hold = useRef(false);

    const describe = (error: unknown) =>
        handlers?.errorMessage?.(error) ??
        (error instanceof Error && error.message ? error.message : null);

    function release() {
        setStatus("idle");
        setNotice(null);
        setPasskeyPending(false);
    }

    function finish(ok: boolean) {
        if (ok) markVerified(handlers?.verifiedFor ?? 0);
        const resolve = settle.current;
        settle.current = null;
        // Widok zostaje (pole w stanie sukcesu, spinner klucza), a wołający
        // zamknie okno prosto z niego: bez powrotu i zamknięcia naraz.
        if (ok && hold.current) {
            setStatus("verified");
            resolve?.(true);
            return;
        }
        setStatus("idle");
        setNotice(null);
        setPasskeyPending(false);
        resolve?.(ok);
        if (trigger.current?.isConnected)
            trigger.current.focus({ preventScroll: true });
    }

    function verify(
        options: StepUpOptions = {},
        settings: { hold?: boolean } = {},
    ) {
        if (settle.current) return Promise.resolve(false);
        hold.current = settings.hold ?? false;
        if (isRecentlyVerified()) return Promise.resolve(true);
        const list = (options.methods ?? ["code", "passkey"]).filter(
            (method) =>
                method === "passkey"
                    ? Boolean(handlers?.passkey) && passkeySupported()
                    : Boolean(handlers?.code),
        );
        trigger.current =
            document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
        setMethods(list);
        setNotice(null);
        setRound((value) => value + 1);
        setStatus("verifying");
        return new Promise<boolean>((resolve) => {
            settle.current = resolve;
        });
    }

    // Tylko z kliknięcia „Użyj klucza dostępu”: okno systemu albo menedżera
    // haseł otwiera się wtedy, gdy ktoś sam wybierze klucz.
    function startPasskey() {
        const passkey = handlers?.passkey;
        if (!passkey || passkeyPending) return;
        setPasskeyPending(true);
        setNotice(null);
        passkey().then(
            () => finish(true),
            (error: unknown) => {
                setPasskeyPending(false);
                setNotice(
                    isPasskeyCancel(error)
                        ? t.stepUp.cancelled
                        : (describe(error) ?? t.stepUp.cancelled),
                );
            },
        );
    }

    async function submitCode(code: string) {
        const check = handlers?.code;
        if (!check) return;
        try {
            await check(code);
        } catch (error) {
            const message = describe(error);
            throw new Error(typeof message === "string" ? message : "", {
                cause: error,
            });
        }
        finish(true);
    }

    return {
        status,
        methods,
        notice,
        passkeyPending,
        round,
        verify,
        release,
        startPasskey,
        submitCode,
        back: () => finish(false),
    };
}

const focusFirst = (node: HTMLDivElement | null) => {
    node?.querySelector<HTMLElement>("input, button:not(:disabled)")?.focus({
        preventScroll: true,
    });
};

// Widok weryfikacji: kod od razu, klucz dostępu jako druga droga.
function StepUpView({
    flow,
    backLabel,
}: {
    flow: Flow;
    backLabel?: string | undefined;
}) {
    const t = useMessages();
    const titleId = useId();
    const code = flow.methods.includes("code");
    const passkey = flow.methods.includes("passkey");
    const description =
        flow.methods.length === 0
            ? t.stepUp.noMethods
            : code
              ? t.stepUp.enterCode
              : t.stepUp.passkeyOnly;

    return (
        // Escape wraca zamiast zamykać okno pod spodem; Enter w polu kodu
        // nie wysyła formularza, który pominąłby weryfikację.
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <div
            key={flow.round}
            ref={focusFirst}
            className="zse-step-up"
            // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
            role="group"
            aria-labelledby={titleId}
            onKeyDown={(event) => {
                if (
                    event.key === "Enter" &&
                    event.target instanceof HTMLInputElement
                )
                    event.preventDefault();
                if (event.key !== "Escape" || flow.passkeyPending) return;
                event.stopPropagation();
                flow.back();
            }}
        >
            <div className="zse-step-up-heading">
                <h2 id={titleId} className="zse-step-up-title">
                    {t.stepUp.title}
                </h2>
                <p className="zse-step-up-description">{description}</p>
            </div>

            {code && (
                <CodeField
                    label={t.stepUp.code}
                    length={CODE_LENGTH}
                    groups={[3, 3]}
                    size="lg"
                    disabled={flow.passkeyPending}
                    onComplete={flow.submitCode}
                />
            )}

            {passkey && (
                <div className="zse-step-up-alt">
                    {code && (
                        <div className="zse-step-up-or" aria-hidden>
                            {t.stepUp.or}
                        </div>
                    )}
                    <Button
                        variant={code ? "outline" : "primary"}
                        icon={Key01Icon}
                        loading={flow.passkeyPending}
                        className="zse-step-up-passkey"
                        onClick={flow.startPasskey}
                    >
                        {flow.passkeyPending
                            ? t.stepUp.waiting
                            : t.stepUp.usePasskey}
                    </Button>
                </div>
            )}

            {flow.notice != null && (
                <output className="zse-step-up-notice">{flow.notice}</output>
            )}

            <div className="zse-step-up-footer">
                <Button
                    variant="ghost"
                    disabled={flow.passkeyPending}
                    onClick={flow.back}
                >
                    {backLabel ?? t.stepUp.back}
                </Button>
            </div>
        </div>
    );
}

// Warstwy w jednym miejscu: widoczna wyznacza wysokość, ukryta leży nad nią,
// a wysokość przechodzi płynnie przez zmierzoną wartość.
function Swap({
    showAlt,
    main,
    alt,
}: {
    showAlt: boolean;
    main: ReactNode;
    alt: ReactNode;
}) {
    const [height, setHeight] = useState<number | null>(null);
    const [altMounted, setAltMounted] = useState(showAlt);
    if (showAlt && !altMounted) setAltMounted(true);

    const measure = (node: HTMLDivElement | null) => {
        if (!node) return;
        const observer = new ResizeObserver(() => setHeight(node.offsetHeight));
        observer.observe(node);
        return () => observer.disconnect();
    };

    return (
        <div
            className="zse-step-up-swap"
            style={height === null ? undefined : { height }}
        >
            <div
                ref={showAlt ? undefined : measure}
                className="zse-step-up-layer"
                data-hidden={showAlt || undefined}
                aria-hidden={showAlt || undefined}
                inert={showAlt}
            >
                {main}
            </div>
            {altMounted && (
                <div
                    ref={showAlt ? measure : undefined}
                    className="zse-step-up-layer"
                    data-hidden={!showAlt || undefined}
                    aria-hidden={!showAlt || undefined}
                    inert={!showAlt}
                >
                    {alt}
                </div>
            )}
        </div>
    );
}

export interface StepUpAreaProps {
    // Treść okna albo karty. W trakcie weryfikacji płynnie ustępuje
    // widokowi weryfikacji, a po „Wróć” wraca w tym samym stanie.
    children: ReactNode;
    // Wspólny przebieg z rodzica, np. Confirmer; bez niego obszar ma własny.
    flow?: Flow;
}

export function StepUpArea({ children, flow: given }: StepUpAreaProps) {
    const own = useStepUpFlow();
    const flow = given ?? own;

    return (
        <FlowContext value={flow}>
            <Swap
                showAlt={flow.status !== "idle"}
                main={children}
                alt={<StepUpView flow={flow} />}
            />
        </FlowContext>
    );
}

// Weryfikacja w najbliższym StepUpArea, a poza nim przez stepUp().
export function useStepUp() {
    const flow = use(FlowContext);
    return (request: StepUpRequest = {}) =>
        flow ? flow.verify(request) : stepUp(request);
}

export function useStepUpStatus(): StepUpStatus {
    return use(FlowContext)?.status ?? "idle";
}

export { useStepUpFlow, type Flow as StepUpFlow };

export interface StepUpGateProps {
    // Funkcja dostaje stan, żeby przed potwierdzeniem pokazać zaślepkę
    // zamiast sekretu: treść pod rozmyciem nadal jest w DOM.
    children: ReactNode | ((verified: boolean) => ReactNode);
    methods?: readonly StepUpMethod[];
    className?: string;
}

// Treść zasłonięta rozmyciem, np. kody zapasowe; po weryfikacji odsłonięta.
export function StepUpGate({ children, methods, className }: StepUpGateProps) {
    const t = useMessages();
    const flow = useStepUpFlow();
    const [verified, setVerified] = useState(false);
    const content =
        typeof children === "function" ? children(verified) : children;

    async function reveal() {
        if (await flow.verify(methods ? { methods } : {})) setVerified(true);
    }

    return (
        <StepUpArea flow={flow}>
            <div
                className={["zse-step-up-gate", className]
                    .filter(Boolean)
                    .join(" ")}
                data-verified={verified || undefined}
            >
                <div
                    className="zse-step-up-gate-content"
                    aria-hidden={!verified || undefined}
                    inert={!verified}
                >
                    {content}
                </div>
                <div
                    className="zse-step-up-gate-cover"
                    data-hidden={verified || undefined}
                    inert={verified}
                >
                    <span className="zse-step-up-sr">{t.stepUp.hidden}</span>
                    <Button variant="outline" onClick={() => void reveal()}>
                        {t.stepUp.reveal}
                    </Button>
                </div>
            </div>
        </StepUpArea>
    );
}

export interface StepUpProviderProps extends StepUpHandlers {
    children: ReactNode;
}

// Raz w aplikacji, np. obok <Confirmer />.
export function StepUpProvider({ children, ...handlers }: StepUpProviderProps) {
    return (
        <Handlers value={handlers}>
            {children}
            <StandaloneHost />
        </Handlers>
    );
}

// stepUp() bez StepUpArea: widok weryfikacji w dymku przy anchor albo
// w małym oknie.
function StandaloneHost() {
    const t = useMessages();
    const flow = useStepUpFlow();
    const [anchor, setAnchor] = useState<Element | null>(null);
    const open = flow.status === "verifying";

    // Rejestracja z każdym renderem, żeby stepUp() wołał bieżący przebieg.
    useExternalEffect(() =>
        registerStepUpHost((request) => {
            setAnchor(request.anchor ?? null);
            return flow.verify(
                request.methods ? { methods: request.methods } : {},
            );
        }),
    );

    const view = <StepUpView flow={flow} backLabel={t.common.cancel} />;
    const onOpenChange = (next: boolean) => {
        if (!next && !flow.passkeyPending) flow.back();
    };

    if (anchor)
        return (
            <Popover.Root
                open={open}
                onOpenChange={onOpenChange}
                modal="trap-focus"
            >
                <Popover.Portal>
                    <Popover.Positioner
                        className="zse-popover-positioner"
                        anchor={anchor}
                        side="bottom"
                        align="end"
                        sideOffset={6}
                        collisionPadding={8}
                    >
                        <Popover.Popup className="zse-popover zse-step-up-popover">
                            {view}
                        </Popover.Popup>
                    </Popover.Positioner>
                </Popover.Portal>
            </Popover.Root>
        );

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Backdrop className="zse-modal-backdrop" />
                <Dialog.Popup className="zse-modal zse-step-up-dialog">
                    {view}
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
