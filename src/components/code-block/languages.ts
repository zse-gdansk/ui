import {
    BashIcon,
    CppIcon,
    Css3Icon,
    FileBracesIcon,
    FileCodeIcon,
    FileDiffIcon,
    Html5Icon,
    JavaIcon,
    JavaScriptIcon,
    PhpIcon,
    PythonIcon,
    ReactIcon,
    SqlIcon,
    TypescriptIcon,
    Xml01Icon,
} from "@hugeicons/core-free-icons";

import type { IconGlyph } from "../icon/Icon";

export interface LanguageInfo {
    name: string;
    icon: IconGlyph;
    // Odcień i nasycenie koloru marki; jasność dobiera CSS pod motyw.
    hue: number;
    chroma: number;
    // Żółte marki (JS, JSON) potrzebują jaśniejszego tonu, inaczej wychodzą
    // oliwkowe.
    bright?: boolean;
}

const INFO: Record<string, LanguageInfo> = {
    typescript: {
        name: "TypeScript",
        icon: TypescriptIcon,
        hue: 255,
        chroma: 0.15,
    },
    tsx: { name: "TSX", icon: ReactIcon, hue: 215, chroma: 0.13 },
    javascript: {
        name: "JavaScript",
        icon: JavaScriptIcon,
        hue: 95,
        chroma: 0.17,
        bright: true,
    },
    jsx: { name: "JSX", icon: ReactIcon, hue: 215, chroma: 0.13 },
    python: { name: "Python", icon: PythonIcon, hue: 250, chroma: 0.13 },
    java: { name: "Java", icon: JavaIcon, hue: 45, chroma: 0.16 },
    html: { name: "HTML", icon: Html5Icon, hue: 38, chroma: 0.19 },
    css: { name: "CSS", icon: Css3Icon, hue: 270, chroma: 0.17 },
    postcss: { name: "CSS", icon: Css3Icon, hue: 270, chroma: 0.17 },
    cpp: { name: "C++", icon: CppIcon, hue: 245, chroma: 0.14 },
    c: { name: "C", icon: CppIcon, hue: 245, chroma: 0.1 },
    php: { name: "PHP", icon: PhpIcon, hue: 285, chroma: 0.12 },
    sql: { name: "SQL", icon: SqlIcon, hue: 60, chroma: 0.15 },
    bash: { name: "Bash", icon: BashIcon, hue: 150, chroma: 0.14 },
    json: {
        name: "JSON",
        icon: FileBracesIcon,
        hue: 90,
        chroma: 0.15,
        bright: true,
    },
    xml: { name: "XML", icon: Xml01Icon, hue: 30, chroma: 0.12 },
    diff: { name: "Diff", icon: FileDiffIcon, hue: 300, chroma: 0.12 },
};

const FALLBACK: LanguageInfo = {
    name: "Kod",
    icon: FileCodeIcon,
    hue: 0,
    chroma: 0,
};

const ALIASES: Record<string, string> = {
    ts: "typescript",
    mts: "typescript",
    cts: "typescript",
    js: "javascript",
    mjs: "javascript",
    cjs: "javascript",
    py: "python",
    sh: "bash",
    shell: "bash",
    zsh: "bash",
    htm: "html",
    "c++": "cpp",
    cc: "cpp",
    hpp: "cpp",
    h: "c",
};

export const normalizeLanguage = (language: string) =>
    ALIASES[language.toLowerCase()] ?? language.toLowerCase();

export function languageInfo(language: string | undefined) {
    return language
        ? (INFO[normalizeLanguage(language)] ?? FALLBACK)
        : FALLBACK;
}

// „srednia.py” → „python”, gdy język nie jest podany.
export function languageFromFilename(filename: string | undefined) {
    const extension = filename?.split(".").pop();
    return extension && extension !== filename
        ? normalizeLanguage(extension)
        : undefined;
}
