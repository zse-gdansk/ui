"use client";

import { UnfoldMoreIcon } from "@hugeicons/core-free-icons";
import type { ReactNode } from "react";

import { useMessages } from "../../i18n/context";
import { Avatar } from "../avatar/Avatar";
import { Icon } from "../icon/Icon";
import { Menu } from "../menu/Menu";
import { useSidebarPlacement } from "../sidebar/Sidebar";
import { Skeleton } from "../skeleton/Skeleton";

export interface UserMenuProps {
    name: string;
    // Druga linia: rola albo e-mail, np. „Nauczycielka matematyki”.
    description?: ReactNode;
    // Zdjęcie; bez niego awatar z imienia.
    avatar?: string;
    // Stały seed awatara, np. id, żeby zmiana nazwiska go nie zmieniała.
    seed?: string;
    // Pozycje menu: MenuItem, MenuSub, MenuSeparator…
    children: ReactNode;
    // Szkielet w wymiarach wiersza, zanim przyjdą dane konta.
    loading?: boolean;
}

// Konto zalogowanej osoby z menu (ustawienia, motyw, wylogowanie). W stopce
// Sidebar to wiersz z awatarem, imieniem i rolą, po zwinięciu panelu sam
// awatar w kolumnie ikon. Poza panelem okrągły przycisk z awatarem.
export function UserMenu({
    name,
    description,
    avatar,
    seed,
    children,
    loading = false,
}: UserMenuProps) {
    const t = useMessages();
    const { inSidebar, rail } = useSidebarPlacement();
    const variant = inSidebar ? "row" : "compact";

    if (loading)
        return (
            <div className="zse-user" data-variant={variant} aria-busy>
                <Skeleton shape="circle" width={24} />
                {inSidebar && (
                    <span className="zse-user-text">
                        <Skeleton shape="line" width="10ch" />
                    </span>
                )}
            </div>
        );

    return (
        <Menu
            side={rail ? "right" : inSidebar ? "top" : "bottom"}
            align={inSidebar && rail ? "end" : inSidebar ? "start" : "end"}
            trigger={
                <button
                    type="button"
                    className="zse-user"
                    data-variant={variant}
                    aria-label={t.userMenu.label(name)}
                >
                    <Avatar
                        name={name}
                        size="sm"
                        {...(avatar !== undefined && { src: avatar })}
                        {...(seed !== undefined && { seed })}
                    />
                    {inSidebar && (
                        <>
                            <span className="zse-user-text">
                                <span className="zse-user-name">{name}</span>
                                {description != null && (
                                    <span className="zse-user-description">
                                        {description}
                                    </span>
                                )}
                            </span>
                            <Icon
                                icon={UnfoldMoreIcon}
                                size={16}
                                className="zse-user-chevron"
                            />
                        </>
                    )}
                </button>
            }
        >
            {(rail || !inSidebar) && (
                <div className="zse-user-head">
                    <span className="zse-user-name">{name}</span>
                    {description != null && (
                        <span className="zse-user-description">
                            {description}
                        </span>
                    )}
                </div>
            )}
            {children}
        </Menu>
    );
}
