import { forwardRef, type ForwardedRef } from "react";

import { logger } from "~/internal/logger";

import { type ActionVisibility } from "~/actions-v2";
import { type HttpError } from "~/api";

import type { SelectBehaviorType } from "~/components/input/select";
import { useCompanies } from "~/hooks";

import {
  CompanySelect,
  type CompanySelectInstance,
  type CompanySelectProps,
} from "./CompanySelect";

export interface ClientCompanySelectProps<B extends SelectBehaviorType>
  extends Omit<CompanySelectProps<B>, "data"> {
  readonly visibility: ActionVisibility;
  readonly onError?: (e: HttpError) => void;
}

export const ClientCompanySelect = forwardRef(
  <B extends SelectBehaviorType>(
    { visibility, onError, ...props }: ClientCompanySelectProps<B>,
    ref: ForwardedRef<CompanySelectInstance<B>>,
  ): JSX.Element => {
    const { data, isLoading, error } = useCompanies({
      query: { includes: [], visibility },
      onError: e => {
        logger.error(e, "There was an error loading the companies via the API.");
        onError?.(e);
      },
    });

    return (
      <CompanySelect<B>
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
    props: ClientCompanySelectProps<B> & {
      readonly ref?: ForwardedRef<CompanySelectInstance<B>>;
    },
  ): JSX.Element;
};
