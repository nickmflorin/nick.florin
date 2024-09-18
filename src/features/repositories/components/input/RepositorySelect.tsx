import { forwardRef, type ForwardedRef } from "react";

import { type ApiRepository } from "~/database/model";
import { logger } from "~/internal/logger";

import { type HttpError } from "~/api";

import type { SelectBehaviorType, DataSelectInstance } from "~/components/input/select";
import { DataSelect, type DataSelectProps } from "~/components/input/select/DataSelect";
import { RepositoryTile } from "~/features/repositories/components/RepositoryTile";
import { useRepositories } from "~/hooks";

const getItemValue = (m: ApiRepository) => m.id;

export interface RepositorySelectProps<B extends SelectBehaviorType>
  extends Omit<
    DataSelectProps<ApiRepository, { behavior: B; getItemValue: typeof getItemValue }>,
    "options" | "itemIsDisabled" | "data"
  > {
  readonly behavior: B;
  readonly onError?: (e: HttpError) => void;
}

export const RepositorySelect = forwardRef(
  <B extends SelectBehaviorType>(
    { behavior, onError, ...props }: RepositorySelectProps<B>,
    ref: ForwardedRef<
      DataSelectInstance<ApiRepository, { behavior: B; getItemValue: typeof getItemValue }>
    >,
  ): JSX.Element => {
    const { data, isLoading, error } = useRepositories({
      query: { includes: [], visibility: "admin" },
      onError: e => {
        logger.error(e, "There was an error loading the repositories via the API.");
        onError?.(e);
      },
    });

    return (
      <DataSelect<ApiRepository, { behavior: B; getItemValue: typeof getItemValue }>
        {...props}
        ref={ref}
        isReady={data !== undefined}
        data={data ?? []}
        isDisabled={error !== undefined}
        isLocked={isLoading}
        isLoading={isLoading}
        options={{ behavior, getItemValue }}
        getItemValueLabel={m => m.slug}
        itemRenderer={m => <RepositoryTile repository={m} className="items-center" />}
      />
    );
  },
) as {
  <B extends SelectBehaviorType>(
    props: RepositorySelectProps<B> & {
      readonly ref?: ForwardedRef<
        DataSelectInstance<ApiRepository, { behavior: B; getItemValue: typeof getItemValue }>
      >;
    },
  ): JSX.Element;
};
