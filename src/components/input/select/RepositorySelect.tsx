import { type ApiRepository } from "~/prisma/model";

import { RepositoryTile } from "~/features/repositories/components/RepositoryTile";

import { Select, type SelectProps } from "./generic";

const globalOptions = {
  isDeselectable: true,
  getModelValue: (m: ApiRepository) => m.id,
  getModelLabel: (m: ApiRepository) => m.slug,
  getModelValueLabel: (m: ApiRepository) => m.slug,
} as const;

type Opts<O extends { isMulti?: boolean; isClearable?: boolean }> = typeof globalOptions & {
  isMulti: O["isMulti"];
  isClearable: O["isClearable"];
};

export interface RepositorySelectProps<
  O extends { isMulti?: boolean; isClearable?: boolean },
  E extends ApiRepository,
> extends Omit<SelectProps<string, E, Opts<O>>, "options" | "itemRenderer"> {
  readonly options: O;
}

export const RepositorySelect = <
  O extends { isMulti?: boolean; isClearable?: boolean },
  E extends ApiRepository,
>({
  options,
  ...props
}: RepositorySelectProps<O, E>): JSX.Element => (
  <Select<string, E, Opts<O>>
    {...props}
    options={{ ...globalOptions, isMulti: options.isMulti, isClearable: options.isClearable }}
    itemRenderer={m => <RepositoryTile repository={m} className="items-center" />}
  />
);
