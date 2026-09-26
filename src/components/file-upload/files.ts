import {
    Doc02Icon,
    File01Icon,
    Image01Icon,
    MusicNote01Icon,
    Pdf02Icon,
    SourceCodeIcon,
    Video01Icon,
    Xls01Icon,
    Zip02Icon,
} from "@hugeicons/core-free-icons";

import type { IconGlyph } from "../icon/Icon";

const UNITS = ["byte", "kilobyte", "megabyte", "gigabyte"] as const;

export function formatSize(bytes: number) {
    let value = bytes;
    let unit = 0;
    while (value >= 1024 && unit < UNITS.length - 1) {
        value /= 1024;
        unit += 1;
    }
    return new Intl.NumberFormat("pl-PL", {
        style: "unit",
        unit: UNITS[unit],
        unitDisplay: "short",
        maximumFractionDigits: unit < 2 ? 0 : 1,
    }).format(value);
}

const tokens = (accept: string) =>
    accept
        .split(",")
        .map((token) => token.trim().toLowerCase())
        .filter(Boolean);

export function accepts(file: File, accept: string | undefined) {
    if (!accept) return true;
    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    return tokens(accept).some((token) =>
        token.startsWith(".")
            ? name.endsWith(token)
            : token.endsWith("/*")
              ? type.startsWith(token.slice(0, -1))
              : type === token,
    );
}

const GROUPS: Record<string, string> = {
    "image/*": "obrazy",
    "video/*": "wideo",
    "audio/*": "audio",
    "application/pdf": "PDF",
    "application/zip": "ZIP",
};

export function describeAccept(accept: string) {
    return tokens(accept)
        .map(
            (token) =>
                GROUPS[token] ??
                (token.startsWith(".")
                    ? token.slice(1).toUpperCase()
                    : (token.split("/")[1] ?? token).toUpperCase()),
        )
        .join(", ");
}

// sprawozdanie.final.pdf -> [sprawozdanie.final, .pdf], żeby przy
// ucinaniu długiej nazwy rozszerzenie zostało widoczne.
export function splitName(name: string) {
    const dot = name.lastIndexOf(".");
    return dot > 0 ? [name.slice(0, dot), name.slice(dot)] : [name, ""];
}

const CODE = /\.(js|ts|tsx|jsx|py|java|c|cpp|cs|php|html|css|json|sql|sh)$/i;

export function fileIcon(file: File): IconGlyph {
    const { type, name } = file;
    if (type.startsWith("image/")) return Image01Icon;
    if (type.startsWith("video/")) return Video01Icon;
    if (type.startsWith("audio/")) return MusicNote01Icon;
    if (type === "application/pdf" || /\.pdf$/i.test(name)) return Pdf02Icon;
    if (/\.(zip|rar|7z|tar|gz)$/i.test(name)) return Zip02Icon;
    if (/\.(xlsx?|csv|ods)$/i.test(name)) return Xls01Icon;
    if (/\.(docx?|odt|rtf|txt|md)$/i.test(name)) return Doc02Icon;
    if (CODE.test(name)) return SourceCodeIcon;
    return File01Icon;
}

const PLURAL = new Intl.PluralRules("pl-PL");

// 1 plik, 2 pliki, 5 plików.
export function filesWord(count: number) {
    const form = PLURAL.select(count);
    return form === "one" ? "plik" : form === "few" ? "pliki" : "plików";
}
