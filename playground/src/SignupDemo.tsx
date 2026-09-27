import { Capacity, SignupCard, type SignupStatus } from "@zse-gdansk/ui";
import { useState } from "react";

const HOUR = 3_600_000;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Zapis na serwerze: miejsce, a gdy go brak, lista rezerwowa.
function useSignup(limit: number, initial: number, initialWaitlist = 0) {
    const [taken, setTaken] = useState(initial);
    const [waitlist, setWaitlist] = useState(initialWaitlist);
    const [status, setStatus] = useState<SignupStatus>("none");
    return {
        taken,
        waitlist,
        status,
        waitlistPosition: status === "waitlist" ? waitlist : undefined,
        async onJoin() {
            await wait(700);
            if (taken < limit) {
                setTaken(taken + 1);
                setStatus("joined");
            } else {
                setWaitlist(waitlist + 1);
                setStatus("waitlist");
            }
        },
        async onLeave() {
            await wait(500);
            if (status === "joined") setTaken(taken - 1);
            else setWaitlist(waitlist - 1);
            setStatus("none");
        },
    };
}

export function SignupDemo() {
    const [now] = useState(() => Date.now());
    const robotics = useSignup(20, 12);
    const trip = useSignup(45, 42);
    const openDay = useSignup(8, 8, 3);

    return (
        <section className="signup-demo">
            <SignupCard
                title="Koło robotyki"
                meta="Wtorki 15:00 · sala 208 · Piotr Szymański"
                description="Budujemy i programujemy roboty na zawody FIRST LEGO League."
                limit={20}
                closesAt={now + 3 * 24 * HOUR}
                {...robotics}
            />
            <SignupCard
                title="Wycieczka do Torunia"
                meta="14 października · wyjazd 7:30"
                limit={45}
                closesAt={now + 5 * HOUR}
                {...trip}
            />
            <SignupCard
                title="Konsultacje przed maturą"
                meta="Sobota 9:00 · sala 105"
                limit={8}
                {...openDay}
            />
            <SignupCard
                title="Turniej szachowy"
                meta="Bez limitu miejsc"
                taken={17}
                closesAt={now - HOUR}
            />
            <SignupCard
                title="Warsztaty druku 3D"
                meta="Zapis tylko do limitu"
                taken={10}
                limit={10}
                allowWaitlist={false}
            />
            <SignupCard
                title="Zapis z błędem serwera"
                taken={3}
                limit={15}
                onJoin={async () => {
                    await wait(600);
                    throw new Error("500");
                }}
            />

            <div className="signup-demo-bars">
                <Capacity taken={4} limit={30} />
                <Capacity taken={27} limit={30} />
                <Capacity taken={30} limit={30} waitlist={5} />
                <Capacity taken={1} limit={2} size="sm" />
                <Capacity taken={64} waitlist={2} />
            </div>
        </section>
    );
}
