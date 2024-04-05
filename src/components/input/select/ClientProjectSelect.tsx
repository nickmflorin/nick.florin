"use client";
import { type HttpError } from "~/api";
import { useProjects } from "~/hooks";

import { ProjectSelect, type ProjectSelectProps } from "./ProjectSelect";

export interface ClientProjectSelectProps<O extends { isMulti?: boolean }>
  extends Omit<ProjectSelectProps<O>, "data"> {
  readonly onError?: (e: HttpError) => void;
}

export const ClientProjectSelect = <O extends { isMulti?: boolean }>({
  onError,
  ...props
}: ClientProjectSelectProps<O>): JSX.Element => {
  const { data, isLoading, error } = useProjects({ onError, includes: [] });

  return (
    <ProjectSelect
      {...props}
      data={data ?? []}
      isReady={data !== undefined}
      isDisabled={error !== undefined}
      isLoading={isLoading}
    />
  );
};
