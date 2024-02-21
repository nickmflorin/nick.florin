import { type SkillCategory, getSkillCategory, SkillCategories } from "~/prisma/model";

import { Select, type SelectProps } from "./generic";

type O = {
  readonly value: SkillCategory;
  readonly label: string;
};

const options = {
  getItemValue: (m: O) => m.value,
  getItemLabel: (m: O) => m.label,
  isMulti: true,
} as const;

export const SkillCategorySelect = (
  props: Omit<SelectProps<O, typeof options>, "options" | "data">,
): JSX.Element => (
  <Select<O, typeof options>
    {...props}
    options={options}
    data={Object.keys(SkillCategories).map(
      (key): O => ({
        label: getSkillCategory(key as SkillCategory).label,
        value: key as SkillCategory,
      }),
    )}
  />
);
