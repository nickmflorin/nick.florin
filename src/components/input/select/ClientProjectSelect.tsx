"use client";
import { type HttpError } from "~/api";
import { useProjects } from "~/hooks";

import { ProjectSelect, type ProjectSelectProps } from "./ProjectSelect";

export interface ClientProjectSelectProps<O extends { isMulti?: boolean; isClearable?: boolean }>
  extends Omit<ProjectSelectProps<O>, "data"> {
  readonly onError?: (e: HttpError) => void;
}

export const ClientProjectSelect = <O extends { isMulti?: boolean; isClearable?: boolean }>({
  onError,
  ...props
}: ClientProjectSelectProps<O>): JSX.Element => {
  const { data, isLoading, error } = useProjects({
    onError,
    query: { includes: [], visibility: "admin" },
  });

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
