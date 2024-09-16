import { forwardRef, type ForwardedRef } from "react";

import { logger } from "~/internal/logger";

import { type HttpError } from "~/api";
import { type Visibility } from "~/api/query";

import type { SelectBehaviorType } from "~/components/input/select";
import { useEducations } from "~/hooks";

import {
  EducationSelect,
  type EducationSelectInstance,
  type EducationSelectProps,
} from "./EducationSelect";

export interface ClientEducationSelectProps<B extends SelectBehaviorType>
  extends Omit<EducationSelectProps<B>, "data"> {
  readonly visibility: Visibility;
  readonly onError?: (e: HttpError) => void;
}

export const ClientEducationSelect = forwardRef(
  <B extends SelectBehaviorType>(
    { visibility, onError, ...props }: ClientEducationSelectProps<B>,
    ref: ForwardedRef<EducationSelectInstance<B>>,
  ): JSX.Element => {
    const { data, isLoading, error } = useEducations({
      query: { includes: [], visibility },
      onError: e => {
        logger.error(e, "There was an error loading the educations via the API.");
        onError?.(e);
      },
    });

    return (
      <EducationSelect
        {...props}
        ref={ref}
        isReady={data !== undefined}
        data={data ?? []}
        isDisabled={error !== undefined}
        isLocked={isLoading}
        isLoading={isLoading}
      />
    );
  },
) as {
  <B extends SelectBehaviorType>(
    props: ClientEducationSelectProps<B> & {
      readonly ref?: ForwardedRef<EducationSelectInstance<B>>;
    },
  ): JSX.Element;
};
