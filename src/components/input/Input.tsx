"use client";

import { Field } from "@base-ui/react/field";
import {
    AlertCircleIcon,
    ViewIcon,
    ViewOffIcon,
} from "@hugeicons/core-free-icons";
import {
    useState,
    type ComponentProps,
    type KeyboardEvent,
    type ReactNode,
} from "react";

import { useMessages } from "../../i18n/context";
import { FieldFooter } from "../field/FieldFooter";
import { Icon, type IconGlyph } from "../icon/Icon";

type InputSize = "sm" | "md" | "lg";

export interface InputProps extends Omit<
    ComponentProps<typeof Field.Control>,
    "size"
> {
    label?: ReactNode;
    // W wierszu etykiety, po prawej, np. link „Nie pamiętasz hasła?”.
    // Poza <label>: link w etykiecie przechwyciłby klik do pola.
    labelAction?: ReactNode;
    hint?: ReactNode;
    error?: string;
    size?: InputSize;
    leftIcon?: IconGlyph;
    rightIcon?: IconGlyph;
}

export function Input({
    label,
    labelAction,
    hint,
    error,
    size = "md",
    leftIcon,
    rightIcon,
    type = "text",
    disabled = false,
    className,
    onKeyDown,
    onKeyUp,
    onBlur,
    ...props
}: InputProps) {
    const t = useMessages();
    const isPassword = type === "password";
    const [passwordVisible, setPasswordVisible] = useState(false);
    // Włączony Caps Lock to najczęstszy powód „złego hasła”. Stan klawisza
    // znany dopiero przy naciśnięciu, więc odczyt z każdego zdarzenia.
    const [capsLock, setCapsLock] = useState(false);
    const readCaps = (event: KeyboardEvent<HTMLInputElement>) => {
        if (isPassword) setCapsLock(event.getModifierState("CapsLock"));
    };
    const labelNode = label != null && label !== false && (
        <Field.Label className="zse-input-label">{label}</Field.Label>
    );
    const hasLeft = Boolean(leftIcon);
    const hasRight = Boolean(rightIcon) || isPassword;

    return (
        <Field.Root
            className="zse-input"
            data-size={size}
            disabled={disabled}
            {...(error && { invalid: true })}
            {...(props.name !== undefined && { name: props.name })}
        >
            {labelAction != null ? (
                <div className="zse-input-label-row">
                    {labelNode}
                    <span className="zse-input-label-action">
                        {labelAction}
                    </span>
                </div>
            ) : (
                labelNode
            )}

            <div className="zse-input-control">
                {hasLeft && leftIcon && (
                    <span className="zse-input-icon" data-side="left">
                        <Icon icon={leftIcon} />
                    </span>
                )}

                <Field.Control
                    {...props}
                    onKeyDown={(event) => {
                        readCaps(event);
                        onKeyDown?.(event);
                    }}
                    onKeyUp={(event) => {
                        readCaps(event);
                        onKeyUp?.(event);
                    }}
                    onBlur={(event) => {
                        setCapsLock(false);
                        onBlur?.(event);
                    }}
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
                            passwordVisible
                                ? t.input.hidePassword
                                : t.input.showPassword
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

            {/* Region istnieje od początku, żeby czytnik ogłosił zmianę. */}
            {isPassword && (
                <span className="zse-input-caps" aria-live="polite">
                    {capsLock && (
                        <>
                            <Icon icon={AlertCircleIcon} size={14} />
                            {t.input.capsLock}
                        </>
                    )}
                </span>
            )}
            <FieldFooter error={error} hint={hint} />
        </Field.Root>
    );
}
