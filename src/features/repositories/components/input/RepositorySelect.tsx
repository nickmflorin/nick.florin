import { forwardRef, type ForwardedRef } from "react";

import { type ApiRepository } from "~/database/model";

import type { SelectBehaviorType, DataSelectInstance } from "~/components/input/select";
import { DataSelect, type DataSelectProps } from "~/components/input/select/DataSelect";
import { RepositoryTile } from "~/features/repositories/components/RepositoryTile";

const getModelValue = (m: ApiRepository) => m.id;

export type RepositorySelectInstance<B extends SelectBehaviorType> = DataSelectInstance<
  ApiRepository,
  { behavior: B; getModelValue: typeof getModelValue }
>;

export interface RepositorySelectProps<B extends SelectBehaviorType>
  extends Omit<
    DataSelectProps<ApiRepository, { behavior: B; getModelValue: typeof getModelValue }>,
    "options" | "itemIsDisabled" | "itemRenderer" | "includeDescriptions" | "getModelValueLabel"
  > {
  readonly behavior: B;
}

export const RepositorySelect = forwardRef(
  <B extends SelectBehaviorType>(
    { behavior, ...props }: RepositorySelectProps<B>,
    ref: ForwardedRef<RepositorySelectInstance<B>>,
  ): JSX.Element => (
    <DataSelect<ApiRepository, { behavior: B; getModelValue: typeof getModelValue }>
      {...props}
      ref={ref}
      options={{ behavior, getModelValue }}
      getModelValueLabel={m => m.slug}
      includeDescriptions={false}
      itemRenderer={m => (
        <RepositoryTile
          repository={m}
          includeNpmLink={false}
          className="items-center gap-[8px]"
          includeLink={false}
          iconSize={22}
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
