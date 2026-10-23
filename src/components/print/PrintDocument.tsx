"use client";

import { useRef, type ReactNode } from "react";

import { useMessages } from "../../i18n/context";
import { useDomEffect, useResizeObserver } from "../../utils/effects";

export type PrintPageSize = "A4" | "A5" | "letter";

// Szerokość podglądu na ekranie; na papierze rozmiar daje @page.
const PAPER: Record<PrintPageSize, [number, number]> = {
    A4: [210, 297],
    A5: [148, 210],
    letter: [215.9, 279.4],
};

const MARGIN = {
    normal: "18mm 16mm 20mm",
    narrow: "10mm 10mm 14mm",
    wide: "25mm 22mm 25mm",
} as const;

export interface PrintDocumentProps {
    children: ReactNode;
    size?: PrintPageSize;
    orientation?: "portrait" | "landscape";
    // Preset albo własne marginesy CSS, np. "20mm 15mm". Dół musi
    // pomieścić numer strony (co najmniej ~12 mm).
    margin?: keyof typeof MARGIN | (string & {});
    // Nagłówek firmowy na pierwszej stronie. logo: adres obrazka albo
    // element (np. SVG), organization i organizationDetail obok niego.
    logo?: ReactNode;
    organization?: ReactNode;
    organizationDetail?: ReactNode;
    // Po prawej: miejsce i data („Gdańsk, 23 października 2026”) oraz
    // sygnatura („RSU/3/2026”).
    place?: ReactNode;
    reference?: ReactNode;
    // Własny nagłówek firmowy zamiast powyższych.
    letterhead?: ReactNode;
    title?: ReactNode;
    subtitle?: ReactNode;
    // Na każdej stronie, nad i pod treścią (np. tytuł skrócony, poufność).
    runningHeader?: ReactNode;
    runningFooter?: ReactNode;
    // „Strona 2 z 5” w prawym dolnym rogu każdej strony (Chrome, Edge;
    // inne przeglądarki drukują bez numeru).
    pageNumbers?: boolean | "page" | "pageOf";
    // Znak wodny na każdej stronie: true daje „Projekt”.
    watermark?: boolean | string;
    // Akcent dokumentu; domyślnie akcent aplikacji z <html>.
    accent?: string;
    className?: string;
}

// Tekst w content @page: cudzysłowy i ukośniki z tłumaczeń bezpieczne.
const cssString = (text: string) =>
    `"${text.replaceAll("\\", "\\\\").replaceAll('"', '\\"').replaceAll("\n", " ")}"`;

// Strona do druku: na ekranie podgląd kartki, przy druku tylko ona, bez
// reszty aplikacji. Zawsze jasna jak papier, także w ciemnym motywie.
// Nagłówek i stopka powtarzają się na każdej stronie (thead i tfoot
// tabeli, które przeglądarki drukują na każdej stronie).
export function PrintDocument({
    children,
    size = "A4",
    orientation = "portrait",
    margin = "normal",
    logo,
    organization,
    organizationDetail,
    place,
    reference,
    letterhead,
    title,
    subtitle,
    runningHeader,
    runningFooter,
    pageNumbers = "pageOf",
    watermark = false,
    accent,
    className,
}: PrintDocumentProps) {
    const t = useMessages();
    const rootRef = useRef<HTMLElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const [short, long] = PAPER[size];
    const width = orientation === "portrait" ? short : long;
    const margins =
        margin in MARGIN ? MARGIN[margin as keyof typeof MARGIN] : margin;

    // Akcent aplikacji, żeby wyróżnienia w dokumencie miały jej kolor.
    useDomEffect(() => {
        if (accent) return;
        const app = document.documentElement.dataset.accent;
        if (app) rootRef.current?.setAttribute("data-accent", app);
    }, [accent]);

    useResizeObserver([previewRef, rootRef], () => {
        const preview = previewRef.current;
        const paper = rootRef.current;
        if (!preview || !paper) return;
        const scale = Math.min(1, preview.clientWidth / paper.offsetWidth);
        paper.style.scale = scale === 1 ? "" : String(scale);
        preview.style.height =
            scale === 1 ? "" : `${paper.offsetHeight * scale}px`;
    });

    const numbers =
        pageNumbers === false
            ? "none"
            : pageNumbers === "page"
              ? `${cssString(`${t.print.page} `)} counter(page)`
              : `${cssString(`${t.print.page} `)} counter(page) ${cssString(` ${t.print.of} `)} counter(pages)`;
    const page = `@page{size:${size} ${orientation};margin:${margins};@bottom-right{content:${numbers};font:8pt/1 var(--font-sans,sans-serif);color:#6b6b6b;}}`;

    const mark = watermark === true ? t.print.draft : watermark || null;
    const head =
        letterhead ??
        ((logo != null ||
            organization != null ||
            place != null ||
            reference != null) && (
            <header className="zse-print-letterhead">
                {logo != null && (
                    <span className="zse-print-logo">
                        {typeof logo === "string" ? (
                            <img src={logo} alt="" />
                        ) : (
                            logo
                        )}
                    </span>
                )}
                <span className="zse-print-org">
                    {organization != null && (
                        <span className="zse-print-org-name">
                            {organization}
                        </span>
                    )}
                    {organizationDetail != null && (
                        <span className="zse-print-org-detail">
                            {organizationDetail}
                        </span>
                    )}
                </span>
                {(place != null || reference != null) && (
                    <span className="zse-print-place">
                        {place != null && <span>{place}</span>}
                        {reference != null && (
                            <span className="zse-print-reference">
                                {reference}
                            </span>
                        )}
                    </span>
                )}
            </header>
        ));

    return (
        <div ref={previewRef} className="zse-print-preview">
            <article
                ref={rootRef}
                className={["zse-print-document", className]
                    .filter(Boolean)
                    .join(" ")}
                data-theme="light"
                data-accent={accent ?? "blue"}
                style={
                    {
                        "--paper-width": `${width}mm`,
                        "--paper-margin": margins,
                    } as React.CSSProperties
                }
            >
                <style>{page}</style>
                {mark && (
                    <span className="zse-print-watermark" aria-hidden>
                        {mark}
                    </span>
                )}
                <table className="zse-print-frame">
                    {runningHeader != null && (
                        <thead>
                            <tr>
                                <td>
                                    <div className="zse-print-running">
                                        {runningHeader}
                                    </div>
                                </td>
                            </tr>
                        </thead>
                    )}
                    {runningFooter != null && (
                        <tfoot>
                            <tr>
                                <td>
                                    <div className="zse-print-running">
                                        {runningFooter}
                                    </div>
                                </td>
                            </tr>
                        </tfoot>
                    )}
                    <tbody>
                        <tr>
                            <td>
                                {head}
                                {(title != null || subtitle != null) && (
                                    <div className="zse-print-heading">
                                        {title != null && (
                                            <h1 className="zse-print-title">
                                                {title}
                                            </h1>
                                        )}
                                        {subtitle != null && (
                                            <p className="zse-print-subtitle">
                                                {subtitle}
                                            </p>
                                        )}
                                    </div>
                                )}
                                <div className="zse-print-body">{children}</div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </article>
        </div>
    );
}
