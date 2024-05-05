import clsx from "clsx";
import { DateTime } from "luxon";

import { withoutOverridingClassName, type ComponentProps } from "~/components/types";
import { type QuantitativeSize } from "~/components/types/sizes";
import { type BaseTypographyProps } from "~/components/types/typography";

import { DateTimeDisplay } from "./DateTimeDisplay";
import { Text } from "./Text";

export interface PartitionedDateTimeDisplayProps extends BaseTypographyProps, ComponentProps {
  readonly date: Date | string;
  readonly gap?: QuantitativeSize<"px">;
  readonly dateFormat?: Intl.DateTimeFormatOptions;
  readonly timeFormat?: Intl.DateTimeFormatOptions;
  readonly dateProps?: BaseTypographyProps & ComponentProps;
  readonly timeProps?: BaseTypographyProps & ComponentProps;
}

export const PartitionedDateTimeDisplay = ({
  date,
  gap = "4px",
  dateFormat = DateTime.DATE_MED,
  timeFormat = DateTime.TIME_SIMPLE,
  className,
  style,
  dateProps,
  timeProps,
  ...props
}: PartitionedDateTimeDisplayProps): JSX.Element => (
  <div className={clsx("flex flex-row items-center", className)} style={{ ...style, gap }}>
    <Text
      fontSize="sm"
      fontWeight="medium"
      {...props}
      {...dateProps}
      className={clsx(
        withoutOverridingClassName("text-gray-800", dateProps?.className),
        dateProps?.className,
      )}
    >
      <DateTimeDisplay date={date} format={dateFormat} />
    </Text>
    <Text
      fontWeight="medium"
      fontSize="sm"
      {...props}
      {...timeProps}
      className={clsx(
        withoutOverridingClassName("text-description", timeProps?.className),
        timeProps?.className,
      )}
    >
      <DateTimeDisplay date={date} format={timeFormat} />
    </Text>
  </div>
);
