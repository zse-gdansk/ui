"use client";

import { Field } from "@base-ui/react/field";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { GridViewIcon } from "@hugeicons/core-free-icons";
import { type KeyboardEvent, type ReactNode, useRef, useState } from "react";

import {
    type GradeModifier,
    makeGrade,
    type ParsedGrade,
} from "../../grades/grades";
import { useMediaQuery } from "../../utils/use-media-query";
import { FieldFooter } from "../field/FieldFooter";
import { Icon } from "../icon/Icon";
import { gradeName, useGrades } from "./context";

export interface GradeFieldProps {
    label?: ReactNode;
    hint?: ReactNode;
    error?: string | undefined;
    size?: "sm" | "md" | "lg";
    // Zapis kanoniczny: "4+", "5-", "np"; null, gdy puste.
    value?: string | null;
    defaultValue?: string;
    onValueChange?: (value: string | null) => void;
    // Bez znaków np i bz.
    marks?: boolean;
    // Siatka otwiera się sama po wejściu w pole, a fokus zostaje w polu.
    // "touch": tylko na dotyku, i wtedy bez klawiatury ekranowej, bo
    // siatka ją zastępuje.
    autoOpen?: boolean | "touch";
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    id?: string;
}

const MOVES: Record<string, (columns: number) => number> = {
    ArrowRight: () => 1,
    ArrowLeft: () => -1,
    ArrowDown: (columns) => columns,
    ArrowUp: (columns) => -columns,
};

// Strzałki po siatce; puste miejsca (6+, 1−) są pomijane w tym samym
// kierunku.
function moveFocus(event: KeyboardEvent<HTMLButtonElement>, columns: number) {
    const move = MOVES[event.key];
    const grid = event.currentTarget.parentElement;
    if (!move || !grid) return;
    const cells = [...grid.children];
    let index = cells.indexOf(event.currentTarget);
    event.preventDefault();
    for (;;) {
        index += move(columns);
        const cell = cells[index];
        if (!cell) return;
        if (cell instanceof HTMLButtonElement) {
            cell.focus();
            return;
        }
    }
}

// Pole oceny: wpisane „db+”, „+4” albo „dobry” zamienia po wyjściu na
// „4+”. Siatka pod polem, bo na telefonie „+” i „−” są na drugiej
// klawiaturze.
export function GradeField({
    label,
    hint,
    error,
    size = "md",
    value,
    defaultValue,
    onValueChange,
    marks = true,
    autoOpen = false,
    placeholder,
    disabled = false,
    required = false,
    name,
    id,
}: GradeFieldProps) {
    const { config, t, parse } = useGrades();
    const { scale } = config;
    const [draft, setDraft] = useState(value ?? defaultValue ?? "");
    const [seen, setSeen] = useState(value);
    const [open, setOpen] = useState(false);
    const group = useRef<HTMLDivElement>(null);
    const touch = useMediaQuery("(pointer: coarse)");
    const auto = autoOpen === true || (autoOpen === "touch" && touch);
    // Otwarte z pola: fokus nie przechodzi do siatki, żeby dalej pisać.
    const fromInput = useRef(false);

    const read = (text: string) => {
        const grade = parse(text);
        return grade?.kind === "mark" && !marks ? null : grade;
    };

    // Wartość zmieniona z zewnątrz: pole pokazuje nową, chyba że wpisany
    // tekst już ją oznacza („db” przy wartości „4”).
    if (value !== seen) {
        setSeen(value);
        if ((read(draft)?.label ?? null) !== (value ?? null))
            setDraft(value ?? "");
    }

    function openFromInput() {
        if (!auto || disabled) return;
        fromInput.current = true;
        setOpen(true);
    }

    function type(text: string) {
        setDraft(text);
        const grade = read(text);
        if (grade) onValueChange?.(grade.label);
        else if (!text.trim()) onValueChange?.(null);
    }

    function pick(grade: ParsedGrade) {
        setDraft(grade.label);
        onValueChange?.(grade.label);
        setOpen(false);
    }

    const current = read(draft);
    const columns = scale.steps.length;
    const plus = scale.modifiers
        .filter((modifier) => modifier.delta > 0)
        .toSorted((a, b) => b.delta - a.delta);
    const minus = scale.modifiers
        .filter((modifier) => modifier.delta < 0)
        .toSorted((a, b) => b.delta - a.delta);
    const rows: (GradeModifier | null)[] = [...plus, null, ...minus];
    const markGrades = marks
        ? scale.marks.flatMap((mark) => {
              const grade = read(mark.label);
              return grade ? [grade] : [];
          })
        : [];

    function key(grade: ParsedGrade) {
        return (
            <button
                key={grade.label}
                type="button"
                className="zse-grade-key"
                data-tone={
                    grade.kind === "grade"
                        ? (grade.step.tone ?? "neutral")
                        : "neutral"
                }
                aria-label={gradeName(t, grade)}
                aria-pressed={current?.label === grade.label}
                onClick={() => pick(grade)}
                onKeyDown={(event) => moveFocus(event, columns)}
            >
                {grade.display}
            </button>
        );
    }

    return (
        <Field.Root
            // Wygląd pola i przycisku jak w NumberField.
            className="zse-input zse-number zse-grade-field"
            data-size={size}
            disabled={disabled}
            validationMode="onBlur"
            validate={(text) =>
                typeof text === "string" && text.trim() && !read(text)
                    ? t.grade.invalid
                    : null
            }
            {...(error && { invalid: true })}
            {...(name !== undefined && { name })}
        >
            {label != null && label !== false && (
                <Field.Label className="zse-input-label">{label}</Field.Label>
            )}

            <BasePopover.Root
                open={open}
                onOpenChange={(next) => {
                    if (next) fromInput.current = false;
                    setOpen(next);
                }}
            >
                <div
                    ref={group}
                    className="zse-input-control zse-number-group"
                    data-buttons=""
                >
                    <Field.Control
                        className="zse-number-input"
                        value={draft}
                        onValueChange={type}
                        onFocus={openFromInput}
                        // Klik w pole, które ma już fokus, po zamknięciu.
                        onClick={() => {
                            if (!open) openFromInput();
                        }}
                        onKeyDown={(event) => {
                            if (event.key === "Escape" && open) setOpen(false);
                        }}
                        onBlur={(event) => {
                            const grade = read(draft);
                            if (grade) setDraft(grade.label);
                            // Tab poza pole zamyka siatkę, wybór w niej nie.
                            const next = event.relatedTarget as Element | null;
                            if (auto && !next?.closest(".zse-grade-popup"))
                                setOpen(false);
                        }}
                        {...(autoOpen === "touch" &&
                            touch && { inputMode: "none" })}
                        autoComplete="off"
                        spellCheck={false}
                        required={required}
                        disabled={disabled}
                        {...(placeholder !== undefined && { placeholder })}
                        {...(id !== undefined && { id })}
                    />
                    <span className="zse-number-buttons">
                        <BasePopover.Trigger
                            className="zse-number-button"
                            aria-label={t.grade.pick}
                            disabled={disabled}
                        >
                            <Icon icon={GridViewIcon} />
                        </BasePopover.Trigger>
                    </span>
                </div>

                <BasePopover.Portal>
                    {/* Pod całym polem i na jego szerokość, jak lista Select. */}
                    <BasePopover.Positioner
                        className="zse-select-positioner"
                        anchor={group}
                        side="bottom"
                        align="start"
                        sideOffset={6}
                        collisionPadding={8}
                    >
                        <BasePopover.Popup
                            className="zse-select-popup zse-grade-popup"
                            aria-label={t.grade.pick}
                            initialFocus={() => !fromInput.current}
                            finalFocus={() => !fromInput.current}
                        >
                            <div
                                className="zse-grade-keys"
                                style={{
                                    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                                }}
                            >
                                {rows.flatMap((modifier) =>
                                    scale.steps.map((step) => {
                                        const grade = makeGrade(
                                            scale,
                                            step,
                                            modifier,
                                        );
                                        // Brak oceny na krańcu (6+, 1−):
                                        // puste miejsce, kolumny się zgadzają.
                                        return read(grade.label) ? (
                                            key(grade)
                                        ) : (
                                            <span
                                                key={grade.label}
                                                aria-hidden
                                            />
                                        );
                                    }),
                                )}
                                {markGrades.length > 0 && (
                                    <span
                                        className="zse-grade-keys-separator"
                                        aria-hidden
                                    />
                                )}
                                {markGrades.map(key)}
                            </div>
                        </BasePopover.Popup>
                    </BasePopover.Positioner>
                </BasePopover.Portal>
            </BasePopover.Root>

            <FieldFooter error={error} hint={hint} />
        </Field.Root>
    );
}
