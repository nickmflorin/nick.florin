"use client";
import { type HttpError } from "~/api";
import { useCompanies } from "~/hooks";

import { CompanySelect, type CompanySelectProps } from "./CompanySelect";

export interface ClientCompanySelectProps<O extends { isMulti?: boolean; isClearable?: boolean }>
  extends Omit<CompanySelectProps<O>, "data"> {
  readonly onError?: (e: HttpError) => void;
}

export const ClientCompanySelect = <O extends { isMulti?: boolean; isClearable?: boolean }>({
  onError,
  ...props
}: ClientCompanySelectProps<O>): JSX.Element => {
  const { data, isLoading, error } = useCompanies({
    onError,
    query: { includes: [], visibility: "admin" },
  });

  return (
    <CompanySelect
      {...props}
      data={data ?? []}
      isReady={data !== undefined}
      isDisabled={error !== undefined}
      isLoading={isLoading}
    />
  );
};
