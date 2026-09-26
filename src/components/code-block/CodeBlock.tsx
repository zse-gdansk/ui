"use client";

import {
    AlertCircleIcon,
    ArrowDown01Icon,
    Copy01Icon,
    Tick02Icon,
} from "@hugeicons/core-free-icons";
import { useEffect, useState, type CSSProperties } from "react";

import { useMessages } from "../../i18n/context";
import { useCopy } from "../../utils/use-copy";
import { Icon } from "../icon/Icon";
import {
    decorations,
    errorLine,
    lineClasses,
    parseAnnotations,
    type CodeError,
    type Marks,
} from "./annotations";
import { highlight } from "./highlight";
import { languageFromFilename, languageInfo } from "./languages";

export interface CodeBlockProps {
    code: string;
    // ts, tsx, python, bash, sql… Bez języka: zwykły tekst.
    language?: string;
    // HTML z Shiki wyrenderowany na serwerze. Wtedy blok nie ładuje Shiki
    // w przeglądarce. Tylko zaufany HTML, trafia do strony bez zmian.
    html?: string;
    // Nazwa pliku w nagłówku, np. "sortowanie.py".
    filename?: string;
    lineNumbers?: boolean;
    // Numery linii od 1. To samo da się zapisać w kodzie adnotacjami
    // // [!code highlight], // [!code ++] i // [!code --].
    highlight?: readonly number[];
    added?: readonly number[];
    removed?: readonly number[];
    // Słowa zaznaczone w całym bloku, np. zmienna, o której jest mowa.
    // W kodzie: // [!code word:oddane].
    words?: readonly string[];
    // Błędy pod linią, zwykle z kompilatora. W kodzie linią z daszkami:
    // //       ^^^^^^^ komunikat
    errors?: readonly CodeError[];
    // Dłuższy blok zaczyna zwinięty do tylu linii, z przyciskiem rozwinięcia.
    maxLines?: number | false;
    className?: string;
}

const escape = (text: string) =>
    text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");

const NONE: readonly never[] = [];

// Zanim Shiki się załaduje: ten sam układ linii i zaznaczeń bez kolorów,
// więc podmiana na pokolorowany kod niczego nie przesuwa.
function plain(code: string, marks: Marks) {
    const ranges = decorations(code, marks);
    let offset = 0;
    const body = code
        .split("\n")
        .map((line, i) => {
            const start = offset;
            offset += line.length + 1;
            let html = "";
            let cursor = 0;
            for (const { start: from, end: to, className } of ranges) {
                if (from < start || to > start + line.length) continue;
                html += escape(line.slice(cursor, from - start));
                html += `<span class="${className}">${escape(line.slice(from - start, to - start))}</span>`;
                cursor = to - start;
            }
            html += escape(line.slice(cursor));
            const classes = ["line", ...lineClasses(i + 1, marks)].join(" ");
            const messages = marks.errors
                .filter((error) => error.line === i + 1 && error.message)
                .map((error) => {
                    const { className, style } = errorLine(error);
                    return `\n<span class="${className}" style="${style}">${escape(error.message)}</span>`;
                })
                .join("");
            return `<span class="${classes}">${html}</span>${messages}`;
        })
        .join("\n");
    return `<pre class="shiki"><code>${body}</code></pre>`;
}

export function CodeBlock({
    code,
    language: languageProp,
    html,
    filename,
    lineNumbers = false,
    highlight: marked = NONE,
    added = NONE,
    removed = NONE,
    words = NONE,
    errors = NONE,
    maxLines = 16,
    className,
}: CodeBlockProps) {
    const language = languageProp ?? languageFromFilename(filename);
    const info = languageInfo(language);
    const t = useMessages();
    const parsed = parseAnnotations(code.replace(/\n$/, ""));
    const source = parsed.source;
    const marks: Marks = {
        highlight: new Set([...parsed.highlight, ...marked]),
        added: new Set([...parsed.added, ...added]),
        removed: new Set([...parsed.removed, ...removed]),
        words: [...parsed.words, ...words],
        errors: [...parsed.errors, ...errors],
    };
    const marksKey = JSON.stringify([
        [...marks.highlight],
        [...marks.added],
        [...marks.removed],
        marks.words,
        marks.errors,
    ]);
    const [colored, setColored] = useState<string | null>(null);
    const [copyState, copyText] = useCopy();
    const [expanded, setExpanded] = useState(false);

    const lineCount = source.split("\n").length;
    const collapsible = maxLines !== false && lineCount > maxLines + 2;

    useEffect(() => {
        if (html || !language) return;
        let cancelled = false;
        const [lit, plus, minus, picked, faults] = JSON.parse(marksKey) as [
            number[],
            number[],
            number[],
            string[],
            CodeError[],
        ];
        const current: Marks = {
            highlight: new Set(lit),
            added: new Set(plus),
            removed: new Set(minus),
            words: picked,
            errors: faults,
        };
        void highlight(source, language, current).then((result) => {
            if (!cancelled && result) setColored(result);
        });
        return () => {
            cancelled = true;
        };
    }, [source, language, html, marksKey]);

    // Kopiuje stan „po”: bez usuniętych linii diffu.
    const copy = () =>
        copyText(
            source
                .split("\n")
                .filter((_, i) => !marks.removed.has(i + 1))
                .join("\n"),
        );

    const button = (
        <button
            type="button"
            className="zse-code-copy"
            aria-label={
                copyState === "copied"
                    ? t.copy.copied
                    : copyState === "failed"
                      ? t.copy.failed
                      : t.copy.copyCode
            }
            onClick={() => void copy()}
        >
            <span
                className="zse-code-copy-layer"
                data-hidden={copyState !== "idle" || undefined}
            >
                <Icon icon={Copy01Icon} size={14} />
            </span>
            <span
                className="zse-code-copy-layer"
                data-tone="success"
                data-hidden={copyState !== "copied" || undefined}
            >
                <Icon icon={Tick02Icon} size={14} />
            </span>
            <span
                className="zse-code-copy-layer"
                data-tone="danger"
                data-hidden={copyState !== "failed" || undefined}
            >
                <Icon icon={AlertCircleIcon} size={14} />
            </span>
        </button>
    );

    return (
        <div
            className={["zse-code-block", className].filter(Boolean).join(" ")}
            data-line-numbers={lineNumbers || undefined}
            data-collapsed={collapsible && !expanded ? "" : undefined}
            data-single={lineCount === 1 && !filename ? "" : undefined}
            style={
                collapsible
                    ? ({ "--code-max-lines": maxLines } as CSSProperties)
                    : undefined
            }
        >
            {filename ? (
                <div className="zse-code-header">
                    <span className="zse-code-title">
                        <span
                            className="zse-code-lang"
                            title={info.name || t.codeBlock.code}
                            data-bright={info.bright || undefined}
                            style={
                                {
                                    "--lang-hue": info.hue,
                                    "--lang-chroma": info.chroma,
                                } as CSSProperties
                            }
                        >
                            <Icon icon={info.icon} size={15} />
                        </span>
                        <span className="zse-code-filename">{filename}</span>
                    </span>
                    {button}
                </div>
            ) : (
                <div className="zse-code-floating">{button}</div>
            )}

            <div
                className="zse-code-body"
                // Pełny kod jest w DOM także zwinięty, więc wyszukiwanie na
                // stronie i kopiowanie działają.
                // oxlint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                    __html: html ?? colored ?? plain(source, marks),
                }}
            />

            {collapsible && !expanded && (
                <div className="zse-code-more">
                    <button
                        type="button"
                        className="zse-code-more-button"
                        onClick={() => setExpanded(true)}
                    >
                        {t.codeBlock.showAll(lineCount)}
                        <Icon icon={ArrowDown01Icon} size={12} />
                    </button>
                </div>
            )}
        </div>
    );
}
