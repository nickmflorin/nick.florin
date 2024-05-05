import { type Experience, type Company } from "~/prisma/model";
import { Text } from "~/components/typography/Text";

import { Select, type SelectProps } from "./generic";

type Exp = Pick<Experience, "title" | "id" | "shortTitle"> & {
  readonly company: Pick<Company, "id" | "name">;
};

const options = {
  getModelValue: (m: Exp) => m.id,
  getModelLabel: (m: Exp) => m.title,
  getModelValueLabel: (m: Exp) => m.shortTitle ?? m.title,
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
        <Text fontSize="sm" fontWeight="medium">
          {useAbbreviatedOptionLabels ? m.shortTitle ?? m.title : m.title}
        </Text>
        <Text fontSize="xs" className="text-description">
          {m.company.name}
        </Text>
      </div>
    )}
  />
);
