"use client";

import { useMessages } from "../../i18n/context";

type Kind = "yes" | "no" | "abstain" | "notCast";

export interface VoteBarProps {
    yes: number;
    no: number;
    abstain: number;
    // Uprawnieni, którzy nie oddali głosu: pasek pokazuje wtedy całość
    // składu, nie tylko oddane głosy.
    notCast?: number | undefined;
    // Głosy za potrzebne do przyjęcia: kreska na pasku, do której musi
    // dojść segment „za”, i zdanie pod legendą.
    required?: number | null | undefined;
    // lg na tablicę w sali.
    size?: "md" | "lg";
    // Nazwa grupy dla czytnika, np. „Wynik głosowania”.
    label?: string;
    className?: string;
}

// Wynik głosowania: za, przeciw, wstrzymało się (i nie głosowało) na jednym
// pasku z progiem większości. Kolory z rozbieżnej palety wykresów (niebieski
// i pomarańczowy, czytelne przy daltonizmie), a liczby i procenty zawsze
// tekstem w legendzie, więc kolor nie jest jedyną informacją.
export function VoteBar({
    yes,
    no,
    abstain,
    notCast,
    required,
    size = "md",
    label,
    className,
}: VoteBarProps) {
    const t = useMessages();
    const parts: { kind: Kind; count: number }[] = [
        { kind: "yes", count: yes },
        { kind: "no", count: no },
        { kind: "abstain", count: abstain },
        ...(notCast === undefined
            ? []
            : [{ kind: "notCast" as const, count: notCast }]),
    ];
    const total = parts.reduce((sum, part) => sum + part.count, 0);
    const percent = new Intl.NumberFormat(t.locale, {
        style: "percent",
        maximumFractionDigits: 0,
    });
    const share = (count: number) => (total === 0 ? 0 : count / total);
    const threshold =
        required == null || total === 0
            ? null
            : Math.min(100, (required / total) * 100);

    return (
        <figure
            aria-label={label}
            className={["zse-vote-bar", className].filter(Boolean).join(" ")}
            data-size={size}
        >
            <div className="zse-vote-scale" aria-hidden>
                <div className="zse-vote-track">
                    {parts.map(
                        (part) =>
                            part.count > 0 && (
                                <span
                                    key={part.kind}
                                    className="zse-vote-segment"
                                    data-kind={part.kind}
                                    style={{ flexGrow: part.count }}
                                />
                            ),
                    )}
                </div>
                {threshold !== null && (
                    <span
                        className="zse-vote-threshold"
                        style={{ left: `${threshold}%` }}
                    />
                )}
            </div>
            <dl className="zse-vote-legend">
                {parts.map((part) => (
                    <div
                        key={part.kind}
                        className="zse-vote-item"
                        data-kind={part.kind}
                    >
                        <dt>{t.voteBar[part.kind]}</dt>
                        <dd>
                            <span className="zse-vote-count">{part.count}</span>
                            <span className="zse-vote-share">
                                {percent.format(share(part.count))}
                            </span>
                        </dd>
                    </div>
                ))}
            </dl>
            {required != null && (
                <figcaption className="zse-vote-required">
                    {t.voteBar.required(required)}
                </figcaption>
            )}
        </figure>
    );
}
