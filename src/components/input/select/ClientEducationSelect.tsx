"use client";
import { type ApiEducation } from "~/prisma/model";
import { type HttpError } from "~/api";
import { useEducations } from "~/hooks";

import { EducationSelect, type EducationSelectProps } from "./EducationSelect";

export interface ClientEducationSelectProps
  extends Omit<EducationSelectProps<ApiEducation>, "data"> {
  readonly onError?: (e: HttpError) => void;
}

export const ClientEducationSelect = ({
  onError,
  ...props
}: ClientEducationSelectProps): JSX.Element => {
  const { data, isLoading, error } = useEducations({ onError });

  return (
    <EducationSelect<ApiEducation>
      {...props}
      isReady={data !== undefined}
      data={data ?? []}
      isDisabled={error !== undefined}
      isLoading={isLoading}
    />
  );
};
