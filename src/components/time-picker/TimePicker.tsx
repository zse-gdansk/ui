"use client";

import { Field } from "@base-ui/react/field";
import { Popover } from "@base-ui/react/popover";
import { Clock01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import {
    useCallback,
    useState,
    type KeyboardEvent,
    type ReactNode,
} from "react";

import { useMessages } from "../../i18n/context";
import { Button } from "../button/Button";
import { FieldFooter } from "../field/FieldFooter";
import { useFormValue } from "../form/context";
import { Icon } from "../icon/Icon";
import { ScrollArea } from "../scroll-area/ScrollArea";
import { formatTime, nowInMinutes, parseTime, toTimeValue } from "./time";

// Nazwany przedział dnia, np. lekcja, zmiana w pracy, tura głosowania.
// Plan podaje aplikacja, biblioteka nie zna godzin lekcji.
export interface TimeSlot {
    // Np. „1” albo „Lekcja 1”.
    label: ReactNode;
    // "HH:MM".
    start: string;
    end?: string;
    disabled?: boolean;
}

export interface TimePickerProps {
    label?: ReactNode;
    hint?: ReactNode;
    error?: string | undefined;
    size?: "sm" | "md" | "lg";
    placeholder?: string;
    disabled?: boolean;
    // Ukryte pole z godziną jako HH:MM, dla zwykłego formularza.
    name?: string;
    // "HH:MM" albo null.
    value?: string | null;
    defaultValue?: string | null;
    onValueChange?: (value: string | null) => void;
    // Zakres dozwolonych godzin, "HH:MM" włącznie.
    min?: string;
    max?: string;
    // Co ile minut, w kolumnie minut. Domyślnie 5.
    step?: number;
    // Wybór z listy przedziałów zamiast dowolnej godziny.
    slots?: readonly TimeSlot[];
    // Która godzina przedziału jest wartością: początek (np. start lekcji)
    // albo koniec (np. głosowanie do końca 3. lekcji).
    slotEdge?: "start" | "end";
}

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

const two = (number: number) => String(number).padStart(2, "0");

// Listy w tym samym popupie, w kolejności: godziny, minuty.
const listsNear = (element: Element) => [
    ...(element
        .closest(".zse-timepicker-popup")
        ?.querySelectorAll<HTMLElement>("[data-list]") ?? []),
];

// Przycisk, od którego zaczyna się lista: wybrany albo pierwszy dostępny.
const entryOf = (list: Element | undefined) =>
    list?.querySelector<HTMLElement>('[tabindex="0"]') ??
    list?.querySelector<HTMLElement>("button:not(:disabled)");

// Strzałki, Home i End między przyciskami jednej listy (w listach tabIndex
// 0 ma tylko wybrany, reszta dostępna strzałkami). Lewo i prawo przechodzą
// do sąsiedniej listy, np. z godzin do minut.
function listKeys(event: KeyboardEvent<HTMLButtonElement>) {
    const list = event.currentTarget.parentElement;
    if (!list) return;
    const options = [
        ...list.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"),
    ];
    const index = options.indexOf(event.currentTarget);
    const go = (next: number) => {
        event.preventDefault();
        options[Math.max(0, Math.min(options.length - 1, next))]?.focus();
    };
    const jump = (offset: number) => {
        const lists = listsNear(list);
        const button = entryOf(lists[lists.indexOf(list) + offset]);
        if (!button) return;
        event.preventDefault();
        button.focus();
    };
    switch (event.key) {
        case "ArrowDown":
            go(index + 1);
            break;
        case "ArrowUp":
            go(index - 1);
            break;
        case "Home":
            go(0);
            break;
        case "End":
            go(options.length - 1);
            break;
        case "ArrowRight":
            jump(1);
            break;
        case "ArrowLeft":
            jump(-1);
            break;
    }
}

// Po otwarciu przycisk z tabIndex 0 jest na środku swojej listy, a pierwsza
// lista dostaje fokus. Tylko raz, przy montowaniu.
function reveal(root: HTMLElement | null) {
    if (!root) return;
    const lists = root.matches("[data-list]")
        ? [root]
        : [...root.querySelectorAll<HTMLElement>("[data-list]")];
    lists.forEach((list, index) => {
        const option = list.querySelector<HTMLElement>('[tabindex="0"]');
        const viewport = list.closest<HTMLElement>(".zse-scroll-viewport");
        if (!option) return;
        if (viewport) {
            const offset =
                option.getBoundingClientRect().top -
                viewport.getBoundingClientRect().top;
            viewport.scrollTop +=
                offset - (viewport.clientHeight - option.offsetHeight) / 2;
        }
        if (index === 0) option.focus({ preventScroll: true });
    });
}

export function TimePicker({
    label,
    hint,
    error,
    size = "md",
    placeholder,
    disabled = false,
    name,
    value: controlled,
    defaultValue = null,
    onValueChange,
    min,
    max,
    step = 5,
    slots,
    slotEdge = "start",
}: TimePickerProps) {
    const t = useMessages();
    const [open, setOpen] = useState(false);
    const [internal, setInternal] = useState<string | null>(defaultValue);
    const value = controlled === undefined ? internal : controlled;
    const minutes = parseTime(value);
    useFormValue(name, value);

    const low = parseTime(min) ?? 0;
    const high = parseTime(max) ?? 24 * 60 - 1;
    const allowed = (time: number) => time >= low && time <= high;

    function set(next: number | null) {
        const text = next === null ? null : toTimeValue(next);
        if (controlled === undefined) setInternal(text);
        onValueChange?.(text);
    }

    const edgeOf = (slot: TimeSlot) =>
        parseTime(slotEdge === "end" ? (slot.end ?? slot.start) : slot.start);
    const rangeText = (slot: TimeSlot) => {
        const start = parseTime(slot.start);
        const end = parseTime(slot.end);
        if (start === null) return "";
        return end === null
            ? formatTime(t.locale, start)
            : `${formatTime(t.locale, start)}–${formatTime(t.locale, end)}`;
    };
    const selectedSlot =
        minutes === null
            ? undefined
            : slots?.find((slot) => edgeOf(slot) === minutes);

    const trigger: ReactNode = selectedSlot ? (
        <>
            {selectedSlot.label}
            <span className="zse-timepicker-range">
                {rangeText(selectedSlot)}
            </span>
        </>
    ) : minutes !== null ? (
        formatTime(t.locale, minutes)
    ) : null;

    return (
        <Field.Root
            className="zse-input zse-datepicker zse-timepicker"
            data-size={size}
            disabled={disabled}
            {...(error && { invalid: true })}
            {...(name !== undefined && { name })}
        >
            {label != null && label !== false && (
                <Field.Label className="zse-input-label">{label}</Field.Label>
            )}

            <Popover.Root open={open} onOpenChange={(next) => setOpen(next)}>
                <Popover.Trigger
                    className="zse-input-field zse-datepicker-trigger"
                    disabled={disabled}
                    data-placeholder={trigger === null ? "" : undefined}
                >
                    <Icon icon={Clock01Icon} className="zse-datepicker-icon" />
                    <span className="zse-datepicker-value">
                        {trigger ?? placeholder ?? t.timePicker.pick}
                    </span>
                </Popover.Trigger>
                <Popover.Portal>
                    <Popover.Positioner
                        className="zse-select-positioner"
                        side="bottom"
                        align="start"
                        sideOffset={6}
                    >
                        <Popover.Popup
                            className="zse-select-popup zse-timepicker-popup"
                            // Fokus ustawia lista, na wybranej godzinie.
                            initialFocus={false}
                        >
                            {slots ? (
                                <SlotList
                                    slots={slots}
                                    selected={selectedSlot}
                                    rangeText={rangeText}
                                    allowed={(slot) => {
                                        const time = edgeOf(slot);
                                        return (
                                            !slot.disabled &&
                                            time !== null &&
                                            allowed(time)
                                        );
                                    }}
                                    onSelect={(slot) => {
                                        set(edgeOf(slot));
                                        setOpen(false);
                                    }}
                                />
                            ) : (
                                <TimeColumns
                                    value={minutes}
                                    step={step}
                                    allowed={allowed}
                                    onChange={set}
                                    onDone={() => setOpen(false)}
                                />
                            )}
                            <div className="zse-calendar-footer">
                                {!slots && (
                                    <NowButton
                                        step={step}
                                        allowed={allowed}
                                        onPick={(now) => {
                                            set(now);
                                            setOpen(false);
                                        }}
                                    />
                                )}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={value === null}
                                    onClick={() => {
                                        set(null);
                                        setOpen(false);
                                    }}
                                >
                                    {t.common.clear}
                                </Button>
                            </div>
                        </Popover.Popup>
                    </Popover.Positioner>
                </Popover.Portal>
            </Popover.Root>

            {name && value !== null && (
                <input type="hidden" name={name} value={value} />
            )}

            <FieldFooter error={error} hint={hint} />
        </Field.Root>
    );
}

// Bieżąca godzina zaokrąglona w górę do kroku. Liczona dopiero w otwartym
// popupie, żeby render na serwerze nie różnił się od klienta.
function NowButton({
    step,
    allowed,
    onPick,
}: {
    step: number;
    allowed: (time: number) => boolean;
    onPick: (time: number) => void;
}) {
    const t = useMessages();
    const now = Math.min(
        Math.ceil(nowInMinutes() / step) * step,
        24 * 60 - step,
    );
    return (
        <Button
            size="sm"
            variant="ghost"
            disabled={!allowed(now)}
            onClick={() => onPick(now)}
        >
            {t.timePicker.now}
        </Button>
    );
}

function TimeColumns({
    value,
    step,
    allowed,
    onChange,
    onDone,
}: {
    value: number | null;
    step: number;
    allowed: (time: number) => boolean;
    onChange: (time: number) => void;
    onDone: () => void;
}) {
    const t = useMessages();
    const revealRef = useCallback(
        (node: HTMLElement | null) => reveal(node),
        [],
    );
    const minutes = Array.from(
        { length: Math.ceil(60 / step) },
        (_, index) => index * step,
    );
    const hours = HOURS.filter((hour) =>
        minutes.some((minute) => allowed(hour * 60 + minute)),
    );
    const hour = value === null ? null : Math.floor(value / 60);
    const minute = value === null ? null : value % 60;
    // Minuty dla godziny, której jeszcze nie wybrano, liczą się od pierwszej.
    const activeHour = hour ?? hours[0] ?? 0;
    const firstMinute = minutes.find((item) => allowed(activeHour * 60 + item));

    function pickHour(next: number, button: HTMLElement) {
        const keep =
            minute !== null && allowed(next * 60 + minute)
                ? minute
                : minutes.find((item) => allowed(next * 60 + item));
        if (keep === undefined) return;
        onChange(next * 60 + keep);
        // Dalej wybiera się minuty.
        const lists = listsNear(button);
        entryOf(lists[1])?.focus();
    }

    return (
        <div ref={revealRef} className="zse-timepicker-columns">
            <div className="zse-timepicker-heads" aria-hidden>
                <span>{t.timePicker.hours}</span>
                <span>{t.timePicker.minutes}</span>
            </div>
            <ScrollArea className="zse-timepicker-scroll" maxHeight={224}>
                <fieldset
                    data-list=""
                    aria-label={t.timePicker.hours}
                    className="zse-timepicker-column"
                >
                    {hours.map((item, index) => {
                        const selected = item === hour;
                        return (
                            <button
                                key={item}
                                type="button"
                                aria-pressed={selected}
                                tabIndex={
                                    selected || (hour === null && index === 0)
                                        ? 0
                                        : -1
                                }
                                className="zse-timepicker-option"
                                onKeyDown={listKeys}
                                onClick={(event) =>
                                    pickHour(item, event.currentTarget)
                                }
                            >
                                {two(item)}
                            </button>
                        );
                    })}
                </fieldset>
            </ScrollArea>
            <ScrollArea className="zse-timepicker-scroll" maxHeight={224}>
                <fieldset
                    data-list=""
                    aria-label={t.timePicker.minutes}
                    className="zse-timepicker-column"
                >
                    {minutes.map((item) => {
                        const time = activeHour * 60 + item;
                        const selected = item === minute;
                        return (
                            <button
                                key={item}
                                type="button"
                                aria-pressed={selected}
                                disabled={!allowed(time)}
                                tabIndex={
                                    selected ||
                                    (minute === null && item === firstMinute)
                                        ? 0
                                        : -1
                                }
                                className="zse-timepicker-option"
                                onKeyDown={listKeys}
                                onClick={() => {
                                    onChange(time);
                                    onDone();
                                }}
                            >
                                {two(item)}
                            </button>
                        );
                    })}
                </fieldset>
            </ScrollArea>
        </div>
    );
}

function SlotList({
    slots,
    selected,
    rangeText,
    allowed,
    onSelect,
}: {
    slots: readonly TimeSlot[];
    selected: TimeSlot | undefined;
    rangeText: (slot: TimeSlot) => string;
    allowed: (slot: TimeSlot) => boolean;
    onSelect: (slot: TimeSlot) => void;
}) {
    const t = useMessages();
    const revealRef = useCallback(
        (node: HTMLElement | null) => reveal(node),
        [],
    );
    const now = nowInMinutes();
    const isCurrent = (slot: TimeSlot) => {
        const start = parseTime(slot.start);
        const end = parseTime(slot.end);
        return start !== null && end !== null && now >= start && now < end;
    };
    const focused =
        selected ??
        slots.find((slot) => allowed(slot) && isCurrent(slot)) ??
        slots.find(allowed);

    return (
        <ScrollArea className="zse-timepicker-scroll" maxHeight={320}>
            <fieldset
                ref={revealRef}
                data-list=""
                aria-label={t.timePicker.pick}
                className="zse-timepicker-slots"
            >
                {slots.map((slot) => (
                    <button
                        key={`${slot.start}-${slot.end ?? ""}`}
                        type="button"
                        aria-pressed={slot === selected}
                        disabled={!allowed(slot)}
                        tabIndex={slot === focused ? 0 : -1}
                        className="zse-select-item zse-timepicker-slot"
                        onKeyDown={listKeys}
                        onClick={() => onSelect(slot)}
                    >
                        <span className="zse-timepicker-slot-label">
                            {slot.label}
                        </span>
                        <span className="zse-timepicker-range">
                            {rangeText(slot)}
                        </span>
                        {isCurrent(slot) && (
                            <span className="zse-timepicker-now">
                                {t.timePicker.current}
                            </span>
                        )}
                        <span
                            className="zse-select-item-indicator"
                            data-hidden={slot !== selected || undefined}
                        >
                            <Icon icon={Tick02Icon} />
                        </span>
                    </button>
                ))}
            </fieldset>
        </ScrollArea>
    );
}
