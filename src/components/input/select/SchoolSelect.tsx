import { type School } from "~/prisma/model";
import { stringifyLocation } from "~/prisma/model";
import { Text } from "~/components/typography/Text";

import { Select, type SelectProps } from "./generic";

const options = {
  isNullable: false,
  getModelValue: (m: School) => m.id,
  getModelLabel: (m: School) => m.name,
  getModelValueLabel: (m: School) => m.shortName ?? m.name,
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
        <Text fontSize="sm" fontWeight="medium">
          {useAbbreviatedOptionLabels ? m.shortName ?? m.name : m.name}
        </Text>
        <Text fontSize="xs" className="text-description">
          {stringifyLocation({ city: m.city, state: m.state })}
        </Text>
      </div>
    )}
  />
);
