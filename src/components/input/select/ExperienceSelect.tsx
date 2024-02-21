import { type Experience, type Company } from "~/prisma/model";
import { Text } from "~/components/typography/Text";

import { Select, type SelectProps } from "./generic";

type Exp = Pick<Experience, "title" | "id"> & {
  readonly company: Pick<Company, "id" | "name">;
};

const options = {
  getItemValue: (m: Exp) => m.id,
  getItemLabel: (m: Exp) => m.title,
  isMulti: true,
} as const;

export const ExperienceSelect = <E extends Exp>(
  props: Omit<SelectProps<E, typeof options>, "options" | "itemRenderer">,
): JSX.Element => (
  <Select<E, typeof options>
    {...props}
    options={options}
    itemRenderer={m => (
      <div className="flex flex-col gap-[4px]">
        <Text size="sm" fontWeight="medium">
          {m.title}
        </Text>
        <Text size="xs" className="text-body-light">
          {m.company.name}
        </Text>
      </div>
    )}
  />
);
