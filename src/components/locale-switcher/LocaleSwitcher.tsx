"use client";

import { LanguageSkillIcon } from "@hugeicons/core-free-icons";
import { useState, type ComponentType } from "react";

import { useMessages } from "../../i18n/context";
import { Button } from "../button/Button";
import { Menu, MenuRadioGroup, MenuRadioItem } from "../menu/Menu";

// Komponent flagi, np. PL z country-flag-icons/react/3x2.
export type FlagComponent = ComponentType<{
    className?: string;
    "aria-hidden"?: boolean;
}>;

export interface LocaleSwitcherProps {
    // Kody BCP 47, np. ["pl", "en", "uk"].
    locales: readonly string[];
    // Aktualny język aplikacji, np. i18n.resolvedLanguage.
    value: string;
    // Zwrócona obietnica (np. i18n.changeLanguage) pokazuje spinner do końca.
    onValueChange: (locale: string) => unknown;
    // Flagi przy językach, np. { pl: PL, en: GB, uk: UA }. Kraj wybiera
    // aplikacja, bo język to nie kraj (en: GB czy US?).
    flags?: Partial<Record<string, FlagComponent>>;
    // "code" pokazuje sam kod, np. w ciasnym nagłówku.
    display?: "name" | "code";
    size?: "sm" | "md";
    side?: "top" | "bottom";
    align?: "start" | "center" | "end";
    "aria-label"?: string;
}

const namers = new Map<string, Intl.DisplayNames | null>();

// Nazwa języka w danym języku, np. ("en", "pl") → „angielski”.
function languageName(code: string, inLocale: string) {
    if (!namers.has(inLocale)) {
        try {
            namers.set(
                inLocale,
                new Intl.DisplayNames([inLocale], { type: "language" }),
            );
        } catch {
            namers.set(inLocale, null);
        }
    }
    try {
        return namers.get(inLocale)?.of(code) ?? code;
    } catch {
        return code;
    }
}

// Nazwa własna języka z wielkiej litery: Polski, English, Українська.
function nativeName(code: string) {
    const name = languageName(code, code);
    return name.charAt(0).toLocaleUpperCase(code) + name.slice(1);
}

const isPromise = (value: unknown): value is PromiseLike<unknown> =>
    typeof (value as PromiseLike<unknown> | null)?.then === "function";

// Wybór języka aplikacji. Nie zależy od biblioteki tłumaczeń: wartość
// i zmiana idą z zewnątrz (i18next, next-intl, własny stan).
export function LocaleSwitcher({
    locales,
    value,
    onValueChange,
    flags,
    display = "name",
    size = "md",
    side = "bottom",
    align = "end",
    "aria-label": ariaLabel,
}: LocaleSwitcherProps) {
    const t = useMessages();
    // Język w trakcie wczytywania; do końca zaznaczony w menu.
    const [pending, setPending] = useState<string | null>(null);
    const shown = pending ?? value;
    const code = shown.split("-")[0]?.toLocaleUpperCase(shown) ?? shown;

    const select = (next: string) => {
        if (next === value) return;
        const result = onValueChange(next);
        if (!isPromise(result)) return;
        setPending(next);
        const done = () =>
            setPending((current) => (current === next ? null : current));
        result.then(done, done);
    };

    return (
        <Menu
            side={side}
            align={align}
            trigger={
                <Button
                    variant="ghost"
                    size={size}
                    icon={LanguageSkillIcon}
                    loading={pending !== null}
                    className="zse-locale-trigger"
                    aria-label={`${ariaLabel ?? t.localeSwitcher.label}: ${nativeName(shown)}`}
                >
                    <span lang={shown} data-display={display}>
                        {display === "code" ? code : nativeName(shown)}
                    </span>
                </Button>
            }
        >
            <MenuRadioGroup value={shown} onValueChange={select}>
                {locales.map((locale) => {
                    const native = nativeName(locale);
                    const local = languageName(locale, value);
                    const Flag = flags?.[locale];
                    return (
                        <MenuRadioItem
                            key={locale}
                            value={locale}
                            closeOnClick
                            {...(Flag && {
                                icon: (
                                    <Flag
                                        className="zse-locale-flag"
                                        aria-hidden
                                    />
                                ),
                            })}
                        >
                            <span lang={locale}>{native}</span>
                            {local.toLocaleLowerCase(value) !==
                                native.toLocaleLowerCase(value) && (
                                <span className="zse-locale-local">
                                    {local}
                                </span>
                            )}
                        </MenuRadioItem>
                    );
                })}
            </MenuRadioGroup>
        </Menu>
    );
}
