"use client";
import { type HttpError } from "~/application/errors";
import { useCompanies } from "~/hooks";

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
      isDisabled={error !== undefined}
      isLoading={isLoading}
    />
  );
};
