import { type ApiRepository } from "~/prisma/model";
import { RepositoryTile } from "~/components/tiles/RepositoryTile";

import { Select, type SelectProps } from "./generic";

const globalOptions = {
  isNullable: false,
  getItemValue: (m: ApiRepository) => m.id,
  getItemLabel: (m: ApiRepository) => m.slug,
  getItemValueLabel: (m: ApiRepository) => m.slug,
} as const;

export interface RepositorySelectProps<O extends { isMulti?: boolean }, E extends ApiRepository>
  extends Omit<SelectProps<E, typeof globalOptions & O>, "options" | "itemRenderer"> {
  readonly options: O;
}

export const RepositorySelect = <O extends { isMulti?: boolean }, E extends ApiRepository>({
  options,
  ...props
}: RepositorySelectProps<O, E>): JSX.Element => (
  <Select<E, typeof options & O>
    {...props}
    options={{ ...globalOptions, ...options }}
    itemRenderer={m => <RepositoryTile repository={m} />}
  />
);
