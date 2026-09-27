"use client";

import { Field } from "@base-ui/react/field";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import {
    useRef,
    useState,
    type ClipboardEvent,
    type KeyboardEvent,
    type ReactNode,
} from "react";

import { useMessages } from "../../i18n/context";
import { useTimeout } from "../../utils/effects";
import { FieldFooter } from "../field/FieldFooter";
import { useFormValue } from "../form/context";
import { Icon } from "../icon/Icon";

export interface TagInputProps {
    label?: ReactNode;
    hint?: ReactNode;
    error?: string | undefined;
    size?: "sm" | "md" | "lg";
    placeholder?: string;
    disabled?: boolean;
    // Ukryte pola z każdą wartością, dla zwykłego formularza.
    name?: string;
    value?: readonly string[];
    defaultValue?: readonly string[];
    onValueChange?: (tags: string[]) => void;
    // true przyjmuje, false odrzuca z ogólnym komunikatem, tekst to własny
    // komunikat, np. „To nie jest adres e-mail.”.
    validate?: (tag: string) => boolean | string;
    max?: number;
    // Klucz porównania duplikatów; domyślnie bez wielkości liter.
    normalize?: (tag: string) => string;
}

const NO_TAGS: readonly string[] = [];
const defaultNormalize = (tag: string) => tag.trim().toLocaleLowerCase();

// Wklejony tekst: przecinki, średniki i nowe linie oddzielają wartości.
const splitEntries = (text: string) =>
    text
        .split(/[\n,;]+/)
        .map((entry) => entry.trim())
        .filter(Boolean);

// Pole na wiele wartości jako znaczniki, np. adresy e-mail rodziców albo
// przedmioty. Enter, przecinek i Tab dodają, Backspace w pustym polu
// zaznacza ostatni znacznik, a dopiero drugi go usuwa.
export function TagInput({
    label,
    hint,
    error,
    size = "md",
    placeholder,
    disabled = false,
    name,
    value: controlled,
    defaultValue = NO_TAGS,
    onValueChange,
    validate,
    max,
    normalize = defaultNormalize,
}: TagInputProps) {
    const t = useMessages();
    const [inner, setInner] = useState<readonly string[]>(defaultValue);
    const tags = controlled ?? inner;
    const [text, setText] = useState("");
    // Komunikat po ostatniej próbie dodania (odrzucenie, duplikat, limit).
    const [message, setMessage] = useState<string | null>(null);
    // Ostatni znacznik zaznaczony pierwszym Backspace.
    const [armed, setArmed] = useState(false);
    // Istniejący znacznik, który mrugnie przy próbie dodania duplikatu.
    const [flash, setFlash] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    useFormValue(name, tags);

    // Mrugnięcie duplikatu gaśnie samo.
    useTimeout(() => setFlash(null), flash === null ? null : 450, flash);

    function commit(next: readonly string[]) {
        if (controlled === undefined) setInner(next);
        onValueChange?.([...next]);
    }

    // Dodaje wartości po kolei; zwraca te, których nie przyjęto.
    function add(entries: readonly string[]) {
        const next = [...tags];
        const rejected: string[] = [];
        let feedback: string | null = null;
        for (const entry of entries) {
            if (max !== undefined && next.length >= max) {
                rejected.push(entry);
                feedback = t.tagInput.limit(String(max));
                continue;
            }
            const existing = next.findIndex(
                (tag) => normalize(tag) === normalize(entry),
            );
            if (existing !== -1) {
                setFlash(existing);
                feedback ??= t.tagInput.duplicate(next[existing] ?? entry);
                continue;
            }
            const verdict = validate?.(entry) ?? true;
            if (verdict !== true) {
                rejected.push(entry);
                feedback =
                    typeof verdict === "string" ? verdict : t.tagInput.invalid;
                continue;
            }
            next.push(entry);
        }
        if (next.length !== tags.length) commit(next);
        setMessage(feedback);
        return rejected;
    }

    function addText() {
        const entry = text.trim();
        if (!entry) return false;
        const rejected = add([entry]);
        // Odrzucona zostaje w polu do poprawienia.
        setText(rejected[0] ?? "");
        return true;
    }

    function remove(index: number) {
        commit(tags.filter((_, position) => position !== index));
        setArmed(false);
        setMessage(null);
    }

    const removeButtons = () => [
        ...(listRef.current?.querySelectorAll<HTMLButtonElement>(
            ".zse-tag-remove",
        ) ?? []),
    ];

    function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        const input = event.currentTarget;
        const atStart = input.selectionStart === 0 && input.selectionEnd === 0;
        if (event.key === "Enter" || event.key === ",") {
            // Pusty Enter wysyła formularz, jak w zwykłym polu.
            if (addText() || event.key === ",") event.preventDefault();
            return;
        }
        if (event.key === "Tab" && text.trim()) {
            addText();
            event.preventDefault();
            return;
        }
        if (event.key === "Backspace" && atStart && tags.length > 0) {
            event.preventDefault();
            if (armed) remove(tags.length - 1);
            else setArmed(true);
            return;
        }
        if (event.key === "ArrowLeft" && atStart && tags.length > 0) {
            event.preventDefault();
            removeButtons().at(-1)?.focus();
            return;
        }
        if (armed) setArmed(false);
    }

    function onTagKeyDown(
        event: KeyboardEvent<HTMLButtonElement>,
        index: number,
    ) {
        const buttons = removeButtons();
        const focusAt = (position: number) => {
            if (position >= buttons.length) inputRef.current?.focus();
            else buttons[Math.max(0, position)]?.focus();
        };
        switch (event.key) {
            case "ArrowLeft":
                event.preventDefault();
                focusAt(index - 1);
                break;
            case "ArrowRight":
                event.preventDefault();
                focusAt(index + 1);
                break;
            case "Escape":
                event.preventDefault();
                inputRef.current?.focus();
                break;
            case "Backspace":
            case "Delete":
                event.preventDefault();
                remove(index);
                // Fokus na sąsiedni znacznik albo z powrotem do pola.
                requestAnimationFrame(() => {
                    const next = removeButtons();
                    const target =
                        event.key === "Backspace" ? index - 1 : index;
                    if (target >= 0 && target < next.length)
                        next[target]?.focus();
                    else inputRef.current?.focus();
                });
                break;
        }
    }

    function onPaste(event: ClipboardEvent<HTMLInputElement>) {
        const entries = splitEntries(event.clipboardData.getData("text"));
        // Jedna wartość wkleja się zwykle, do dalszej edycji.
        if (entries.length < 2) return;
        event.preventDefault();
        const rejected = add(entries);
        setText(rejected.join(", "));
        if (rejected.length > 0)
            setMessage(
                t.tagInput.skipped(
                    rejected.length,
                    new Intl.NumberFormat(t.locale).format(rejected.length),
                ),
            );
    }

    const lastTag = tags.at(-1);

    return (
        <Field.Root
            className="zse-input zse-tags"
            data-size={size}
            disabled={disabled}
            {...(error && { invalid: true })}
            {...(name !== undefined && { name })}
        >
            {label != null && label !== false && (
                <Field.Label className="zse-input-label">{label}</Field.Label>
            )}
            {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div
                className="zse-tags-box"
                data-disabled={disabled || undefined}
                onClick={(event) => {
                    if (event.target === event.currentTarget)
                        inputRef.current?.focus();
                }}
            >
                {tags.length > 0 && (
                    <ul ref={listRef} className="zse-tags-list">
                        {tags.map((tag, index) => (
                            <li
                                key={tag}
                                className="zse-tag"
                                data-armed={
                                    (armed && index === tags.length - 1) ||
                                    undefined
                                }
                                data-flash={flash === index || undefined}
                            >
                                <span className="zse-tag-label">{tag}</span>
                                <button
                                    type="button"
                                    className="zse-tag-remove"
                                    tabIndex={-1}
                                    disabled={disabled}
                                    aria-label={t.common.remove(tag)}
                                    onClick={() => {
                                        remove(index);
                                        inputRef.current?.focus();
                                    }}
                                    onKeyDown={(event) =>
                                        onTagKeyDown(event, index)
                                    }
                                >
                                    <Icon icon={Cancel01Icon} size={12} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                <Field.Control
                    ref={inputRef}
                    className="zse-tags-input"
                    value={text}
                    placeholder={tags.length === 0 ? placeholder : undefined}
                    disabled={disabled}
                    autoComplete="off"
                    enterKeyHint="enter"
                    onChange={(event) => {
                        setText(event.target.value);
                        setArmed(false);
                        if (message) setMessage(null);
                    }}
                    onKeyDown={onInputKeyDown}
                    onPaste={onPaste}
                    onBlur={() => {
                        setArmed(false);
                        addText();
                    }}
                />
            </div>
            <output className="zse-tags-sr" aria-live="polite">
                {armed && lastTag !== undefined
                    ? t.tagInput.armed(lastTag)
                    : ""}
            </output>
            {name &&
                tags.map((tag) => (
                    <input key={tag} type="hidden" name={name} value={tag} />
                ))}
            <FieldFooter error={error ?? message} hint={hint} />
        </Field.Root>
    );
}
