import { forwardRef, type ForwardedRef } from "react";

import { logger } from "~/internal/logger";

import type { ActionVisibility } from "~/actions-v2";
import { type HttpError } from "~/api";

import type { SelectBehaviorType } from "~/components/input/select";
import { useSchools } from "~/hooks";

import { SchoolSelect, type SchoolSelectProps, type SchoolSelectInstance } from "./SchoolSelect";

export interface ClientSchoolSelectProps<B extends SelectBehaviorType>
  extends Omit<SchoolSelectProps<B>, "data"> {
  readonly visibility: ActionVisibility;
  readonly onError?: (e: HttpError) => void;
}

export const ClientSchoolSelect = forwardRef(
  <B extends SelectBehaviorType>(
    { visibility, onError, ...props }: ClientSchoolSelectProps<B>,
    ref: ForwardedRef<SchoolSelectInstance<B>>,
  ): JSX.Element => {
    const { data, isLoading, error } = useSchools({
      query: { includes: [], visibility },
      onError: e => {
        logger.error(e, "There was an error loading the schools via the API.");
        onError?.(e);
      },
    });

    return (
      <SchoolSelect<B>
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
    props: ClientSchoolSelectProps<B> & {
      readonly ref?: ForwardedRef<SchoolSelectInstance<B>>;
    },
  ): JSX.Element;
};
