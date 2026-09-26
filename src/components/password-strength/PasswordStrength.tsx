"use client";

import { Tick02Icon } from "@hugeicons/core-free-icons";

import { Icon } from "../icon/Icon";

export interface PasswordRule {
    label: string;
    test: (password: string) => boolean;
}

export interface PasswordStrengthProps {
    // Hasło z pola obok, np. <Input type="password" />.
    value: string;
    // Własna lista wymagań zamiast domyślnej.
    rules?: readonly PasswordRule[];
    // Lista wymagań pod paskiem.
    showRules?: boolean;
    minLength?: number;
}

// Najczęstsze hasła i przewidywalne dla szkoły: z nimi ocena to zawsze
// „bardzo słabe”, nawet gdy formalnie spełniają wymagania.
const COMMON = new Set([
    "12345678",
    "123456789",
    "password",
    "password1",
    "qwerty123",
    "qwertyuiop",
    "zaq12wsx",
    "haslo123",
    "haslo1234",
    "zse12345",
    "zsegdansk",
    "1qaz2wsx",
    "iloveyou",
]);

export function defaultRules(minLength = 8): PasswordRule[] {
    return [
        {
            label: `Co najmniej ${minLength} znaków`,
            test: (p) => p.length >= minLength,
        },
        {
            label: "Mała i wielka litera",
            test: (p) => /\p{Ll}/u.test(p) && /\p{Lu}/u.test(p),
        },
        { label: "Cyfra", test: (p) => /\d/.test(p) },
        {
            label: "Znak specjalny, np. ! ? #",
            test: (p) => /[^\p{L}\d\s]/u.test(p),
        },
    ];
}

const LEVELS = [
    { label: "Bardzo słabe", tone: "danger" },
    { label: "Słabe", tone: "danger" },
    { label: "Średnie", tone: "warning" },
    { label: "Dobre", tone: "success" },
    { label: "Silne", tone: "success" },
] as const;

// 0–4: spełnione wymagania plus jeden punkt za długość od 12 znaków.
// Za krótkie hasło nie przekroczy „słabego”, popularne jest zawsze 0.
export function passwordScore(
    password: string,
    rules: readonly PasswordRule[] = defaultRules(),
    minLength = 8,
) {
    if (!password) return 0;
    if (COMMON.has(password.toLowerCase())) return 0;
    const met = rules.filter((rule) => rule.test(password)).length;
    let score =
        Math.round((met / rules.length) * 3) + (password.length >= 12 ? 1 : 0);
    if (password.length < minLength) score = Math.min(score, 1);
    return Math.min(score, 4);
}

export function PasswordStrength({
    value,
    rules,
    showRules = true,
    minLength = 8,
}: PasswordStrengthProps) {
    const list = rules ?? defaultRules(minLength);
    const score = passwordScore(value, list, minLength);
    const level = LEVELS[score] ?? LEVELS[0];
    const common = value !== "" && COMMON.has(value.toLowerCase());

    return (
        <div
            className="zse-password"
            data-tone={value ? level.tone : undefined}
        >
            <div className="zse-password-bar" aria-hidden>
                {[1, 2, 3, 4].map((segment) => (
                    <span
                        key={segment}
                        data-filled={
                            (value && segment <= Math.max(score, 1)) ||
                            undefined
                        }
                    />
                ))}
            </div>
            <p className="zse-password-verdict" aria-live="polite">
                {value
                    ? common
                        ? "Bardzo słabe: to jedno z najczęstszych haseł"
                        : `Siła hasła: ${level.label.toLocaleLowerCase("pl")}`
                    : "Wpisz hasło, żeby sprawdzić jego siłę"}
            </p>
            {showRules && (
                <ul className="zse-password-rules">
                    {list.map((rule) => {
                        const met = rule.test(value);
                        return (
                            <li key={rule.label} data-met={met || undefined}>
                                <span
                                    className="zse-password-check"
                                    aria-hidden
                                >
                                    <Icon
                                        icon={Tick02Icon}
                                        size={10}
                                        strokeWidth={3}
                                    />
                                </span>
                                {rule.label}
                                <span className="zse-password-sr">
                                    {met ? " (spełnione)" : " (niespełnione)"}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
