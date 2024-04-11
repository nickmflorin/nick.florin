"use client";
import { type HttpError } from "~/api";
import { useSchools } from "~/hooks";

import { SchoolSelect, type SchoolSelectProps } from "./SchoolSelect";

export interface ClientSchoolSelectProps extends Omit<SchoolSelectProps, "data"> {
  readonly onError?: (e: HttpError) => void;
}

export const ClientSchoolSelect = ({ onError, ...props }: ClientSchoolSelectProps): JSX.Element => {
  const { data, isLoading, error } = useSchools({ onError, includes: [], visibility: "admin" });

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
