import { forwardRef, type ForwardedRef } from "react";

import { logger } from "~/internal/logger";

import type { ActionVisibility } from "~/actions-v2";
import { type ApiError } from "~/api-v2";

import type { SelectBehaviorType } from "~/components/input/select";
import { useRepositories } from "~/hooks/api-v2";

import {
  RepositorySelect,
  type RepositorySelectInstance,
  type RepositorySelectProps,
} from "./RepositorySelect";

export interface ClientRepositorySelectProps<B extends SelectBehaviorType>
  extends Omit<RepositorySelectProps<B>, "data"> {
  readonly visibility: ActionVisibility;
  readonly onError?: (e: ApiError) => void;
}

export const ClientRepositorySelect = forwardRef(
  <B extends SelectBehaviorType>(
    { visibility, onError, ...props }: ClientRepositorySelectProps<B>,
    ref: ForwardedRef<RepositorySelectInstance<B>>,
  ): JSX.Element => {
    const { data, isLoading, error } = useRepositories({
      query: { includes: [], visibility },
      onError: e => {
        logger.error(e, "There was an error loading the repositories via the API.");
        onError?.(e);
      },
    });

    return (
      <RepositorySelect<B>
        {...props}
        ref={ref}
        isReady={data !== undefined && props.isReady !== false}
        data={data ?? []}
        isDisabled={error !== undefined || props.isDisabled}
        isLocked={isLoading || props.isLocked}
        isLoading={isLoading || props.isLoading}
      />
    );
  },
) as {
  <B extends SelectBehaviorType>(
    props: ClientRepositorySelectProps<B> & {
      readonly ref?: ForwardedRef<RepositorySelectInstance<B>>;
    },
  ): JSX.Element;
};
