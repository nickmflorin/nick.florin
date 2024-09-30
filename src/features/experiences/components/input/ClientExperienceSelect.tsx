import { forwardRef, type ForwardedRef } from "react";

import type { ExperienceIncludes } from "~/database/model";
import { logger } from "~/internal/logger";

import { type ActionVisibility } from "~/actions";
import { type ApiError } from "~/api";

import type { SelectBehaviorType } from "~/components/input/select";
import { useExperiences } from "~/hooks/api";

import {
  ExperienceSelect,
  type ExperienceSelectInstance,
  type ExperienceSelectProps,
} from "./ExperienceSelect";

export interface ClientExperienceSelectProps<
  B extends SelectBehaviorType,
  I extends ExperienceIncludes,
> extends Omit<ExperienceSelectProps<B, I>, "data"> {
  readonly visibility: ActionVisibility;
  readonly includes: I;
  readonly onError?: (e: ApiError) => void;
}

export const ClientExperienceSelect = forwardRef(
  <B extends SelectBehaviorType, I extends ExperienceIncludes>(
    { visibility, onError, includes, ...props }: ClientExperienceSelectProps<B, I>,
    ref: ForwardedRef<ExperienceSelectInstance<B, I>>,
  ): JSX.Element => {
    const { data, isLoading, error } = useExperiences({
      query: { includes, visibility },
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
        isDisabled={error !== undefined || props.isDisabled}
        isLocked={isLoading || props.isLocked}
        isLoading={isLoading || props.isLoading}
      />
    );
  },
) as {
  <B extends SelectBehaviorType, I extends ExperienceIncludes>(
    props: ClientExperienceSelectProps<B, I> & {
      readonly ref?: ForwardedRef<ExperienceSelectInstance<B, I>>;
    },
  ): JSX.Element;
};
