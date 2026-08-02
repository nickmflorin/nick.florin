import { type JSX } from 'react';

import { DateTime, type DateTimeFormatOptions } from 'luxon';

import { logger } from '~/internal/logger';

import {
  classNames,
  type ComponentProps,
  type TypographyCharacteristics,
  type TypographyComponent,
} from '~/components/types';

import { Text, type TextProps } from './Text';

type BaseDateTimeTextProps<C extends TypographyComponent<'text'>> = {
  readonly dateFormat?: never;
  readonly dateProps?: never;
  readonly format?: DateTimeFormatOptions | string;
  readonly formatSeparately?: false;
  readonly strict?: boolean;
  readonly timeFormat?: never;
  readonly timeProps?: never;
} & Omit<TextProps<C>, 'children' | 'ref'>;

type BaseSeparatedDateTimeTextProps = {
  readonly component?: 'div' | 'text';
  readonly dateFormat?: DateTimeFormatOptions | string;
  readonly dateProps?: ComponentProps &
    Omit<TypographyCharacteristics, 'align' | 'lineClamp' | 'truncate'>;
  readonly format?: never;
  readonly formatSeparately: true;
  readonly strict?: boolean;
  readonly timeFormat?: DateTimeFormatOptions | string;
  readonly timeProps?: ComponentProps &
    Omit<TypographyCharacteristics, 'align' | 'lineClamp' | 'truncate'>;
} & ComponentProps &
  TypographyCharacteristics;

type DateTimeProp = Date | DateTime | string;

type DateTimeValueProps<C extends TypographyComponent<'text'>> = {
  readonly children?: never;
  readonly value: DateTimeProp;
} & BaseDateTimeTextProps<C>;

type DateTimeChildrenProps<C extends TypographyComponent<'text'>> = {
  readonly children: string;
  readonly value?: never;
} & BaseDateTimeTextProps<C>;

type DateTimeRenderProps<C extends TypographyComponent<'text'>> = {
  readonly children: (params: { text: string; value: DateTime }) => JSX.Element;
  readonly value: DateTimeProp;
} & BaseDateTimeTextProps<C>;

type SeparatedDateTimeValueProps = {
  readonly children?: never;
  readonly value: DateTimeProp;
} & BaseSeparatedDateTimeTextProps;

type SeparatedDateTimeChildrenProp = {
  readonly children: string;
  readonly value?: never;
} & BaseSeparatedDateTimeTextProps;

export type DateTimeProps<C extends TypographyComponent<'text'>> =
  | DateTimeChildrenProps<C>
  | DateTimeRenderProps<C>
  | DateTimeValueProps<C>
  | SeparatedDateTimeChildrenProp
  | SeparatedDateTimeValueProps;

const parser = <C extends TypographyComponent<'text'>>(
  value: DateTimeProp,
  { strict }: Required<Pick<BaseDateTimeTextProps<C>, 'strict'>>,
): DateTime | null => {
  if (value instanceof DateTime) {
    if (!value.isValid) {
      throw new Error(
        'The provided DateTime object is not valid!  Validity must be checked before providing ' +
          'to the DateTimeText component.',
      );
    }
    return value;
  } else if (value instanceof Date) {
    const dt = DateTime.fromJSDate(value);
    if (!dt.isValid) {
      if (strict) {
        throw new Error(
          `An invalid date, '${String(value)}', was provided to the DateTimeText component.  ` +
            'The component cannot render.',
        );
      }
      logger.warn(
        `An invalid date, '${String(value)}', was provided to the DateTimeText component.  The ` +
          'component cannot render.',
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
          'cannot render.',
      );
    }
    logger.warn(
      `An invalid date, '${value}', was provided to the DateTimeText component.  The component ` +
        'cannot render.',
      { value },
    );
    return null;
  }
  return dt;
};

export const DateTimeText = <C extends TypographyComponent<'text'>>({
  children,
  className,
  component = 'div',
  dateFormat = DateTime.DATE_MED,
  dateProps,
  format = DateTime.DATETIME_MED,
  formatSeparately,
  strict = false,
  style,
  timeFormat = DateTime.TIME_SIMPLE,
  timeProps,
  value,
  ...props
}: DateTimeProps<C>): JSX.Element | null => {
  if (!formatSeparately) {
    if (typeof children === 'function') {
      const obj = parser(value, { strict });
      if (obj) {
        return children({
          text: typeof format === 'string' ? obj.toFormat(format) : obj.toLocaleString(format),
          value: obj,
        });
      }
      return null;
    }
    const obj = parser(value ?? children, { strict });
    if (obj) {
      return (
        <Text {...props} className={className} style={style}>
          {typeof format === 'string' ? obj.toFormat(format) : obj.toLocaleString(format)}
        </Text>
      );
    }
    return null;
  }
  const obj = parser(value ?? children, { strict });
  if (obj) {
    if (component === 'text') {
      return (
        <Text {...props} className={className} lineClamp={1} style={style}>
          <Text
            {...dateProps}
            className={classNames('text-body', dateProps?.className)}
            component='span'
          >
            {typeof dateFormat === 'string'
              ? obj.toFormat(dateFormat)
              : obj.toLocaleString(dateFormat)}
          </Text>{' '}
          <Text
            {...timeProps}
            className={classNames('text-description', timeProps?.className)}
            component='span'
          >
            {typeof timeFormat === 'string'
              ? obj.toFormat(timeFormat)
              : obj.toLocaleString(timeFormat)}
          </Text>
        </Text>
      );
    }
    return (
      <div className={classNames('flex flex-row gap-1', className)} style={style}>
        <Text
          {...props}
          {...dateProps}
          className={classNames('text-body', dateProps?.className)}
          lineClamp={1}
        >
          {typeof dateFormat === 'string'
            ? obj.toFormat(dateFormat)
            : obj.toLocaleString(dateFormat)}
        </Text>
        <Text
          {...props}
          {...timeProps}
          className={classNames('text-description', timeProps?.className)}
          lineClamp={1}
        >
          {typeof timeFormat === 'string'
            ? obj.toFormat(timeFormat)
            : obj.toLocaleString(timeFormat)}
        </Text>
      </div>
    );
  }
  return null;
};
