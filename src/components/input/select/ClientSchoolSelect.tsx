"use client";
import { useSchools } from "~/hooks";
import { type HttpError } from "~/http";

import { SchoolSelect, type SchoolSelectProps } from "./SchoolSelect";

export interface ClientSchoolSelectProps extends Omit<SchoolSelectProps, "data"> {
  readonly onError?: (e: HttpError) => void;
}

export const ClientSchoolSelect = ({ onError, ...props }: ClientSchoolSelectProps): JSX.Element => {
  const { data, isLoading, error } = useSchools({ onError });

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
