import { type School } from "~/prisma/model";
import { stringifyLocation } from "~/prisma/model";
import { Text } from "~/components/typography/Text";

import { Select, type SelectProps } from "./generic";

const options = {
  isNullable: false,
  getItemValue: (m: School) => m.id,
  getItemLabel: (m: School) => m.name,
  getItemValueLabel: (m: School) => m.shortName ?? m.name,
} as const;

export interface SchoolSelectProps
  extends Omit<SelectProps<School, typeof options>, "options" | "itemRenderer"> {
  readonly useAbbreviatedOptionLabels?: boolean;
}

export const SchoolSelect = ({
  useAbbreviatedOptionLabels,
  ...props
}: SchoolSelectProps): JSX.Element => (
  <Select<School, typeof options>
    {...props}
    options={options}
    itemRenderer={m => (
      <div className="flex flex-col gap-[4px]">
        <Text size="sm" fontWeight="medium">
          {useAbbreviatedOptionLabels ? m.shortName ?? m.name : m.name}
        </Text>
        <Text size="xs" className="text-body-light">
          {stringifyLocation({ city: m.city, state: m.state })}
        </Text>
      </div>
    )}
  />
);
