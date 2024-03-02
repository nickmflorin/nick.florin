import { getDegree, Degrees, type Degree } from "~/prisma/model";

import { Select, type SelectProps } from "./generic";

type O = {
  readonly value: Degree;
  readonly label: string;
  readonly shortLabel: string;
};

const options = {
  getItemValue: (m: O) => m.value,
  getItemLabel: (m: O) => m.label,
  getItemValueLabel: (m: O) => m.shortLabel,
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
