import { type ApiEducation } from "~/prisma/model";
import type { MenuOptions } from "~/components/menus";
import { Text } from "~/components/typography/Text";

import { Select, type SelectProps } from "./generic";

const globalOptions = {
  isDeselectable: true,
  getModelValue: (m: ApiEducation) => m.id,
  getModelLabel: (m: ApiEducation) => m.major,
  getModelValueLabel: <E extends ApiEducation>(m: E, options: MenuOptions<E>) =>
    options.isMulti ? m.shortMajor ?? m.major : m.major,
} as const;

type Opts<O extends { isMulti?: boolean; isClearable?: boolean }> = typeof globalOptions & {
  isMulti: O["isMulti"];
  isClearable: O["isClearable"];
};

export interface EducationSelectProps<
  O extends { isMulti?: boolean; isClearable?: boolean },
  E extends ApiEducation,
> extends Omit<SelectProps<string, E, Opts<O>>, "options" | "itemRenderer"> {
  readonly useAbbreviatedOptionLabels?: boolean;
  readonly options: O;
}

export const EducationSelect = <
  O extends { isMulti?: boolean; isClearable?: boolean },
  E extends ApiEducation,
>({
  useAbbreviatedOptionLabels = true,
  options,
  ...props
}: EducationSelectProps<O, E>): JSX.Element => (
  <Select<string, E, Opts<O>>
    {...props}
    options={{ ...globalOptions, isMulti: options.isMulti, isClearable: options.isClearable }}
    itemRenderer={m => (
      <div className="flex flex-col gap-[4px]">
        <Text fontSize="sm" fontWeight="medium">
          {useAbbreviatedOptionLabels ? m.shortMajor ?? m.major : m.major}
        </Text>
        <Text fontSize="xs" className="text-description">
          {m.school.name}
        </Text>
      </div>
    )}
  />
);
