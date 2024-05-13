import { getProgrammingDomain, ProgrammingDomains, type ProgrammingDomain } from "~/prisma/model";

import { Select, type SelectProps } from "./generic";

type M = {
  readonly value: ProgrammingDomain;
  readonly label: string;
};

const globalOptions = {
  isDeselectable: true,
  getModelValue: (m: M) => m.value,
  getModelLabel: (m: M) => m.label,
} as const;

type Opts<O extends { isMulti?: boolean; isClearable?: boolean }> = typeof globalOptions & {
  isMulti: O["isMulti"];
  isClearable: O["isClearable"];
};

export interface ProgrammingDomainSelectProps<
  O extends { isMulti?: boolean; isClearable?: boolean },
> extends Omit<SelectProps<ProgrammingDomain, M, Opts<O>>, "options" | "data"> {
  readonly options: O;
}

export const ProgrammingDomainSelect = <O extends { isMulti?: boolean; isClearable?: boolean }>({
  options,
  ...props
}: ProgrammingDomainSelectProps<O>): JSX.Element => (
  <Select<ProgrammingDomain, M, Opts<O>>
    {...props}
    options={{ ...globalOptions, isMulti: options.isMulti, isClearable: options.isClearable }}
    data={Object.keys(ProgrammingDomains).map(
      (key): M => ({
        label: getProgrammingDomain(key as ProgrammingDomain).label,
        value: key as ProgrammingDomain,
      }),
    )}
  />
);
