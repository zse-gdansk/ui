import {
    Calendar,
    DatePicker,
    type CalendarMark,
    type DateRange,
} from "@zse-gdansk/ui";
import { useState } from "react";

const today = new Date();
const day = (offset: number) =>
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);

// Sprawdziany i terminy względem dzisiaj, żeby demo zawsze coś pokazywało.
const EVENTS: [number, CalendarMark][] = [
    [2, "danger"],
    [5, "accent"],
    [5, "warning"],
    [9, "success"],
    [-3, "accent"],
];

const marks = (date: Date) => {
    const found = EVENTS.filter(([offset]) => {
        const target = day(offset);
        return (
            target.getFullYear() === date.getFullYear() &&
            target.getMonth() === date.getMonth() &&
            target.getDate() === date.getDate()
        );
    }).map(([, tone]) => tone);
    return found.length > 0 ? found : undefined;
};

const weekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

export function CalendarDemo() {
    const [date, setDate] = useState<Date | null>(day(2));
    const [trip, setTrip] = useState<DateRange | null>(null);

    return (
        <section className="calendar-demo">
            <div className="calendar-card">
                <Calendar value={date} onValueChange={setDate} marks={marks} />
            </div>
            <div className="calendar-card">
                <Calendar
                    mode="range"
                    value={trip}
                    onValueChange={setTrip}
                    isDisabled={weekend}
                />
            </div>
            <div className="fields">
                <DatePicker
                    label="Termin oddania"
                    value={date}
                    onValueChange={setDate}
                    marks={marks}
                    min={day(0)}
                    hint="Tylko od dzisiaj"
                />
                <DatePicker
                    mode="range"
                    label="Wycieczka klasowa"
                    value={trip}
                    onValueChange={setTrip}
                    isDisabled={weekend}
                />
                <DatePicker
                    label="Data urodzenia"
                    size="sm"
                    max={day(0)}
                    hint="Kliknij miesiąc w nagłówku, żeby przeskoczyć o lata"
                />
                <DatePicker label="Zablokowane" disabled />
            </div>
        </section>
    );
}
