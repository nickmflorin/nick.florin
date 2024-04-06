"use client";
import {
  DatePicker as RootDatePicker,
  type DatePickerProps as RootDatePickerProps,
} from "@mantine/dates";
import { DateTime } from "luxon";

import { toDateTime } from "./util";

export interface DatePickerProps
  extends Omit<RootDatePickerProps<"default">, "onChange" | "value"> {
  readonly value: Date | DateTime | string | null;
  readonly onChange?: (v: DateTime | null) => void;
}

export const DatePicker = (props: DatePickerProps): JSX.Element => (
  <RootDatePicker<"default">
    {...props}
    value={toDateTime(props.value)?.toJSDate()}
    onChange={v => {
      if (v) {
        const dt = DateTime.fromJSDate(v);
        props.onChange?.(dt);
      } else {
        props.onChange?.(null);
      }
    }}
  />
);

export default DatePicker;
