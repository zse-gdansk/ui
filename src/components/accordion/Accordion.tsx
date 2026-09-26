"use client";

import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import type { ReactElement, ReactNode } from "react";

import { Icon, type IconGlyph } from "../icon/Icon";

export interface AccordionItem {
    value: string;
    title: ReactNode;
    content: ReactNode;
    icon?: IconGlyph;
    // Krótki dopisek po prawej, np. liczba punktów albo termin.
    meta?: ReactNode;
    disabled?: boolean;
}

export interface AccordionProps {
    items: readonly AccordionItem[];
    // Kilka otwartych naraz. Domyślnie otwarcie jednego zamyka poprzedni.
    multiple?: boolean;
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (value: string[]) => void;
    // plain: kreski między pozycjami, card: wszystko w jednej ramce,
    // separated: każda pozycja osobną kartą.
    variant?: "plain" | "card" | "separated";
    className?: string;
}

export function Accordion({
    items,
    multiple = false,
    value,
    defaultValue,
    onValueChange,
    variant = "plain",
    className,
}: AccordionProps) {
    return (
        <BaseAccordion.Root
            className={["zse-accordion", className].filter(Boolean).join(" ")}
            data-variant={variant}
            multiple={multiple}
            // Szukanie na stronie (⌘F) otwiera zwinięty panel z trafieniem.
            hiddenUntilFound
            {...(value !== undefined && { value })}
            {...(defaultValue !== undefined && { defaultValue })}
            {...(onValueChange && {
                onValueChange: (next: unknown[]) =>
                    onValueChange(next.map(String)),
            })}
        >
            {items.map((item) => (
                <BaseAccordion.Item
                    key={item.value}
                    value={item.value}
                    disabled={item.disabled ?? false}
                    className="zse-accordion-item"
                >
                    <BaseAccordion.Header className="zse-accordion-header">
                        <BaseAccordion.Trigger className="zse-accordion-trigger">
                            {item.icon && (
                                <Icon
                                    icon={item.icon}
                                    className="zse-accordion-icon"
                                />
                            )}
                            <span className="zse-accordion-title">
                                {item.title}
                            </span>
                            {item.meta != null && (
                                <span className="zse-accordion-meta">
                                    {item.meta}
                                </span>
                            )}
                            <Icon
                                icon={ArrowDown01Icon}
                                className="zse-accordion-chevron"
                            />
                        </BaseAccordion.Trigger>
                    </BaseAccordion.Header>
                    <BaseAccordion.Panel className="zse-accordion-panel">
                        <div className="zse-accordion-content">
                            {item.content}
                        </div>
                    </BaseAccordion.Panel>
                </BaseAccordion.Item>
            ))}
        </BaseAccordion.Root>
    );
}

export interface CollapsibleProps {
    // Tekst wbudowanego wyzwalacza: link ze strzałką, która obraca się po
    // otwarciu, równo z treścią pod spodem.
    label?: ReactNode;
    // Własny element zamiast wbudowanego, np. <Button />.
    trigger?: ReactElement<Record<string, unknown>>;
    children: ReactNode;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    className?: string;
}

// Pojedyncza zwijana sekcja z własnym wyzwalaczem, np. „Pokaż szczegóły”.
export function Collapsible({
    label = "Pokaż szczegóły",
    trigger,
    children,
    open,
    defaultOpen,
    onOpenChange,
    className,
}: CollapsibleProps) {
    return (
        <BaseCollapsible.Root
            className={["zse-collapsible", className].filter(Boolean).join(" ")}
            {...(open !== undefined && { open })}
            {...(defaultOpen !== undefined && { defaultOpen })}
            {...(onOpenChange && {
                onOpenChange: (next: boolean) => onOpenChange(next),
            })}
        >
            {trigger ? (
                <BaseCollapsible.Trigger render={trigger} />
            ) : (
                <BaseCollapsible.Trigger className="zse-collapsible-trigger">
                    {label}
                    <Icon
                        icon={ArrowDown01Icon}
                        size={14}
                        className="zse-accordion-chevron"
                    />
                </BaseCollapsible.Trigger>
            )}
            <BaseCollapsible.Panel
                className="zse-collapsible-panel"
                hiddenUntilFound
            >
                <div className="zse-accordion-content">{children}</div>
            </BaseCollapsible.Panel>
        </BaseCollapsible.Root>
    );
}
