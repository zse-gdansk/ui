"use client";

import {
    Copy01Icon,
    Download04Icon,
    PrinterIcon,
    Tick02Icon,
} from "@hugeicons/core-free-icons";
import type { CSSProperties } from "react";

import { useMessages } from "../../i18n/context";
import { useCopy } from "../../utils/use-copy";
import { Button } from "../button/Button";

export interface BackupCodesProps {
    codes: readonly string[];
    // Już wykorzystane: przekreślone i pomijane przy kopiowaniu.
    used?: readonly string[];
    // Pierwsza linia pliku i wydruku, np. nazwa aplikacji i konto.
    fileTitle?: string;
    fileName?: string;
    className?: string;
}

const NO_CODES: readonly string[] = [];

// Kody zapasowe 2FA: numerowana siatka czytana z góry na dół, licznik
// pozostałych i akcje, żeby kody faktycznie gdzieś zapisać.
export function BackupCodes({
    codes,
    used = NO_CODES,
    fileTitle,
    fileName = "kody-zapasowe.txt",
    className,
}: BackupCodesProps) {
    const t = useMessages();
    const [copyState, copy] = useCopy();
    const isUsed = (code: string) => used.includes(code);
    const left = codes.filter((code) => !isUsed(code));
    const number = new Intl.NumberFormat(t.locale);

    const text = () =>
        [
            ...(fileTitle ? [fileTitle, ""] : []),
            ...codes.map(
                (code, index) =>
                    `${String(index + 1).padStart(2, " ")}. ${code}${
                        isUsed(code) ? ` (${t.backupCodes.used})` : ""
                    }`,
            ),
            "",
        ].join("\n");

    // Numerowana lista samych niewykorzystanych, gotowa do wklejenia.
    const copyText = () =>
        left.map((code, index) => `${index + 1}. ${code}`).join("\n");

    function download() {
        const url = URL.createObjectURL(
            new Blob([text()], { type: "text/plain;charset=utf-8" }),
        );
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
    }

    // Drukuje same kody w ukrytej ramce, nie całą stronę.
    function print() {
        const frame = document.createElement("iframe");
        frame.setAttribute("aria-hidden", "true");
        frame.style.cssText = "position:fixed;width:0;height:0;border:0";
        document.body.append(frame);
        const doc = frame.contentDocument;
        const view = frame.contentWindow;
        if (!doc || !view) {
            frame.remove();
            return;
        }
        const pre = doc.createElement("pre");
        pre.textContent = text();
        pre.style.cssText = "font: 14px/1.8 ui-monospace, monospace";
        doc.body.append(pre);
        view.addEventListener("afterprint", () => frame.remove(), {
            once: true,
        });
        view.print();
    }

    return (
        <div className={["zse-backup", className].filter(Boolean).join(" ")}>
            <ol
                className="zse-backup-list"
                style={
                    {
                        "--backup-rows": Math.ceil(codes.length / 2),
                    } as CSSProperties
                }
            >
                {codes.map((code, index) => (
                    <li
                        // Kody mogą się powtarzać (np. zaślepki przed
                        // odsłonięciem), więc kluczem jest miejsce na liście.
                        // oxlint-disable-next-line react/no-array-index-key
                        key={index}
                        className="zse-backup-item"
                        data-used={isUsed(code) || undefined}
                    >
                        <span className="zse-backup-index" aria-hidden>
                            {index + 1}
                        </span>
                        <code className="zse-backup-code">{code}</code>
                        {isUsed(code) && (
                            <span className="zse-backup-sr">
                                {t.backupCodes.used}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
            <div className="zse-backup-footer">
                <span className="zse-backup-left">
                    {t.backupCodes.left(
                        left.length,
                        number.format(left.length),
                        number.format(codes.length),
                    )}
                </span>
                <div className="zse-backup-actions">
                    <Button
                        variant="outline"
                        size="sm"
                        icon={copyState === "copied" ? Tick02Icon : Copy01Icon}
                        onClick={() => void copy(copyText)}
                    >
                        {copyState === "copied"
                            ? t.copy.copied
                            : copyState === "failed"
                              ? t.copy.failed
                              : t.backupCodes.copy}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        icon={Download04Icon}
                        onClick={download}
                    >
                        {t.backupCodes.download}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        icon={PrinterIcon}
                        onClick={print}
                    >
                        {t.backupCodes.print}
                    </Button>
                </div>
            </div>
        </div>
    );
}
