import { forwardRef, type ForwardedRef } from "react";

import type { EducationIncludes } from "~/database/model";
import { logger } from "~/internal/logger";

import { type ActionVisibility } from "~/actions";
import { type ApiError } from "~/api";

import type { SelectBehaviorType } from "~/components/input/select";
import { useEducations } from "~/hooks/api";

import {
  EducationSelect,
  type EducationSelectInstance,
  type EducationSelectProps,
} from "./EducationSelect";

export interface ClientEducationSelectProps<
  B extends SelectBehaviorType,
  I extends EducationIncludes,
> extends Omit<EducationSelectProps<B, I>, "data"> {
  readonly visibility: ActionVisibility;
  readonly includes: I;
  readonly onError?: (e: ApiError) => void;
}

export const ClientEducationSelect = forwardRef(
  <B extends SelectBehaviorType, I extends EducationIncludes>(
    { visibility, includes, onError, ...props }: ClientEducationSelectProps<B, I>,
    ref: ForwardedRef<EducationSelectInstance<B, I>>,
  ): JSX.Element => {
    const { data, isLoading, error } = useEducations({
      query: { includes, visibility },
      onError: e => {
        logger.error(e, "There was an error loading the educations via the API.");
        onError?.(e);
      },
    });
    return (
      <EducationSelect<B, I>
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
  <B extends SelectBehaviorType, I extends EducationIncludes>(
    props: ClientEducationSelectProps<B, I> & {
      readonly ref?: ForwardedRef<EducationSelectInstance<B, I>>;
    },
  ): JSX.Element;
};
