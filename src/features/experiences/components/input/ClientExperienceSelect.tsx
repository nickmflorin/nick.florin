import { forwardRef, type ForwardedRef } from "react";

import { logger } from "~/internal/logger";

import { type HttpError } from "~/api";
import { type Visibility } from "~/api/query";

import type { SelectBehaviorType } from "~/components/input/select";
import { useExperiences } from "~/hooks";

import {
  ExperienceSelect,
  type ExperienceSelectInstance,
  type ExperienceSelectProps,
} from "./ExperienceSelect";

export interface ClientExperienceSelectProps<B extends SelectBehaviorType>
  extends Omit<ExperienceSelectProps<B>, "data"> {
  readonly visibility: Visibility;
  readonly onError?: (e: HttpError) => void;
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
