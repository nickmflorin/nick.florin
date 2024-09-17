import { forwardRef, type ForwardedRef } from "react";

import { logger } from "~/internal/logger";
import { type Company } from "~/prisma/model";
import { stringifyLocation } from "~/prisma/model";

import { type HttpError } from "~/api";

import type { SelectBehaviorType, DataSelectInstance } from "~/components/input/select";
import { DataSelect, type DataSelectProps } from "~/components/input/select/DataSelect";
import { Text, Description } from "~/components/typography";
import { useCompanies } from "~/hooks";

const getItemValue = (m: Company) => m.id;

export interface CompanySelectProps<B extends SelectBehaviorType>
  extends Omit<
    DataSelectProps<Company, { behavior: B; getItemValue: typeof getItemValue }>,
    "options" | "itemIsDisabled" | "data"
  > {
  readonly behavior: B;
  readonly useAbbreviatedOptionLabels?: boolean;
  readonly onError?: (e: HttpError) => void;
}

export const CompanySelect = forwardRef(
  <B extends SelectBehaviorType>(
    { behavior, useAbbreviatedOptionLabels, onError, ...props }: CompanySelectProps<B>,
    ref: ForwardedRef<
      DataSelectInstance<Company, { behavior: B; getItemValue: typeof getItemValue }>
    >,
  ): JSX.Element => {
    const { data, isLoading, error } = useCompanies({
      query: { includes: [], visibility: "admin" },
      onError: e => {
        logger.error(e, "There was an error loading the companies via the API.");
        onError?.(e);
      },
    });

    return (
      <DataSelect<Company, { behavior: B; getItemValue: typeof getItemValue }>
        {...props}
        ref={ref}
        isReady={data !== undefined && props.isReady !== false}
        data={data ?? []}
        isDisabled={error !== undefined}
        isLocked={isLoading}
        isLoading={isLoading}
        options={{ behavior, getItemValue }}
        getItemValueLabel={m => m.shortName ?? m.name}
        itemRenderer={m => (
          <div className="flex flex-col gap-[4px]">
            <Text fontSize="sm" fontWeight="medium">
              {useAbbreviatedOptionLabels ? (m.shortName ?? m.name) : m.name}
            </Text>
            <Description fontSize="xs">
              {stringifyLocation({ city: m.city, state: m.state })}
            </Description>
          </div>
        )}
      />
    );
  },
) as {
  <B extends SelectBehaviorType>(
    props: CompanySelectProps<B> & {
      readonly ref?: ForwardedRef<
        DataSelectInstance<Company, { behavior: B; getItemValue: typeof getItemValue }>
      >;
    },
  ): JSX.Element;
};
