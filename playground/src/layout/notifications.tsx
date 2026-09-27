import {
    Award01Icon,
    CancelCircleIcon,
    Megaphone01Icon,
    NoteEditIcon,
    UserSwitchIcon,
} from "@hugeicons/core-free-icons";
import {
    NotificationCenter,
    toast,
    type NotificationItem,
} from "@zse-gdansk/ui";
import { useState } from "react";

const minutes = (value: number) => Date.now() - value * 60_000;

// Przykładowe powiadomienia nauczyciela, nie z prawdziwego systemu.
const START: NotificationItem[] = [
    {
        id: "1",
        title: "Zastępstwo jutro na 3. lekcji",
        body: "Matematyka w 2A za A. Nowak, sala 114.",
        time: minutes(6),
        icon: UserSwitchIcon,
        tone: "warning",
        href: "#/zastepstwa",
    },
    {
        id: "2",
        title: "Julia Lewandowska dodała usprawiedliwienie",
        body: "Nieobecność 24–25 września, zwolnienie lekarskie.",
        time: minutes(42),
        avatar: { name: "Julia Lewandowska" },
    },
    {
        id: "3",
        title: "Odwołane zajęcia z WF",
        body: "Wtorek, 6. i 7. lekcja, klasa 3C.",
        time: minutes(190),
        icon: CancelCircleIcon,
        tone: "danger",
    },
    {
        id: "7",
        title: "Nowa wiadomość od rodzica",
        body: "Mama Antoniego Zająca pyta o termin poprawy sprawdzianu.",
        time: minutes(12),
        avatar: { name: "Katarzyna Zając" },
    },
    {
        id: "8",
        title: "Sprawdzian 3C do oceny",
        body: "Maszyny elektryczne, 28 prac czeka od wczoraj.",
        time: minutes(95),
        icon: NoteEditIcon,
        tone: "accent",
    },
    {
        id: "9",
        title: "Hanna Wiśniewska dodała usprawiedliwienie",
        body: "Nieobecność 26 września, wyjazd na zawody.",
        time: minutes(240),
        avatar: { name: "Hanna Wiśniewska" },
    },
    {
        id: "10",
        title: "Zmiana sali na jutro",
        body: "Fizyka w 3C przeniesiona z 115 do 208.",
        time: minutes(60 * 20),
        icon: UserSwitchIcon,
        tone: "warning",
    },
    {
        id: "11",
        title: "Głosowanie na przewodniczącego samorządu",
        body: "Wyniki opublikowane, frekwencja 71%.",
        time: minutes(60 * 22),
        icon: Megaphone01Icon,
        tone: "accent",
    },
    {
        id: "12",
        title: "Mikołaj Zieliński oddał pracę po terminie",
        body: "Projekt z informatyki, 2 dni po terminie.",
        time: minutes(60 * 27),
        avatar: { name: "Mikołaj Zieliński" },
    },
    {
        id: "4",
        title: "Nowe ogłoszenie dyrekcji",
        body: "Rada pedagogiczna przeniesiona na czwartek, 15:00.",
        time: minutes(60 * 26),
        icon: Megaphone01Icon,
        tone: "accent",
        read: false,
    },
    {
        id: "5",
        title: "Przyznano punkty klasie 3C",
        body: "+20 za udział w konkursie energetycznym.",
        time: minutes(60 * 30),
        icon: Award01Icon,
        tone: "success",
        read: true,
    },
    {
        id: "6",
        title: "Przypomnienie: oceny do piątku",
        body: "Wystawienie ocen śródrocznych w dzienniku do 3 października.",
        time: minutes(60 * 24 * 4),
        icon: NoteEditIcon,
        read: true,
    },
];

export function Notifications() {
    const [items, setItems] = useState(START);
    const read = (id?: string) =>
        setItems((list) =>
            list.map((item) =>
                id === undefined || item.id === id
                    ? Object.assign({}, item, { read: true })
                    : item,
            ),
        );

    return (
        <NotificationCenter
            notifications={items}
            onRead={read}
            onReadAll={() => read()}
            onOpen={(item) => toast(item.title)}
            allHref="#/ustawienia/powiadomienia"
        />
    );
}
