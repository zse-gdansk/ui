import {
    EventCalendar,
    type CalendarEvent,
    type CalendarEventType,
} from "@zse-gdansk/ui";

const TYPES: CalendarEventType[] = [
    { id: "school", label: "Wydarzenia szkolne", color: "var(--chart-1)" },
    { id: "parents", label: "Wywiadówki", color: "var(--chart-2)" },
    { id: "free", label: "Dni wolne", color: "var(--chart-3)" },
    { id: "survey", label: "Ankiety i terminy", color: "var(--chart-4)" },
    { id: "trip", label: "Wycieczki i praktyki", color: "var(--chart-7)" },
];

// Przykładowe wydarzenia w bieżącym miesiącu, nie z prawdziwego kalendarza.
const now = new Date();
const day = (date: number, time?: string) => {
    const value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
    return time ? `${value}T${time}` : value;
};

const EVENTS: CalendarEvent[] = [
    {
        id: "1",
        title: "Ankieta o lekcjach zdalnych",
        type: "survey",
        start: day(1),
        end: day(28),
        description: "Dla uczniów wszystkich klas, w dzienniku.",
    },
    {
        id: "2",
        title: "Apel na rozpoczęcie miesiąca",
        type: "school",
        start: day(1, "08:00"),
        end: day(1, "08:45"),
        location: "Sala gimnastyczna",
    },
    {
        id: "3",
        title: "Praktyki zawodowe 3C",
        type: "trip",
        start: day(8),
        end: day(19),
        location: "Energa Operator, Gdańsk",
    },
    {
        id: "4",
        title: "Rada pedagogiczna",
        type: "school",
        start: day(10, "15:00"),
        end: day(10, "17:00"),
        location: "Sala 204",
    },
    {
        id: "5",
        title: "Wywiadówka klas pierwszych",
        type: "parents",
        start: day(16, "17:00"),
        end: day(16, "18:30"),
    },
    {
        id: "6",
        title: "Wywiadówka klas drugich",
        type: "parents",
        start: day(16, "18:00"),
        end: day(16, "19:00"),
    },
    {
        id: "7",
        title: "Dzień otwarty",
        type: "school",
        start: day(16, "10:00"),
    },
    {
        id: "8",
        title: "Termin zgłoszeń do olimpiady",
        type: "survey",
        start: day(16),
    },
    {
        id: "9",
        title: "Wycieczka 2A do Krakowa",
        type: "trip",
        start: day(22),
        end: day(24),
    },
    { id: "10", title: "Dzień wolny od zajęć", type: "free", start: day(26) },
];

export function EventsDemo() {
    return (
        <section className="events-demo">
            <EventCalendar
                label="Kalendarz szkolny"
                events={EVENTS}
                types={TYPES}
            />
        </section>
    );
}
