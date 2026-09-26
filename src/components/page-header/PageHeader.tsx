"use client";

import type { ReactNode } from "react";

import { Skeleton } from "../skeleton/Skeleton";

export interface PageHeaderProps {
    title?: ReactNode;
    description?: ReactNode;
    // Wiersz pod tytułem: breadcrumbs, status, liczby, znaczniki.
    meta?: ReactNode;
    // Przyciski po prawej, na wysokości pierwszej linii tytułu.
    actions?: ReactNode;
    // Szkielety tytułu i opisu w ich wysokości, np. zanim przyjdzie imię
    // ucznia.
    loading?: boolean;
    // h2 dla nagłówka podsekcji.
    as?: "h1" | "h2";
}

// Nagłówek treści strony, pierwszy element w <main>. Breadcrumbs są w pasku,
// tu tytuł, opis i akcje.
export function PageHeader({
    title,
    description,
    meta,
    actions,
    loading = false,
    as: Heading = "h1",
}: PageHeaderProps) {
    return (
        <header className="zse-page-header" aria-busy={loading || undefined}>
            <div className="zse-page-header-grid">
                <Heading className="zse-page-title">
                    {loading ? <Skeleton shape="line" width="14ch" /> : title}
                </Heading>
                {actions != null && (
                    <div className="zse-page-actions">{actions}</div>
                )}
                {(description != null || loading) && (
                    <p className="zse-page-description">
                        {loading ? (
                            <Skeleton shape="line" width="28ch" />
                        ) : (
                            description
                        )}
                    </p>
                )}
                {meta != null && <div className="zse-page-meta">{meta}</div>}
            </div>
        </header>
    );
}
