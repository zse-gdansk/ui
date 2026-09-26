"use client";

import {
    AlertCircleIcon,
    Copy01Icon,
    Tick02Icon,
    ViewIcon,
    ViewOffIcon,
} from "@hugeicons/core-free-icons";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { useMessages } from "../../i18n/context";
import { useCopy } from "../../utils/use-copy";
import { Icon } from "../icon/Icon";
import { Spokes } from "../spinner/Spinner";

type Source = string | (() => Promise<string>);

export interface SecretFieldProps {
    label?: ReactNode;
    hint?: ReactNode;
    // Sekret albo funkcja, która go pobiera dopiero przy „Pokaż” albo
    // „Kopiuj”: wtedy nie trafia do przeglądarki, dopóki nie jest potrzebny.
    value: Source;
    // Ostatnie znaki do maski, gdy value to funkcja (np. z API „abcd”).
    preview?: string;
    // Ile ostatnich znaków widać w masce. Domyślnie 4, dla krótkich (PIN,
    // do 8 znaków) 0.
    visibleEnd?: number;
    // Po tylu ms odkryta wartość sama się chowa; 0 wyłącza.
    autoHide?: number;
    size?: "sm" | "md" | "lg";
    // Bez przycisku kopiowania, np. gdy sekretu nie wolno wklejać dalej.
    copyable?: boolean;
}

// Stała liczba kropek: maska nie zdradza długości sekretu.
const MASK = "•".repeat(12);

// Sekret do odczytu i skopiowania, np. klucz API, PIN, token. Domyślnie
// zamaskowany, z pokazaniem na chwilę i kopiowaniem bez pokazywania.
export function SecretField({
    label,
    hint,
    value,
    preview,
    visibleEnd,
    autoHide = 30000,
    size = "md",
    copyable = true,
}: SecretFieldProps) {
    const t = useMessages();
    const labelId = useId();
    const [revealed, setRevealed] = useState(false);
    const [loaded, setLoaded] = useState<string | null>(
        typeof value === "string" ? value : null,
    );
    // Która akcja czeka na pobranie: spinner kręci się w klikniętym
    // przycisku, a akcja wykonuje się dopiero po pobraniu.
    const [waiting, setWaiting] = useState<"reveal" | "copy" | null>(null);
    const [copyState, copy] = useCopy();
    const [error, setError] = useState(false);
    const pending = useRef<Promise<string> | null>(null);

    const [source, setSource] = useState<Source>(() => value);
    if (source !== value) {
        setSource(() => value);
        setLoaded(typeof value === "string" ? value : null);
        setRevealed(false);
    }

    const known = loaded ?? "";
    const end =
        visibleEnd ??
        (known ? (known.length > 8 ? 4 : 0) : preview ? preview.length : 0);
    const ending =
        end > 0
            ? known
                ? known.slice(-end)
                : (preview ?? "").slice(-end)
            : "";

    // Jedno pobranie naraz, wspólne dla „Pokaż” i „Kopiuj”.
    function load() {
        if (loaded !== null) return Promise.resolve(loaded);
        if (typeof value === "string") return Promise.resolve(value);
        pending.current ??= value()
            .then((result) => {
                setLoaded(result);
                setError(false);
                return result;
            })
            .catch((reason: unknown) => {
                setError(true);
                throw reason;
            })
            .finally(() => {
                pending.current = null;
            });
        return pending.current;
    }

    async function toggle() {
        if (revealed) {
            setRevealed(false);
            return;
        }
        if (waiting) return;
        setWaiting("reveal");
        try {
            await load();
            setRevealed(true);
        } catch {
        } finally {
            setWaiting(null);
        }
    }

    async function copyValue() {
        if (waiting) return;
        setWaiting("copy");
        try {
            await copy(load);
        } finally {
            setWaiting(null);
        }
    }

    // Odkryty sekret sam się chowa po czasie i przy przejściu na inną kartę.
    useEffect(() => {
        if (!revealed) return;
        const timer =
            autoHide > 0
                ? setTimeout(() => setRevealed(false), autoHide)
                : undefined;
        const onVisibility = () => {
            if (document.hidden) setRevealed(false);
        };
        document.addEventListener("visibilitychange", onVisibility);
        return () => {
            clearTimeout(timer);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, [revealed, autoHide]);

    return (
        <div className="zse-input zse-secret" data-size={size}>
            {label != null && label !== false && (
                <span className="zse-input-label" id={labelId}>
                    {label}
                </span>
            )}
            <div
                className="zse-secret-box"
                // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
                role="group"
                aria-labelledby={label != null ? labelId : undefined}
            >
                <span className="zse-secret-value">
                    <span
                        className="zse-secret-layer"
                        data-hidden={revealed || undefined}
                        aria-hidden={revealed || undefined}
                    >
                        <span aria-hidden>
                            {MASK}
                            {ending}
                        </span>
                        <span className="zse-secret-sr">
                            {ending
                                ? t.secretField.hiddenEnding(ending)
                                : t.secretField.hidden}
                        </span>
                    </span>
                    <span
                        className="zse-secret-layer zse-secret-plain"
                        data-hidden={!revealed || undefined}
                        aria-hidden={!revealed || undefined}
                    >
                        {revealed ? known : ""}
                    </span>
                </span>
                <button
                    type="button"
                    className="zse-secret-action"
                    aria-label={
                        revealed ? t.secretField.hide : t.secretField.show
                    }
                    aria-pressed={revealed}
                    aria-busy={waiting === "reveal" || undefined}
                    onClick={toggle}
                >
                    <span className="zse-input-toggle-icon">
                        <span
                            className="zse-input-toggle-layer"
                            data-hidden={
                                revealed || waiting === "reveal" || undefined
                            }
                        >
                            <Icon icon={ViewIcon} />
                        </span>
                        <span
                            className="zse-input-toggle-layer"
                            data-hidden={
                                !revealed || waiting === "reveal" || undefined
                            }
                        >
                            <Icon icon={ViewOffIcon} />
                        </span>
                        <span
                            className="zse-input-toggle-layer"
                            data-hidden={waiting !== "reveal" || undefined}
                        >
                            <Spokes />
                        </span>
                    </span>
                </button>
                {copyable && (
                    <button
                        type="button"
                        className="zse-secret-action"
                        data-state={copyState}
                        aria-label={
                            copyState === "copied"
                                ? t.copy.copied
                                : copyState === "failed"
                                  ? t.copy.failed
                                  : t.copy.copy
                        }
                        aria-busy={waiting === "copy" || undefined}
                        onClick={copyValue}
                    >
                        <span className="zse-input-toggle-icon">
                            <span
                                className="zse-input-toggle-layer"
                                data-hidden={
                                    waiting === "copy" ||
                                    copyState !== "idle" ||
                                    undefined
                                }
                            >
                                <Icon icon={Copy01Icon} />
                            </span>
                            <span
                                className="zse-input-toggle-layer"
                                data-hidden={waiting !== "copy" || undefined}
                            >
                                <Spokes />
                            </span>
                            <span
                                className="zse-input-toggle-layer"
                                data-tone="success"
                                data-hidden={
                                    waiting === "copy" ||
                                    copyState !== "copied" ||
                                    undefined
                                }
                            >
                                <Icon icon={Tick02Icon} />
                            </span>
                            <span
                                className="zse-input-toggle-layer"
                                data-tone="danger"
                                data-hidden={
                                    waiting === "copy" ||
                                    copyState !== "failed" ||
                                    undefined
                                }
                            >
                                <Icon icon={AlertCircleIcon} />
                            </span>
                        </span>
                    </button>
                )}
            </div>
            {error && (
                <p className="zse-input-hint zse-secret-error" role="alert">
                    {t.secretField.loadFailed}
                </p>
            )}
            {hint != null && hint !== false && (
                <p className="zse-input-hint zse-input-description">{hint}</p>
            )}
        </div>
    );
}
