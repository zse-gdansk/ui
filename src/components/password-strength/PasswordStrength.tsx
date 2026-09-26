"use client";

import { Tick02Icon } from "@hugeicons/core-free-icons";

import { useMessages } from "../../i18n/context";
import { pl } from "../../i18n/pl";
import type { Messages } from "../../i18n/types";
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

export function defaultRules(
    minLength = 8,
    messages: Messages["password"] = pl.password,
): PasswordRule[] {
    return [
        {
            label: messages.minLength(minLength),
            test: (p) => p.length >= minLength,
        },
        {
            label: messages.mixedCase,
            test: (p) => /\p{Ll}/u.test(p) && /\p{Lu}/u.test(p),
        },
        { label: messages.digit, test: (p) => /\d/.test(p) },
        {
            label: messages.special,
            test: (p) => /[^\p{L}\d\s]/u.test(p),
        },
    ];
}

const TONES = ["danger", "danger", "warning", "success", "success"] as const;

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
    const t = useMessages();
    const list = rules ?? defaultRules(minLength, t.password);
    const score = passwordScore(value, list, minLength);
    const level = {
        label: t.password.levels[score] ?? t.password.levels[0],
        tone: TONES[score] ?? TONES[0],
    };
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
                        ? t.password.common
                        : t.password.verdict(level.label)
                    : t.password.empty}
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
                                    {` (${met ? t.password.met : t.password.unmet})`}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
