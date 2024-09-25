import { forwardRef, type ForwardedRef } from "react";

import { logger } from "~/internal/logger";

import { type HttpError } from "~/api";

import type { SelectBehaviorType } from "~/components/input/select";
import { useProjects } from "~/hooks";

import {
  ProjectSelect,
  type ProjectSelectProps,
  type ProjectSelectInstance,
} from "./ProjectSelect";

export interface ClientProjectSelectProps<B extends SelectBehaviorType>
  extends Omit<ProjectSelectProps<B>, "data"> {
  readonly onError?: (e: HttpError) => void;
}

export const ClientProjectSelect = forwardRef(
  <B extends SelectBehaviorType>(
    { onError, ...props }: ClientProjectSelectProps<B>,
    ref: ForwardedRef<ProjectSelectInstance<B>>,
  ): JSX.Element => {
    const { data, isLoading, error } = useProjects({
      query: { includes: [], visibility: "admin" },
      onError: e => {
        logger.error(e, "There was an error loading the projects via the API.");
        onError?.(e);
      },
    });

    return (
      <ProjectSelect<B>
        {...props}
        data={data ?? []}
        ref={ref}
        isReady={data !== undefined && props.isReady !== false}
        isDisabled={error !== undefined || props.isDisabled}
        isLocked={isLoading || props.isLocked}
        isLoading={isLoading || props.isLoading}
      />
    );
  },
) as {
  <B extends SelectBehaviorType>(
    props: ClientProjectSelectProps<B> & {
      readonly ref?: ForwardedRef<ProjectSelectInstance<B>>;
    },
  ): JSX.Element;
};
