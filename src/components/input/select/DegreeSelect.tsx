import { getDegree, Degrees, type Degree } from "~/prisma/model";

import { Select, type SelectProps } from "./generic";

type M = {
  readonly value: Degree;
  readonly label: string;
  readonly shortLabel: string;
};

const globalOptions = {
  isNullable: false,
  getModelValue: (m: M) => m.value,
  getModelLabel: (m: M) => m.label,
  getModelValueLabel: (m: M) => m.shortLabel,
} as const;

type Opts<O extends { isMulti?: boolean; isClearable?: boolean }> = typeof globalOptions & {
  isMulti: O["isMulti"];
  isClearable: O["isClearable"];
};

export interface DegreeSelectProps<O extends { isMulti?: boolean; isClearable?: boolean }>
  extends Omit<SelectProps<Degree, M, Opts<O>>, "options" | "data"> {
  readonly options: O;
}

export const DegreeSelect = <O extends { isMulti?: boolean; isClearable?: boolean }>({
  options,
  ...props
}: DegreeSelectProps<O>): JSX.Element => (
  <Select<Degree, M, Opts<O>>
    {...props}
    options={{ ...globalOptions, isMulti: options.isMulti, isClearable: options.isClearable }}
    data={Object.keys(Degrees).map(
      (key): M => ({
        label: getDegree(key as Degree).label,
        value: key as Degree,
        shortLabel: getDegree(key as Degree).shortLabel,
      }),
    )}
  />
);
