"use client";

import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import { Field } from "@base-ui/react/field";
import { Fieldset } from "@base-ui/react/fieldset";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import {
    createContext,
    useContext,
    useId,
    useMemo,
    useState,
    type CSSProperties,
    type ReactNode,
} from "react";

import { useMessages } from "../../i18n/context";
import { Avatar } from "../avatar/Avatar";
import { Checkbox } from "../checkbox/Checkbox";
import { FieldFooter } from "../field/FieldFooter";
import { Icon, type IconGlyph } from "../icon/Icon";
import { Radio } from "../radio/Radio";

interface GroupBaseProps {
    label?: ReactNode;
    hint?: ReactNode;
    error?: string | undefined;
    name?: string;
    disabled?: boolean;
    // Najmniejsza szerokość karty; kolumn tyle, ile się zmieści.
    minWidth?: CSSProperties["width"];
    // stack: grafika na górze, np. kandydaci ze zdjęciem.
    layout?: "row" | "stack";
    children: ReactNode;
}

const LayoutContext = createContext<"row" | "stack">("row");

// Limit i zaznaczenie grupy kart z checkboxami: karta ponad limit się
// wyłącza.
const LimitContext = createContext<{
    selected: readonly string[];
    max: number | undefined;
}>({ selected: [], max: undefined });

function gridStyle(minWidth: CSSProperties["width"]) {
    return {
        "--choice-min":
            typeof minWidth === "number" ? `${minWidth}px` : minWidth,
    } as CSSProperties;
}

export interface RadioCardGroupProps extends GroupBaseProps {
    value?: string | null;
    defaultValue?: string | null;
    onValueChange?: (value: string) => void;
}

// Wybór jednej opcji z dużych kart, np. głos w wyborach do samorządu.
export function RadioCardGroup({
    label,
    hint,
    error,
    name,
    disabled = false,
    minWidth = 240,
    layout = "row",
    value,
    defaultValue,
    onValueChange,
    children,
}: RadioCardGroupProps) {
    const labelId = useId();

    return (
        <Field.Root
            className="zse-input zse-check-field"
            disabled={disabled}
            {...(name !== undefined && { name })}
            {...(error && { invalid: true })}
        >
            {label != null && label !== false && (
                <div id={labelId} className="zse-radio-legend">
                    {label}
                </div>
            )}
            <BaseRadioGroup
                className="zse-choice-grid"
                style={gridStyle(minWidth)}
                disabled={disabled}
                {...(label != null &&
                    label !== false && {
                        "aria-labelledby": labelId,
                    })}
                {...(value !== undefined && { value })}
                {...(defaultValue !== undefined && { defaultValue })}
                {...(onValueChange && {
                    onValueChange: (next: unknown) =>
                        onValueChange(String(next)),
                })}
            >
                <LayoutContext value={layout}>{children}</LayoutContext>
            </BaseRadioGroup>
            <FieldFooter error={error} hint={hint} />
        </Field.Root>
    );
}

export interface CheckboxCardGroupProps extends GroupBaseProps {
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (value: string[]) => void;
    // Najwyżej tyle zaznaczeń, np. „wybierz do 3 kandydatów”; licznik pod
    // spodem, reszta kart wyłącza się po osiągnięciu limitu.
    max?: number;
}

const NONE: string[] = [];

export function CheckboxCardGroup({
    label,
    hint,
    error,
    name,
    disabled = false,
    minWidth = 240,
    layout = "row",
    value,
    defaultValue = NONE,
    onValueChange,
    max,
    children,
}: CheckboxCardGroupProps) {
    const t = useMessages();
    const number = new Intl.NumberFormat(t.locale);
    const [inner, setInner] = useState(defaultValue);
    const selected = value ?? inner;
    const limit = useMemo(() => ({ selected, max }), [selected, max]);

    return (
        <Field.Root
            className="zse-input zse-check-field"
            disabled={disabled}
            {...(name !== undefined && { name })}
            {...(error && { invalid: true })}
        >
            <Fieldset.Root
                className="zse-choice-fieldset"
                render={
                    <BaseCheckboxGroup
                        value={selected}
                        disabled={disabled}
                        onValueChange={(next) => {
                            if (value === undefined) setInner(next);
                            onValueChange?.(next);
                        }}
                    />
                }
            >
                {label != null && label !== false && (
                    <Fieldset.Legend className="zse-radio-legend">
                        {label}
                    </Fieldset.Legend>
                )}
                <div className="zse-choice-grid" style={gridStyle(minWidth)}>
                    <LayoutContext value={layout}>
                        <LimitContext value={limit}>{children}</LimitContext>
                    </LayoutContext>
                </div>
                {max !== undefined && (
                    <output className="zse-choice-count" aria-live="polite">
                        {t.choiceCard.count(
                            number.format(selected.length),
                            number.format(max),
                        )}
                    </output>
                )}
            </Fieldset.Root>
            <FieldFooter error={error} hint={hint} />
        </Field.Root>
    );
}

export interface ChoiceCardProps {
    value: string;
    title: ReactNode;
    description?: ReactNode;
    // Wiersz pod opisem, np. klasa kandydata albo znacznik.
    meta?: ReactNode;
    icon?: IconGlyph;
    // Osoba: awatar z imienia albo zdjęcie.
    avatar?: { name: string; src?: string };
    // Zdjęcie na górze karty w układzie stack.
    image?: string;
    disabled?: boolean;
}

// Treść karty wspólna dla wersji radio i checkbox. Kontrolka w rogu, cała
// karta to etykieta, więc klika się każdy jej punkt.
function CardBody({
    control,
    title,
    description,
    meta,
    icon,
    avatar,
    image,
    disabled,
    titleId,
    descriptionId,
}: Omit<ChoiceCardProps, "value"> & {
    control: ReactNode;
    titleId: string;
    descriptionId: string;
}) {
    const layout = useContext(LayoutContext);
    const media = image ? (
        <img className="zse-choice-image" src={image} alt="" />
    ) : avatar ? (
        <Avatar
            name={avatar.name}
            size={layout === "stack" ? "xl" : "lg"}
            {...(avatar.src !== undefined && { src: avatar.src })}
        />
    ) : icon ? (
        <span className="zse-choice-icon">
            <Icon icon={icon} size={20} />
        </span>
    ) : null;

    return (
        // Kontrolka jest w środku etykiety (Base UI: ukryty input).
        // oxlint-disable-next-line jsx-a11y/label-has-associated-control
        <label
            className="zse-choice-card"
            data-layout={layout}
            data-disabled={disabled || undefined}
        >
            {media != null && <span className="zse-choice-media">{media}</span>}
            <span className="zse-choice-text">
                <span className="zse-choice-title" id={titleId}>
                    {title}
                </span>
                {description != null && (
                    <span className="zse-choice-description" id={descriptionId}>
                        {description}
                    </span>
                )}
                {meta != null && (
                    <span className="zse-choice-meta">{meta}</span>
                )}
            </span>
            <span className="zse-choice-control">{control}</span>
        </label>
    );
}

export function RadioCard({
    value,
    disabled = false,
    ...props
}: ChoiceCardProps) {
    const titleId = useId();
    const descriptionId = useId();

    return (
        <CardBody
            {...props}
            disabled={disabled}
            titleId={titleId}
            descriptionId={descriptionId}
            control={
                <Radio
                    value={value}
                    disabled={disabled}
                    aria-labelledby={titleId}
                    {...(props.description != null && {
                        "aria-describedby": descriptionId,
                    })}
                />
            }
        />
    );
}

export function CheckboxCard({
    value,
    disabled = false,
    ...props
}: ChoiceCardProps) {
    const titleId = useId();
    const descriptionId = useId();
    const { selected, max } = useContext(LimitContext);
    // Po osiągnięciu limitu nie da się zaznaczyć kolejnej, odznaczyć tak.
    const blocked =
        max !== undefined &&
        selected.length >= max &&
        !selected.includes(value);

    return (
        <CardBody
            {...props}
            disabled={disabled || blocked}
            titleId={titleId}
            descriptionId={descriptionId}
            control={
                <Checkbox
                    value={value}
                    disabled={disabled || blocked}
                    aria-labelledby={titleId}
                    {...(props.description != null && {
                        "aria-describedby": descriptionId,
                    })}
                />
            }
        />
    );
}
