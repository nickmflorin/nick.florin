"use client";
import { type HttpError } from "~/application/errors";
import { type ApiExperience } from "~/prisma/model";
import { useExperiences } from "~/hooks";

import { ExperienceSelect, type ExperienceSelectProps } from "./ExperienceSelect";

export interface ClientExperienceSelectProps
  extends Omit<ExperienceSelectProps<ApiExperience>, "data"> {
  readonly onError?: (e: HttpError) => void;
}

export const ClientExperienceSelect = ({
  onError,
  ...props
}: ClientExperienceSelectProps): JSX.Element => {
  const { data, isLoading, error } = useExperiences({ onError });

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
