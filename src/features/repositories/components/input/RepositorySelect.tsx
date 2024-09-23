import { forwardRef, type ForwardedRef } from "react";

import { type ApiRepository } from "~/database/model";

import type { SelectBehaviorType, DataSelectInstance } from "~/components/input/select";
import { DataSelect, type DataSelectProps } from "~/components/input/select/DataSelect";
import { RepositoryTile } from "~/features/repositories/components/RepositoryTile";

const getItemValue = (m: ApiRepository) => m.id;

export type RepositorySelectInstance<B extends SelectBehaviorType> = DataSelectInstance<
  ApiRepository,
  { behavior: B; getItemValue: typeof getItemValue }
>;

export interface RepositorySelectProps<B extends SelectBehaviorType>
  extends Omit<
    DataSelectProps<ApiRepository, { behavior: B; getItemValue: typeof getItemValue }>,
    "options" | "itemIsDisabled"
  > {
  readonly behavior: B;
}

export const RepositorySelect = forwardRef(
  <B extends SelectBehaviorType>(
    { behavior, ...props }: RepositorySelectProps<B>,
    ref: ForwardedRef<RepositorySelectInstance<B>>,
  ): JSX.Element => (
    <DataSelect<ApiRepository, { behavior: B; getItemValue: typeof getItemValue }>
      {...props}
      ref={ref}
      options={{ behavior, getItemValue }}
      getItemValueLabel={m => m.slug}
      includeDescriptions={false}
      itemRenderer={m => (
        <RepositoryTile
          repository={m}
          className="items-center"
          includeLink={false}
          includeDescription={false}
        />
      )}
    />
  ),
) as {
  <B extends SelectBehaviorType>(
    props: RepositorySelectProps<B> & {
      readonly ref?: ForwardedRef<RepositorySelectInstance<B>>;
    },
  ): JSX.Element;
};
