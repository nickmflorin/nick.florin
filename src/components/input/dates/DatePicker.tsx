'use client';
import { type JSX } from 'react';

import {
  DatePicker as RootDatePicker,
  type DatePickerProps as RootDatePickerProps,
} from '@mantine/dates';
import { type DateTime } from 'luxon';

import { toDateTime } from './util';

export interface DatePickerProps extends Omit<RootDatePickerProps<'default'>, 'value'> {
  readonly value: Date | DateTime | null | string;
}

export const DatePicker = (props: DatePickerProps): JSX.Element => (
  <RootDatePicker<'default'> {...props} value={toDateTime(props.value)?.toJSDate()} />
);
