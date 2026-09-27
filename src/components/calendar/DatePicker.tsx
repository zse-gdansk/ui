"use client";

import { Field } from "@base-ui/react/field";
import { Popover } from "@base-ui/react/popover";
import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { useState, type ReactNode } from "react";

import { useMessages } from "../../i18n/context";
import { Button } from "../button/Button";
import { FieldFooter } from "../field/FieldFooter";
import { useFormValue } from "../form/context";
import { Icon } from "../icon/Icon";
import { Calendar, type CalendarMark, type DateRange } from "./Calendar";
import { dateFormats, startOfDay } from "./dates";

interface DatePickerBaseProps {
    label?: ReactNode;
    hint?: ReactNode;
    error?: string | undefined;
    size?: "sm" | "md" | "lg";
    placeholder?: string;
    min?: Date;
    max?: Date;
    isDisabled?: (date: Date) => boolean;
    marks?: (date: Date) => CalendarMark | CalendarMark[] | null | undefined;
    disabled?: boolean;
    // Ukryte pola z datą jako RRRR-MM-DD, dla zwykłego formularza.
    name?: string;
}

interface SingleProps extends DatePickerBaseProps {
    mode?: "single";
    value?: Date | null;
    defaultValue?: Date | null;
    onValueChange?: (value: Date | null) => void;
}

interface RangeProps extends DatePickerBaseProps {
    mode: "range";
    value?: DateRange | null;
    defaultValue?: DateRange | null;
    onValueChange?: (value: DateRange | null) => void;
}

export type DatePickerProps = SingleProps | RangeProps;

const iso = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function DatePicker(props: DatePickerProps) {
    const {
        label,
        hint,
        error,
        size = "md",
        min,
        max,
        isDisabled,
        marks,
        disabled = false,
        name,
    } = props;
    const t = useMessages();
    const formats = dateFormats(t.locale);
    const range = props.mode === "range";
    const [open, setOpen] = useState(false);
    const [internal, setInternal] = useState<Date | DateRange | null>(
        props.defaultValue ?? null,
    );
    const value = props.value === undefined ? internal : props.value;
    const single = range ? null : (value as Date | null);
    const span = range ? (value as DateRange | null) : null;
    // W Form wartością jest Date albo { from, to }, nie tekst, więc schemat
    // może od razu sprawdzać np. z.date().min(dzisiaj).
    useFormValue(name, value);

    function set(next: Date | DateRange | null) {
        if (props.value === undefined) setInternal(next);
        if (props.mode === "range")
            props.onValueChange?.(next as DateRange | null);
        else props.onValueChange?.(next as Date | null);
    }

    const text = single
        ? formats.date(single)
        : span
          ? span.to
              ? formats.range(span.from, span.to)
              : `${formats.date(span.from)} – …`
          : null;
    const placeholder =
        props.placeholder ??
        (range ? t.datePicker.pickRange : t.datePicker.pick);

    const today = startOfDay(new Date());
    const todayBlocked =
        (min !== undefined && today < startOfDay(min)) ||
        (max !== undefined && today > startOfDay(max)) ||
        (isDisabled?.(today) ?? false);

    const shared = {
        autoFocus: true,
        ...(min && { min }),
        ...(max && { max }),
        ...(isDisabled && { isDisabled }),
        ...(marks && { marks }),
    };

    const footer = (
        <>
            <Button
                size="sm"
                variant="ghost"
                disabled={todayBlocked}
                onClick={() => {
                    set(range ? { from: today, to: today } : today);
                    setOpen(false);
                }}
            >
                {t.datePicker.today}
            </Button>
            <Button
                size="sm"
                variant="ghost"
                disabled={!value}
                onClick={() => {
                    set(null);
                    setOpen(false);
                }}
            >
                {t.common.clear}
            </Button>
        </>
    );

    return (
        <Field.Root
            className="zse-input zse-datepicker"
            data-size={size}
            disabled={disabled}
            {...(error && { invalid: true })}
            {...(name !== undefined && { name: name })}
        >
            {label != null && label !== false && (
                <Field.Label className="zse-input-label">{label}</Field.Label>
            )}

            <Popover.Root open={open} onOpenChange={(next) => setOpen(next)}>
                <Popover.Trigger
                    className="zse-input-field zse-datepicker-trigger"
                    disabled={disabled}
                    data-placeholder={text ? undefined : ""}
                >
                    <Icon
                        icon={Calendar03Icon}
                        className="zse-datepicker-icon"
                    />
                    <span className="zse-datepicker-value">
                        {text ?? placeholder}
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
                            className="zse-select-popup zse-datepicker-popup"
                            // Fokus ustawia kalendarz, na wybranym dniu.
                            initialFocus={false}
                        >
                            {props.mode === "range" ? (
                                <Calendar
                                    mode="range"
                                    value={span}
                                    onValueChange={(next) => {
                                        set(next);
                                        if (next?.to) setOpen(false);
                                    }}
                                    footer={footer}
                                    {...shared}
                                />
                            ) : (
                                <Calendar
                                    value={single}
                                    onValueChange={(next) => {
                                        set(next);
                                        setOpen(false);
                                    }}
                                    footer={footer}
                                    {...shared}
                                />
                            )}
                        </Popover.Popup>
                    </Popover.Positioner>
                </Popover.Portal>
            </Popover.Root>

            {name && single && (
                <input type="hidden" name={name} value={iso(single)} />
            )}
            {name && span && (
                <>
                    <input
                        type="hidden"
                        name={`${name}[from]`}
                        value={iso(span.from)}
                    />
                    {span.to && (
                        <input
                            type="hidden"
                            name={`${name}[to]`}
                            value={iso(span.to)}
                        />
                    )}
                </>
            )}

            <FieldFooter error={error} hint={hint} />
        </Field.Root>
    );
}
