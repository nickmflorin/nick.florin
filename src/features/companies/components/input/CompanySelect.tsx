import { forwardRef, type ForwardedRef } from "react";

import { type Company } from "~/database/model";
import { stringifyLocation } from "~/database/model";

import type { SelectBehaviorType, DataSelectInstance } from "~/components/input/select";
import { DataSelect, type DataSelectProps } from "~/components/input/select/DataSelect";
import { Text, Description } from "~/components/typography";

const getModelValue = (m: Company) => m.id;

export type CompanySelectInstance<B extends SelectBehaviorType> = DataSelectInstance<
  Company,
  { behavior: B; getModelValue: typeof getModelValue }
>;

export interface CompanySelectProps<B extends SelectBehaviorType>
  extends Omit<
    DataSelectProps<Company, { behavior: B; getModelValue: typeof getModelValue }>,
    "options" | "itemIsDisabled" | "itemRenderer" | "getModelValueLabel"
  > {
  readonly behavior: B;
  readonly useAbbreviatedLabels?: boolean;
}

export const CompanySelect = forwardRef(
  <B extends SelectBehaviorType>(
    { behavior, useAbbreviatedLabels, includeDescriptions = true, ...props }: CompanySelectProps<B>,
    ref: ForwardedRef<CompanySelectInstance<B>>,
  ): JSX.Element => (
    <DataSelect<Company, { behavior: B; getModelValue: typeof getModelValue }>
      {...props}
      ref={ref}
      options={{ behavior, getModelValue }}
      getModelValueLabel={m => m.shortName ?? m.name}
      includeDescriptions={false}
      itemRenderer={m => (
        <div className="flex flex-col gap-[4px]">
          <Text fontSize="sm" fontWeight="medium">
            {useAbbreviatedLabels ? (m.shortName ?? m.name) : m.name}
          </Text>
          {includeDescriptions && (
            <Description fontSize="xs">
              {stringifyLocation({ city: m.city, state: m.state })}
            </Description>
          )}
        </div>
      )}
    />
  ),
) as {
  <B extends SelectBehaviorType>(
    props: CompanySelectProps<B> & {
      readonly ref?: ForwardedRef<CompanySelectInstance<B>>;
    },
  ): JSX.Element;
};
