import { forwardRef, type ForwardedRef } from "react";

import { type School, stringifyLocation } from "~/database/model";

import type { SelectBehaviorType, DataSelectInstance } from "~/components/input/select";
import { DataSelect, type DataSelectProps } from "~/components/input/select/DataSelect";
import { Text, Description } from "~/components/typography";

const getItemValue = (m: School) => m.id;

export type SchoolSelectInstance<B extends SelectBehaviorType> = DataSelectInstance<
  School,
  { behavior: B; getItemValue: typeof getItemValue }
>;

export interface SchoolSelectProps<B extends SelectBehaviorType>
  extends Omit<
    DataSelectProps<School, { behavior: B; getItemValue: typeof getItemValue }>,
    "options" | "itemIsDisabled" | "itemRenderer" | "getItemValueLabel"
  > {
  readonly behavior: B;
  readonly useAbbreviatedLabels?: boolean;
}

export const SchoolSelect = forwardRef(
  <B extends SelectBehaviorType>(
    { behavior, useAbbreviatedLabels, ...props }: SchoolSelectProps<B>,
    ref: ForwardedRef<SchoolSelectInstance<B>>,
  ): JSX.Element => (
    <DataSelect<School, { behavior: B; getItemValue: typeof getItemValue }>
      {...props}
      ref={ref}
      options={{ behavior, getItemValue }}
      getItemValueLabel={m => m.shortName ?? m.name}
      itemRenderer={m => (
        <div className="flex flex-col gap-[4px]">
          <Text fontSize="sm" fontWeight="medium">
            {useAbbreviatedLabels ? (m.shortName ?? m.name) : m.name}
          </Text>
          <Description fontSize="xs">
            {stringifyLocation({ city: m.city, state: m.state })}
          </Description>
        </div>
      )}
    />
  ),
) as {
  <B extends SelectBehaviorType>(
    props: SchoolSelectProps<B> & {
      readonly ref?: ForwardedRef<SchoolSelectInstance<B>>;
    },
  ): JSX.Element;
};
