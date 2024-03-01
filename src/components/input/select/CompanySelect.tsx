import { type Company } from "~/prisma/model";
import { stringifyLocation } from "~/prisma/model";
import { Text } from "~/components/typography/Text";

import { Select, type SelectProps } from "./generic";

const options = {
  getItemValue: (m: Company) => m.id,
  getItemLabel: (m: Company) => m.name,
} as const;

export interface CompanySelectProps
  extends Omit<SelectProps<Company, typeof options>, "options" | "itemRenderer"> {}

export const CompanySelect = (props: CompanySelectProps): JSX.Element => (
  <Select<Company, typeof options>
    {...props}
    options={options}
    itemRenderer={m => (
      <div className="flex flex-col gap-[4px]">
        <Text size="sm" fontWeight="medium">
          {m.name}
        </Text>
        <Text size="xs" className="text-body-light">
          {stringifyLocation({ city: m.city, state: m.state })}
        </Text>
      </div>
    )}
  />
);
