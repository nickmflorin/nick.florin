"use client";
import { type HttpError } from "~/application/errors";
import { type ApiEducation } from "~/prisma/model";
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
      data={data ?? []}
      isDisabled={error !== undefined}
      isLoading={isLoading}
    />
  );
};
