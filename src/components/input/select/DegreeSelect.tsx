import { getDegree, Degrees, type Degree } from "~/prisma/model";

import { Select, type SelectProps } from "./generic";

type O = {
  readonly value: Degree;
  readonly label: string;
  readonly shortLabel: string;
};

const options = {
  isNullable: false,
  getModelValue: (m: O) => m.value,
  getModelLabel: (m: O) => m.label,
  getModelValueLabel: (m: O) => m.shortLabel,
} as const;

export const DegreeSelect = (
  props: Omit<SelectProps<O, typeof options>, "options" | "data">,
): JSX.Element => (
  <Select<O, typeof options>
    {...props}
    options={options}
    data={Object.keys(Degrees).map(
      (key): O => ({
        label: getDegree(key as Degree).label,
        value: key as Degree,
        shortLabel: getDegree(key as Degree).shortLabel,
      }),
    )}
  />
);
