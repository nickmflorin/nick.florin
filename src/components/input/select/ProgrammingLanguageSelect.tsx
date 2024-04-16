import {
  getProgrammingLanguage,
  ProgrammingLanguages,
  type ProgrammingLanguage,
} from "~/prisma/model";

import { Select, type SelectProps } from "./generic";

type O = {
  readonly value: ProgrammingLanguage;
  readonly label: string;
};

const options = {
  getModelValue: (m: O) => m.value,
  getModelLabel: (m: O) => m.label,
  isMulti: true,
} as const;

export const ProgrammingLanguageSelect = (
  props: Omit<SelectProps<O, typeof options>, "options" | "data">,
): JSX.Element => (
  <Select<O, typeof options>
    {...props}
    options={options}
    data={Object.keys(ProgrammingLanguages).map(
      (key): O => ({
        label: getProgrammingLanguage(key as ProgrammingLanguage).label,
        value: key as ProgrammingLanguage,
      }),
    )}
  />
);
