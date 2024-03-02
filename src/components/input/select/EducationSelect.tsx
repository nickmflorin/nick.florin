import { type Education, type School } from "~/prisma/model";
import { Text } from "~/components/typography/Text";

import { Select, type SelectProps } from "./generic";

type Edu = Pick<Education, "shortMajor" | "major" | "id"> & {
  readonly school: Pick<School, "id" | "name">;
};

const options = {
  getItemValue: (m: Edu) => m.id,
  getItemLabel: (m: Edu) => m.major,
  getItemValueLabel: (m: Edu) => m.shortMajor ?? m.major,
  isMulti: true,
} as const;

export interface EducationSelectProps<E extends Edu>
  extends Omit<SelectProps<E, typeof options>, "options" | "itemRenderer"> {}

export const EducationSelect = <E extends Edu>(
  props: Omit<SelectProps<E, typeof options>, "options" | "itemRenderer">,
): JSX.Element => (
  <Select<E, typeof options>
    {...props}
    options={options}
    itemRenderer={m => (
      <div className="flex flex-col gap-[4px]">
        <Text size="sm" fontWeight="medium">
          {m.major}
        </Text>
        <Text size="xs" className="text-body-light">
          {m.school.name}
        </Text>
      </div>
    )}
  />
);
