import { forwardRef, type ForwardedRef } from "react";

import { logger } from "~/internal/logger";

import { type ActionVisibility } from "~/actions-v2";

import type { SelectBehaviorType } from "~/components/input/select";
import { useExperiences, type SWRError } from "~/hooks/api-v2";

import {
  ExperienceSelect,
  type ExperienceSelectInstance,
  type ExperienceSelectProps,
} from "./ExperienceSelect";

export interface ClientExperienceSelectProps<B extends SelectBehaviorType>
  extends Omit<ExperienceSelectProps<B>, "data"> {
  readonly visibility: ActionVisibility;
  readonly onError?: (e: SWRError) => void;
}

export const ClientExperienceSelect = forwardRef(
  <B extends SelectBehaviorType>(
    { visibility, onError, ...props }: ClientExperienceSelectProps<B>,
    ref: ForwardedRef<ExperienceSelectInstance<B>>,
  ): JSX.Element => {
    const { data, isLoading, error } = useExperiences({
      query: { includes: [], visibility },
      onError: e => {
        logger.error(e, "There was an error loading the experiences via the API.");
        onError?.(e);
      },
    });
    return (
      <ExperienceSelect
        {...props}
        ref={ref}
        isReady={data !== undefined && props.isReady !== false}
        data={data ?? []}
        isDisabled={error !== undefined}
        isLocked={isLoading}
        isLoading={isLoading}
      />
    );
  },
) as {
  <B extends SelectBehaviorType>(
    props: ClientExperienceSelectProps<B> & {
      readonly ref?: ForwardedRef<ExperienceSelectInstance<B>>;
    },
  ): JSX.Element;
};
