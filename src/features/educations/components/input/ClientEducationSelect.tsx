import { forwardRef, type ForwardedRef } from "react";

import { logger } from "~/internal/logger";

import { type ActionVisibility } from "~/actions-v2";

import type { SelectBehaviorType } from "~/components/input/select";
import type { SWRError } from "~/hooks/api-v2";
import { useEducations } from "~/hooks/api-v2";

import {
  EducationSelect,
  type EducationSelectInstance,
  type EducationSelectProps,
} from "./EducationSelect";

export interface ClientEducationSelectProps<B extends SelectBehaviorType>
  extends Omit<EducationSelectProps<B>, "data"> {
  readonly visibility: ActionVisibility;
  readonly onError?: (e: SWRError) => void;
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
    props: ClientEducationSelectProps<B> & {
      readonly ref?: ForwardedRef<EducationSelectInstance<B>>;
    },
  ): JSX.Element;
};
