"use client";

import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import type { ComponentProps, ReactNode } from "react";

import { Icon, type IconGlyph } from "../icon/Icon";

export interface TabsItem {
    value: string;
    label: ReactNode;
    icon?: IconGlyph;
    disabled?: boolean;
    content: ReactNode;
}

export interface TabsProps {
    items: readonly TabsItem[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    className?: ComponentProps<typeof BaseTabs.Root>["className"];
}

export function Tabs({
    items,
    value,
    defaultValue,
    onValueChange,
    className,
}: TabsProps) {
    const initial =
        defaultValue ?? items.find((item) => item.disabled !== true)?.value;

    return (
        <BaseTabs.Root
            {...(value !== undefined ? { value } : {})}
            {...(value === undefined && initial !== undefined
                ? { defaultValue: initial }
                : {})}
            {...(onValueChange !== undefined
                ? {
                      onValueChange: (next: string | null) => {
                          if (typeof next === "string") onValueChange(next);
                      },
                  }
                : {})}
            className={(state) =>
                [
                    "zse-tabs",
                    typeof className === "function"
                        ? className(state)
                        : className,
                ]
                    .filter(Boolean)
                    .join(" ")
            }
        >
            <BaseTabs.List className="zse-tabs-list">
                {items.map((item) => (
                    <BaseTabs.Tab
                        key={item.value}
                        value={item.value}
                        disabled={item.disabled}
                        className="zse-tabs-tab"
                    >
                        {item.icon !== undefined && <Icon icon={item.icon} />}
                        {item.label}
                    </BaseTabs.Tab>
                ))}
                <BaseTabs.Indicator className="zse-tabs-indicator" />
            </BaseTabs.List>
            <div className="zse-tabs-panels">
                {items.map((item) => (
                    <BaseTabs.Panel
                        key={item.value}
                        value={item.value}
                        keepMounted
                        className="zse-tabs-panel"
                    >
                        {item.content}
                    </BaseTabs.Panel>
                ))}
            </div>
        </BaseTabs.Root>
    );
}
