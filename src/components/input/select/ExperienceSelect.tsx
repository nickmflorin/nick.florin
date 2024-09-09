import { type Experience, type Company } from "~/prisma/model";

import { Text } from "~/components/typography/Text";

import { Select, type SelectProps } from "./generic";

type Exp = Pick<Experience, "title" | "id" | "shortTitle"> & {
  readonly company: Pick<Company, "id" | "name">;
};

const globalOptions = {
  isDeselectable: true,
  getModelValue: (m: Exp) => m.id,
  getModelLabel: (m: Exp) => m.title,
  getModelValueLabel: (m: Exp) => m.shortTitle ?? m.title,
} as const;

type Opts<O extends { isMulti?: boolean; isClearable?: boolean }> = typeof globalOptions & {
  isMulti: O["isMulti"];
  isClearable: O["isClearable"];
};

export interface ExperienceSelectProps<
  O extends { isMulti?: boolean; isClearable?: boolean },
  E extends Exp,
> extends Omit<SelectProps<string, E, Opts<O>>, "options" | "itemRenderer"> {
  readonly options: O;
  readonly useAbbreviatedOptionLabels?: boolean;
}

export const ExperienceSelect = <
  O extends { isMulti?: boolean; isClearable?: boolean },
  E extends Exp,
>({
  useAbbreviatedOptionLabels = true,
  options,
  ...props
}: ExperienceSelectProps<O, E>): JSX.Element => (
  <Select<string, E, Opts<O>>
    {...props}
    options={{ ...globalOptions, isMulti: options.isMulti, isClearable: options.isClearable }}
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
