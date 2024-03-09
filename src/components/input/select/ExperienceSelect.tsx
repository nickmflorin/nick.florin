import { type Experience, type Company } from "~/prisma/model";
import { Text } from "~/components/typography/Text";

import { Select, type SelectProps } from "./generic";

type Exp = Pick<Experience, "title" | "id" | "shortTitle"> & {
  readonly company: Pick<Company, "id" | "name">;
};

const options = {
  getItemValue: (m: Exp) => m.id,
  getItemLabel: (m: Exp) => m.title,
  getItemValueLabel: (m: Exp) => m.shortTitle ?? m.title,
  isMulti: true,
} as const;

export interface ExperienceSelectProps<E extends Exp>
  extends Omit<SelectProps<E, typeof options>, "options" | "itemRenderer"> {
  readonly useAbbreviatedOptionLabels?: boolean;
}

export const ExperienceSelect = <E extends Exp>({
  useAbbreviatedOptionLabels = true,
  ...props
}: ExperienceSelectProps<E>): JSX.Element => (
  <Select<E, typeof options>
    {...props}
    options={options}
    itemRenderer={m => (
      <div className="flex flex-col gap-[4px]">
        <Text size="sm" fontWeight="medium">
          {useAbbreviatedOptionLabels ? m.shortTitle ?? m.title : m.title}
        </Text>
        <Text size="xs" className="text-body-light">
          {m.company.name}
        </Text>
      </div>
    )}
  />
);
