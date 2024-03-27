"use client";
import { useCompanies } from "~/hooks";
import { type HttpError } from "~/http";

import { CompanySelect, type CompanySelectProps } from "./CompanySelect";

export interface ClientCompanySelectProps extends Omit<CompanySelectProps, "data"> {
  readonly onError?: (e: HttpError) => void;
}

export const ClientCompanySelect = ({
  onError,
  ...props
}: ClientCompanySelectProps): JSX.Element => {
  const { data, isLoading, error } = useCompanies({ onError });

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
