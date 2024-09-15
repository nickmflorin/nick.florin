import { type Company } from "~/prisma/model";
import { stringifyLocation } from "~/prisma/model";

import { Select, type SelectProps } from "~/components/input/select";
import { Text } from "~/components/typography";

const globalOptions = {
  getModelValue: (m: Company) => m.id,
  getModelLabel: (m: Company) => m.name,
  getModelValueLabel: (m: Company) => m.shortName ?? m.name,
} as const;

type Opts<O extends { isMulti?: boolean; isClearable?: boolean }> = typeof globalOptions & {
  isMulti: O["isMulti"];
  isClearable: O["isClearable"];
};

export interface CompanySelectProps<O extends { isMulti?: boolean; isClearable?: boolean }>
  extends Omit<SelectProps<string, Company, Opts<O>>, "options" | "itemRenderer"> {
  readonly useAbbreviatedOptionLabels?: boolean;
  readonly options: O;
}

export const CompanySelect = <O extends { isMulti?: boolean; isClearable?: boolean }>({
  useAbbreviatedOptionLabels = true,
  options,
  ...props
}: CompanySelectProps<O>): JSX.Element => (
  <Select<string, Company, Opts<O>>
    {...props}
    options={{ ...globalOptions, isMulti: options.isMulti, isClearable: options.isClearable }}
    itemRenderer={m => (
      <div className="flex flex-col gap-[4px]">
        <Text fontSize="sm" fontWeight="medium">
          {useAbbreviatedOptionLabels ? (m.shortName ?? m.name) : m.name}
        </Text>
        <Text fontSize="xs" className="text-description">
          {stringifyLocation({ city: m.city, state: m.state })}
        </Text>
      </div>
    )}
  />
);
