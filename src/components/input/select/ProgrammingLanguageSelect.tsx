import { type Required } from "utility-types";

import {
  getProgrammingLanguage,
  ProgrammingLanguages,
  type ProgrammingLanguage,
} from "~/prisma/model";

import { Select, type SelectProps, type SelectModel } from "./generic";

type O = Required<
  Pick<SelectModel<ProgrammingLanguage>, "value" | "label" | "icon">,
  "value" | "label" | "icon"
>;

const options = {
  getModelValue: (m: O) => m.value,
  getModelLabel: (m: O) => m.label,
  isMulti: true,
} as const;

export const ProgrammingLanguageSelect = (
  props: Omit<SelectProps<O, typeof options>, "options" | "data">,
): JSX.Element => (
  <Select<O, typeof options>
    maxHeight={240}
    {...props}
    options={options}
    data={Object.keys(ProgrammingLanguages).map(
      (key): O => ({
        label: getProgrammingLanguage(key as ProgrammingLanguage).label,
        value: key as ProgrammingLanguage,
        icon: getProgrammingLanguage(key as ProgrammingLanguage).icon,
      }),
    )}
  />
);
