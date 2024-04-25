import { type Company } from "~/prisma/model";
import { stringifyLocation } from "~/prisma/model";
import { Text } from "~/components/typography/Text";

import { Select, type SelectProps } from "./generic";

const options = {
  isNullable: false,
  getModelValue: (m: Company) => m.id,
  getModelLabel: (m: Company) => m.name,
  getModelValueLabel: (m: Company) => m.shortName ?? m.name,
} as const;

export interface CompanySelectProps
  extends Omit<SelectProps<Company, typeof options>, "options" | "itemRenderer"> {
  readonly useAbbreviatedOptionLabels?: boolean;
}

export const CompanySelect = ({
  useAbbreviatedOptionLabels = true,
  ...props
}: CompanySelectProps): JSX.Element => (
  <Select<Company, typeof options>
    {...props}
    options={options}
    itemRenderer={m => (
      <div className="flex flex-col gap-[4px]">
        <Text fontSize="sm" fontWeight="medium">
          {useAbbreviatedOptionLabels ? m.shortName ?? m.name : m.name}
        </Text>
        <Text fontSize="xs" className="text-body-light">
          {stringifyLocation({ city: m.city, state: m.state })}
        </Text>
      </div>
    )}
  />
);
