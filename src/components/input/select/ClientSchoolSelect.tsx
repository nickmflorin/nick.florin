"use client";
import { type HttpError } from "~/api";

import { useSchools } from "~/hooks";

import { SchoolSelect, type SchoolSelectProps } from "./SchoolSelect";

export interface ClientSchoolSelectProps<O extends { isMulti?: boolean; isClearable?: boolean }>
  extends Omit<SchoolSelectProps<O>, "data"> {
  readonly onError?: (e: HttpError) => void;
}

export const ClientSchoolSelect = <O extends { isMulti?: boolean; isClearable?: boolean }>({
  onError,
  ...props
}: ClientSchoolSelectProps<O>): JSX.Element => {
  const { data, isLoading, error } = useSchools({
    onError,
    query: { includes: [], visibility: "admin" },
  });

  return (
    <SchoolSelect
      {...props}
      data={data ?? []}
      isDisabled={error !== undefined}
      isLoading={isLoading}
      isReady={data !== undefined}
    />
  );
};
