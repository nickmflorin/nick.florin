import { DateTime, type DateTimeFormatOptions } from "luxon";

import { logger } from "~/internal/logger";

import { type ComponentProps, type TypographyCharacteristics } from "~/components/types";
import { classNames } from "~/components/types";

import { Text, type TextComponent, type TextProps } from "./Text";

type BaseDateTimeTextProps<C extends TextComponent> = Omit<TextProps<C>, "children" | "ref"> & {
  readonly format?: DateTimeFormatOptions | string;
  readonly strict?: boolean;
  readonly timeFormat?: never;
  readonly dateFormat?: never;
  readonly formatSeparately?: false;
  readonly dateProps?: never;
  readonly timeProps?: never;
};

type BaseSeparatedDateTimeTextProps = ComponentProps &
  TypographyCharacteristics & {
    readonly component?: "div" | "text";
    readonly dateProps?: Omit<TypographyCharacteristics, "align" | "truncate" | "lineClamp"> &
      ComponentProps;
    readonly timeProps?: Omit<TypographyCharacteristics, "align" | "truncate" | "lineClamp"> &
      ComponentProps;
    readonly format?: never;
    readonly strict?: boolean;
    readonly formatSeparately: true;
    readonly timeFormat?: DateTimeFormatOptions | string;
    readonly dateFormat?: DateTimeFormatOptions | string;
  };

type DateTimeProp = DateTime | string | Date;

type DateTimeValueProps<C extends TextComponent> = BaseDateTimeTextProps<C> & {
  readonly value: DateTimeProp;
  readonly children?: never;
};

type DateTimeChildrenProps<C extends TextComponent> = BaseDateTimeTextProps<C> & {
  readonly children: string;
  readonly value?: never;
};

type DateTimeRenderProps<C extends TextComponent> = BaseDateTimeTextProps<C> & {
  readonly value: DateTimeProp;
  readonly children: (params: { value: DateTime; text: string }) => JSX.Element;
};

type SeparatedDateTimeValueProps = BaseSeparatedDateTimeTextProps & {
  readonly value: DateTimeProp;
  readonly children?: never;
};

type SeparatedDateTimeChildrenProp = BaseSeparatedDateTimeTextProps & {
  readonly children: string;
  readonly value?: never;
};

export type DateTimeProps<C extends TextComponent> =
  | DateTimeChildrenProps<C>
  | DateTimeValueProps<C>
  | DateTimeRenderProps<C>
  | SeparatedDateTimeChildrenProp
  | SeparatedDateTimeValueProps;

const parser = <C extends TextComponent>(
  value: DateTimeProp,
  { strict }: Required<Pick<BaseDateTimeTextProps<C>, "strict">>,
): DateTime | null => {
  if (value instanceof DateTime) {
    if (!value.isValid) {
      throw new Error(
        "The provided DateTime object is not valid!  Validity must be checked before providing " +
          "to the DateTimeText component.",
      );
    }
    return value;
  } else if (value instanceof Date) {
    const dt = DateTime.fromJSDate(value);
    if (!dt.isValid) {
      if (strict) {
        throw new Error(
          `An invalid date, '${value}', was provided to the DateTimeText component.  The component ` +
            "cannot render.",
        );
      }
      logger.warn(
        `An invalid date, '${value}', was provided to the DateTimeText component.  The component ` +
          "cannot render.",
        { value },
      );
      return null;
    }
    return dt;
  }
  const dt = DateTime.fromISO(value);
  if (!dt.isValid) {
    if (strict) {
      throw new Error(
        `An invalid date, '${value}', was provided to the DateTimeText component.  The component ` +
          "cannot render.",
      );
    }
    logger.warn(
      `An invalid date, '${value}', was provided to the DateTimeText component.  The component ` +
        "cannot render.",
      { value },
    );
    return null;
  }
  return dt;
};

export const DateTimeText = <C extends TextComponent>({
  value,
  children,
  format = DateTime.DATETIME_MED,
  dateFormat = DateTime.DATE_MED,
  timeFormat = DateTime.TIME_SIMPLE,
  strict = false,
  formatSeparately,
  className,
  style,
  timeProps,
  dateProps,
  component = "div",
  ...props
}: DateTimeProps<C>): JSX.Element => {
  if (!formatSeparately) {
    if (typeof children === "function") {
      const obj = parser(value, { strict });
      if (obj) {
        return children({
          value: obj,
          text: typeof format === "string" ? obj.toFormat(format) : obj.toLocaleString(format),
        });
      }
      return <></>;
    }
    const obj = parser(value ?? children, { strict });
    if (obj) {
      return (
        <Text {...props} className={className} style={style}>
          {typeof format === "string" ? obj.toFormat(format) : obj.toLocaleString(format)}
        </Text>
      );
    }
    return <></>;
  }
  const obj = parser(value ?? children, { strict });
  if (obj) {
    if (component === "text") {
      return (
        <Text {...props} style={style} className={className} lineClamp={1}>
          <Text
            {...dateProps}
            component="span"
            className={classNames("text-body", dateProps?.className)}
          >
            {typeof dateFormat === "string"
              ? obj.toFormat(dateFormat)
              : obj.toLocaleString(dateFormat)}
          </Text>{" "}
          <Text
            {...timeProps}
            component="span"
            className={classNames("text-description", timeProps?.className)}
          >
            {typeof timeFormat === "string"
              ? obj.toFormat(timeFormat)
              : obj.toLocaleString(timeFormat)}
          </Text>
        </Text>
      );
    }
    return (
      <div style={style} className={classNames("flex flex-row gap-1", className)}>
        <Text
          {...props}
          {...dateProps}
          className={classNames("text-body", dateProps?.className)}
          lineClamp={1}
        >
          {typeof dateFormat === "string"
            ? obj.toFormat(dateFormat)
            : obj.toLocaleString(dateFormat)}
        </Text>
        <Text
          {...props}
          {...timeProps}
          className={classNames("text-description", timeProps?.className)}
          lineClamp={1}
        >
          {typeof timeFormat === "string"
            ? obj.toFormat(timeFormat)
            : obj.toLocaleString(timeFormat)}
        </Text>
      </div>
    );
  }
  return <></>;
};
