"use client";
import { type ApiExperience } from "~/prisma/model";
import { type HttpError } from "~/api";
import { type Visibility } from "~/app/api/types";
import { useExperiences } from "~/hooks";

import { ExperienceSelect, type ExperienceSelectProps } from "./ExperienceSelect";

export interface ClientExperienceSelectProps
  extends Omit<ExperienceSelectProps<ApiExperience>, "data"> {
  readonly visibility?: Visibility;
  readonly onError?: (e: HttpError) => void;
}

export const ClientExperienceSelect = ({
  onError,
  visibility = "public",
  ...props
}: ClientExperienceSelectProps): JSX.Element => {
  const { data, isLoading, error } = useExperiences({ onError, visibility });

  return (
    <ExperienceSelect<ApiExperience>
      {...props}
      data={data ?? []}
      isReady={data !== undefined}
      isDisabled={error !== undefined}
      isLoading={isLoading}
    />
  );
};
