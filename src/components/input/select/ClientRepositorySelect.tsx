"use client";
import { type ApiRepository } from "~/prisma/model";

import { type HttpError } from "~/api";

import {
  RepositorySelect,
  type RepositorySelectProps,
} from "~/components/input/select/RepositorySelect";
import { useRepositories } from "~/hooks";

export interface ClientRepositorySelectProps<O extends { isMulti?: boolean; isClearable?: boolean }>
  extends Omit<RepositorySelectProps<O, ApiRepository>, "data"> {
  readonly onError?: (e: HttpError) => void;
}

export const ClientRepositorySelect = <O extends { isMulti?: boolean; isClearable?: boolean }>({
  onError,
  ...props
}: ClientRepositorySelectProps<O>): JSX.Element => {
  const { data, isLoading, error } = useRepositories({
    onError,
    query: { includes: [], visibility: "admin" },
  });
  return (
    <RepositorySelect<O, ApiRepository>
      {...props}
      data={data ?? []}
      isReady={data !== undefined}
      isDisabled={error !== undefined}
      isLoading={isLoading}
    />
  );
};
