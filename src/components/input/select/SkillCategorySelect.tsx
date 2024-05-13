import { type SkillCategory, getSkillCategory, SkillCategories } from "~/prisma/model";

import { Select, type SelectProps } from "./generic";

type M = {
  readonly value: SkillCategory;
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

export interface SkillCategorySelectProps<O extends { isMulti?: boolean; isClearable?: boolean }>
  extends Omit<SelectProps<SkillCategory, M, Opts<O>>, "options" | "data"> {
  readonly options: O;
}

export const SkillCategorySelect = <O extends { isMulti?: boolean; isClearable?: boolean }>({
  options,
  ...props
}: SkillCategorySelectProps<O>): JSX.Element => (
  <Select<SkillCategory, M, Opts<O>>
    maxHeight={240}
    {...props}
    options={{ ...globalOptions, isMulti: options.isMulti, isClearable: options.isClearable }}
    data={Object.keys(SkillCategories).map(
      (key): M => ({
        label: getSkillCategory(key as SkillCategory).label,
        value: key as SkillCategory,
      }),
    )}
  />
);
