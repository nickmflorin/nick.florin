"use client";
import { type ApiEducation } from "~/prisma/model";
import { type HttpError } from "~/api";
import { type Visibility } from "~/api/query";
import { useEducations } from "~/hooks";

import { EducationSelect, type EducationSelectProps } from "./EducationSelect";

export interface ClientEducationSelectProps<O extends { isMulti?: boolean }>
  extends Omit<EducationSelectProps<O, ApiEducation>, "data"> {
  readonly visibility?: Visibility;
  readonly useAbbreviatedOptionLabels?: boolean;
  readonly onError?: (e: HttpError) => void;
}

export const ClientEducationSelect = <O extends { isMulti?: boolean }>({
  onError,
  visibility = "public",
  isReady = true,
  ...props
}: ClientEducationSelectProps<O>): JSX.Element => {
  const { data, isLoading, error } = useEducations({ onError, visibility });

  return (
    <EducationSelect<O, ApiEducation>
      {...props}
      isReady={data !== undefined && isReady}
      data={data ?? []}
      isDisabled={error !== undefined || props.isDisabled}
      isLoading={isLoading || props.isLoading}
    />
  );
};
