"use client";

import {
    ArrowRight01Icon,
    MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";
import {
    isValidElement,
    useLayoutEffect,
    useRef,
    useState,
    type ReactElement,
    type ReactNode,
} from "react";

import { Icon, type IconGlyph } from "../icon/Icon";
import { Menu, MenuItem } from "../menu/Menu";

export interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: IconGlyph;
}

export interface BreadcrumbsProps {
    // Od najwyższego poziomu; ostatni to bieżąca strona.
    items: readonly BreadcrumbItem[];
    // Link z routera, np. Next: (p) => <NextLink {...p} />.
    renderLink?: (props: {
        href: string;
        className: string;
        children: ReactNode;
    }) => ReactNode;
    className?: string;
}

// Ile elementów ze środka schować, żeby wiersz się zmieścił. Pierwszy
// i bieżący zostają; chowane są od drugiego w stronę bieżącego, więc
// najbliższy rodzic znika ostatni. Gdy i tak brakuje miejsca, znika też
// pierwszy.
// Szerokości elementów zawierają już strzałkę za nimi.
function fit(widths: number[], more: number, available: number) {
    const count = widths.length;
    const total = (visible: number[]) =>
        visible.reduce((sum, i) => sum + (widths[i] ?? 0), 0);
    const all = widths.map((_, i) => i);
    if (total(all) <= available) return { hidden: [] as number[], first: true };

    for (let hide = 1; hide <= count - 2; hide += 1) {
        const hidden = all.slice(1, 1 + hide);
        const visible = all.filter((i) => !hidden.includes(i));
        if (total(visible) + more <= available) return { hidden, first: true };
    }
    return { hidden: all.slice(0, -1), first: false };
}

export function Breadcrumbs({
    items,
    renderLink,
    className,
}: BreadcrumbsProps) {
    const navRef = useRef<HTMLElement>(null);
    const measureRef = useRef<HTMLOListElement>(null);
    const [hidden, setHidden] = useState<number[]>([]);

    // Szerokości z niewidocznej kopii z pełnymi nazwami. Przeliczane, gdy
    // zmienia się miejsce (kontener) albo treść (kopia zmienia szerokość).
    useLayoutEffect(() => {
        const nav = navRef.current;
        const measure = measureRef.current;
        if (!nav || !measure) return;
        const update = () => {
            const crumbs = [
                ...measure.querySelectorAll<HTMLElement>("[data-measure-item]"),
            ];
            const more = measure.querySelector<HTMLElement>(
                "[data-measure-more]",
            );
            const result = fit(
                crumbs.map((crumb) => crumb.offsetWidth),
                more?.offsetWidth ?? 32,
                nav.clientWidth,
            );
            setHidden((previous) =>
                previous.join() === result.hidden.join()
                    ? previous
                    : result.hidden,
            );
        };
        update();
        const observer = new ResizeObserver(update);
        observer.observe(nav);
        observer.observe(measure);
        return () => observer.disconnect();
    }, []);

    const link = (item: BreadcrumbItem, current: boolean) => {
        const content = (
            <>
                {item.icon && (
                    <Icon
                        icon={item.icon}
                        size={15}
                        className="zse-crumb-icon"
                    />
                )}
                <span className="zse-crumb-text">{item.label}</span>
            </>
        );
        if (current || !item.href)
            return (
                <span
                    className="zse-crumb"
                    aria-current={current ? "page" : undefined}
                    title={item.label}
                >
                    {content}
                </span>
            );
        const props = {
            href: item.href,
            className: "zse-crumb",
            children: content,
        };
        return renderLink ? (
            renderLink(props)
        ) : (
            <a {...props} title={item.label} />
        );
    };

    const separator = (
        <Icon
            icon={ArrowRight01Icon}
            size={14}
            className="zse-crumb-separator"
            aria-hidden
        />
    );

    // Link z routera także w menu „…”: element z renderLink (np. NextLink
    // z href) jako render pozycji menu, Base UI dokłada treść i klasy.
    const routerLink = (href: string) => {
        const element = renderLink?.({ href, className: "", children: null });
        return isValidElement(element)
            ? { render: element as ReactElement<Record<string, unknown>> }
            : {};
    };

    const lastIndex = items.length - 1;
    const hiddenItems = hidden
        .map((i) => items[i])
        .filter(Boolean) as BreadcrumbItem[];
    // Przycisk „…” w miejscu pierwszego schowanego.
    const moreAt = hidden[0];

    return (
        <nav
            ref={navRef}
            aria-label="Ścieżka"
            className={["zse-breadcrumbs", className].filter(Boolean).join(" ")}
        >
            <ol className="zse-breadcrumbs-list">
                {items.map((item, index) => {
                    if (index === moreAt)
                        return (
                            <li key="more" className="zse-breadcrumbs-item">
                                <Menu
                                    trigger={
                                        <button
                                            type="button"
                                            className="zse-crumb zse-crumb-more"
                                            aria-label={`Pokaż ${hiddenItems.length} ukryte`}
                                        >
                                            <Icon
                                                icon={MoreHorizontalIcon}
                                                size={16}
                                            />
                                        </button>
                                    }
                                >
                                    {hiddenItems.map((hiddenItem) => (
                                        <MenuItem
                                            key={hiddenItem.label}
                                            {...(hiddenItem.icon && {
                                                icon: hiddenItem.icon,
                                            })}
                                            {...(hiddenItem.href && {
                                                href: hiddenItem.href,
                                            })}
                                            {...(hiddenItem.href &&
                                                renderLink &&
                                                routerLink(hiddenItem.href))}
                                        >
                                            {hiddenItem.label}
                                        </MenuItem>
                                    ))}
                                </Menu>
                                {separator}
                            </li>
                        );
                    if (hidden.includes(index)) return null;
                    return (
                        <li key={item.label} className="zse-breadcrumbs-item">
                            {link(item, index === lastIndex)}
                            {index < lastIndex && separator}
                        </li>
                    );
                })}
            </ol>

            <ol
                ref={measureRef}
                className="zse-breadcrumbs-measure"
                aria-hidden
                inert
            >
                {items.map((item, index) => (
                    <li
                        key={item.label}
                        data-measure-item=""
                        className="zse-breadcrumbs-item"
                    >
                        <span className="zse-crumb">
                            {item.icon && <Icon icon={item.icon} size={15} />}
                            <span>{item.label}</span>
                        </span>
                        {index < lastIndex && separator}
                    </li>
                ))}
                <li data-measure-more="" className="zse-breadcrumbs-item">
                    <span className="zse-crumb zse-crumb-more">
                        <Icon icon={MoreHorizontalIcon} size={16} />
                    </span>
                    {separator}
                </li>
            </ol>
        </nav>
    );
}
