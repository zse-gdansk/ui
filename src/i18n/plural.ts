import type { PluralForms } from "./types";

const rules = new Map<string, Intl.PluralRules>();

// Forma liczebnika dla języka: „2 pliki”, „5 plików”, „2 files”.
export function plural(locale: string, count: number, forms: PluralForms) {
    let rule = rules.get(locale);
    if (!rule) {
        rule = new Intl.PluralRules(locale);
        rules.set(locale, rule);
    }
    return forms[rule.select(count)] ?? forms.other;
}
