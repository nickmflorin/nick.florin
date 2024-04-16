import { getProgrammingDomain, ProgrammingDomains, type ProgrammingDomain } from "~/prisma/model";

import { Select, type SelectProps } from "./generic";

type O = {
  readonly value: ProgrammingDomain;
  readonly label: string;
};

const options = {
  getModelValue: (m: O) => m.value,
  getModelLabel: (m: O) => m.label,
  isMulti: true,
} as const;

export const ProgrammingDomainSelect = (
  props: Omit<SelectProps<O, typeof options>, "options" | "data">,
): JSX.Element => (
  <Select<O, typeof options>
    {...props}
    options={options}
    data={Object.keys(ProgrammingDomains).map(
      (key): O => ({
        label: getProgrammingDomain(key as ProgrammingDomain).label,
        value: key as ProgrammingDomain,
      }),
    )}
  />
);
