"use client";

import { Field } from "@base-ui/react/field";
import { ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons";
import { useState, type ComponentProps, type ReactNode } from "react";

import { Icon, type IconGlyph } from "../icon/Icon";

type InputSize = "sm" | "md" | "lg";

export interface InputProps extends Omit<
    ComponentProps<typeof Field.Control>,
    "size"
> {
    label?: ReactNode;
    hint?: ReactNode;
    error?: string;
    size?: InputSize;
    leftIcon?: IconGlyph;
    rightIcon?: IconGlyph;
}

export function Input({
    label,
    hint,
    error,
    size = "md",
    leftIcon,
    rightIcon,
    type = "text",
    disabled = false,
    className,
    ...props
}: InputProps) {
    const isPassword = type === "password";
    const [passwordVisible, setPasswordVisible] = useState(false);
    const hasLeft = Boolean(leftIcon);
    const hasRight = Boolean(rightIcon) || isPassword;

    return (
        <Field.Root
            className="zse-input"
            data-size={size}
            disabled={disabled}
            invalid={Boolean(error)}
        >
            {label != null && label !== false && (
                <Field.Label className="zse-input-label">{label}</Field.Label>
            )}

            <div className="zse-input-control">
                {hasLeft && leftIcon && (
                    <span className="zse-input-icon" data-side="left">
                        <Icon icon={leftIcon} />
                    </span>
                )}

                <Field.Control
                    {...props}
                    type={isPassword && passwordVisible ? "text" : type}
                    disabled={disabled}
                    data-has-left={hasLeft || undefined}
                    data-has-right={hasRight || undefined}
                    className={(state) =>
                        [
                            "zse-input-field",
                            typeof className === "function"
                                ? className(state)
                                : className,
                        ]
                            .filter(Boolean)
                            .join(" ")
                    }
                />

                {isPassword ? (
                    <button
                        type="button"
                        className="zse-input-toggle"
                        disabled={disabled}
                        aria-label={
                            passwordVisible ? "Ukryj hasło" : "Pokaż hasło"
                        }
                        aria-pressed={passwordVisible}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() =>
                            setPasswordVisible((visible) => !visible)
                        }
                    >
                        <span className="zse-input-toggle-icon">
                            <span
                                className="zse-input-toggle-layer"
                                data-hidden={passwordVisible || undefined}
                            >
                                <Icon icon={ViewIcon} />
                            </span>
                            <span
                                className="zse-input-toggle-layer"
                                data-hidden={!passwordVisible || undefined}
                            >
                                <Icon icon={ViewOffIcon} />
                            </span>
                        </span>
                    </button>
                ) : (
                    rightIcon && (
                        <span className="zse-input-icon" data-side="right">
                            <Icon icon={rightIcon} />
                        </span>
                    )
                )}
            </div>

            {error ? (
                <Field.Error className="zse-input-hint" match>
                    {error}
                </Field.Error>
            ) : (
                hint != null &&
                hint !== false && (
                    <Field.Description className="zse-input-hint">
                        {hint}
                    </Field.Description>
                )
            )}
        </Field.Root>
    );
}
