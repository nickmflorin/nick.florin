import { type Required } from "utility-types";

import {
  getProgrammingLanguage,
  ProgrammingLanguages,
  type ProgrammingLanguage,
} from "~/prisma/model";

import { Select, type SelectProps, type SelectModel } from "~/components/input/select";

type M = Required<
  Pick<SelectModel<ProgrammingLanguage>, "value" | "label" | "icon">,
  "value" | "label" | "icon"
>;

const globalOptions = {
  isDeselectable: true,
  getModelValue: (m: M) => m.value,
  getModelLabel: (m: M) => m.label,
} as const;

type Opts<O extends { isMulti?: boolean; isClearable?: boolean }> = typeof globalOptions & {
  isMulti: O["isMulti"];
  isClearable: O["isClearable"];
};

export interface ProgrammingLanguageSelectProps<
  O extends { isMulti?: boolean; isClearable?: boolean },
> extends Omit<SelectProps<ProgrammingLanguage, M, Opts<O>>, "options" | "data"> {
  readonly options: O;
}

export const ProgrammingLanguageSelect = <O extends { isMulti?: boolean; isClearable?: boolean }>({
  options,
  ...props
}: ProgrammingLanguageSelectProps<O>): JSX.Element => (
  <Select<ProgrammingLanguage, M, Opts<O>>
    maxHeight={240}
    {...props}
    options={{ ...globalOptions, isMulti: options.isMulti, isClearable: options.isClearable }}
    data={Object.keys(ProgrammingLanguages).map(
      (key): M => ({
        label: getProgrammingLanguage(key as ProgrammingLanguage).label,
        value: key as ProgrammingLanguage,
        icon: getProgrammingLanguage(key as ProgrammingLanguage).icon,
      }),
    )}
  />
);
