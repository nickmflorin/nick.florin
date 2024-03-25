"use client";
import { type ApiEducation } from "~/prisma/model";
import { type Visibility } from "~/actions/visibility";
import { type HttpError } from "~/api";
import { useEducations } from "~/hooks";

import { EducationSelect, type EducationSelectProps } from "./EducationSelect";

export interface ClientEducationSelectProps
  extends Omit<EducationSelectProps<ApiEducation>, "data"> {
  readonly visibility?: Visibility;
  readonly onError?: (e: HttpError) => void;
}

export const ClientEducationSelect = ({
  onError,
  visibility = "public",
  ...props
}: ClientEducationSelectProps): JSX.Element => {
  const { data, isLoading, error } = useEducations({ onError, visibility });

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
