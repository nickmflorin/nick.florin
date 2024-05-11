import { type ApiRepository } from "~/prisma/model";
import { RepositoryTile } from "~/components/tiles/RepositoryTile";

import { Select, type SelectProps } from "./generic";

const globalOptions = {
  isNullable: false,
  getModelValue: (m: ApiRepository) => m.id,
  getModelLabel: (m: ApiRepository) => m.slug,
  getModelValueLabel: (m: ApiRepository) => m.slug,
} as const;

type Opts<O extends { isMulti?: boolean }> = typeof globalOptions & { isMulti: O["isMulti"] };

export interface RepositorySelectProps<O extends { isMulti?: boolean }, E extends ApiRepository>
  extends Omit<SelectProps<string, E, Opts<O>>, "options" | "itemRenderer"> {
  readonly options: O;
}

export const RepositorySelect = <O extends { isMulti?: boolean }, E extends ApiRepository>({
  options,
  ...props
}: RepositorySelectProps<O, E>): JSX.Element => (
  <Select<string, E, Opts<O>>
    {...props}
    options={{ ...globalOptions, isMulti: options.isMulti }}
    itemRenderer={m => <RepositoryTile repository={m} className="items-center" />}
  />
);
