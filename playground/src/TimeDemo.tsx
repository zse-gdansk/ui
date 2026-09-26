import { TimePicker, type TimeSlot } from "@zse-gdansk/ui";
import { useState } from "react";

const LESSONS: TimeSlot[] = [
    ["07:45", "08:30"],
    ["08:40", "09:25"],
    ["09:35", "10:20"],
    ["10:35", "11:20"],
    ["11:30", "12:15"],
    ["12:25", "13:10"],
    ["13:20", "14:05"],
    ["14:10", "14:55"],
    ["15:00", "15:45"],
].map(([start, end], index) => ({
    label: `${index + 1}. lekcja`,
    start: start ?? "",
    end: end ?? "",
}));

export function TimeDemo() {
    const [lesson, setLesson] = useState<string | null>("09:35");
    const [closing, setClosing] = useState<string | null>(null);
    const [meeting, setMeeting] = useState<string | null>("16:30");

    return (
        <section>
            <div className="fields">
                <TimePicker
                    label="Sprawdzian"
                    slots={LESSONS}
                    value={lesson}
                    onValueChange={setLesson}
                    hint={lesson ? `Wartość: ${lesson}` : "Początek lekcji"}
                />
                <TimePicker
                    label="Koniec głosowania"
                    slots={LESSONS}
                    slotEdge="end"
                    value={closing}
                    onValueChange={setClosing}
                    hint={
                        closing
                            ? `Wartość: ${closing}`
                            : "Głosowanie trwa do końca wybranej lekcji"
                    }
                />
                <TimePicker
                    label="Wywiadówka"
                    value={meeting}
                    onValueChange={setMeeting}
                    min="15:00"
                    max="20:00"
                    step={15}
                    hint="Od 15:00 do 20:00, co 15 minut"
                />
                <TimePicker label="Dowolna godzina" size="sm" />
                <TimePicker label="Zablokowane" disabled />
            </div>
        </section>
    );
}
