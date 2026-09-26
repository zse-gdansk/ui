import type { HighlighterCore, ShikiTransformer } from "shiki/core";

import { lineClasses, wordRanges, type Marks } from "./annotations";

// Shiki w przeglądarce, ładowany dopiero przy pierwszym bloku kodu.
// Silnik regexów w JS zamiast WASM Onigurumy, gramatyki pojedynczo.

const ALIASES: Record<string, string> = {
    ts: "typescript",
    js: "javascript",
    sh: "bash",
    shell: "bash",
    zsh: "bash",
    py: "python",
    yml: "yaml",
    md: "markdown",
    cs: "csharp",
    "c++": "cpp",
    // Zwykła gramatyka CSS prawie nie koloruje liczb i jednostek.
    css: "postcss",
};

let highlighter: Promise<HighlighterCore> | null = null;

function load() {
    highlighter ??= Promise.all([
        import("shiki/core"),
        import("shiki/engine/javascript"),
        import("shiki/themes"),
    ]).then(
        ([
            { createHighlighterCore },
            { createJavaScriptRegexEngine },
            { bundledThemes },
        ]) =>
            createHighlighterCore({
                themes: [
                    bundledThemes["github-light"],
                    bundledThemes["one-dark-pro"],
                ],
                langs: [],
                engine: createJavaScriptRegexEngine(),
            }),
    );
    return highlighter;
}

export async function highlight(code: string, language: string, marks: Marks) {
    const name = ALIASES[language] ?? language;
    const [instance, { bundledLanguages }] = await Promise.all([
        load(),
        import("shiki/langs"),
    ]);
    const grammar = bundledLanguages[name as keyof typeof bundledLanguages];
    if (!grammar) return null;
    if (!instance.getLoadedLanguages().includes(name))
        await instance.loadLanguage(grammar);

    const lineMarks: ShikiTransformer = {
        // Tło maluje blok, nie <pre>.
        pre(node) {
            delete node.properties.style;
            delete node.properties.tabindex;
        },
        line(node, line) {
            for (const kind of lineClasses(line, marks))
                this.addClassToHast(node, kind);
        },
    };

    return instance.codeToHtml(code, {
        lang: name,
        themes: { light: "github-light", dark: "one-dark-pro" },
        defaultColor: false,
        transformers: [lineMarks],
        decorations: wordRanges(code, marks.words).map(([start, end]) => ({
            start,
            end,
            properties: { class: "zse-code-word" },
        })),
    });
}
