import { type School } from "~/prisma/model";
import { stringifyLocation } from "~/prisma/model";

import { Text } from "~/components/typography";

import { Select, type SelectProps } from "./generic";

const globalOptions = {
  getModelValue: (m: School) => m.id,
  getModelLabel: (m: School) => m.name,
  getModelValueLabel: (m: School) => m.shortName ?? m.name,
} as const;

type Opts<O extends { isMulti?: boolean; isClearable?: boolean }> = typeof globalOptions & {
  isMulti: O["isMulti"];
  isClearable: O["isClearable"];
};

export interface SchoolSelectProps<O extends { isMulti?: boolean; isClearable?: boolean }>
  extends Omit<SelectProps<string, School, Opts<O>>, "options" | "itemRenderer"> {
  readonly useAbbreviatedOptionLabels?: boolean;
  readonly options: O;
}

export const SchoolSelect = <O extends { isMulti?: boolean; isClearable?: boolean }>({
  useAbbreviatedOptionLabels,
  options,
  ...props
}: SchoolSelectProps<O>): JSX.Element => (
  <Select<string, School, Opts<O>>
    {...props}
    options={{ ...globalOptions, isClearable: options.isClearable, isMulti: options.isMulti }}
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
