"use client";
import { type ApiExperience } from "~/prisma/model";
import { type HttpError } from "~/api";
import { type Visibility } from "~/api/query";
import { useExperiences } from "~/hooks";

import { ExperienceSelect, type ExperienceSelectProps } from "./ExperienceSelect";

export interface ClientExperienceSelectProps<O extends { isMulti?: boolean; isClearable?: boolean }>
  extends Omit<ExperienceSelectProps<O, ApiExperience>, "data"> {
  readonly visibility: Visibility;
  readonly onError?: (e: HttpError) => void;
}

export const ClientExperienceSelect = <O extends { isMulti?: boolean; isClearable?: boolean }>({
  onError,
  visibility,
  ...props
}: ClientExperienceSelectProps<O>): JSX.Element => {
  const { data, isLoading, error } = useExperiences({
    onError,
    query: { visibility, includes: [] },
  });

  return (
    <ExperienceSelect<O, ApiExperience>
      {...props}
      data={data ?? []}
      isReady={data !== undefined}
      isDisabled={error !== undefined}
      isLoading={isLoading}
    />
  );
};
